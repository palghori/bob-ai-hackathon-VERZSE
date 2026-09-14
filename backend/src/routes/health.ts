import { Router } from 'express';
import { getDb } from '../database';

export const healthRouter = Router();

/**
 * Condition Engine — computes health scores from sensor data and thresholds.
 * This is a deterministic rules-based engine, NOT an ML model.
 */
function computeHealthScore(assetId: string): any {
  const db = getDb();

  const asset = db.prepare('SELECT * FROM assets WHERE asset_id = ?').get(assetId) as any;
  if (!asset) return null;

  // Get latest sensor reading
  const latest = db.prepare(
    'SELECT * FROM sensor_readings WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 1'
  ).get(assetId) as any;

  // Get thresholds for this asset type
  const thresholds = db.prepare(
    'SELECT * FROM thresholds WHERE asset_type = ?'
  ).all(asset.asset_type) as any[];

  // Get incident count (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400_000).toISOString();
  const incidentCount = db.prepare(
    'SELECT COUNT(*) as count FROM incidents WHERE asset_id = ? AND timestamp >= ?'
  ).get(assetId, ninetyDaysAgo) as any;

  const contributors: string[] = [];
  let sensorScore = 100;
  let anomalyScore = 100;
  let maintenanceScore = 100;
  let historicalScore = 100;
  let ageScore = 100;

  if (latest) {
    // Evaluate each sensor against thresholds
    for (const threshold of thresholds) {
      const value = latest[threshold.sensor_field];
      if (value == null) continue;

      // Check high thresholds
      if (threshold.critical_high && value >= threshold.critical_high) {
        sensorScore -= 25;
        contributors.push(`${threshold.sensor_field}: CRITICAL (${value}${threshold.unit})`);
      } else if (threshold.warning_high && value >= threshold.warning_high) {
        sensorScore -= 15;
        contributors.push(`${threshold.sensor_field}: WARNING (${value}${threshold.unit})`);
      } else if (threshold.watch_high && value >= threshold.watch_high) {
        sensorScore -= 5;
        contributors.push(`${threshold.sensor_field}: WATCH (${value}${threshold.unit})`);
      }

      // Check low thresholds (e.g., power factor)
      if (threshold.critical_low && value <= threshold.critical_low) {
        sensorScore -= 25;
        contributors.push(`${threshold.sensor_field}: CRITICAL LOW (${value}${threshold.unit})`);
      } else if (threshold.warning_low && value <= threshold.warning_low) {
        sensorScore -= 15;
        contributors.push(`${threshold.sensor_field}: WARNING LOW (${value}${threshold.unit})`);
      }
    }
    sensorScore = Math.max(0, sensorScore);
  }

  // Maintenance score
  if (asset.maintenance_status === 'OVERDUE') {
    maintenanceScore = 50;
    contributors.push('Maintenance: OVERDUE');
  } else if (asset.maintenance_status === 'DUE_SOON') {
    maintenanceScore = 75;
    contributors.push('Maintenance: DUE SOON');
  }

  // Historical score (incidents)
  const incidents = incidentCount?.count || 0;
  if (incidents >= 3) {
    historicalScore = 50;
    contributors.push(`Historical: ${incidents} incidents in 90 days`);
  } else if (incidents >= 1) {
    historicalScore = 75;
    contributors.push(`Historical: ${incidents} incident(s) in 90 days`);
  }

  // Age score
  if (asset.installation_date) {
    const ageYears = (Date.now() - new Date(asset.installation_date).getTime()) / (365.25 * 86400_000);
    if (ageYears > 35) {
      ageScore = 50;
      contributors.push(`Age: ${ageYears.toFixed(0)} years (aging)`);
    } else if (ageYears > 25) {
      ageScore = 70;
      contributors.push(`Age: ${ageYears.toFixed(0)} years`);
    } else if (ageYears > 15) {
      ageScore = 85;
    }
  }

  // Overall weighted score
  const overall = Math.round(
    sensorScore * 0.35 +
    anomalyScore * 0.15 +
    maintenanceScore * 0.15 +
    historicalScore * 0.15 +
    ageScore * 0.20
  );

  // Determine health status
  let healthStatus = 'HEALTHY';
  if (overall < 40) healthStatus = 'CRITICAL';
  else if (overall < 60) healthStatus = 'WARNING';
  else if (overall < 75) healthStatus = 'WATCH';

  return {
    asset_id: assetId,
    timestamp: new Date().toISOString(),
    overall_score: overall,
    sensor_score: sensorScore,
    anomaly_score: anomalyScore,
    maintenance_score: maintenanceScore,
    historical_score: historicalScore,
    age_score: ageScore,
    contributors: JSON.stringify(contributors),
    health_status: healthStatus,
  };
}

// GET health score for a specific asset (compute on demand)
healthRouter.get('/:assetId', (req, res) => {
  const result = computeHealthScore(req.params.assetId);
  if (!result) return res.status(404).json({ error: 'Asset not found' });

  // Cache the result
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO health_scores (asset_id, timestamp, overall_score, sensor_score, anomaly_score, maintenance_score, historical_score, age_score, contributors)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(result.asset_id, result.timestamp, result.overall_score, result.sensor_score, result.anomaly_score, result.maintenance_score, result.historical_score, result.age_score, result.contributors);

  // Update asset health status
  db.prepare('UPDATE assets SET health_status = ? WHERE asset_id = ?').run(result.health_status, result.asset_id);

  res.json({ data: result, data_mode: 'DEMO' });
});

// POST compute health scores for all assets
healthRouter.post('/compute-all', (_req, res) => {
  const db = getDb();
  const assets = db.prepare('SELECT asset_id FROM assets').all() as any[];
  const results: any[] = [];

  for (const asset of assets) {
    const score = computeHealthScore(asset.asset_id);
    if (score) {
      db.prepare(
        `INSERT OR REPLACE INTO health_scores (asset_id, timestamp, overall_score, sensor_score, anomaly_score, maintenance_score, historical_score, age_score, contributors)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(score.asset_id, score.timestamp, score.overall_score, score.sensor_score, score.anomaly_score, score.maintenance_score, score.historical_score, score.age_score, score.contributors);
      db.prepare('UPDATE assets SET health_status = ? WHERE asset_id = ?').run(score.health_status, score.asset_id);
      results.push(score);
    }
  }

  res.json({ data: results, count: results.length, data_mode: 'DEMO' });
});

export { computeHealthScore };
