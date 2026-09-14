# GRIDGUARD — Data Dictionary

> All data in this prototype is **SYNTHETIC** demo data.

## Tables

### `substations`
| Field | Type | Description |
|-------|------|-------------|
| substation_id | TEXT PK | Unique identifier (SUB-001) |
| name | TEXT | Substation name |
| latitude | REAL | Geographic latitude |
| longitude | REAL | Geographic longitude |
| region | TEXT | Operating region |
| zone | TEXT | Grid zone |
| voltage_level | TEXT | Voltage class (69kV, 115kV, 230kV, 345kV) |
| importance | TEXT | STANDARD / HIGH / CRITICAL |
| connected_feeders | INT | Number of connected feeders |
| redundancy | TEXT | N / N-1 / N-2 |

### `assets`
| Field | Type | Description |
|-------|------|-------------|
| asset_id | TEXT PK | Unique ID (TX-1001, BR-3001, FD-5001, RN-7001) |
| asset_name | TEXT | Human-readable name |
| asset_type | TEXT | Transformer / Substation / Feeder / Breaker / Renewable |
| manufacturer | TEXT | Equipment manufacturer |
| model | TEXT | Equipment model |
| serial_number | TEXT | Serial number |
| installation_date | TEXT | ISO date |
| commissioning_date | TEXT | ISO date |
| latitude / longitude | REAL | GPS coordinates |
| region | TEXT | Operating region |
| zone | TEXT | Grid zone |
| substation_id | TEXT FK | Parent substation |
| rated_power_mva | REAL | Rated power in MVA |
| voltage_level | TEXT | Operating voltage |
| criticality | TEXT | LOW / MEDIUM / HIGH / CRITICAL |
| customers_served | INT | Number of downstream customers |
| critical_load | INT | Boolean: supplies critical infrastructure |
| health_status | TEXT | HEALTHY / WATCH / WARNING / CRITICAL / UNKNOWN |

### `sensor_readings`
Time-series sensor data. Not all fields apply to all asset types.

| Field | Type | Unit | Applies To |
|-------|------|------|------------|
| temperature | REAL | °C | All |
| winding_temperature | REAL | °C | Transformer, Renewable |
| hotspot_temperature | REAL | °C | Transformer, Renewable |
| load_percent | REAL | % | All |
| vibration | REAL | mm/s | All |
| oil_temperature | REAL | °C | Transformer |
| oil_moisture | REAL | ppm | Transformer |
| hydrogen | REAL | ppm | Transformer (DGA) |
| methane | REAL | ppm | Transformer (DGA) |
| acetylene | REAL | ppm | Transformer (DGA) |
| ethylene | REAL | ppm | Transformer (DGA) |
| ethane | REAL | ppm | Transformer (DGA) |
| carbon_monoxide | REAL | ppm | Transformer (DGA) |
| carbon_dioxide | REAL | ppm | Transformer (DGA) |
| power_factor | REAL | - | Transformer |
| bushing_capacitance | REAL | pF | Transformer |
| bushing_tandelta | REAL | % | Transformer |
| tap_changer_operations | INT | count | Transformer |

### `thresholds`
Configurable alarm thresholds per asset type and sensor field.

### `incidents`
Historical incident records with severity, root cause, weather, and resolution.

### `work_orders`
Maintenance work orders: NEW → ASSIGNED → IN_PROGRESS → COMPLETED.

### `crews`
Field crew records with skills, location, availability, and capacity.

### `predictions`
ML model predictions stored per asset with probability, risk band, and top features.

### `alerts`
System alerts: UNREAD → ACKNOWLEDGED → RESOLVED.

### `health_scores`
Computed health scores with 5-dimension breakdown (sensor, anomaly, maintenance, historical, age).
