import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'gridguard.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initializeDatabase(): void {
  const db = getDb();

  db.exec(`
    -- ============================================================
    -- SUBSTATIONS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS substations (
      substation_id   TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      latitude        REAL NOT NULL,
      longitude       REAL NOT NULL,
      region          TEXT NOT NULL,
      zone            TEXT,
      voltage_level   TEXT,
      importance      TEXT DEFAULT 'STANDARD',
      connected_feeders INTEGER DEFAULT 0,
      redundancy      TEXT DEFAULT 'N-1'
    );

    -- ============================================================
    -- ASSETS (Transformers, Breakers, Feeders, etc.)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS assets (
      asset_id              TEXT PRIMARY KEY,
      asset_name            TEXT NOT NULL,
      asset_type            TEXT NOT NULL CHECK(asset_type IN ('Transformer','Substation','Feeder','Breaker','Renewable')),
      manufacturer          TEXT,
      model                 TEXT,
      serial_number         TEXT,
      installation_date     TEXT,
      commissioning_date    TEXT,
      latitude              REAL NOT NULL,
      longitude             REAL NOT NULL,
      region                TEXT NOT NULL,
      zone                  TEXT,
      substation_id         TEXT REFERENCES substations(substation_id),
      rated_power_mva       REAL,
      voltage_level         TEXT,
      criticality           TEXT DEFAULT 'MEDIUM' CHECK(criticality IN ('LOW','MEDIUM','HIGH','CRITICAL')),
      customers_served      INTEGER DEFAULT 0,
      critical_load         INTEGER DEFAULT 0,
      maintenance_status    TEXT DEFAULT 'UP_TO_DATE',
      health_status         TEXT DEFAULT 'HEALTHY' CHECK(health_status IN ('HEALTHY','WATCH','WARNING','CRITICAL','UNKNOWN')),
      last_inspection       TEXT,
      last_maintenance      TEXT,
      next_scheduled_maintenance TEXT
    );

    -- ============================================================
    -- SENSOR READINGS (time-series)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS sensor_readings (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id              TEXT NOT NULL REFERENCES assets(asset_id),
      timestamp             TEXT NOT NULL,
      temperature           REAL,
      winding_temperature   REAL,
      hotspot_temperature   REAL,
      load_percent          REAL,
      current_a             REAL,
      voltage_kv            REAL,
      vibration             REAL,
      humidity              REAL,
      oil_temperature       REAL,
      oil_moisture          REAL,
      hydrogen              REAL,
      methane               REAL,
      acetylene             REAL,
      ethylene              REAL,
      ethane                REAL,
      carbon_monoxide       REAL,
      carbon_dioxide        REAL,
      power_factor          REAL,
      harmonic_distortion   REAL,
      current_unbalance     REAL,
      voltage_unbalance     REAL,
      bushing_capacitance   REAL,
      bushing_tandelta      REAL,
      tap_changer_operations INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_sensor_asset_ts ON sensor_readings(asset_id, timestamp);

    -- ============================================================
    -- THRESHOLDS (configurable, central)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS thresholds (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_type    TEXT NOT NULL,
      sensor_field  TEXT NOT NULL,
      watch_low     REAL,
      watch_high    REAL,
      warning_low   REAL,
      warning_high  REAL,
      critical_low  REAL,
      critical_high REAL,
      unit          TEXT,
      UNIQUE(asset_type, sensor_field)
    );

    -- ============================================================
    -- INCIDENTS (historical)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS incidents (
      incident_id           TEXT PRIMARY KEY,
      asset_id              TEXT NOT NULL REFERENCES assets(asset_id),
      timestamp             TEXT NOT NULL,
      incident_type         TEXT NOT NULL,
      severity              TEXT NOT NULL CHECK(severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
      duration_hours        REAL,
      root_cause            TEXT,
      weather_condition     TEXT,
      load_condition        TEXT,
      maintenance_before    INTEGER DEFAULT 0,
      resolution            TEXT,
      downtime_hours        REAL,
      customers_affected    INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_incident_asset ON incidents(asset_id);

    -- ============================================================
    -- WORK ORDERS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS work_orders (
      work_order_id         TEXT PRIMARY KEY,
      asset_id              TEXT NOT NULL REFERENCES assets(asset_id),
      type                  TEXT NOT NULL,
      priority              TEXT NOT NULL CHECK(priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
      created_at            TEXT NOT NULL,
      recommended_by        TEXT DEFAULT 'SYSTEM',
      assigned_crew         TEXT REFERENCES crews(crew_id),
      status                TEXT DEFAULT 'NEW' CHECK(status IN ('NEW','ASSIGNED','IN_PROGRESS','BLOCKED','COMPLETED','CANCELLED')),
      due_date              TEXT,
      notes                 TEXT,
      resolution            TEXT,
      completed_at          TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_wo_asset ON work_orders(asset_id);
    CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(status);

    -- ============================================================
    -- CREWS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS crews (
      crew_id               TEXT PRIMARY KEY,
      crew_name             TEXT NOT NULL,
      skills                TEXT,
      base_latitude         REAL,
      base_longitude        REAL,
      base_location         TEXT,
      availability          TEXT DEFAULT 'AVAILABLE' CHECK(availability IN ('AVAILABLE','ASSIGNED','TRAVELING','ON_SITE','OFF_DUTY')),
      shift                 TEXT,
      status                TEXT DEFAULT 'ACTIVE',
      capacity              INTEGER DEFAULT 4
    );

    -- ============================================================
    -- WEATHER CACHE
    -- ============================================================
    CREATE TABLE IF NOT EXISTS weather_cache (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude      REAL NOT NULL,
      longitude     REAL NOT NULL,
      timestamp     TEXT NOT NULL,
      source        TEXT DEFAULT 'SIMULATED' CHECK(source IN ('LIVE','CACHED','SIMULATED')),
      temperature_c REAL,
      wind_speed_kmh REAL,
      wind_direction TEXT,
      rain_mm       REAL,
      humidity      REAL,
      weather_code  INTEGER,
      severe_weather INTEGER DEFAULT 0,
      forecast_json TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_weather_loc ON weather_cache(latitude, longitude, timestamp);

    -- ============================================================
    -- HEALTH SCORES (computed / cached)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS health_scores (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id        TEXT NOT NULL REFERENCES assets(asset_id),
      timestamp       TEXT NOT NULL,
      overall_score   REAL NOT NULL,
      sensor_score    REAL,
      anomaly_score   REAL,
      maintenance_score REAL,
      historical_score REAL,
      age_score       REAL,
      contributors    TEXT,
      UNIQUE(asset_id, timestamp)
    );

    -- ============================================================
    -- PREDICTIONS (from ML service)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS predictions (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id            TEXT NOT NULL REFERENCES assets(asset_id),
      timestamp           TEXT NOT NULL,
      failure_probability REAL NOT NULL,
      risk_band           TEXT NOT NULL,
      prediction_horizon  TEXT DEFAULT '30d',
      top_features        TEXT,
      model_version       TEXT,
      anomaly_score       REAL,
      anomaly_status      TEXT,
      anomalous_features  TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_pred_asset ON predictions(asset_id);

    -- ============================================================
    -- ALERTS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS alerts (
      alert_id      TEXT PRIMARY KEY,
      asset_id      TEXT REFERENCES assets(asset_id),
      timestamp     TEXT NOT NULL,
      alert_type    TEXT NOT NULL,
      severity      TEXT NOT NULL CHECK(severity IN ('INFO','LOW','MEDIUM','HIGH','CRITICAL')),
      title         TEXT NOT NULL,
      message       TEXT,
      status        TEXT DEFAULT 'UNREAD' CHECK(status IN ('UNREAD','ACKNOWLEDGED','RESOLVED')),
      acknowledged_by TEXT,
      resolved_at   TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_alert_status ON alerts(status);

    -- ============================================================
    -- AUDIT LOG
    -- ============================================================
    CREATE TABLE IF NOT EXISTS audit_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp   TEXT NOT NULL,
      user_id     TEXT,
      action      TEXT NOT NULL,
      entity_type TEXT,
      entity_id   TEXT,
      details     TEXT
    );
  `);

  console.log('[DB] Database initialized successfully');
}

export function closeDb(): void {
  if (db) {
    db.close();
  }
}
