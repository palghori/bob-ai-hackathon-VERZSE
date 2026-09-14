/**
 * GRIDGUARD Backend — Express Server
 * Main application entry point with all API routes.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase, getDb, closeDb } from './database';
import { assetsRouter } from './routes/assets';
import { sensorsRouter } from './routes/sensors';
import { incidentsRouter } from './routes/incidents';
import { workOrdersRouter } from './routes/workOrders';
import { crewsRouter } from './routes/crews';
import { alertsRouter } from './routes/alerts';
import { thresholdsRouter } from './routes/thresholds';
import { healthRouter } from './routes/health';
import { weatherRouter } from './routes/weather';
import { dashboardRouter } from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('short'));

// ─── Initialize Database ────────────────────────────────────────────
initializeDatabase();

// ─── Routes ─────────────────────────────────────────────────────────
app.use('/api/assets', assetsRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/work-orders', workOrdersRouter);
app.use('/api/crews', crewsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/thresholds', thresholdsRouter);
app.use('/api/health-scores', healthRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/dashboard', dashboardRouter);

// ─── System Status ──────────────────────────────────────────────────
app.get('/api/status', (_req, res) => {
  const db = getDb();
  const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get() as any;
  res.json({
    status: 'online',
    service: 'gridguard-backend',
    version: '0.1.0',
    database: 'online',
    data_mode: 'DEMO',
    ml_service: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    asset_count: assetCount?.count || 0,
    timestamp: new Date().toISOString(),
  });
});

// ─── Health Check ───────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ─── Error Handler ──────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n⚡ GRIDGUARD Backend running on http://localhost:${PORT}`);
  console.log(`   📊 API: http://localhost:${PORT}/api/status`);
  console.log(`   🔌 Mode: DEMO\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  closeDb();
  process.exit(0);
});
