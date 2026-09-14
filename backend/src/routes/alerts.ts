import { Router } from 'express';
import { getDb } from '../database';

export const alertsRouter = Router();

// GET all alerts with filters
alertsRouter.get('/', (req, res) => {
  const db = getDb();
  const { status, severity, asset_id, limit: lim } = req.query;

  let query = `SELECT al.*, a.asset_name, a.asset_type, a.region 
               FROM alerts al 
               LEFT JOIN assets a ON al.asset_id = a.asset_id 
               WHERE 1=1`;
  const params: any[] = [];

  if (status) { query += ' AND al.status = ?'; params.push(status); }
  if (severity) { query += ' AND al.severity = ?'; params.push(severity); }
  if (asset_id) { query += ' AND al.asset_id = ?'; params.push(asset_id); }

  query += ' ORDER BY al.timestamp DESC';
  if (lim) { query += ' LIMIT ?'; params.push(Number(lim)); }

  const alerts = db.prepare(query).all(...params);
  const unreadCount = db.prepare("SELECT COUNT(*) as count FROM alerts WHERE status = 'UNREAD'").get() as any;

  res.json({ 
    data: alerts, 
    count: alerts.length, 
    unread_count: unreadCount?.count || 0,
    data_mode: 'DEMO' 
  });
});

// PATCH acknowledge/resolve alert
alertsRouter.patch('/:id', (req, res) => {
  const db = getDb();
  const { status } = req.body;
  const id = req.params.id;

  if (status === 'ACKNOWLEDGED') {
    db.prepare("UPDATE alerts SET status = 'ACKNOWLEDGED', acknowledged_by = 'demo-user' WHERE alert_id = ?").run(id);
  } else if (status === 'RESOLVED') {
    db.prepare("UPDATE alerts SET status = 'RESOLVED', resolved_at = ? WHERE alert_id = ?").run(new Date().toISOString(), id);
  }

  const updated = db.prepare('SELECT * FROM alerts WHERE alert_id = ?').get(id);
  res.json({ data: updated, data_mode: 'DEMO' });
});
