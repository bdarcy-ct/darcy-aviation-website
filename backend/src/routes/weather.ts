import { Router, Request, Response } from 'express';

const router = Router();

interface WeatherData {
  condition: string;
  temp_c: number | null;
  wind_speed_kt: number;
  wind_dir: number;
  wind_gust_kt: number | null;
  visibility_miles: number;
  ceiling_ft: number | null;
  flight_category: string;
  raw_metar: string;
  is_night: boolean;
  updated_at: string;
}

let cachedWeather: WeatherData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function determineCondition(metar: any): string {
  const raw: string = metar.rawOb || '';

  // Check weather phenomena in raw METAR (appears before remarks "RMK")
  const mainPart = raw.split(' RMK ')[0] || raw;

  // Thunderstorm
  if (/\bTS\b/.test(mainPart)) return 'thunderstorm';
  // Snow
  if (/\b[+-]?SN\b/.test(mainPart)) return 'snow';
  // Rain (includes drizzle DZ)
  if (/\b[+-]?(RA|DZ|SHRA|SHRA)\b/.test(mainPart)) return 'rain';
  // Fog
  if (/\bFG\b/.test(mainPart)) return 'fog';
  // Mist / Haze
  if (/\b(BR|HZ)\b/.test(mainPart)) return 'mist';

  // Sky cover based conditions
  const cover = metar.cover || '';
  switch (cover) {
    case 'CLR':
    case 'SKC':
    case 'CAVOK':
      return 'clear';
    case 'FEW':
      return 'few_clouds';
    case 'SCT':
      return 'scattered';
    case 'BKN':
      return 'broken';
    case 'OVC':
      return 'overcast';
    default:
      return 'clear';
  }
}

function determineIsNight(): boolean {
  // Use Eastern Time (KDXR is in ET)
  const now = new Date();
  const etOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    hour: 'numeric',
    hour12: false,
  };
  const hourStr = new Intl.DateTimeFormat('en-US', etOptions).format(now);
  const hour = parseInt(hourStr, 10);
  // Night: 6pm (18) to 6am (6)
  return hour >= 18 || hour < 6;
}

function parseVisibility(visib: any): number {
  if (typeof visib === 'number') return visib;
  if (typeof visib === 'string') {
    if (visib.includes('+')) return parseFloat(visib) || 10;
    return parseFloat(visib) || 10;
  }
  return 10;
}

function getCeiling(clouds: any[]): number | null {
  if (!Array.isArray(clouds)) return null;
  // Ceiling is the lowest BKN or OVC layer
  for (const layer of clouds) {
    if (layer.cover === 'BKN' || layer.cover === 'OVC') {
      return layer.base || null;
    }
  }
  return null;
}

async function fetchWeather(): Promise<WeatherData> {
  const url = 'https://aviationweather.gov/api/data/metar?ids=KDXR&format=json';
  const response = await fetch(url, {
    headers: { 'User-Agent': 'DarcyAviation/1.0' },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`METAR API returned ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No METAR data returned for KDXR');
  }

  const metar = data[0];

  return {
    condition: determineCondition(metar),
    temp_c: metar.temp ?? null,
    wind_speed_kt: metar.wspd ?? 0,
    wind_dir: metar.wdir ?? 0,
    wind_gust_kt: metar.wgst ?? null,
    visibility_miles: parseVisibility(metar.visib),
    ceiling_ft: getCeiling(metar.clouds),
    flight_category: metar.fltCat || 'VFR',
    raw_metar: metar.rawOb || '',
    is_night: determineIsNight(),
    updated_at: new Date().toISOString(),
  };
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cachedWeather && now - cacheTimestamp < CACHE_DURATION_MS) {
      res.json(cachedWeather);
      return;
    }

    const weather = await fetchWeather();
    cachedWeather = weather;
    cacheTimestamp = now;
    res.json(weather);
  } catch (error) {
    console.error('Weather fetch error:', error);
    // Return cached data if available, even if stale
    if (cachedWeather) {
      res.json(cachedWeather);
      return;
    }
    // Fallback when no cached data
    res.json({
      condition: 'clear',
      temp_c: null,
      wind_speed_kt: 0,
      wind_dir: 0,
      wind_gust_kt: null,
      visibility_miles: 10,
      ceiling_ft: null,
      flight_category: 'VFR',
      raw_metar: '',
      is_night: determineIsNight(),
      updated_at: new Date().toISOString(),
    });
  }
});

export default router;
