import { Router } from 'express';
import { getDb } from '../database';

export const dashboardRouter = Router();

// GET dashboard KPIs and summary data
dashboardRouter.get('/kpis', (_req, res) => {
  const db = getDb();

  const totalAssets = (db.prepare('SELECT COUNT(*) as c FROM assets').get() as any).c;
  const healthy = (db.prepare("SELECT COUNT(*) as c FROM assets WHERE health_status = 'HEALTHY'").get() as any).c;
  const watch = (db.prepare("SELECT COUNT(*) as c FROM assets WHERE health_status = 'WATCH'").get() as any).c;
  const warning = (db.prepare("SELECT COUNT(*) as c FROM assets WHERE health_status = 'WARNING'").get() as any).c;
  const critical = (db.prepare("SELECT COUNT(*) as c FROM assets WHERE health_status = 'CRITICAL'").get() as any).c;
  const unknown = (db.prepare("SELECT COUNT(*) as c FROM assets WHERE health_status = 'UNKNOWN'").get() as any).c;

  const atRisk = warning + critical;

  const outageExposure = (db.prepare(
    "SELECT COALESCE(SUM(customers_served), 0) as c FROM assets WHERE health_status IN ('WARNING', 'CRITICAL')"
  ).get() as any).c;

  const openWorkOrders = (db.prepare(
    "SELECT COUNT(*) as c FROM work_orders WHERE status NOT IN ('COMPLETED', 'CANCELLED')"
  ).get() as any).c;

  const crewsAvailable = (db.prepare(
    "SELECT COUNT(*) as c FROM crews WHERE availability = 'AVAILABLE'"
  ).get() as any).c;

  const totalCrews = (db.prepare('SELECT COUNT(*) as c FROM crews').get() as any).c;

  const unreadAlerts = (db.prepare(
    "SELECT COUNT(*) as c FROM alerts WHERE status = 'UNREAD'"
  ).get() as any).c;

  // Health distribution
  const healthDistribution = { healthy, watch, warning, critical, unknown };

  // Asset type distribution
  const typeDistribution = db.prepare(
    'SELECT asset_type, COUNT(*) as count FROM assets GROUP BY asset_type'
  ).all();

  // Region distribution
  const regionDistribution = db.prepare(
    'SELECT region, COUNT(*) as count, SUM(customers_served) as total_customers FROM assets GROUP BY region'
  ).all();

  // Criticality distribution
  const criticalityDistribution = db.prepare(
    'SELECT criticality, COUNT(*) as count FROM assets GROUP BY criticality'
  ).all();

  // Recent incidents (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString();
  const recentIncidents = (db.prepare(
    'SELECT COUNT(*) as c FROM incidents WHERE timestamp >= ?'
  ).get(thirtyDaysAgo) as any).c;

  res.json({
    kpis: {
      total_assets: totalAssets,
      healthy,
      at_risk: atRisk,
      critical,
      outage_exposure: outageExposure,
      open_work_orders: openWorkOrders,
      crews_available: crewsAvailable,
      total_crews: totalCrews,
      unread_alerts: unreadAlerts,
      recent_incidents: recentIncidents,
    },
    distributions: {
      health: healthDistribution,
      asset_type: typeDistribution,
      region: regionDistribution,
      criticality: criticalityDistribution,
    },
    data_mode: 'DEMO',
    timestamp: new Date().toISOString(),
  });
});

// GET fleet risk ranking
dashboardRouter.get('/fleet-risk', (_req, res) => {
  const db = getDb();

  const assets = db.prepare(`
    SELECT a.*, 
           hs.overall_score as health_score,
           hs.contributors,
           p.failure_probability,
           p.risk_band,
           p.top_features,
           p.anomaly_score as pred_anomaly_score,
           p.anomaly_status
    FROM assets a
    LEFT JOIN (
      SELECT asset_id, overall_score, contributors, 
             ROW_NUMBER() OVER (PARTITION BY asset_id ORDER BY timestamp DESC) as rn
      FROM health_scores
    ) hs ON a.asset_id = hs.asset_id AND hs.rn = 1
    LEFT JOIN (
      SELECT asset_id, failure_probability, risk_band, top_features, anomaly_score, anomaly_status,
             ROW_NUMBER() OVER (PARTITION BY asset_id ORDER BY timestamp DESC) as rn
      FROM predictions
    ) p ON a.asset_id = p.asset_id AND p.rn = 1
    ORDER BY 
      CASE a.health_status 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'WARNING' THEN 2 
        WHEN 'WATCH' THEN 3 
        ELSE 4 
      END,
      a.customers_served DESC
  `).all();

  res.json({ data: assets, count: assets.length, data_mode: 'DEMO' });
});
