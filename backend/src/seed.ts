/**
 * GRIDGUARD — Synthetic Data Generator
 * 
 * Generates realistic demo data for all database tables.
 * All data is clearly synthetic and does not represent real utility assets.
 */
import { v4 as uuid } from 'uuid';
import { getDb, initializeDatabase, closeDb } from './database';

// ─── Helpers ────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number, decimals = 1): number {
  return +(min + Math.random() * (max - min)).toFixed(decimals);
}

function randomDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0];
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

// ─── Constants ──────────────────────────────────────────────────────
const REGIONS = ['North Valley', 'Southwest', 'East Ridge', 'Cedar Creek', 'Westgate', 'Lakeside', 'Pine Hills', 'Central Metro'];
const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
const MANUFACTURERS = ['ABB', 'Siemens Energy', 'GE Vernova', 'Hitachi Energy', 'Schneider Electric', 'Eaton', 'Toshiba'];
const TRANSFORMER_MODELS = ['T-3000', 'T-5000', 'T-7500', 'T-1200', 'T-2400'];
const BREAKER_MODELS = ['BK-800', 'BK-1200', 'BK-2000', 'BK-500'];
const CRITICALITY_LEVELS: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const HEALTH_STATUSES: Array<'HEALTHY' | 'WATCH' | 'WARNING' | 'CRITICAL'> = ['HEALTHY', 'WATCH', 'WARNING', 'CRITICAL'];

const INCIDENT_TYPES = ['Overheating', 'Oil leak', 'Bushing failure', 'Tap changer fault', 'Winding fault', 'Cooling failure', 'Insulation breakdown', 'Lightning strike', 'Overload trip', 'Vibration alarm'];
const RESOLUTIONS = ['Replaced component', 'Repaired on-site', 'Temporary bypass', 'Load reduced', 'Cooling restored', 'Oil replaced', 'Bushing replaced', 'Scheduled overhaul'];
const WEATHER_CONDITIONS = ['Clear', 'High wind', 'Lightning', 'Heavy rain', 'Heatwave', 'Ice storm', 'Light rain', 'Fog'];
const CREW_SKILLS = ['Transformer specialist', 'HV switching', 'Oil diagnostics', 'Line repair', 'Breaker maintenance', 'General maintenance', 'Emergency response'];
const CREW_NAMES = [
  'North Response Alpha', 'North Response Bravo', 'South Field Team',
  'East Ridge Crew', 'Cedar Creek Unit', 'Westgate Response', 'Metro Fast Team',
  'Lakeside Support', 'Pine Hills Crew', 'Central Specialist', 'HV Emergency 01',
  'HV Emergency 02', 'Night Shift Alpha', 'Night Shift Bravo', 'Substation Team 04',
  'Transformer Spec 01', 'Line Crew West', 'Line Crew East'
];

// Synthetic coordinates (fictional grid area, NOT real utility locations)
const BASE_LAT = 37.5;
const BASE_LNG = -122.0;

// ─── Generate Substations ───────────────────────────────────────────
function generateSubstations(): any[] {
  const substations = [];
  for (let i = 1; i <= 12; i++) {
    substations.push({
      substation_id: `SUB-${String(i).padStart(3, '0')}`,
      name: `${pick(REGIONS)} Substation ${i}`,
      latitude: +(BASE_LAT + randBetween(-0.5, 0.5, 4)).toFixed(4),
      longitude: +(BASE_LNG + randBetween(-0.5, 0.5, 4)).toFixed(4),
      region: pick(REGIONS),
      zone: pick(ZONES),
      voltage_level: pick(['69kV', '115kV', '230kV', '345kV']),
      importance: pick(['STANDARD', 'HIGH', 'CRITICAL']),
      connected_feeders: Math.floor(Math.random() * 8) + 2,
      redundancy: pick(['N', 'N-1', 'N-2']),
    });
  }
  return substations;
}

// ─── Generate Assets ────────────────────────────────────────────────
function generateAssets(substations: any[]): any[] {
  const assets: any[] = [];
  let txCount = 0, brkCount = 0, fdrCount = 0, renCount = 0;

  // Generate ~50 transformers
  for (let i = 0; i < 50; i++) {
    txCount++;
    const sub = pick(substations);
    const health = pick(HEALTH_STATUSES);
    const crit = pick(CRITICALITY_LEVELS);
    assets.push({
      asset_id: `TX-${String(1000 + txCount).padStart(4, '0')}`,
      asset_name: `${sub.region} Transformer ${txCount}`,
      asset_type: 'Transformer',
      manufacturer: pick(MANUFACTURERS),
      model: pick(TRANSFORMER_MODELS),
      serial_number: `SN-${uuid().slice(0, 8).toUpperCase()}`,
      installation_date: randomDate(1985, 2020),
      commissioning_date: randomDate(1985, 2021),
      latitude: +(sub.latitude + randBetween(-0.05, 0.05, 4)).toFixed(4),
      longitude: +(sub.longitude + randBetween(-0.05, 0.05, 4)).toFixed(4),
      region: sub.region,
      zone: sub.zone,
      substation_id: sub.substation_id,
      rated_power_mva: pick([10, 25, 40, 63, 100, 150, 250]),
      voltage_level: sub.voltage_level,
      criticality: crit,
      customers_served: crit === 'CRITICAL' ? randBetween(8000, 25000, 0) : randBetween(500, 12000, 0),
      critical_load: crit === 'CRITICAL' ? 1 : (Math.random() > 0.7 ? 1 : 0),
      maintenance_status: pick(['UP_TO_DATE', 'DUE_SOON', 'OVERDUE', 'IN_PROGRESS']),
      health_status: health,
      last_inspection: randomDate(2024, 2026),
      last_maintenance: randomDate(2023, 2026),
      next_scheduled_maintenance: randomDate(2026, 2027),
    });
  }

  // Generate ~30 breakers
  for (let i = 0; i < 30; i++) {
    brkCount++;
    const sub = pick(substations);
    assets.push({
      asset_id: `BR-${String(3000 + brkCount).padStart(4, '0')}`,
      asset_name: `${sub.region} Breaker ${brkCount}`,
      asset_type: 'Breaker',
      manufacturer: pick(MANUFACTURERS),
      model: pick(BREAKER_MODELS),
      serial_number: `SN-${uuid().slice(0, 8).toUpperCase()}`,
      installation_date: randomDate(1995, 2022),
      commissioning_date: randomDate(1996, 2022),
      latitude: +(sub.latitude + randBetween(-0.03, 0.03, 4)).toFixed(4),
      longitude: +(sub.longitude + randBetween(-0.03, 0.03, 4)).toFixed(4),
      region: sub.region,
      zone: sub.zone,
      substation_id: sub.substation_id,
      rated_power_mva: null,
      voltage_level: sub.voltage_level,
      criticality: pick(CRITICALITY_LEVELS),
      customers_served: randBetween(200, 5000, 0),
      critical_load: 0,
      maintenance_status: pick(['UP_TO_DATE', 'DUE_SOON', 'OVERDUE']),
      health_status: pick(HEALTH_STATUSES),
      last_inspection: randomDate(2024, 2026),
      last_maintenance: randomDate(2023, 2026),
      next_scheduled_maintenance: randomDate(2026, 2028),
    });
  }

  // Generate ~15 feeders
  for (let i = 0; i < 15; i++) {
    fdrCount++;
    const sub = pick(substations);
    assets.push({
      asset_id: `FD-${String(5000 + fdrCount).padStart(4, '0')}`,
      asset_name: `${sub.region} Feeder ${fdrCount}`,
      asset_type: 'Feeder',
      manufacturer: pick(MANUFACTURERS),
      model: null,
      serial_number: `SN-${uuid().slice(0, 8).toUpperCase()}`,
      installation_date: randomDate(2000, 2020),
      commissioning_date: randomDate(2000, 2021),
      latitude: +(sub.latitude + randBetween(-0.08, 0.08, 4)).toFixed(4),
      longitude: +(sub.longitude + randBetween(-0.08, 0.08, 4)).toFixed(4),
      region: sub.region,
      zone: sub.zone,
      substation_id: sub.substation_id,
      rated_power_mva: null,
      voltage_level: sub.voltage_level,
      criticality: pick(['LOW', 'MEDIUM', 'HIGH']),
      customers_served: randBetween(100, 3000, 0),
      critical_load: 0,
      maintenance_status: pick(['UP_TO_DATE', 'DUE_SOON']),
      health_status: pick(HEALTH_STATUSES),
      last_inspection: randomDate(2024, 2026),
      last_maintenance: randomDate(2024, 2026),
      next_scheduled_maintenance: randomDate(2026, 2028),
    });
  }

  // Generate 5 renewable-connected transformers
  for (let i = 0; i < 5; i++) {
    renCount++;
    const sub = pick(substations);
    assets.push({
      asset_id: `RN-${String(7000 + renCount).padStart(4, '0')}`,
      asset_name: `${sub.region} Solar Farm TX ${renCount}`,
      asset_type: 'Renewable',
      manufacturer: pick(MANUFACTURERS),
      model: pick(TRANSFORMER_MODELS),
      serial_number: `SN-${uuid().slice(0, 8).toUpperCase()}`,
      installation_date: randomDate(2018, 2024),
      commissioning_date: randomDate(2018, 2024),
      latitude: +(sub.latitude + randBetween(-0.1, 0.1, 4)).toFixed(4),
      longitude: +(sub.longitude + randBetween(-0.1, 0.1, 4)).toFixed(4),
      region: sub.region,
      zone: sub.zone,
      substation_id: sub.substation_id,
      rated_power_mva: pick([5, 10, 20, 40]),
      voltage_level: '69kV',
      criticality: 'MEDIUM',
      customers_served: randBetween(500, 4000, 0),
      critical_load: 0,
      maintenance_status: 'UP_TO_DATE',
      health_status: pick(['HEALTHY', 'WATCH']),
      last_inspection: randomDate(2025, 2026),
      last_maintenance: randomDate(2025, 2026),
      next_scheduled_maintenance: randomDate(2026, 2027),
    });
  }

  return assets;
}

// ─── Generate Sensor Readings (time-series) ─────────────────────────
function generateSensorReadings(assets: any[]): any[] {
  const readings: any[] = [];
  const now = Date.now();

  for (const asset of assets) {
    // Generate 72 hours of hourly readings
    const isTransformer = asset.asset_type === 'Transformer' || asset.asset_type === 'Renewable';
    const isUnhealthy = asset.health_status === 'WARNING' || asset.health_status === 'CRITICAL';

    for (let h = 72; h >= 0; h--) {
      const ts = new Date(now - h * 3600_000).toISOString();
      const drift = isUnhealthy ? (72 - h) * 0.15 : 0; // Gradual degradation for unhealthy assets

      const reading: any = {
        asset_id: asset.asset_id,
        timestamp: ts,
        temperature: randBetween(35 + drift, 65 + drift),
        load_percent: randBetween(30, isUnhealthy ? 95 : 75),
        vibration: randBetween(0.5, isUnhealthy ? 8.5 : 4.0),
        humidity: randBetween(20, 75),
      };

      if (isTransformer) {
        reading.winding_temperature = randBetween(45 + drift, 85 + drift);
        reading.hotspot_temperature = randBetween(55 + drift, 105 + drift);
        reading.current_a = randBetween(100, 600);
        reading.voltage_kv = randBetween(60, 240);
        reading.oil_temperature = randBetween(40 + drift * 0.5, 75 + drift * 0.5);
        reading.oil_moisture = randBetween(5, isUnhealthy ? 40 : 20);
        reading.hydrogen = randBetween(10, isUnhealthy ? 500 : 100);
        reading.methane = randBetween(5, isUnhealthy ? 200 : 50);
        reading.acetylene = randBetween(0, isUnhealthy ? 50 : 5);
        reading.ethylene = randBetween(5, isUnhealthy ? 150 : 30);
        reading.ethane = randBetween(2, isUnhealthy ? 80 : 20);
        reading.carbon_monoxide = randBetween(50, isUnhealthy ? 800 : 200);
        reading.carbon_dioxide = randBetween(1000, isUnhealthy ? 8000 : 3000);
        reading.power_factor = randBetween(isUnhealthy ? 0.82 : 0.95, 1.0, 3);
        reading.harmonic_distortion = randBetween(1, isUnhealthy ? 12 : 5);
        reading.current_unbalance = randBetween(0.5, isUnhealthy ? 8 : 3);
        reading.voltage_unbalance = randBetween(0.3, isUnhealthy ? 5 : 2);
        reading.bushing_capacitance = randBetween(isUnhealthy ? 280 : 300, 340, 1);
        reading.bushing_tandelta = randBetween(0.2, isUnhealthy ? 1.5 : 0.6, 3);
        reading.tap_changer_operations = Math.floor(Math.random() * (isUnhealthy ? 15 : 5));
      }

      readings.push(reading);
    }
  }

  return readings;
}

// ─── Generate Incidents ─────────────────────────────────────────────
function generateIncidents(assets: any[]): any[] {
  const incidents: any[] = [];
  const unhealthyAssets = assets.filter(a => a.health_status === 'WARNING' || a.health_status === 'CRITICAL');
  const candidateAssets = [...unhealthyAssets, ...assets.slice(0, 20)]; // Bias towards unhealthy

  for (let i = 0; i < 45; i++) {
    const asset = pick(candidateAssets);
    const severity = pick(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const);
    incidents.push({
      incident_id: `INC-${uuid().slice(0, 8).toUpperCase()}`,
      asset_id: asset.asset_id,
      timestamp: hoursAgo(randBetween(1, 8760, 0)), // Up to 1 year ago
      incident_type: pick(INCIDENT_TYPES),
      severity,
      duration_hours: randBetween(0.5, 72),
      root_cause: pick(['Equipment aging', 'Weather damage', 'Overload', 'Manufacturing defect', 'Inadequate maintenance', 'External interference']),
      weather_condition: pick(WEATHER_CONDITIONS),
      load_condition: pick(['Normal', 'High', 'Peak', 'Low']),
      maintenance_before: Math.random() > 0.6 ? 1 : 0,
      resolution: pick(RESOLUTIONS),
      downtime_hours: severity === 'CRITICAL' ? randBetween(8, 48) : randBetween(0, 12),
      customers_affected: severity === 'CRITICAL' ? randBetween(1000, 15000, 0) : randBetween(0, 3000, 0),
    });
  }

  return incidents;
}

// ─── Generate Crews ─────────────────────────────────────────────────
function generateCrews(): any[] {
  return CREW_NAMES.map((name, i) => ({
    crew_id: `CRW-${String(i + 1).padStart(3, '0')}`,
    crew_name: name,
    skills: JSON.stringify([pick(CREW_SKILLS), pick(CREW_SKILLS)].filter((v, idx, arr) => arr.indexOf(v) === idx)),
    base_latitude: +(BASE_LAT + randBetween(-0.4, 0.4, 4)).toFixed(4),
    base_longitude: +(BASE_LNG + randBetween(-0.4, 0.4, 4)).toFixed(4),
    base_location: pick(REGIONS),
    availability: pick(['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'ASSIGNED', 'OFF_DUTY'] as const), // Bias available
    shift: pick(['Day', 'Night', 'Swing']),
    status: 'ACTIVE',
    capacity: pick([3, 4, 5, 6]),
  }));
}

// ─── Generate Work Orders ───────────────────────────────────────────
function generateWorkOrders(assets: any[], crews: any[]): any[] {
  const orders: any[] = [];
  const unhealthy = assets.filter(a => a.health_status !== 'HEALTHY');

  for (let i = 0; i < 31; i++) {
    const asset = pick(unhealthy.length > 0 ? unhealthy : assets);
    const priority = pick(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const);
    const status = pick(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'] as const);
    orders.push({
      work_order_id: `WO-${String(2000 + i).padStart(5, '0')}`,
      asset_id: asset.asset_id,
      type: pick(['Inspection', 'Preventive Maintenance', 'Corrective Maintenance', 'Emergency Repair', 'Oil Sampling', 'Bushing Test', 'DGA Analysis']),
      priority,
      created_at: hoursAgo(randBetween(1, 720, 0)),
      recommended_by: pick(['SYSTEM', 'OPERATOR', 'ASSET_MANAGER']),
      assigned_crew: status !== 'NEW' ? pick(crews).crew_id : null,
      status,
      due_date: randomDate(2026, 2026),
      notes: pick(['Routine check', 'Elevated readings detected', 'Weather damage assessment', 'Follow-up from previous incident', 'Scheduled overhaul']),
      resolution: status === 'COMPLETED' ? pick(RESOLUTIONS) : null,
      completed_at: status === 'COMPLETED' ? hoursAgo(randBetween(1, 168, 0)) : null,
    });
  }

  return orders;
}

// ─── Generate Thresholds ────────────────────────────────────────────
function generateThresholds(): any[] {
  return [
    { asset_type: 'Transformer', sensor_field: 'temperature', watch_high: 65, warning_high: 80, critical_high: 95, unit: '°C' },
    { asset_type: 'Transformer', sensor_field: 'hotspot_temperature', watch_high: 85, warning_high: 110, critical_high: 130, unit: '°C' },
    { asset_type: 'Transformer', sensor_field: 'winding_temperature', watch_high: 75, warning_high: 95, critical_high: 115, unit: '°C' },
    { asset_type: 'Transformer', sensor_field: 'load_percent', watch_high: 70, warning_high: 85, critical_high: 100, unit: '%' },
    { asset_type: 'Transformer', sensor_field: 'vibration', watch_high: 4.0, warning_high: 6.0, critical_high: 8.0, unit: 'mm/s' },
    { asset_type: 'Transformer', sensor_field: 'oil_moisture', watch_high: 20, warning_high: 30, critical_high: 40, unit: 'ppm' },
    { asset_type: 'Transformer', sensor_field: 'hydrogen', watch_high: 100, warning_high: 300, critical_high: 500, unit: 'ppm' },
    { asset_type: 'Transformer', sensor_field: 'acetylene', watch_high: 5, warning_high: 20, critical_high: 50, unit: 'ppm' },
    { asset_type: 'Transformer', sensor_field: 'methane', watch_high: 50, warning_high: 120, critical_high: 200, unit: 'ppm' },
    { asset_type: 'Transformer', sensor_field: 'ethylene', watch_high: 30, warning_high: 80, critical_high: 150, unit: 'ppm' },
    { asset_type: 'Transformer', sensor_field: 'carbon_monoxide', watch_high: 200, warning_high: 500, critical_high: 800, unit: 'ppm' },
    { asset_type: 'Transformer', sensor_field: 'bushing_tandelta', watch_high: 0.5, warning_high: 0.8, critical_high: 1.2, unit: '%' },
    { asset_type: 'Transformer', sensor_field: 'power_factor', watch_low: 0.95, warning_low: 0.90, critical_low: 0.85, unit: '' },
    { asset_type: 'Breaker', sensor_field: 'temperature', watch_high: 55, warning_high: 70, critical_high: 85, unit: '°C' },
    { asset_type: 'Breaker', sensor_field: 'vibration', watch_high: 3.5, warning_high: 5.0, critical_high: 7.0, unit: 'mm/s' },
    { asset_type: 'Feeder', sensor_field: 'temperature', watch_high: 60, warning_high: 75, critical_high: 90, unit: '°C' },
    { asset_type: 'Feeder', sensor_field: 'load_percent', watch_high: 75, warning_high: 90, critical_high: 100, unit: '%' },
    { asset_type: 'Renewable', sensor_field: 'temperature', watch_high: 60, warning_high: 75, critical_high: 90, unit: '°C' },
    { asset_type: 'Renewable', sensor_field: 'vibration', watch_high: 3.5, warning_high: 5.5, critical_high: 7.5, unit: 'mm/s' },
  ];
}

// ─── Generate Alerts ────────────────────────────────────────────────
function generateAlerts(assets: any[]): any[] {
  const alerts: any[] = [];
  const unhealthy = assets.filter(a => a.health_status !== 'HEALTHY');

  const alertTemplates = [
    { type: 'SENSOR_THRESHOLD', severity: 'HIGH', titleFn: (a: any) => `Elevated temperature on ${a.asset_id}`, msgFn: (a: any) => `Temperature exceeds warning threshold on ${a.asset_name}` },
    { type: 'ANOMALY', severity: 'HIGH', titleFn: (a: any) => `Anomaly detected on ${a.asset_id}`, msgFn: (a: any) => `Abnormal sensor pattern detected on ${a.asset_name}` },
    { type: 'FAILURE_RISK', severity: 'CRITICAL', titleFn: (a: any) => `High failure risk: ${a.asset_id}`, msgFn: (a: any) => `Failure probability elevated for ${a.asset_name}` },
    { type: 'WEATHER', severity: 'MEDIUM', titleFn: (a: any) => `Weather exposure: ${a.region}`, msgFn: (a: any) => `Severe weather may affect ${a.asset_name}` },
    { type: 'MAINTENANCE_DUE', severity: 'LOW', titleFn: (a: any) => `Maintenance due: ${a.asset_id}`, msgFn: (a: any) => `Scheduled maintenance approaching for ${a.asset_name}` },
  ];

  for (let i = 0; i < 15; i++) {
    const asset = pick(i < 8 ? unhealthy : assets);
    const template = pick(alertTemplates);
    alerts.push({
      alert_id: `ALT-${uuid().slice(0, 8).toUpperCase()}`,
      asset_id: asset.asset_id,
      timestamp: hoursAgo(randBetween(0.1, 72, 1)),
      alert_type: template.type,
      severity: template.severity,
      title: template.titleFn(asset),
      message: template.msgFn(asset),
      status: pick(['UNREAD', 'UNREAD', 'UNREAD', 'ACKNOWLEDGED'] as const),
    });
  }

  return alerts;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SEED
// ═══════════════════════════════════════════════════════════════════
function seed() {
  console.log('🔌 GRIDGUARD Data Seeder');
  console.log('========================');
  console.log('⚠️  All data is SYNTHETIC for demo purposes.\n');

  initializeDatabase();
  const db = getDb();

  // Clear existing data
  const tables = ['audit_log', 'alerts', 'predictions', 'health_scores', 'weather_cache', 'work_orders', 'sensor_readings', 'incidents', 'crews', 'assets', 'substations', 'thresholds'];
  for (const t of tables) {
    db.prepare(`DELETE FROM ${t}`).run();
  }
  console.log('🗑️  Cleared existing data');

  // Generate
  const substations = generateSubstations();
  const assets = generateAssets(substations);
  const sensorReadings = generateSensorReadings(assets);
  const incidents = generateIncidents(assets);
  const crews = generateCrews();
  const workOrders = generateWorkOrders(assets, crews);
  const thresholds = generateThresholds();
  const alerts = generateAlerts(assets);

  // Insert substations
  const insertSub = db.prepare(`INSERT INTO substations (substation_id, name, latitude, longitude, region, zone, voltage_level, importance, connected_feeders, redundancy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const s of substations) {
    insertSub.run(s.substation_id, s.name, s.latitude, s.longitude, s.region, s.zone, s.voltage_level, s.importance, s.connected_feeders, s.redundancy);
  }
  console.log(`✅ Inserted ${substations.length} substations`);

  // Insert assets
  const insertAsset = db.prepare(`INSERT INTO assets (asset_id, asset_name, asset_type, manufacturer, model, serial_number, installation_date, commissioning_date, latitude, longitude, region, zone, substation_id, rated_power_mva, voltage_level, criticality, customers_served, critical_load, maintenance_status, health_status, last_inspection, last_maintenance, next_scheduled_maintenance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const a of assets) {
    insertAsset.run(a.asset_id, a.asset_name, a.asset_type, a.manufacturer, a.model, a.serial_number, a.installation_date, a.commissioning_date, a.latitude, a.longitude, a.region, a.zone, a.substation_id, a.rated_power_mva, a.voltage_level, a.criticality, a.customers_served, a.critical_load, a.maintenance_status, a.health_status, a.last_inspection, a.last_maintenance, a.next_scheduled_maintenance);
  }
  console.log(`✅ Inserted ${assets.length} assets`);

  // Insert sensor readings (batch for performance)
  const insertReading = db.prepare(`INSERT INTO sensor_readings (asset_id, timestamp, temperature, winding_temperature, hotspot_temperature, load_percent, current_a, voltage_kv, vibration, humidity, oil_temperature, oil_moisture, hydrogen, methane, acetylene, ethylene, ethane, carbon_monoxide, carbon_dioxide, power_factor, harmonic_distortion, current_unbalance, voltage_unbalance, bushing_capacitance, bushing_tandelta, tap_changer_operations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertBatch = db.transaction((readings: any[]) => {
    for (const r of readings) {
      insertReading.run(r.asset_id, r.timestamp, r.temperature, r.winding_temperature, r.hotspot_temperature, r.load_percent, r.current_a, r.voltage_kv, r.vibration, r.humidity, r.oil_temperature, r.oil_moisture, r.hydrogen, r.methane, r.acetylene, r.ethylene, r.ethane, r.carbon_monoxide, r.carbon_dioxide, r.power_factor, r.harmonic_distortion, r.current_unbalance, r.voltage_unbalance, r.bushing_capacitance, r.bushing_tandelta, r.tap_changer_operations);
    }
  });
  insertBatch(sensorReadings);
  console.log(`✅ Inserted ${sensorReadings.length} sensor readings`);

  // Insert incidents
  const insertInc = db.prepare(`INSERT INTO incidents (incident_id, asset_id, timestamp, incident_type, severity, duration_hours, root_cause, weather_condition, load_condition, maintenance_before, resolution, downtime_hours, customers_affected) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const inc of incidents) {
    insertInc.run(inc.incident_id, inc.asset_id, inc.timestamp, inc.incident_type, inc.severity, inc.duration_hours, inc.root_cause, inc.weather_condition, inc.load_condition, inc.maintenance_before, inc.resolution, inc.downtime_hours, inc.customers_affected);
  }
  console.log(`✅ Inserted ${incidents.length} incidents`);

  // Insert crews
  const insertCrew = db.prepare(`INSERT INTO crews (crew_id, crew_name, skills, base_latitude, base_longitude, base_location, availability, shift, status, capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const c of crews) {
    insertCrew.run(c.crew_id, c.crew_name, c.skills, c.base_latitude, c.base_longitude, c.base_location, c.availability, c.shift, c.status, c.capacity);
  }
  console.log(`✅ Inserted ${crews.length} crews`);

  // Insert work orders
  const insertWO = db.prepare(`INSERT INTO work_orders (work_order_id, asset_id, type, priority, created_at, recommended_by, assigned_crew, status, due_date, notes, resolution, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const wo of workOrders) {
    insertWO.run(wo.work_order_id, wo.asset_id, wo.type, wo.priority, wo.created_at, wo.recommended_by, wo.assigned_crew, wo.status, wo.due_date, wo.notes, wo.resolution, wo.completed_at);
  }
  console.log(`✅ Inserted ${workOrders.length} work orders`);

  // Insert thresholds
  const insertThresh = db.prepare(`INSERT OR REPLACE INTO thresholds (asset_type, sensor_field, watch_low, watch_high, warning_low, warning_high, critical_low, critical_high, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const t of thresholds) {
    insertThresh.run(t.asset_type, t.sensor_field, t.watch_low ?? null, t.watch_high ?? null, t.warning_low ?? null, t.warning_high ?? null, t.critical_low ?? null, t.critical_high ?? null, t.unit);
  }
  console.log(`✅ Inserted ${thresholds.length} thresholds`);

  // Insert alerts
  const insertAlert = db.prepare(`INSERT INTO alerts (alert_id, asset_id, timestamp, alert_type, severity, title, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const a of alerts) {
    insertAlert.run(a.alert_id, a.asset_id, a.timestamp, a.alert_type, a.severity, a.title, a.message, a.status);
  }
  console.log(`✅ Inserted ${alerts.length} alerts`);

  console.log('\n🎉 Database seeded successfully!');
  console.log(`   📊 ${assets.length} assets | ${sensorReadings.length} readings | ${incidents.length} incidents`);
  console.log(`   🔧 ${workOrders.length} work orders | ${crews.length} crews | ${alerts.length} alerts`);

  closeDb();
}

seed();
