import { Router } from 'express';
import { getDb } from '../database';

export const weatherRouter = Router();

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

interface WeatherData {
  temperature_c: number;
  wind_speed_kmh: number;
  wind_direction: string;
  rain_mm: number;
  humidity: number;
  weather_code: number;
  severe_weather: number;
  source: string;
}

// Fetch from Open-Meteo (free, no API key needed)
async function fetchLiveWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m,rain,relative_humidity_2m,weather_code&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const current = data.current;

    return {
      temperature_c: current.temperature_2m,
      wind_speed_kmh: current.wind_speed_10m,
      wind_direction: `${current.wind_direction_10m}°`,
      rain_mm: current.rain || 0,
      humidity: current.relative_humidity_2m,
      weather_code: current.weather_code,
      severe_weather: current.weather_code >= 95 ? 1 : 0,
      source: 'LIVE',
    };
  } catch {
    return null;
  }
}

// GET weather for an asset by coordinates
weatherRouter.get('/asset/:assetId', async (req, res) => {
  const db = getDb();
  const asset = db.prepare('SELECT latitude, longitude, region FROM assets WHERE asset_id = ?').get(req.params.assetId) as any;
  if (!asset) return res.status(404).json({ error: 'Asset not found' });

  // Try live weather
  let weather = await fetchLiveWeather(asset.latitude, asset.longitude);

  if (!weather) {
    // Fallback to cached
    const cached = db.prepare(
      'SELECT * FROM weather_cache WHERE latitude = ? AND longitude = ? ORDER BY timestamp DESC LIMIT 1'
    ).get(asset.latitude, asset.longitude) as any;

    if (cached) {
      weather = { ...cached, source: 'CACHED' };
    } else {
      // Use simulated fallback
      weather = {
        temperature_c: 22 + Math.random() * 10,
        wind_speed_kmh: 5 + Math.random() * 25,
        wind_direction: '180°',
        rain_mm: Math.random() > 0.7 ? Math.random() * 10 : 0,
        humidity: 40 + Math.random() * 40,
        weather_code: 0,
        severe_weather: 0,
        source: 'SIMULATED',
      };
    }
  }

  // Cache the result
  db.prepare(
    `INSERT INTO weather_cache (latitude, longitude, timestamp, source, temperature_c, wind_speed_kmh, wind_direction, rain_mm, humidity, weather_code, severe_weather)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(asset.latitude, asset.longitude, new Date().toISOString(), weather.source,
    weather.temperature_c, weather.wind_speed_kmh, weather.wind_direction,
    weather.rain_mm, weather.humidity, weather.weather_code, weather.severe_weather);

  res.json({
    asset_id: req.params.assetId,
    region: asset.region,
    ...weather,
    timestamp: new Date().toISOString(),
    data_mode: 'DEMO',
  });
});

// GET weather for all regions (aggregated)
weatherRouter.get('/regions', async (_req, res) => {
  const db = getDb();
  const regions = db.prepare(
    'SELECT DISTINCT region, AVG(latitude) as lat, AVG(longitude) as lng FROM assets GROUP BY region'
  ).all() as any[];

  const results = [];
  for (const region of regions) {
    let weather = await fetchLiveWeather(region.lat, region.lng);
    if (!weather) {
      weather = {
        temperature_c: 20 + Math.random() * 12,
        wind_speed_kmh: 5 + Math.random() * 30,
        wind_direction: '180°',
        rain_mm: Math.random() > 0.7 ? Math.random() * 10 : 0,
        humidity: 40 + Math.random() * 40,
        weather_code: 0,
        severe_weather: 0,
        source: 'SIMULATED',
      };
    }
    results.push({ region: region.region, ...weather });
  }

  res.json({ data: results, data_mode: 'DEMO' });
});
