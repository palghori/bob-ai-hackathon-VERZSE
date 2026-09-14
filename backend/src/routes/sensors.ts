import { Router } from 'express';
import { getDb } from '../database';

export const sensorsRouter = Router();

// GET sensor readings for an asset with time range
sensorsRouter.get('/:assetId', (req, res) => {
  const db = getDb();
  const { range, limit } = req.query;
  const assetId = req.params.assetId;

  // Calculate time filter
  let hoursBack = 24;
  switch (range) {
    case '1h': hoursBack = 1; break;
    case '6h': hoursBack = 6; break;
    case '24h': hoursBack = 24; break;
    case '7d': hoursBack = 168; break;
    case '30d': hoursBack = 720; break;
    case '90d': hoursBack = 2160; break;
  }

  const since = new Date(Date.now() - hoursBack * 3600_000).toISOString();
  const maxRows = Math.min(Number(limit) || 500, 2000);

  const readings = db.prepare(
    `SELECT * FROM sensor_readings WHERE asset_id = ? AND timestamp >= ? ORDER BY timestamp ASC LIMIT ?`
  ).all(assetId, since, maxRows);

  res.json({ 
    data: readings, 
    count: readings.length, 
    asset_id: assetId,
    range: range || '24h',
    data_mode: 'DEMO' 
  });
});

// GET latest reading for an asset
sensorsRouter.get('/:assetId/latest', (req, res) => {
  const db = getDb();
  const reading = db.prepare(
    'SELECT * FROM sensor_readings WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 1'
  ).get(req.params.assetId);

  if (!reading) return res.status(404).json({ error: 'No readings found' });
  res.json({ data: reading, data_mode: 'DEMO' });
});

// GET DGA (dissolved gas analysis) for an asset
sensorsRouter.get('/:assetId/dga', (req, res) => {
  const db = getDb();
  const { range } = req.query;
  let hoursBack = 72;
  if (range === '7d') hoursBack = 168;
  if (range === '30d') hoursBack = 720;

  const since = new Date(Date.now() - hoursBack * 3600_000).toISOString();

  const readings = db.prepare(
    `SELECT timestamp, hydrogen, methane, acetylene, ethylene, ethane, carbon_monoxide, carbon_dioxide, oil_moisture 
     FROM sensor_readings WHERE asset_id = ? AND timestamp >= ? AND hydrogen IS NOT NULL 
     ORDER BY timestamp ASC`
  ).all(req.params.assetId, since);

  res.json({ data: readings, count: readings.length, data_mode: 'DEMO' });
});

// GET bushing analytics for an asset
sensorsRouter.get('/:assetId/bushing', (req, res) => {
  const db = getDb();
  const readings = db.prepare(
    `SELECT timestamp, bushing_capacitance, bushing_tandelta 
     FROM sensor_readings WHERE asset_id = ? AND bushing_capacitance IS NOT NULL 
     ORDER BY timestamp DESC LIMIT 72`
  ).all(req.params.assetId);

  res.json({ data: readings.reverse(), count: readings.length, data_mode: 'DEMO' });
});

// GET tap changer analytics for an asset
sensorsRouter.get('/:assetId/tapchanger', (req, res) => {
  const db = getDb();
  const readings = db.prepare(
    `SELECT timestamp, tap_changer_operations 
     FROM sensor_readings WHERE asset_id = ? AND tap_changer_operations IS NOT NULL 
     ORDER BY timestamp DESC LIMIT 72`
  ).all(req.params.assetId);

  // Calculate total operations and rate
  const totalOps = (readings as any[]).reduce((sum, r) => sum + (r.tap_changer_operations || 0), 0);
  const recentOps = (readings as any[]).slice(0, 24).reduce((sum, r) => sum + (r.tap_changer_operations || 0), 0);

  res.json({ 
    data: readings.reverse(), 
    total_operations: totalOps,
    recent_24h_operations: recentOps,
    data_mode: 'DEMO' 
  });
});
