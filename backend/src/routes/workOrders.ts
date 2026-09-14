import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';

export const workOrdersRouter = Router();

// GET all work orders with filters
workOrdersRouter.get('/', (req, res) => {
  const db = getDb();
  const { status, priority, asset_id } = req.query;

  let query = `SELECT wo.*, a.asset_name, a.asset_type, a.region, c.crew_name 
               FROM work_orders wo 
               JOIN assets a ON wo.asset_id = a.asset_id 
               LEFT JOIN crews c ON wo.assigned_crew = c.crew_id 
               WHERE 1=1`;
  const params: any[] = [];

  if (status) { query += ' AND wo.status = ?'; params.push(status); }
  if (priority) { query += ' AND wo.priority = ?'; params.push(priority); }
  if (asset_id) { query += ' AND wo.asset_id = ?'; params.push(asset_id); }

  query += ' ORDER BY wo.created_at DESC';

  const orders = db.prepare(query).all(...params);
  res.json({ data: orders, count: orders.length, data_mode: 'DEMO' });
});

// GET single work order
workOrdersRouter.get('/:id', (req, res) => {
  const db = getDb();
  const wo = db.prepare(
    `SELECT wo.*, a.asset_name, a.asset_type, a.region, c.crew_name 
     FROM work_orders wo 
     JOIN assets a ON wo.asset_id = a.asset_id 
     LEFT JOIN crews c ON wo.assigned_crew = c.crew_id 
     WHERE wo.work_order_id = ?`
  ).get(req.params.id);

  if (!wo) return res.status(404).json({ error: 'Work order not found' });
  res.json({ data: wo, data_mode: 'DEMO' });
});

// POST create work order
workOrdersRouter.post('/', (req, res) => {
  const db = getDb();
  const { asset_id, type, priority, notes, assigned_crew, due_date } = req.body;

  if (!asset_id || !type || !priority) {
    return res.status(400).json({ error: 'asset_id, type, and priority are required' });
  }

  const id = `WO-${uuid().slice(0, 8).toUpperCase()}`;
  db.prepare(
    `INSERT INTO work_orders (work_order_id, asset_id, type, priority, created_at, recommended_by, assigned_crew, status, due_date, notes)
     VALUES (?, ?, ?, ?, ?, 'OPERATOR', ?, 'NEW', ?, ?)`
  ).run(id, asset_id, type, priority, new Date().toISOString(), assigned_crew || null, due_date || null, notes || null);

  // Audit log
  db.prepare(
    `INSERT INTO audit_log (timestamp, user_id, action, entity_type, entity_id, details) 
     VALUES (?, 'demo-user', 'CREATE', 'WORK_ORDER', ?, ?)`
  ).run(new Date().toISOString(), id, JSON.stringify({ asset_id, type, priority }));

  const created = db.prepare('SELECT * FROM work_orders WHERE work_order_id = ?').get(id);
  res.status(201).json({ data: created, data_mode: 'DEMO' });
});

// PATCH update work order status
workOrdersRouter.patch('/:id', (req, res) => {
  const db = getDb();
  const { status, assigned_crew, notes, resolution } = req.body;
  const id = req.params.id;

  const existing = db.prepare('SELECT * FROM work_orders WHERE work_order_id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Work order not found' });

  if (status) {
    db.prepare('UPDATE work_orders SET status = ? WHERE work_order_id = ?').run(status, id);
    if (status === 'COMPLETED') {
      db.prepare('UPDATE work_orders SET completed_at = ?, resolution = ? WHERE work_order_id = ?')
        .run(new Date().toISOString(), resolution || 'Completed', id);
    }
  }
  if (assigned_crew) {
    db.prepare('UPDATE work_orders SET assigned_crew = ?, status = ? WHERE work_order_id = ?')
      .run(assigned_crew, 'ASSIGNED', id);
  }
  if (notes) {
    db.prepare('UPDATE work_orders SET notes = ? WHERE work_order_id = ?').run(notes, id);
  }

  const updated = db.prepare('SELECT * FROM work_orders WHERE work_order_id = ?').get(id);
  res.json({ data: updated, data_mode: 'DEMO' });
});
