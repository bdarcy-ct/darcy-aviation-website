import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';

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

// ─── HTML Email Builder ─────────────────────────────────────────────────────

function buildDispatchHTML(d: any): string {
  const f = (n: number) => n?.toFixed(2) ?? '—';
  const rows = d.rows || [];

  const rowsHTML = rows.map((r: any) => {
    const color = r.color === 'purple' ? '#7c3aed' : r.color === 'blue' ? '#2563eb' : r.color === 'green' ? '#059669' : r.color === 'red' ? '#dc2626' : '#333';
    const bold = r.bold ? 'font-weight:700;' : '';
    const bg = r.overweight ? 'background:#fee2e2;' : r.subtotal ? 'border-top:1.5px solid #999;' : '';
    return `<tr style="${bg}">
      <td style="padding:3px 6px;text-align:right;${bold}color:${color}">${r.label}</td>
      <td style="padding:3px 4px;text-align:center;color:#666">${r.op || ''}</td>
      <td style="padding:3px 6px;text-align:right;font-family:monospace;${bold}color:${color}">${f(r.weight)}</td>
      <td style="padding:3px 4px;text-align:center;color:#ccc">×</td>
      <td style="padding:3px 6px;text-align:right;font-family:monospace;color:${color}">${f(r.arm)}</td>
      <td style="padding:3px 4px;text-align:center;color:#666">${r.opM || ''}</td>
      <td style="padding:3px 6px;text-align:right;font-family:monospace;color:${color}">${f(r.moment)}</td>
    </tr>`;
  }).join('\n');

  const condRow = (label: string, depVal: string, destVal: string) =>
    `<tr><td style="padding:2px 6px;color:#666;font-size:11px">${label}</td><td style="padding:2px 6px;text-align:center;font-size:11px">${depVal}</td><td style="padding:2px 6px;text-align:center;font-size:11px">${destVal}</td></tr>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:20px;background:#f5f5f5;font-family:Inter,Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:12px">
<div style="max-width:720px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

  <!-- Header -->
  <div style="background:#111827;color:white;padding:16px 24px;text-align:center">
    <div style="font-size:20px;font-weight:700;letter-spacing:0.5px">Weight &amp; Balance</div>
    <div style="font-size:10px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin-top:2px">Darcy Aviation — KDXR</div>
  </div>

  <div style="padding:16px 20px">

    <!-- Info bar -->
    <table style="width:100%;margin-bottom:12px;font-size:12px"><tr>
      <td><strong>Aircraft:</strong> ${d.aircraft} (${d.aircraftType})</td>
      <td style="text-align:center"><strong>Route:</strong> ${d.departure || '—'} → ${d.destination || '—'}</td>
      <td style="text-align:right"><strong>Date:</strong> ${d.dateStr}</td>
    </tr></table>

    <div style="display:flex;gap:12px">

      <!-- LEFT: Conditions -->
      <div style="width:200px;flex-shrink:0;border:1px solid #e5e7eb;border-radius:6px;padding:8px">
        <div style="text-align:center;font-weight:700;font-size:11px;background:#f3f4f6;border-radius:4px;padding:3px;margin-bottom:6px">Conditions</div>
        <table style="width:100%;font-size:11px;border-collapse:collapse">
          <tr><td></td><td style="text-align:center;font-size:9px;color:#999;font-weight:600">DEP</td><td style="text-align:center;font-size:9px;color:#999;font-weight:600">DEST</td></tr>
          ${condRow('Winds', d.depWinds || '—', d.destWinds || '—')}
          ${condRow('HW / CW', d.depHwCw || '— / —', d.destHwCw || '— / —')}
          ${condRow('Temp / Dp', d.depTemp || '—', d.destTemp || '—')}
          ${condRow('Altimeter', d.depAlt || '—', d.destAlt || '—')}
          ${condRow('Press Alt', d.depPA || '—', d.destPA || '—')}
          ${condRow('Dens Alt', d.depDA || '—', d.destDA || '—')}
        </table>
        <div style="text-align:center;font-weight:700;font-size:11px;background:#f3f4f6;border-radius:4px;padding:3px;margin:8px 0 6px">Performance</div>
        <table style="width:100%;font-size:11px;border-collapse:collapse">
          <tr><td style="padding:2px 6px;color:#666">Va (T/O / Ldg)</td><td style="text-align:center">${d.vaTo || '—'} / ${d.vaLd || '—'}</td></tr>
          <tr><td style="padding:2px 6px;color:#666">T/O Roll / 50'</td><td style="text-align:center">${d.toGr || '—'} / ${d.toObs || '—'}</td></tr>
          <tr><td style="padding:2px 6px;color:#666">Ldg Roll / 50' (dep)</td><td style="text-align:center">${d.ldGrDep || '—'} / ${d.ldObsDep || '—'}</td></tr>
          <tr><td style="padding:2px 6px;color:#666">Ldg Roll / 50' (dest)</td><td style="text-align:center">${d.ldGrDest || '—'} / ${d.ldObsDest || '—'}</td></tr>
        </table>
      </div>

      <!-- RIGHT: W&B Table -->
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:6px;padding:8px">
        <table style="width:100%;font-size:11px;margin-bottom:6px"><tr>
          <td style="text-align:center"><div style="color:#999;font-size:9px">Max Wt</div><strong>${d.maxGross}</strong></td>
          <td style="text-align:center"><div style="color:#999;font-size:9px">Useful</div><strong>${f(d.usefulLoad)}</strong></td>
          <td style="text-align:center"><div style="color:#999;font-size:9px">BEW</div><strong>${f(d.bew)}</strong></td>
          <td style="text-align:center"><div style="color:#999;font-size:9px">Arm</div><strong>${f(d.bewArm)}</strong></td>
          <td style="text-align:center"><div style="color:#999;font-size:9px">Moment</div><strong>${f(d.bewMoment)}</strong></td>
        </tr></table>
        <table style="width:100%;font-size:11px;border-collapse:collapse">
          <tr style="border-bottom:1px solid #ddd">
            <th style="text-align:right;padding:3px 6px;color:#999;font-weight:600"></th>
            <th style="width:20px"></th>
            <th style="text-align:right;padding:3px 6px;color:#999;font-weight:600">Weight</th>
            <th style="width:20px;text-align:center;color:#ccc">×</th>
            <th style="text-align:right;padding:3px 6px;color:#999;font-weight:600">Arm</th>
            <th style="width:20px"></th>
            <th style="text-align:right;padding:3px 6px;color:#999;font-weight:600">Moment</th>
          </tr>
          ${rowsHTML}
        </table>
      </div>
    </div>

    <!-- METAR raw -->
    <div style="margin-top:12px;padding:8px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:10px;font-family:monospace;color:#666">
      <div><strong>DEP METAR:</strong> ${d.depMetar || 'N/A'}</div>
      ${d.destMetar ? `<div><strong>DEST METAR:</strong> ${d.destMetar}</div>` : ''}
    </div>

    <!-- Signature -->
    <div style="margin-top:16px;display:flex;justify-content:space-between;font-size:11px">
      <div><strong>Pilot/Student:</strong> ${d.pilotName}</div>
      <div><strong>Date:</strong> ${d.dateStr}</div>
    </div>
    <div style="margin-top:14px;display:flex;justify-content:space-between;font-size:11px;color:#999">
      <div>Signature: ________________________</div>
      <div>Instructor: ________________________</div>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:10px;font-size:9px;color:#999;border-top:1px solid #eee">
    Darcy Aviation — KDXR Danbury, CT · For planning purposes — verify with POH/AFM
  </div>
</div></body></html>`;
}

// ─── POST /api/wb/dispatch ──────────────────────────────────────────────────

router.post('/dispatch', async (req: Request, res: Response) => {
  const d = req.body;

  if (!d.pilotName || !d.aircraft) {
    res.status(400).json({ error: 'Pilot name and aircraft required' });
    return;
  }

  const now = new Date(d.timestamp || Date.now());
  d.dateStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });

  const htmlBody = buildDispatchHTML(d);

  // Plain-text fallback
  const textBody = `WEIGHT & BALANCE — DARCY AVIATION
Date: ${d.dateStr}
Pilot: ${d.pilotName}
Aircraft: ${d.aircraft} (${d.aircraftType})
Route: ${d.departure || '—'} → ${d.destination || '—'}
Takeoff: ${d.takeoffWeight?.toFixed(1)} lbs / CG ${d.takeoffCg?.toFixed(2)}"
Landing: ${d.landingWeight?.toFixed(1)} lbs / CG ${d.landingCg?.toFixed(2)}"
DEP METAR: ${d.depMetar || 'N/A'}
DEST METAR: ${d.destMetar || 'N/A'}`;

  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const DISPATCH_EMAIL = process.env.DISPATCH_EMAIL || 'dispatch@darcyaviation.com';

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const port = parseInt(SMTP_PORT || '465');
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      await transporter.sendMail({
        from: `"Darcy Aviation W&B" <${SMTP_USER}>`,
        to: DISPATCH_EMAIL,
        subject: `W&B Sheet — ${d.aircraft} — ${d.pilotName} — ${d.departure || 'KDXR'} → ${d.destination || '?'}`,
        text: textBody,
        html: htmlBody,
      });

      console.log(`✈️ W&B dispatch email sent for ${d.aircraft} (${d.pilotName})`);
      res.json({ success: true, message: 'Weight & Balance sheet sent to dispatch' });
      return;
    } catch (emailErr: any) {
      console.error('Email send failed:', emailErr.message);
      res.json({ success: true, message: 'W&B sheet recorded (email delivery failed — check SMTP config)' });
      return;
    }
  }

  // No SMTP — log and return success
  console.log(`📋 W&B dispatch logged (no SMTP). Pilot: ${d.pilotName}, Aircraft: ${d.aircraft}`);
  console.log(`   Route: ${d.departure || '—'} → ${d.destination || '—'}`);
  console.log(`   T/O: ${d.takeoffWeight?.toFixed(1)} lbs, Ldg: ${d.landingWeight?.toFixed(1)} lbs`);

  res.json({
    success: true,
    message: 'Weight & Balance sheet recorded (email delivery pending SMTP setup)',
  });
});

export default router;
