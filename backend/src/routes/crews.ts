import { Router } from 'express';
import { getDb } from '../database';

export const crewsRouter = Router();

// GET all crews
crewsRouter.get('/', (req, res) => {
  const db = getDb();
  const { availability, location } = req.query;

  let query = 'SELECT * FROM crews WHERE 1=1';
  const params: any[] = [];

  if (availability) { query += ' AND availability = ?'; params.push(availability); }
  if (location) { query += ' AND base_location = ?'; params.push(location); }

  query += ' ORDER BY crew_name';

  const crews = db.prepare(query).all(...params);

  // Enrich with active work order count
  const enriched = crews.map((crew: any) => {
    const woCount = db.prepare(
      "SELECT COUNT(*) as count FROM work_orders WHERE assigned_crew = ? AND status NOT IN ('COMPLETED','CANCELLED')"
    ).get(crew.crew_id) as any;
    return { ...crew, active_work_orders: woCount?.count || 0 };
  });

  res.json({ data: enriched, count: enriched.length, data_mode: 'DEMO' });
});

// GET single crew
crewsRouter.get('/:id', (req, res) => {
  const db = getDb();
  const crew = db.prepare('SELECT * FROM crews WHERE crew_id = ?').get(req.params.id);
  if (!crew) return res.status(404).json({ error: 'Crew not found' });

  const workOrders = db.prepare(
    `SELECT wo.*, a.asset_name FROM work_orders wo 
     JOIN assets a ON wo.asset_id = a.asset_id 
     WHERE wo.assigned_crew = ? AND wo.status NOT IN ('COMPLETED','CANCELLED')
     ORDER BY wo.created_at DESC`
  ).all(req.params.id);

  res.json({ ...crew as any, assigned_work_orders: workOrders, data_mode: 'DEMO' });
});

// PATCH update crew availability
crewsRouter.patch('/:id', (req, res) => {
  const db = getDb();
  const { availability, shift } = req.body;
  const id = req.params.id;

  if (availability) {
    db.prepare('UPDATE crews SET availability = ? WHERE crew_id = ?').run(availability, id);
  }
  if (shift) {
    db.prepare('UPDATE crews SET shift = ? WHERE crew_id = ?').run(shift, id);
  }

  const updated = db.prepare('SELECT * FROM crews WHERE crew_id = ?').get(id);
  res.json({ data: updated, data_mode: 'DEMO' });
});
