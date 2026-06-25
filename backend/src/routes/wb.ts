import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import db from '../database';

const router = Router();

// ─── Dispatch approval store (IFR / outside-SOP overrides) ───────────────────
// A flight that is IFR or outside SOP can't be dispatched directly. Instead the
// student sends an approval request here; Brent gets a magic-link email and
// either approves (sheet is then emailed to dispatch) or rejects it.
db.exec(`
  CREATE TABLE IF NOT EXISTS wb_approvals (
    token         TEXT PRIMARY KEY,
    aircraft      TEXT,
    student       TEXT,
    instructor    TEXT,
    type_of_flight TEXT,
    departure     TEXT,
    destination   TEXT,
    reasons       TEXT,
    note          TEXT,
    payload       TEXT,
    status        TEXT DEFAULT 'pending',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    decided_at    DATETIME
  );
`);

// Resolve the public base URL used to build magic links inside emails.
function getBaseUrl(req: Request): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = req.get('host') || `localhost:${process.env.PORT || 3001}`;
  return `${proto}://${host}`;
}

// Shared mailer used by the approval flow. Returns whether SMTP actually sent.
async function sendWbMail(opts: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return false;
  const port = parseInt(SMTP_PORT || '465');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 4000,
    greetingTimeout: 4000,
    socketTimeout: 6000,
  });
  await transporter.sendMail({ from: `"Darcy Aviation W&B" <${SMTP_USER}>`, ...opts });
  return true;
}

// Inject a colored banner block just above the white sheet card in the email HTML.
function injectBanner(sheetHtml: string, bannerHtml: string): string {
  const anchor = '<div style="max-width:750px;margin:0 auto;background:white';
  if (sheetHtml.includes(anchor)) return sheetHtml.replace(anchor, bannerHtml + anchor);
  return bannerHtml + sheetHtml;
}

function approvalRequestBanner(d: any, reasons: string[], note: string, approveUrl: string, rejectUrl: string): string {
  const reasonItems = (reasons || []).map(r => `<li style="margin:2px 0">${r}</li>`).join('');
  return `<div style="max-width:750px;margin:0 auto 16px;background:#fffbeb;border:2px solid #f59e0b;border-radius:10px;padding:18px 24px">
    <div style="font-size:16px;font-weight:800;color:#b45309">⚠️ Dispatch Approval Required</div>
    <div style="font-size:12px;color:#92400e;margin-top:6px">${d.studentName || d.pilotName || 'A pilot'} requested to dispatch <strong>${d.aircraft || ''}</strong> (${d.departure || 'KDXR'} → ${d.destination || '—'}) outside standard dispatch.</div>
    <div style="font-size:12px;color:#92400e;margin-top:8px"><strong>Why this needs your approval:</strong><ul style="margin:6px 0 0;padding-left:18px;color:#92400e">${reasonItems}</ul></div>
    ${note ? `<div style="font-size:12px;color:#92400e;margin-top:8px"><strong>Note from pilot:</strong> ${note}</div>` : ''}
    <table style="margin-top:14px"><tr>
      <td style="padding-right:10px"><a href="${approveUrl}" style="display:inline-block;background:#059669;color:white;text-decoration:none;font-weight:800;font-size:14px;padding:12px 28px;border-radius:8px">✅ Approve &amp; Dispatch</a></td>
      <td><a href="${rejectUrl}" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;font-weight:800;font-size:14px;padding:12px 28px;border-radius:8px">❌ Reject</a></td>
    </tr></table>
    <div style="font-size:10px;color:#a16207;margin-top:10px">The full weight &amp; balance sheet is below for your review. You'll get a quick confirmation screen — confirming there emails it straight to dispatch.</div>
  </div>`;
}

function approvedBanner(reasons: string[]): string {
  const reasonItems = (reasons || []).map(r => `<li style="margin:2px 0">${r}</li>`).join('');
  return `<div style="max-width:750px;margin:0 auto 16px;background:#ecfdf5;border:2px solid #059669;border-radius:10px;padding:16px 24px">
    <div style="font-size:15px;font-weight:800;color:#047857">✅ APPROVED BY BRENT — Dispatch Override</div>
    <div style="font-size:11px;color:#065f46;margin-top:6px"><strong>Approved despite:</strong><ul style="margin:6px 0 0;padding-left:18px">${reasonItems}</ul></div>
  </div>`;
}

// Minimal HTML page rendered when Brent clicks an approve/reject link.
function resultPage(title: string, color: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head>
  <body style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;background:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px">
    <div style="max-width:440px;background:white;border-radius:16px;padding:36px 32px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="font-size:48px;margin-bottom:8px">${title.startsWith('Approved') ? '✅' : title.startsWith('Rejected') ? '❌' : 'ℹ️'}</div>
      <div style="font-size:22px;font-weight:800;color:${color}">${title}</div>
      <div style="font-size:14px;color:#475569;margin-top:12px;line-height:1.5">${body}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:24px">Darcy Aviation — KDXR Danbury, CT</div>
    </div>
  </body></html>`;
}

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
    dotsHTML += `<text x="${(x + 8).toFixed(1)}" y="${(y - 1).toFixed(1)}" fill="${pt.color}" font-size="9" font-weight="bold">${pt.label}</text>`;
    dotsHTML += `<text x="${(x + 8).toFixed(1)}" y="${(y + 9).toFixed(1)}" fill="#888" font-size="7.5">${Math.round(pt.weight)} lbs</text>`;
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

// ─── QuickChart CG Chart URL (backend fallback) ──────────────────────────────
// The frontend pre-generates a short QuickChart URL (d.chartUrl). If that call
// failed (network/QuickChart down → silent catch), chartUrl is empty and the
// email chart goes blank. This rebuilds a self-contained QuickChart GET URL from
// the envelope data so every email (request / dispatch / approved) always shows
// the CG chart with the dots, no live API call required at send time.
function buildCgChartUrl(d: any): string {
  const env = d.cgEnvelope || [];
  if (!Array.isArray(env) || env.length < 2) return '';

  const closed = (poly: any[]) => [
    ...poly.map((e: any) => ({ x: e.fwd, y: e.weight })),
    ...[...poly].reverse().map((e: any) => ({ x: e.aft, y: e.weight })),
    { x: poly[0].fwd, y: poly[0].weight },
  ];

  const datasets: any[] = [
    { label: 'Normal', data: closed(env), borderColor: '#059669', backgroundColor: 'rgba(34,197,94,0.15)', fill: true, showLine: true, pointRadius: 0, borderWidth: 2, tension: 0 },
  ];
  if (Array.isArray(d.utilityEnvelope) && d.utilityEnvelope.length >= 2) {
    datasets.push({ label: 'Utility', data: closed(d.utilityEnvelope), borderColor: '#d97706', borderDash: [6, 3], backgroundColor: 'rgba(217,119,6,0.08)', fill: true, showLine: true, pointRadius: 0, borderWidth: 1.5, tension: 0 });
  }
  const dot = (label: string, cg: number, w: number, bg: string, bd: string) =>
    ({ label: `${label} ${Math.round(w)} lbs`, data: [{ x: cg, y: w }], backgroundColor: bg, borderColor: bd, pointRadius: 7, pointBorderWidth: 2, showLine: false });
  if (d.zfwWeight > 0) datasets.push(dot('ZFW', d.zfwCg || 0, d.zfwWeight, '#7c3aed', '#5b21b6'));
  if (d.takeoffWeight > 0) datasets.push(dot('T/O', d.takeoffCg || 0, d.takeoffWeight, '#2563eb', '#1d4ed8'));
  if (d.landingWeight > 0) datasets.push(dot('Ldg', d.landingCg || 0, d.landingWeight, '#059669', '#047857'));

  const config = {
    type: 'scatter',
    data: { datasets },
    options: {
      plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 9 }, boxWidth: 12 } } },
      scales: {
        x: { title: { display: true, text: 'CG Station (inches)', font: { weight: 'bold' } }, grid: { color: '#e5e7eb' } },
        y: { title: { display: true, text: 'Weight (lbs)', font: { weight: 'bold' } }, grid: { color: '#e5e7eb' } },
      },
    },
  };
  // v=3 pins Chart.js 3 — the GET endpoint defaults to v2, which rejects the
  // v3-style scales/title config with a 400 (renders a blank/error image).
  return `https://quickchart.io/chart?width=520&height=320&backgroundColor=white&v=3&c=${encodeURIComponent(JSON.stringify(config))}`;
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

  // Use new fields with backward compat
  const studentName = d.studentName || d.pilotName || '—';
  const instructorName = d.instructorName || '—';
  const directionOfFlight = d.directionOfFlight || '';
  const typeOfFlight = d.typeOfFlight || '';

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

    <!-- Flight Details + Names -->
    <table style="width:100%;margin-bottom:12px;font-size:12px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
      <tr style="background:#f8fafc">
        <td style="padding:8px 12px;border-right:1px solid #e5e7eb"><strong>Student:</strong> ${studentName}</td>
        <td style="padding:8px 12px"><strong>Instructor:</strong> ${instructorName}</td>
      </tr>
      ${directionOfFlight || typeOfFlight ? `<tr style="background:#f8fafc;border-top:1px solid #e5e7eb">
        <td style="padding:8px 12px;border-right:1px solid #e5e7eb"><strong>Route:</strong> ${directionOfFlight || '—'}</td>
        <td style="padding:8px 12px"><strong>Type:</strong> ${typeOfFlight || '—'}</td>
      </tr>` : ''}
    </table>

    <!-- Weight Summary -->
    <table style="width:100%;margin-bottom:16px;font-size:12px;border:2px solid #2563eb;border-radius:6px;overflow:hidden">
      <tr style="background:#eff6ff">
        <td style="padding:8px 12px;text-align:center;border-right:1px solid #bfdbfe"><strong style="color:#7c3aed">ZFW:</strong> <span style="font-weight:700">${(d.zfwWeight || 0).toFixed(1)} lbs</span></td>
        <td style="padding:8px 12px;text-align:center;border-right:1px solid #bfdbfe"><strong style="color:#2563eb">T/O:</strong> <span style="font-weight:700">${(d.takeoffWeight || 0).toFixed(1)} lbs</span></td>
        <td style="padding:8px 12px;text-align:center"><strong style="color:#059669">LDG:</strong> <span style="font-weight:700">${(d.landingWeight || 0).toFixed(1)} lbs</span></td>
      </tr>
    </table>

    <!-- Route & Aircraft Info -->
    <table style="width:100%;margin-bottom:16px;font-size:12px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
      <tr style="background:#f8fafc">
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
          </table>
          <div style="border:2px solid #2563eb;border-radius:6px;padding:6px;margin:6px 0;background:#eff6ff">
            <div style="text-align:center;font-weight:700;font-size:10px;color:#2563eb;margin-bottom:4px">Takeoff — Departure</div>
            <table style="width:100%;font-size:10px;border-collapse:collapse">
              <tr><td style="padding:1px 4px;color:#555;font-weight:700">Ground Roll</td><td style="text-align:center;font-weight:700">${d.toGr || '—'}</td></tr>
              <tr><td style="padding:1px 4px;color:#555;font-weight:700">Over 50'</td><td style="text-align:center;font-weight:700">${d.toObs || '—'}</td></tr>
            </table>
          </div>
          <div style="border:2px solid #059669;border-radius:6px;padding:6px;margin:6px 0;background:#f0fdf4">
            <div style="text-align:center;font-weight:700;font-size:10px;color:#059669;margin-bottom:4px">Landing — Destination</div>
            <table style="width:100%;font-size:10px;border-collapse:collapse">
              <tr><td style="padding:1px 4px;color:#555;font-weight:700">Ground Roll</td><td style="text-align:center;font-weight:700">${d.ldGrDest || '—'}</td></tr>
              <tr><td style="padding:1px 4px;color:#555;font-weight:700">Over 50'</td><td style="text-align:center;font-weight:700">${d.ldObsDest || '—'}</td></tr>
            </table>
          </div>
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
    ${(() => { const chartImg = d._chartUrl || d.chartUrl || buildCgChartUrl(d); return chartImg ? `<div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-weight:700;font-size:12px;color:#334155;margin-bottom:8px">Center of Gravity Envelope</div>
      <img src="${chartImg}" alt="CG Envelope Chart" style="max-width:100%;height:auto" width="500" />
    </div>` : ''; })()}

    <!-- METAR raw -->
    <div style="margin-top:14px;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:10px;font-family:'Courier New',monospace;color:#64748b;line-height:1.6">
      <div><strong style="color:#475569">DEP METAR:</strong> ${d.depMetar || 'N/A'}</div>
      ${d.destMetar ? `<div><strong style="color:#475569">DEST METAR:</strong> ${d.destMetar}</div>` : ''}
    </div>

    <!-- Signature Block -->
    <table style="width:100%;margin-top:20px;font-size:11px">
      <tr>
        <td><strong>Student:</strong> ${studentName}</td>
        <td style="text-align:right"><strong>Date:</strong> ${d.dateStr}</td>
      </tr>
      <tr>
        <td><strong>Instructor:</strong> ${instructorName}</td>
        <td></td>
      </tr>
    </table>
    <table style="width:100%;margin-top:16px;font-size:11px;color:#94a3b8">
      <tr>
        <td>Student Signature: ________________________</td>
        <td style="text-align:right">Instructor Signature: ________________________</td>
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

  if ((!d.pilotName && !d.studentName) || !d.aircraft) {
    res.status(400).json({ error: 'Student name and aircraft required' });
    return;
  }

  const now = new Date(d.timestamp || Date.now());
  d.dateStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });

  // Use chart URL from frontend (pre-generated via QuickChart)
  if (d.chartUrl) {
    d._chartUrl = d.chartUrl;
  }

  // Use pre-built HTML from relay source if available, otherwise build fresh
  const htmlBody = d._prebuiltHtml || buildDispatchHTML(d);

  // Plain-text fallback
  const textBody = d._prebuiltText || `WEIGHT & BALANCE — DARCY AVIATION
Date: ${d.dateStr}
Student: ${d.studentName || d.pilotName}
Instructor: ${d.instructorName || '—'}
Route: ${d.directionOfFlight || '—'}
Type: ${d.typeOfFlight || '—'}
Aircraft: ${d.aircraft} (${d.aircraftType})
Route: ${d.departure || '—'} → ${d.destination || '—'}
Takeoff: ${d.takeoffWeight?.toFixed(1)} lbs / CG ${d.takeoffCg?.toFixed(2)}"
Landing: ${d.landingWeight?.toFixed(1)} lbs / CG ${d.landingCg?.toFixed(2)}"
T/O Roll: ${d.toGr || '—'} / Over 50': ${d.toObs || '—'}
Ldg (dest) Roll: ${d.ldGrDest || '—'} / Over 50': ${d.ldObsDest || '—'}
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
        subject: `W&B Sheet — ${d.aircraft} — ${d.studentName || d.pilotName} — ${d.departure || 'KDXR'} → ${d.destination || '?'}`,
        text: textBody,
        html: htmlBody,
      });

      console.log(`✈️ W&B dispatch email sent for ${d.aircraft} (${d.pilotName})`);
      res.json({ success: true, message: 'Weight & Balance sheet sent to dispatch' });
      return;
    } catch (emailErr: any) {
      console.error('SMTP failed, trying relay:', emailErr.message);

      // Fallback: relay through the working Railway service over HTTPS
      // Send pre-built HTML so relay doesn't need to regenerate
      const RELAY_URL = process.env.EMAIL_RELAY_URL;
      if (RELAY_URL) {
        try {
          // Send pre-built HTML to relay so it doesn't regenerate (avoids double chart)
          const relayBody = { ...d, _prebuiltHtml: htmlBody, _prebuiltText: textBody };
          // Remove raw envelope data so relay doesn't generate its own chart
          delete relayBody.cgEnvelope;
          delete relayBody.utilityEnvelope;
          const relayRes = await fetch(RELAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(relayBody),
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

// ─── POST /api/wb/approval-request ──────────────────────────────────────────
// Body = full dispatch payload + { reasons: string[], note?: string }.
// Creates a pending approval and emails Brent the sheet with approve/reject links.

router.post('/approval-request', async (req: Request, res: Response) => {
  const d = req.body || {};
  const reasons: string[] = Array.isArray(d.reasons) ? d.reasons : [];
  const note: string = (d.note || '').toString().slice(0, 1000);

  if ((!d.studentName && !d.pilotName) || !d.aircraft) {
    res.status(400).json({ error: 'Student name and aircraft required' });
    return;
  }
  if (reasons.length === 0) {
    res.status(400).json({ error: 'No approval reason supplied' });
    return;
  }

  const now = new Date(d.timestamp || Date.now());
  d.dateStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });

  const token = crypto.randomBytes(24).toString('hex');

  db.prepare(`INSERT INTO wb_approvals
    (token, aircraft, student, instructor, type_of_flight, departure, destination, reasons, note, payload, status)
    VALUES (?,?,?,?,?,?,?,?,?,?,'pending')`).run(
    token,
    d.aircraft || '',
    d.studentName || d.pilotName || '',
    d.instructorName || '',
    d.typeOfFlight || '',
    d.departure || '',
    d.destination || '',
    JSON.stringify(reasons),
    note,
    JSON.stringify(d),
  );

  const base = getBaseUrl(req);
  const approveUrl = `${base}/api/wb/approve/${token}`;
  const rejectUrl = `${base}/api/wb/reject/${token}`;

  const sheetHtml = buildDispatchHTML(d);
  const html = injectBanner(sheetHtml, approvalRequestBanner(d, reasons, note, approveUrl, rejectUrl));
  const text = `DISPATCH APPROVAL REQUIRED — Darcy Aviation
${d.studentName || d.pilotName} requests to dispatch ${d.aircraft} (${d.departure || 'KDXR'} → ${d.destination || '—'}).
Reasons: ${reasons.join('; ')}
${note ? `Note: ${note}\n` : ''}
Approve: ${approveUrl}
Reject:  ${rejectUrl}`;

  const APPROVER_EMAIL = process.env.APPROVER_EMAIL || process.env.DISPATCH_EMAIL || 'brent@darcyaviation.com';

  let emailed = false;
  try {
    emailed = await sendWbMail({ to: APPROVER_EMAIL, subject: `⚠️ Approval needed — ${d.aircraft} — ${d.studentName || d.pilotName} — ${d.departure || 'KDXR'} → ${d.destination || '?'}`, html, text });
  } catch (err: any) {
    console.error('Approval email failed:', err.message);
  }

  console.log(`🛂 W&B approval requested for ${d.aircraft} (${d.studentName || d.pilotName}) — reasons: ${reasons.join('; ')} — emailed=${emailed}`);

  const payload: any = {
    success: true,
    approvalId: token,
    message: emailed
      ? `Sent for approval. You'll be cleared once it's approved.`
      : `Approval request recorded. (Email not configured — use the link below to test.)`,
  };
  // When SMTP isn't configured (e.g. local review), surface the links so the
  // full approve→dispatch loop can be tested without a live inbox.
  if (!emailed) {
    payload._localLinks = { approveUrl, rejectUrl };
  }
  res.json(payload);
});

// ─── Approve / Reject magic links (clicked from Brent's email) ───────────────

async function decide(token: string, decision: 'approved' | 'rejected', req: Request, res: Response) {
  const row: any = db.prepare('SELECT * FROM wb_approvals WHERE token = ?').get(token);
  if (!row) {
    res.status(404).send(resultPage('Link not found', '#dc2626', 'This approval link is invalid or has expired.'));
    return;
  }
  if (row.status !== 'pending') {
    const when = row.decided_at ? ` on ${new Date(row.decided_at + 'Z').toLocaleString('en-US', { timeZone: 'America/New_York' })}` : '';
    res.send(resultPage('Already handled', '#475569', `This request was already <strong>${row.status}</strong>${when}. No further action needed.`));
    return;
  }

  db.prepare('UPDATE wb_approvals SET status = ?, decided_at = CURRENT_TIMESTAMP WHERE token = ?').run(decision, token);

  const d = JSON.parse(row.payload || '{}');
  const reasons: string[] = JSON.parse(row.reasons || '[]');

  if (decision === 'rejected') {
    console.log(`🛂 W&B approval REJECTED for ${row.aircraft} (${row.student})`);
    res.send(resultPage('Rejected', '#dc2626',
      `<strong>${row.aircraft}</strong> for ${row.student} was <strong>not</strong> approved. The sheet was not sent to dispatch.`));
    return;
  }

  // Approved → email the sheet to dispatch, stamped as a Brent-approved override.
  const DISPATCH_EMAIL = process.env.DISPATCH_EMAIL || 'dispatch@darcyaviation.com';
  const html = injectBanner(buildDispatchHTML(d), approvedBanner(reasons));
  const text = `W&B SHEET — APPROVED BY BRENT (Override)
Approved despite: ${reasons.join('; ')}
Student: ${d.studentName || d.pilotName} | Aircraft: ${d.aircraft} | ${d.departure || 'KDXR'} → ${d.destination || '—'}
T/O: ${d.takeoffWeight?.toFixed?.(1)} lbs / CG ${d.takeoffCg?.toFixed?.(2)}"`;

  let emailed = false;
  try {
    emailed = await sendWbMail({ to: DISPATCH_EMAIL, subject: `✅ APPROVED (Override) — ${d.aircraft} — ${d.studentName || d.pilotName} — ${d.departure || 'KDXR'} → ${d.destination || '?'}`, html, text });
  } catch (err: any) {
    console.error('Post-approval dispatch email failed:', err.message);
  }
  console.log(`🛂 W&B approval APPROVED for ${row.aircraft} (${row.student}) — dispatch emailed=${emailed}`);

  res.send(resultPage('Approved', '#059669',
    `<strong>${row.aircraft}</strong> for ${row.student} is approved.${emailed ? ' The weight &amp; balance sheet has been sent to dispatch.' : ' (Email not configured — recorded only.)'}`));
}

// Confirmation landing page. GET is safe (no state change) so email security
// scanners / link prefetchers can't consume the one-time token before Brent
// actually decides. The real approve/reject happens on the POST below.
function confirmPage(token: string, decision: 'approved' | 'rejected', row: any): string {
  const isApprove = decision === 'approved';
  const color = isApprove ? '#059669' : '#dc2626';
  const verb = isApprove ? 'Approve & Send to Dispatch' : 'Reject';
  const icon = isApprove ? '✅' : '❌';
  const reasons: string[] = (() => { try { return JSON.parse(row.reasons || '[]'); } catch { return []; } })();
  const reasonItems = reasons.map(r => `<li style="margin:2px 0">${r}</li>`).join('');
  const route = `${row.departure || 'KDXR'} → ${row.destination || '—'}`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Confirm ${isApprove ? 'Approval' : 'Rejection'}</title></head>
  <body style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;background:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px">
    <div style="max-width:460px;background:white;border-radius:16px;padding:32px;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="font-size:42px;text-align:center;margin-bottom:8px">${icon}</div>
      <div style="font-size:20px;font-weight:800;color:${color};text-align:center">Confirm ${isApprove ? 'Approval' : 'Rejection'}</div>
      <div style="font-size:14px;color:#475569;margin-top:16px;line-height:1.6">
        <strong>${row.aircraft}</strong> for <strong>${row.student}</strong><br/>
        <span style="color:#64748b">${route}${row.type_of_flight ? ` · ${row.type_of_flight}` : ''}</span>
      </div>
      ${reasonItems ? `<div style="font-size:12px;color:#92400e;background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:10px 14px;margin-top:14px"><strong>Flagged for:</strong><ul style="margin:6px 0 0;padding-left:18px">${reasonItems}</ul></div>` : ''}
      <div style="font-size:12px;color:#64748b;margin-top:16px">${isApprove ? 'Approving will email the full weight &amp; balance sheet to dispatch as an override.' : 'Rejecting will NOT send the sheet to dispatch. The student stays uncleared.'}</div>
      <form method="POST" action="/api/wb/${isApprove ? 'approve' : 'reject'}/${token}" style="margin-top:24px">
        <button type="submit" style="width:100%;background:${color};color:white;border:none;font-weight:800;font-size:16px;padding:14px;border-radius:10px;cursor:pointer">${icon} ${verb}</button>
      </form>
      <div style="font-size:11px;color:#94a3b8;margin-top:20px;text-align:center">Darcy Aviation — KDXR Danbury, CT</div>
    </div>
  </body></html>`;
}

function showConfirm(token: string, decision: 'approved' | 'rejected', res: Response) {
  const row: any = db.prepare('SELECT * FROM wb_approvals WHERE token = ?').get(token);
  if (!row) {
    res.status(404).send(resultPage('Link not found', '#dc2626', 'This approval link is invalid or has expired.'));
    return;
  }
  if (row.status !== 'pending') {
    const when = row.decided_at ? ` on ${new Date(row.decided_at + 'Z').toLocaleString('en-US', { timeZone: 'America/New_York' })}` : '';
    res.send(resultPage('Already handled', '#475569', `This request was already <strong>${row.status}</strong>${when}. No further action needed.`));
    return;
  }
  res.send(confirmPage(token, decision, row));
}

// GET = safe confirmation page (prefetch-proof). POST = actually decide.
router.get('/approve/:token', (req: Request, res: Response) => { showConfirm(String(req.params.token), 'approved', res); });
router.get('/reject/:token', (req: Request, res: Response) => { showConfirm(String(req.params.token), 'rejected', res); });
router.post('/approve/:token', (req: Request, res: Response) => { decide(String(req.params.token), 'approved', req, res); });
router.post('/reject/:token', (req: Request, res: Response) => { decide(String(req.params.token), 'rejected', req, res); });

export default router;
