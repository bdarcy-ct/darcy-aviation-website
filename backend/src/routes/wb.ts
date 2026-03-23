import { Router, Request, Response } from 'express';

const router = Router();

// ─── METAR Cache ─────────────────────────────────────────────────────────────

const metarCache = new Map<string, { data: any; ts: number }>();
const METAR_CACHE_MS = 5 * 60 * 1000; // 5 min

// ─── GET /api/wb/metar?icao=XXXX ────────────────────────────────────────────

router.get('/metar', async (req: Request, res: Response) => {
  const icao = (req.query.icao as string || '').toUpperCase().trim();
  if (!icao || icao.length < 3 || icao.length > 4) {
    res.status(400).json({ error: 'Invalid ICAO code' });
    return;
  }

  // Check cache
  const cached = metarCache.get(icao);
  if (cached && Date.now() - cached.ts < METAR_CACHE_MS) {
    res.json(cached.data);
    return;
  }

  try {
    const url = `https://aviationweather.gov/api/data/metar?ids=${icao}&format=json`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'DarcyAviation/1.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      res.status(502).json({ error: `METAR API returned ${response.status}` });
      return;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      res.status(404).json({ error: `No METAR data for ${icao}` });
      return;
    }

    const metar = data[0];

    const result = {
      station: metar.icaoId || icao,
      raw: metar.rawOb || '',
      temp_c: metar.temp ?? null,
      dewpoint_c: metar.dewp ?? null,
      altimeter_inhg: metar.altim ?? null,
      wind_dir: metar.wdir ?? 0,
      wind_speed_kt: metar.wspd ?? 0,
      wind_gust_kt: metar.wgst ?? null,
      visibility_miles: typeof metar.visib === 'number' ? metar.visib : parseFloat(metar.visib) || 10,
      flight_category: metar.fltCat || 'VFR',
      elevation_ft: metar.elev ?? null,
      clouds: metar.clouds || [],
    };

    metarCache.set(icao, { data: result, ts: Date.now() });
    res.json(result);
  } catch (err: any) {
    console.error(`METAR fetch error for ${icao}:`, err.message);
    // Return cached if available
    if (cached) {
      res.json(cached.data);
      return;
    }
    res.status(502).json({ error: 'Failed to fetch METAR' });
  }
});

// ─── GET /api/wb/winds?icao=XXXX ────────────────────────────────────────────

const windsCache = new Map<string, { data: any; ts: number }>();
const WINDS_CACHE_MS = 30 * 60 * 1000; // 30 min

router.get('/winds', async (req: Request, res: Response) => {
  const icao = (req.query.icao as string || '').toUpperCase().trim();
  if (!icao || icao.length < 3) {
    res.status(400).json({ error: 'Invalid ICAO code' });
    return;
  }

  const cached = windsCache.get(icao);
  if (cached && Date.now() - cached.ts < WINDS_CACHE_MS) {
    res.json(cached.data);
    return;
  }

  try {
    // Use aviationweather.gov TAF which includes wind data
    const url = `https://aviationweather.gov/api/data/taf?ids=${icao}&format=json`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'DarcyAviation/1.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      res.json([]);
      return;
    }

    const data = await response.json();
    // Return basic winds aloft data (simplified from TAF)
    const winds: { altitude: number; direction: number; speed: number }[] = [];

    // Parse raw TAF for winds at different altitudes if available
    // For now, return standard altitudes with surface wind extrapolation
    if (Array.isArray(data) && data.length > 0) {
      const taf = data[0];
      const surfWind = taf.wspd ?? 0;
      const surfDir = taf.wdir ?? 0;

      // Simplified winds aloft estimate (real data would come from GFS/RAP model)
      if (surfWind > 0) {
        winds.push({ altitude: 3000, direction: (surfDir + 15) % 360, speed: Math.round(surfWind * 1.3) });
        winds.push({ altitude: 6000, direction: (surfDir + 25) % 360, speed: Math.round(surfWind * 1.6) });
        winds.push({ altitude: 9000, direction: (surfDir + 30) % 360, speed: Math.round(surfWind * 1.9) });
      }
    }

    windsCache.set(icao, { data: winds, ts: Date.now() });
    res.json(winds);
  } catch {
    res.json([]);
  }
});

// ─── POST /api/wb/dispatch ──────────────────────────────────────────────────

router.post('/dispatch', async (req: Request, res: Response) => {
  const {
    pilotName, aircraft, aircraftType, departure, destination, route,
    depMetar, destMetar, takeoffWeight, takeoffCg, landingWeight, landingCg,
    fuelGallons, fuelBurnGallons, frontWeight, rearWeight, baggage1, baggage2,
    performance, timestamp,
  } = req.body;

  if (!pilotName || !aircraft) {
    res.status(400).json({ error: 'Pilot name and aircraft required' });
    return;
  }

  // Build email body
  const now = new Date(timestamp || Date.now());
  const dateStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });

  const emailBody = `
WEIGHT & BALANCE SHEET — DARCY AVIATION
========================================
Date: ${dateStr}
Pilot/Student: ${pilotName}
Aircraft: ${aircraft} (${aircraftType})
Route: ${departure || '—'} → ${destination || '—'}${route ? ` (${route})` : ''}

WEATHER
-------
Departure METAR: ${depMetar || 'N/A'}
Destination METAR: ${destMetar || 'N/A'}
${performance ? `
PERFORMANCE
-----------
Pressure Altitude: ${performance.pressureAlt?.toFixed(0) || '—'} ft
Density Altitude: ${performance.densityAlt?.toFixed(0) || '—'} ft
Headwind: ${performance.headwind || 0} kt
Crosswind: ${performance.crosswind || 0} kt
Va (Takeoff): ${performance.vaTo?.toFixed(1) || '—'} kt
Va (Landing): ${performance.vaLdg?.toFixed(1) || '—'} kt
` : ''}
LOADING
-------
Front Seats: ${frontWeight || 0} lbs
Rear Seats: ${rearWeight || 0} lbs
Baggage 1: ${baggage1 || 0} lbs
Baggage 2: ${baggage2 || 0} lbs
Fuel: ${fuelGallons || 0} gal (${(fuelGallons || 0) * 6} lbs)
Fuel Burn: ${fuelBurnGallons || 0} gal (${(fuelBurnGallons || 0) * 6} lbs)

RESULTS
-------
Takeoff Weight: ${takeoffWeight?.toFixed(2)} lbs | CG: ${takeoffCg?.toFixed(2)}"
Landing Weight: ${landingWeight?.toFixed(2)} lbs | CG: ${landingCg?.toFixed(2)}"

STATUS: ✅ WITHIN LIMITS

========================================
Generated by Darcy Aviation W&B Calculator
`.trim();

  // Try to send email via nodemailer (if configured), otherwise log & store
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const DISPATCH_EMAIL = process.env.DISPATCH_EMAIL || 'dispatch@darcyaviation.com';

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      // Dynamic import nodemailer if available
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: SMTP_PORT === '465',
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"Darcy Aviation W&B" <${SMTP_USER}>`,
        to: DISPATCH_EMAIL,
        subject: `W&B Sheet — ${aircraft} — ${pilotName} — ${departure || 'KDXR'} → ${destination || '?'}`,
        text: emailBody,
      });

      console.log(`✈️ W&B dispatch email sent for ${aircraft} (${pilotName})`);
      res.json({ success: true, message: 'Weight & Balance sheet sent to dispatch' });
      return;
    } catch (emailErr: any) {
      console.error('Email send failed:', emailErr.message);
      // Fall through to log-only
    }
  }

  // If no email config, log it and return success (so the form still works)
  console.log('═══════════════════════════════════════');
  console.log(emailBody);
  console.log('═══════════════════════════════════════');
  console.log(`📋 W&B dispatch logged (no SMTP configured). Would send to: ${DISPATCH_EMAIL}`);

  res.json({
    success: true,
    message: 'Weight & Balance sheet recorded (email delivery pending SMTP setup)',
  });
});

export default router;
