import { Router } from 'express';
import { getDb } from '../database';

export const incidentsRouter = Router();

// GET all incidents with filters
incidentsRouter.get('/', (req, res) => {
  const db = getDb();
  const { asset_id, severity, type, limit: lim } = req.query;

  let query = 'SELECT i.*, a.asset_name, a.asset_type, a.region FROM incidents i JOIN assets a ON i.asset_id = a.asset_id WHERE 1=1';
  const params: any[] = [];

  if (asset_id) { query += ' AND i.asset_id = ?'; params.push(asset_id); }
  if (severity) { query += ' AND i.severity = ?'; params.push(severity); }
  if (type) { query += ' AND i.incident_type = ?'; params.push(type); }

  query += ' ORDER BY i.timestamp DESC';
  if (lim) { query += ' LIMIT ?'; params.push(Number(lim)); }

  const incidents = db.prepare(query).all(...params);
  res.json({ data: incidents, count: incidents.length, data_mode: 'DEMO' });
});

// GET incident timeline for a specific asset
incidentsRouter.get('/timeline/:assetId', (req, res) => {
  const db = getDb();
  const incidents = db.prepare(
    'SELECT * FROM incidents WHERE asset_id = ? ORDER BY timestamp DESC'
  ).all(req.params.assetId);

  res.json({ data: incidents, count: incidents.length, data_mode: 'DEMO' });
});
