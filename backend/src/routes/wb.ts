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

// ─── SVG CG Chart Builder ───────────────────────────────────────────────────

function buildCgChartSVG(d: any): string {
  const env = d.cgEnvelope || [];
  const util = d.utilityEnvelope || null;
  if (env.length < 2) return '';

  const points = [
    { label: 'ZFW', weight: d.zfwWeight || 0, cg: d.zfwCg || 0, color: '#7c3aed' },
    { label: 'T/O', weight: d.takeoffWeight || 0, cg: d.takeoffCg || 0, color: '#2563eb' },
    { label: 'Ldg', weight: d.landingWeight || 0, cg: d.landingCg || 0, color: '#059669' },
  ];

  const allEnvs = util ? [...env, ...util] : env;
  const allW = allEnvs.map((e: any) => e.weight);
  const allC = allEnvs.flatMap((e: any) => [e.fwd, e.aft]);
  const minW = Math.min(...allW) - 100, maxW = Math.max(...allW) + 75;
  const minC = Math.min(...allC) - 2, maxC = Math.max(...allC) + 2;

  const W = 460, H = 280;
  const p = { t: 15, r: 20, b: 35, l: 50 };
  const pW = W - p.l - p.r, pH = H - p.t - p.b;
  const sx = (c: number) => p.l + ((c - minC) / (maxC - minC)) * pW;
  const sy = (w: number) => p.t + pH - ((w - minW) / (maxW - minW)) * pH;

  const fwdN = env.map((e: any) => `${sx(e.fwd).toFixed(1)},${sy(e.weight).toFixed(1)}`);
  const aftN = [...env].reverse().map((e: any) => `${sx(e.aft).toFixed(1)},${sy(e.weight).toFixed(1)}`);
  const normalPoly = [...fwdN, ...aftN].join(' ');

  let utilPoly = '';
  if (util && util.length >= 2) {
    const fwdU = util.map((e: any) => `${sx(e.fwd).toFixed(1)},${sy(e.weight).toFixed(1)}`);
    const aftU = [...util].reverse().map((e: any) => `${sx(e.aft).toFixed(1)},${sy(e.weight).toFixed(1)}`);
    utilPoly = [...fwdU, ...aftU].join(' ');
  }

  // Grid lines
  const wS = maxW - minW > 800 ? 200 : 100, cS = maxC - minC > 20 ? 5 : 2;
  let gridLines = '';
  for (let w = Math.ceil(minW / wS) * wS; w <= maxW; w += wS) {
    gridLines += `<line x1="${p.l}" y1="${sy(w).toFixed(1)}" x2="${p.l + pW}" y2="${sy(w).toFixed(1)}" stroke="#ddd" stroke-width="0.5"/>`;
    gridLines += `<text x="${p.l - 4}" y="${(sy(w) + 3).toFixed(1)}" text-anchor="end" fill="#888" font-size="8">${w}</text>`;
  }
  for (let c = Math.ceil(minC / cS) * cS; c <= maxC; c += cS) {
    gridLines += `<line x1="${sx(c).toFixed(1)}" y1="${p.t}" x2="${sx(c).toFixed(1)}" y2="${p.t + pH}" stroke="#ddd" stroke-width="0.5"/>`;
    gridLines += `<text x="${sx(c).toFixed(1)}" y="${p.t + pH + 12}" text-anchor="middle" fill="#888" font-size="8">${c}</text>`;
  }

  // Data points
  let dotsHTML = '';
  for (const pt of points) {
    if (pt.weight <= 0) continue;
    const x = sx(pt.cg), y = sy(pt.weight);
    if (x < p.l || x > p.l + pW || y < p.t || y > p.t + pH) continue;
    dotsHTML += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${pt.color}" stroke="white" stroke-width="1.5"/>`;
    dotsHTML += `<text x="${(x + 8).toFixed(1)}" y="${(y + 3).toFixed(1)}" fill="${pt.color}" font-size="9" font-weight="bold">${pt.label}</text>`;
  }

  // Legend
  let legend = '';
  if (util) {
    legend = `<line x1="${p.l + 8}" y1="${p.t + 10}" x2="${p.l + 24}" y2="${p.t + 10}" stroke="#059669" stroke-width="1.5"/>
      <text x="${p.l + 28}" y="${p.t + 13}" fill="#666" font-size="7">Normal</text>
      <line x1="${p.l + 8}" y1="${p.t + 20}" x2="${p.l + 24}" y2="${p.t + 20}" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4,3"/>
      <text x="${p.l + 28}" y="${p.t + 23}" fill="#666" font-size="7">Utility</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="max-width:100%;height:auto;font-family:Arial,sans-serif">
    <rect width="${W}" height="${H}" fill="white" rx="4"/>
    <rect x="${p.l}" y="${p.t}" width="${pW}" height="${pH}" fill="#fafafa" rx="3" stroke="#eee" stroke-width="0.5"/>
    ${gridLines}
    <polygon points="${normalPoly}" fill="rgba(34,197,94,0.12)" stroke="#059669" stroke-width="1.5" stroke-linejoin="miter"/>
    ${utilPoly ? `<polygon points="${utilPoly}" fill="rgba(217,119,6,0.08)" stroke="#d97706" stroke-width="1.5" stroke-dasharray="6,3" stroke-linejoin="miter"/>` : ''}
    ${legend}
    ${dotsHTML}
    <text x="${p.l + pW / 2}" y="${H - 4}" text-anchor="middle" fill="#888" font-size="9" font-weight="bold">C.G. Location (inches)</text>
    <text x="12" y="${p.t + pH / 2}" text-anchor="middle" fill="#888" font-size="9" font-weight="bold" transform="rotate(-90, 12, ${p.t + pH / 2})">Weight (lbs)</text>
  </svg>`;
}

// ─── HTML Email Builder ─────────────────────────────────────────────────────

function buildDispatchHTML(d: any): string {
  const f = (n: number) => n?.toFixed(2) ?? '—';
  const rows = d.rows || [];

  const rowsHTML = rows.map((r: any) => {
    const color = r.color === 'purple' ? '#7c3aed' : r.color === 'blue' ? '#2563eb' : r.color === 'green' ? '#059669' : r.color === 'red' ? '#dc2626' : '#333';
    const bold = r.bold ? 'font-weight:700;' : '';
    const bg = r.overweight ? 'background:#fee2e2;' : r.subtotal ? 'border-top:1.5px solid #bbb;' : '';
    return `<tr style="${bg}">
      <td style="padding:4px 6px;text-align:right;${bold}color:${color};font-size:11px">${r.label}</td>
      <td style="padding:4px 4px;text-align:center;color:#999;font-size:11px">${r.op || ''}</td>
      <td style="padding:4px 6px;text-align:right;font-family:'Courier New',monospace;${bold}color:${color};font-size:11px">${f(r.weight)}</td>
      <td style="padding:4px 4px;text-align:center;color:#ccc;font-size:10px">×</td>
      <td style="padding:4px 6px;text-align:right;font-family:'Courier New',monospace;color:${color};font-size:11px">${f(r.arm)}</td>
      <td style="padding:4px 4px;text-align:center;color:#999;font-size:11px">${r.opM || ''}</td>
      <td style="padding:4px 6px;text-align:right;font-family:'Courier New',monospace;color:${color};font-size:11px">${f(r.moment)}</td>
    </tr>`;
  }).join('\n');

  const condRow = (label: string, depVal: string, destVal: string) =>
    `<tr><td style="padding:2px 6px;color:#555;font-size:11px">${label}</td><td style="padding:2px 6px;text-align:center;font-size:11px">${depVal}</td><td style="padding:2px 6px;text-align:center;font-size:11px">${destVal}</td></tr>`;

  const toOk = d.toOk !== false;
  const lOk = d.lOk !== false;
  const toMargin = d.toMargin ?? (d.maxGross - (d.takeoffWeight || 0));
  const statusColor = toOk && lOk ? '#059669' : '#dc2626';
  const statusText = toOk && lOk ? '✅ WITHIN LIMITS' : '⚠️ OUT OF LIMITS';

  const cgChart = buildCgChartSVG(d);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:20px;background:#f0f2f5;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:12px">
<div style="max-width:750px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">

  <!-- Header -->
  <div style="background:#0f172a;color:white;padding:20px 28px">
    <table style="width:100%"><tr>
      <td style="vertical-align:middle"><div style="font-size:22px;font-weight:800;letter-spacing:0.5px">Weight &amp; Balance</div>
        <div style="font-size:10px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-top:3px">Darcy Aviation — KDXR Danbury, CT</div></td>
      <td style="text-align:right;vertical-align:middle;color:#94a3b8;font-size:11px">
        <div>${d.dateStr}</div>
        <div style="margin-top:2px;font-size:13px;font-weight:700;color:white">${d.aircraft}</div>
        <div style="color:#64748b">${d.aircraftType}</div></td>
    </tr></table>
  </div>

  <!-- Status Banner -->
  <div style="background:${statusColor};color:white;text-align:center;padding:8px;font-weight:700;font-size:13px;letter-spacing:0.5px">${statusText}</div>

  <div style="padding:20px 24px">

    <!-- Route & Pilot Info -->
    <table style="width:100%;margin-bottom:16px;font-size:12px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
      <tr style="background:#f8fafc">
        <td style="padding:8px 12px;border-right:1px solid #e5e7eb"><strong>Pilot:</strong> ${d.pilotName}</td>
        <td style="padding:8px 12px;border-right:1px solid #e5e7eb;text-align:center"><strong>Route:</strong> ${d.departure || '—'} → ${d.destination || '—'}</td>
        <td style="padding:8px 12px;text-align:right"><strong>Max Gross:</strong> ${d.maxGross} lbs</td>
      </tr>
    </table>

    <!-- Two-column layout using table for email compat -->
    <table style="width:100%;border-spacing:12px 0;border-collapse:separate">
      <tr valign="top">

      <!-- LEFT: Conditions + Performance -->
      <td style="width:210px;vertical-align:top">
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:12px">
          <div style="text-align:center;font-weight:700;font-size:11px;background:#f1f5f9;border-radius:4px;padding:4px;margin-bottom:8px;color:#334155">CONDITIONS</div>
          <table style="width:100%;font-size:10px;border-collapse:collapse">
            <tr><td></td><td style="text-align:center;font-size:9px;color:#94a3b8;font-weight:700;padding-bottom:4px">DEP</td><td style="text-align:center;font-size:9px;color:#94a3b8;font-weight:700;padding-bottom:4px">DEST</td></tr>
            ${condRow('Winds', d.depWinds || '—', d.destWinds || '—')}
            ${condRow('HW / CW', d.depHwCw || '— / —', d.destHwCw || '— / —')}
            ${condRow('Temp / Dp', d.depTemp || '—', d.destTemp || '—')}
            ${condRow('Altimeter', d.depAlt || '—', d.destAlt || '—')}
            ${condRow('Press Alt', d.depPA || '—', d.destPA || '—')}
            ${condRow('Dens Alt', d.depDA || '—', d.destDA || '—')}
          </table>

          <div style="text-align:center;font-weight:700;font-size:11px;background:#f1f5f9;border-radius:4px;padding:4px;margin:10px 0 8px;color:#334155">PERFORMANCE</div>
          <table style="width:100%;font-size:10px;border-collapse:collapse">
            <tr><td style="padding:2px 6px;color:#555">V<sub>A</sub> (T/O / Ldg)</td><td style="text-align:center;font-weight:600">${d.vaTo || '—'} / ${d.vaLd || '—'}</td></tr>
            <tr><td style="padding:2px 6px;color:#555">T/O Roll / 50'</td><td style="text-align:center">${d.toGr || '—'} / ${d.toObs || '—'}</td></tr>
            <tr><td style="padding:2px 6px;color:#555">Ldg (dep)</td><td style="text-align:center">${d.ldGrDep || '—'} / ${d.ldObsDep || '—'}</td></tr>
            <tr><td style="padding:2px 6px;color:#555">Ldg (dest)</td><td style="text-align:center">${d.ldGrDest || '—'} / ${d.ldObsDest || '—'}</td></tr>
          </table>
        </div>
      </td>

      <!-- RIGHT: W&B Table -->
      <td style="vertical-align:top">
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px">
          <!-- Summary bar -->
          <table style="width:100%;font-size:11px;margin-bottom:8px;border:1px solid #e5e7eb;border-radius:4px;overflow:hidden"><tr style="background:#f8fafc">
            <td style="text-align:center;padding:4px 6px;border-right:1px solid #e5e7eb"><div style="color:#94a3b8;font-size:8px;font-weight:700">MAX WT</div><strong>${d.maxGross}</strong></td>
            <td style="text-align:center;padding:4px 6px;border-right:1px solid #e5e7eb"><div style="color:#94a3b8;font-size:8px;font-weight:700">USEFUL</div><strong>${f(d.usefulLoad)}</strong></td>
            <td style="text-align:center;padding:4px 6px;border-right:1px solid #e5e7eb"><div style="color:#94a3b8;font-size:8px;font-weight:700">BEW</div><strong>${f(d.bew)}</strong></td>
            <td style="text-align:center;padding:4px 6px;border-right:1px solid #e5e7eb"><div style="color:#94a3b8;font-size:8px;font-weight:700">ARM</div><strong>${f(d.bewArm)}</strong></td>
            <td style="text-align:center;padding:4px 6px"><div style="color:#94a3b8;font-size:8px;font-weight:700">MOMENT</div><strong>${f(d.bewMoment)}</strong></td>
          </tr></table>

          <!-- W&B Table -->
          <table style="width:100%;font-size:11px;border-collapse:collapse">
            <tr style="border-bottom:1.5px solid #cbd5e1">
              <th style="text-align:right;padding:4px 6px;color:#94a3b8;font-weight:700;font-size:10px"></th>
              <th style="width:18px"></th>
              <th style="text-align:right;padding:4px 6px;color:#94a3b8;font-weight:700;font-size:10px">Weight</th>
              <th style="width:18px;text-align:center;color:#cbd5e1;font-size:10px">×</th>
              <th style="text-align:right;padding:4px 6px;color:#94a3b8;font-weight:700;font-size:10px">Arm</th>
              <th style="width:18px"></th>
              <th style="text-align:right;padding:4px 6px;color:#94a3b8;font-weight:700;font-size:10px">Moment</th>
            </tr>
            ${rowsHTML}
          </table>

          <!-- Margin -->
          <table style="width:100%;margin-top:8px;border-top:1px solid #e5e7eb;padding-top:6px;font-size:11px">
            <tr>
              <td><span style="color:#94a3b8">T/O Margin:</span> <strong style="color:${toMargin >= 0 ? '#059669' : '#dc2626'}">${toMargin >= 0 ? '+' : ''}${Math.round(toMargin)} lbs</strong></td>
              <td style="text-align:right"><span style="color:#94a3b8">T/O CG:</span> <strong style="color:${toOk ? '#2563eb' : '#dc2626'}">${f(d.takeoffCg)}"</strong>
                &nbsp; <span style="color:#94a3b8">Ldg CG:</span> <strong style="color:${lOk ? '#059669' : '#dc2626'}">${f(d.landingCg)}"</strong></td>
            </tr>
          </table>
        </div>
      </td>
      </tr>
    </table>

    <!-- CG Envelope Chart -->
    ${d._chartUrl ? `<div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-weight:700;font-size:12px;color:#334155;margin-bottom:8px">Center of Gravity Envelope</div>
      <img src="${d._chartUrl}" alt="CG Envelope Chart" style="max-width:100%;height:auto" width="500" />
    </div>` : ''}

    <!-- METAR raw -->
    <div style="margin-top:14px;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:10px;font-family:'Courier New',monospace;color:#64748b;line-height:1.6">
      <div><strong style="color:#475569">DEP METAR:</strong> ${d.depMetar || 'N/A'}</div>
      ${d.destMetar ? `<div><strong style="color:#475569">DEST METAR:</strong> ${d.destMetar}</div>` : ''}
    </div>

    <!-- Signature Block -->
    <table style="width:100%;margin-top:20px;font-size:11px">
      <tr>
        <td><strong>Pilot/Student:</strong> ${d.pilotName}</td>
        <td style="text-align:right"><strong>Date:</strong> ${d.dateStr}</td>
      </tr>
    </table>
    <table style="width:100%;margin-top:16px;font-size:11px;color:#94a3b8">
      <tr>
        <td>Signature: ________________________</td>
        <td style="text-align:right">Instructor: ________________________</td>
      </tr>
    </table>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:12px;font-size:9px;color:#94a3b8;border-top:1px solid #e5e7eb;background:#f8fafc">
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

  // Build QuickChart CG envelope URL
  if (d.cgEnvelope && d.cgEnvelope.length >= 2) {
    const env = d.cgEnvelope;
    const util = d.utilityEnvelope;
    const fwdLine = env.map((e: any) => ({ x: e.fwd, y: e.weight }));
    const aftLine = env.map((e: any) => ({ x: e.aft, y: e.weight }));
    const datasets: any[] = [
      { label: 'Fwd Limit', data: fwdLine, borderColor: '#059669', backgroundColor: 'rgba(34,197,94,0.1)', fill: false, showLine: true, pointRadius: 0, borderWidth: 2 },
      { label: 'Aft Limit', data: aftLine, borderColor: '#059669', fill: '-1', showLine: true, pointRadius: 0, borderWidth: 2 },
    ];
    if (util && util.length >= 2) {
      datasets.push(
        { label: 'Util Fwd', data: util.map((e: any) => ({ x: e.fwd, y: e.weight })), borderColor: '#d97706', borderDash: [6, 3], fill: false, showLine: true, pointRadius: 0, borderWidth: 1.5 },
        { label: 'Util Aft', data: [...util].reverse().map((e: any) => ({ x: e.aft, y: e.weight })), borderColor: '#d97706', borderDash: [6, 3], fill: false, showLine: true, pointRadius: 0, borderWidth: 1.5 },
      );
    }
    const pts: any[] = [];
    if (d.zfwWeight > 0) pts.push({ label: 'ZFW', data: [{ x: d.zfwCg, y: d.zfwWeight }], backgroundColor: '#7c3aed', borderColor: '#7c3aed', pointRadius: 6, pointStyle: 'circle', showLine: false });
    if (d.takeoffWeight > 0) pts.push({ label: 'T/O', data: [{ x: d.takeoffCg, y: d.takeoffWeight }], backgroundColor: '#2563eb', borderColor: '#2563eb', pointRadius: 6, pointStyle: 'circle', showLine: false });
    if (d.landingWeight > 0) pts.push({ label: 'Ldg', data: [{ x: d.landingCg, y: d.landingWeight }], backgroundColor: '#059669', borderColor: '#059669', pointRadius: 6, pointStyle: 'circle', showLine: false });
    datasets.push(...pts);

    const chartConfig = {
      type: 'scatter',
      data: { datasets },
      options: {
        scales: {
          x: { title: { display: true, text: 'C.G. Location (inches)' } },
          y: { title: { display: true, text: 'Weight (lbs)' } },
        },
        plugins: { legend: { display: true, position: 'top' } },
      },
    };
    d._chartUrl = `https://quickchart.io/chart?w=500&h=300&bkg=white&c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
  }

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
        connectionTimeout: 3000,
        greetingTimeout: 3000,
        socketTimeout: 5000,
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
      console.error('SMTP failed, trying relay:', emailErr.message);

      // Fallback: relay through the working Railway service over HTTPS
      const RELAY_URL = process.env.EMAIL_RELAY_URL;
      if (RELAY_URL) {
        try {
          const relayRes = await fetch(RELAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(d),
            signal: AbortSignal.timeout(15000),
          });
          const relayData = await relayRes.json() as any;
          if (relayData.success) {
            console.log(`✈️ W&B dispatch sent via relay for ${d.aircraft} (${d.pilotName})`);
            res.json({ success: true, message: 'Weight & Balance sheet sent to dispatch' });
            return;
          }
        } catch (relayErr: any) {
          console.error('Relay also failed:', relayErr.message);
        }
      }

      res.json({ success: false, message: `Email delivery failed. Please try again.` });
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
