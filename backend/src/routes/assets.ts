import { Router } from 'express';
import { getDb } from '../database';

export const assetsRouter = Router();

// GET all assets with optional filters
assetsRouter.get('/', (req, res) => {
  const db = getDb();
  const { type, region, health_status, criticality, search, sort_by, order } = req.query;
  
  let query = 'SELECT * FROM assets WHERE 1=1';
  const params: any[] = [];

  if (type) { query += ' AND asset_type = ?'; params.push(type); }
  if (region) { query += ' AND region = ?'; params.push(region); }
  if (health_status) { query += ' AND health_status = ?'; params.push(health_status); }
  if (criticality) { query += ' AND criticality = ?'; params.push(criticality); }
  if (search) { 
    query += ' AND (asset_id LIKE ? OR asset_name LIKE ? OR region LIKE ?)'; 
    const s = `%${search}%`;
    params.push(s, s, s); 
  }

  const validSortFields = ['asset_id', 'asset_name', 'asset_type', 'region', 'criticality', 'health_status', 'customers_served'];
  const sortField = validSortFields.includes(sort_by as string) ? sort_by : 'asset_id';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortField} ${sortOrder}`;

  const assets = db.prepare(query).all(...params);
  res.json({ data: assets, count: assets.length, data_mode: 'DEMO' });
});

// GET single asset by ID
assetsRouter.get('/:id', (req, res) => {
  const db = getDb();
  const asset = db.prepare('SELECT * FROM assets WHERE asset_id = ?').get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  
  // Get latest sensor reading
  const latestSensor = db.prepare(
    'SELECT * FROM sensor_readings WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 1'
  ).get(req.params.id);

  // Get recent incidents count
  const incidentCount = db.prepare(
    'SELECT COUNT(*) as count FROM incidents WHERE asset_id = ?'
  ).get(req.params.id) as any;

  // Get open work orders
  const openWOs = db.prepare(
    "SELECT COUNT(*) as count FROM work_orders WHERE asset_id = ? AND status NOT IN ('COMPLETED','CANCELLED')"
  ).get(req.params.id) as any;

  // Get latest health score
  const healthScore = db.prepare(
    'SELECT * FROM health_scores WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 1'
  ).get(req.params.id);

  // Get latest prediction
  const prediction = db.prepare(
    'SELECT * FROM predictions WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 1'
  ).get(req.params.id);

  res.json({
    ...asset as any,
    latest_sensor: latestSensor || null,
    incident_count: incidentCount?.count || 0,
    open_work_orders: openWOs?.count || 0,
    health_score: healthScore || null,
    prediction: prediction || null,
    data_mode: 'DEMO',
  });
});

// GET asset regions (for filters)
assetsRouter.get('/meta/regions', (_req, res) => {
  const db = getDb();
  const regions = db.prepare('SELECT DISTINCT region FROM assets ORDER BY region').all();
  res.json({ data: regions.map((r: any) => r.region) });
});

// GET asset types (for filters)
assetsRouter.get('/meta/types', (_req, res) => {
  const db = getDb();
  const types = db.prepare('SELECT DISTINCT asset_type FROM assets ORDER BY asset_type').all();
  res.json({ data: types.map((t: any) => t.asset_type) });
});
