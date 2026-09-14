import { Router } from 'express';
import { getDb } from '../database';

export const thresholdsRouter = Router();

// GET all thresholds
thresholdsRouter.get('/', (req, res) => {
  const db = getDb();
  const { asset_type } = req.query;

  let query = 'SELECT * FROM thresholds';
  const params: any[] = [];
  if (asset_type) { query += ' WHERE asset_type = ?'; params.push(asset_type); }

  const thresholds = db.prepare(query).all(...params);
  res.json({ data: thresholds, count: thresholds.length });
});

// PUT update a threshold
thresholdsRouter.put('/:id', (req, res) => {
  const db = getDb();
  const { watch_low, watch_high, warning_low, warning_high, critical_low, critical_high } = req.body;
  const id = req.params.id;

  db.prepare(
    `UPDATE thresholds SET watch_low = ?, watch_high = ?, warning_low = ?, warning_high = ?, critical_low = ?, critical_high = ? WHERE id = ?`
  ).run(watch_low, watch_high, warning_low, warning_high, critical_low, critical_high, id);

  const updated = db.prepare('SELECT * FROM thresholds WHERE id = ?').get(id);
  res.json({ data: updated });
});
