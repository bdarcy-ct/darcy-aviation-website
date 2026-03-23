import { useState, useEffect, useMemo, useCallback } from 'react';

// ─── Aircraft Database ───────────────────────────────────────────────────────

interface CgLimit { weight: number; fwd: number; aft: number; }

interface Aircraft {
  tailNumber: string; type: string; model: string;
  basicEmptyWeight: number; basicEmptyArm: number; basicEmptyMoment: number;
  maxGrossWeight: number; usefulLoad: number;
  fuelArm: number; maxFuelLbs: number; taxiFuelLbs: number;
  frontArm: number; rearArm: number; bag1Arm: number; bag2Arm: number;
  bag1Max: number; bag2Max: number; hasRear: boolean; hasBag2: boolean;
  cgEnvelope: CgLimit[];
  utilityEnvelope?: CgLimit[];
  frontLabel: string; rearLabel: string; bag1Label: string; bag2Label: string; fuelLabel: string;
}

// CG envelopes verified against POH data for each type

const AIRCRAFT: Aircraft[] = [
  // ── Cessna 172 — N121MS ──
  // Normal fwd: vertical 35.0 to 1950, diagonal to 40.5 at 2300
  // Utility: same fwd, aft=40.5, max 2000. At 2000: interpFwd = 35+(50/350)*5.5 = 35.79
  {
    tailNumber: 'N121MS', type: 'Cessna 172', model: 'C172',
    basicEmptyWeight: 1493.44, basicEmptyArm: 39.39, basicEmptyMoment: 58819.45,
    maxGrossWeight: 2300, usefulLoad: 806.56,
    fuelArm: 47.9, maxFuelLbs: 336, taxiFuelLbs: 8,
    frontArm: 37, rearArm: 73, bag1Arm: 95, bag2Arm: 123,
    bag1Max: 120, bag2Max: 120, hasRear: true, hasBag2: true,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2', fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 47.3 },
      { weight: 1950, fwd: 35.0, aft: 47.3 },
      { weight: 2300, fwd: 40.5, aft: 47.3 },
    ],
    utilityEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 40.5 },
      { weight: 1950, fwd: 35.0, aft: 40.5 },
      { weight: 2000, fwd: 35.8, aft: 40.5 },
    ],
  },
  // ── Cessna 172 — N6475D ──
  {
    tailNumber: 'N6475D', type: 'Cessna 172', model: 'C172',
    basicEmptyWeight: 1478.95, basicEmptyArm: 39.13, basicEmptyMoment: 57865.08,
    maxGrossWeight: 2300, usefulLoad: 821.05,
    fuelArm: 47.9, maxFuelLbs: 336, taxiFuelLbs: 8,
    frontArm: 37, rearArm: 73, bag1Arm: 95, bag2Arm: 123,
    bag1Max: 120, bag2Max: 120, hasRear: true, hasBag2: true,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2', fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 47.3 },
      { weight: 1950, fwd: 35.0, aft: 47.3 },
      { weight: 2300, fwd: 40.5, aft: 47.3 },
    ],
    utilityEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 40.5 },
      { weight: 1950, fwd: 35.0, aft: 40.5 },
      { weight: 2000, fwd: 35.8, aft: 40.5 },
    ],
  },
  // ── Cessna 172 180HP — N34LC ──
  // Normal fwd: vertical 35.0 to 1950, diagonal to 41.0 at 2550
  // Utility max 2000. At 2000: interpFwd = 35+(50/600)*6 = 35.5
  {
    tailNumber: 'N34LC', type: 'Cessna 172 (180 HP)', model: 'C172-180',
    basicEmptyWeight: 1498.10, basicEmptyArm: 38.71, basicEmptyMoment: 57994.26,
    maxGrossWeight: 2550, usefulLoad: 1051.90,
    fuelArm: 47.9, maxFuelLbs: 336, taxiFuelLbs: 8,
    frontArm: 37, rearArm: 73, bag1Arm: 95, bag2Arm: 123,
    bag1Max: 120, bag2Max: 120, hasRear: true, hasBag2: true,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2', fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 47.3 },
      { weight: 1950, fwd: 35.0, aft: 47.3 },
      { weight: 2550, fwd: 41.0, aft: 47.3 },
    ],
    utilityEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 40.5 },
      { weight: 1950, fwd: 35.0, aft: 40.5 },
      { weight: 2000, fwd: 35.5, aft: 40.5 },
    ],
  },
  // ── Cessna 152 — N65563 ──
  // Normal fwd: vertical 29.0 to 1350, diagonal to 33.0 at 1670
  // Utility max 1500. At 1500: interpFwd = 29+(150/320)*4 = 30.875
  {
    tailNumber: 'N65563', type: 'Cessna 152', model: 'C152',
    basicEmptyWeight: 1161.1, basicEmptyArm: 30.27, basicEmptyMoment: 35146.50,
    maxGrossWeight: 1670, usefulLoad: 508.9,
    fuelArm: 42, maxFuelLbs: 156, taxiFuelLbs: 4,
    frontArm: 39, rearArm: 0, bag1Arm: 64, bag2Arm: 84,
    bag1Max: 120, bag2Max: 40, hasRear: false, hasBag2: true,
    frontLabel: 'Front Seats', rearLabel: '',
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2', fuelLabel: 'Usable Fuel',
    cgEnvelope: [
      { weight: 1100, fwd: 29.0, aft: 36.5 },
      { weight: 1350, fwd: 29.0, aft: 36.5 },
      { weight: 1670, fwd: 33.0, aft: 36.5 },
    ],
    utilityEnvelope: [
      { weight: 1100, fwd: 29.0, aft: 33.5 },
      { weight: 1350, fwd: 29.0, aft: 33.5 },
      { weight: 1500, fwd: 30.9, aft: 33.5 },
    ],
  },
  // ── Piper Warrior II — N8715C ──
  // Normal fwd: vertical 82.0 to 1800, diagonal to 87.0 at 2325
  // Utility max 1950. At 1950: interpFwd = 82+(150/525)*5 = 83.43
  {
    tailNumber: 'N8715C', type: 'Piper Warrior II', model: 'PA-28-161',
    basicEmptyWeight: 1498.84, basicEmptyArm: 85.32, basicEmptyMoment: 127881.03,
    maxGrossWeight: 2325, usefulLoad: 826.16,
    fuelArm: 95.0, maxFuelLbs: 288, taxiFuelLbs: 8,
    frontArm: 80.5, rearArm: 118.1, bag1Arm: 142.8, bag2Arm: 0,
    bag1Max: 200, bag2Max: 0, hasRear: true, hasBag2: false,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage Back', bag2Label: '', fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1500, fwd: 82.0, aft: 93.0 },
      { weight: 1800, fwd: 82.0, aft: 93.0 },
      { weight: 2325, fwd: 87.0, aft: 93.0 },
    ],
    utilityEnvelope: [
      { weight: 1500, fwd: 82.0, aft: 91.0 },
      { weight: 1800, fwd: 82.0, aft: 91.0 },
      { weight: 1950, fwd: 83.4, aft: 91.0 },
    ],
  },
  // ── Piper Warrior II — N84001 ──
  {
    tailNumber: 'N84001', type: 'Piper Warrior II', model: 'PA-28-161',
    basicEmptyWeight: 1467.70, basicEmptyArm: 84.10, basicEmptyMoment: 123389.00,
    maxGrossWeight: 2325, usefulLoad: 857.30,
    fuelArm: 95.0, maxFuelLbs: 288, taxiFuelLbs: 8,
    frontArm: 80.5, rearArm: 118.1, bag1Arm: 142.8, bag2Arm: 0,
    bag1Max: 200, bag2Max: 0, hasRear: true, hasBag2: false,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage Back', bag2Label: '', fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1500, fwd: 82.0, aft: 93.0 },
      { weight: 1800, fwd: 82.0, aft: 93.0 },
      { weight: 2325, fwd: 87.0, aft: 93.0 },
    ],
    utilityEnvelope: [
      { weight: 1500, fwd: 82.0, aft: 91.0 },
      { weight: 1800, fwd: 82.0, aft: 91.0 },
      { weight: 1950, fwd: 83.4, aft: 91.0 },
    ],
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface MetarData {
  raw: string; temp_c: number | null; dewpoint_c: number | null;
  altimeter_inhg: number | null; wind_dir: number | string;
  wind_speed_kt: number; wind_gust_kt: number | null;
  flight_category: string; station: string; elevation_ft: number | null;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function normalizeAlt(v: number | null): number { if (v === null) return 29.92; return v > 100 ? v * 0.02953 : v; }
function pressAlt(elev: number, alt: number) { return elev + (29.92 - alt) * 1000; }
function densAlt(p: number, t: number) { return p + 120 * (t - (15 - p / 1000 * 2)); }
function wComp(dir: number | string, spd: number, rwy: number) {
  if (typeof dir === 'string' || isNaN(Number(dir))) return { hw: 0, xw: 0 };
  const d = ((Number(dir) - rwy + 360) % 360) * Math.PI / 180;
  return { hw: Math.round(spd * Math.cos(d)), xw: Math.round(Math.abs(spd * Math.sin(d))) };
}
function interpCg(env: CgLimit[], w: number, s: 'fwd' | 'aft'): number {
  if (w <= env[0].weight) return env[0][s];
  if (w >= env[env.length - 1].weight) return env[env.length - 1][s];
  for (let i = 0; i < env.length - 1; i++) {
    if (w >= env[i].weight && w <= env[i + 1].weight) {
      const r = (w - env[i].weight) / (env[i + 1].weight - env[i].weight);
      return env[i][s] + r * (env[i + 1][s] - env[i][s]);
    }
  }
  return env[0][s];
}
function cgOk(env: CgLimit[], w: number, cg: number): boolean {
  if (w < env[0].weight) return cg >= env[0].fwd && cg <= env[0].aft;
  if (w > env[env.length - 1].weight) return false;
  return cg >= interpCg(env, w, 'fwd') && cg <= interpCg(env, w, 'aft');
}
function f(n: number, d = 2) { return n.toFixed(d); }

// ─── Glass Card ──────────────────────────────────────────────────────────────

const glass = 'bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]';

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`${glass} ${className || ''}`}>{children}</div>;
}

// ─── Editable Input ──────────────────────────────────────────────────────────

function NumIn({ value, onChange, cls }: { value: number; onChange: (v: number) => void; cls?: string }) {
  return (
    <input type="number" value={value || ''} onChange={e => onChange(Number(e.target.value) || 0)}
      placeholder="0" min={0}
      className={`w-full bg-white/5 text-right font-mono rounded px-1.5 py-0.5 border border-white/10 focus:border-blue-400/50 focus:bg-white/10 focus:outline-none transition ${cls || 'text-white'}`}
      style={{ MozAppearance: 'textfield' }} />
  );
}

// ─── CG Chart with Utility Category ─────────────────────────────────────────

function CgChart({ aircraft, points }: {
  aircraft: Aircraft; points: { label: string; weight: number; cg: number; color: string }[];
}) {
  const env = aircraft.cgEnvelope;
  const util = aircraft.utilityEnvelope;

  // Compute axis bounds from both envelopes
  const allEnvs = util ? [...env, ...util] : env;
  const allW = allEnvs.map(e => e.weight);
  const allC = allEnvs.flatMap(e => [e.fwd, e.aft]);
  const minW = Math.min(...allW) - 100, maxW = Math.max(...allW) + 75;
  const minC = Math.min(...allC) - 2, maxC = Math.max(...allC) + 2;

  const W = 460, H = 300, p = { t: 15, r: 20, b: 40, l: 55 };
  const pW = W - p.l - p.r, pH = H - p.t - p.b;
  const sx = (c: number) => p.l + ((c - minC) / (maxC - minC)) * pW;
  const sy = (w: number) => p.t + pH - ((w - minW) / (maxW - minW)) * pH;

  // Build normal envelope polygon
  const fwdN = env.map(e => `${sx(e.fwd)},${sy(e.weight)}`);
  const aftN = [...env].reverse().map(e => `${sx(e.aft)},${sy(e.weight)}`);

  // Build utility envelope polygon (if exists)
  let utilPoly = '';
  if (util && util.length >= 2) {
    const fwdU = util.map(e => `${sx(e.fwd)},${sy(e.weight)}`);
    const aftU = [...util].reverse().map(e => `${sx(e.aft)},${sy(e.weight)}`);
    utilPoly = [...fwdU, ...aftU].join(' ');
  }

  // Grid
  const wS = maxW - minW > 800 ? 200 : 100, cS = maxC - minC > 20 ? 5 : 2;
  const wT: number[] = [], cT: number[] = [];
  for (let w = Math.ceil(minW / wS) * wS; w <= maxW; w += wS) wT.push(w);
  for (let c = Math.ceil(minC / cS) * cS; c <= maxC; c += cS) cT.push(c);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <rect width={W} height={H} fill="transparent" />
      <rect x={p.l} y={p.t} width={pW} height={pH} fill="rgba(255,255,255,0.03)" rx="4" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

      {wT.map(w => <g key={w}><line x1={p.l} y1={sy(w)} x2={p.l + pW} y2={sy(w)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" /><text x={p.l - 6} y={sy(w) + 3} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="9">{w}</text></g>)}
      {cT.map(c => <g key={c}><line x1={sx(c)} y1={p.t} x2={sx(c)} y2={p.t + pH} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" /><text x={sx(c)} y={p.t + pH + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">{c}</text></g>)}

      {/* Normal category — solid green fill, straight lines */}
      <polygon points={[...fwdN, ...aftN].join(' ')} fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.6)" strokeWidth="2" strokeLinejoin="miter" shapeRendering="crispEdges" />

      {/* Utility category — dashed yellow, straight lines */}
      {utilPoly && (
        <polygon points={utilPoly} fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.5)" strokeWidth="2" strokeDasharray="8,4" strokeLinejoin="miter" shapeRendering="crispEdges" />
      )}

      {/* Legend */}
      {util && (
        <g>
          <line x1={p.l + 8} y1={p.t + 12} x2={p.l + 28} y2={p.t + 12} stroke="rgba(34,197,94,0.6)" strokeWidth="1.5" />
          <text x={p.l + 32} y={p.t + 15} fill="rgba(255,255,255,0.5)" fontSize="8">Normal</text>
          <line x1={p.l + 8} y1={p.t + 24} x2={p.l + 28} y2={p.t + 24} stroke="rgba(234,179,8,0.5)" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x={p.l + 32} y={p.t + 27} fill="rgba(255,255,255,0.5)" fontSize="8">Utility</text>
        </g>
      )}

      {/* Data points */}
      {points.filter(pt => pt.weight > 0).map((pt, i) => {
        const x = sx(pt.cg), y = sy(pt.weight);
        if (x < p.l || x > p.l + pW || y < p.t || y > p.t + pH) return null;
        return <g key={i}><circle cx={x} cy={y} r="5" fill={pt.color} stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" /><text x={x + 8} y={y + 3} fill="rgba(255,255,255,0.7)" fontSize="9" fontWeight="bold">{pt.label}</text></g>;
      })}

      <text x={p.l + pW / 2} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontWeight="bold">C.G. Location (inches)</text>
      <text x={14} y={p.t + pH / 2} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontWeight="bold" transform={`rotate(-90, 14, ${p.t + pH / 2})`}>Weight (lbs)</text>
    </svg>
  );
}

// ─── Section Bar & DualVal ───────────────────────────────────────────────────

function SecBar({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return <div className={`text-center text-[11px] font-semibold py-1 px-2 rounded-lg ${dark ? 'bg-white/10 text-white' : 'bg-white/[0.06] text-white/70'}`}>{children}</div>;
}

function DualVal({ l, r, accent }: { l: string; r: string; accent?: boolean }) {
  return (
    <div className="flex text-[11px] py-0.5">
      <div className={`flex-1 text-center ${accent ? 'text-emerald-400 font-semibold' : 'text-white/80'}`}>{l}</div>
      <div className={`flex-1 text-center ${accent ? 'text-emerald-400 font-semibold' : 'text-white/80'}`}>{r}</div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function WeightBalance() {
  const [sel, setSel] = useState(AIRCRAFT[0].tailNumber);
  const [dep, setDep] = useState('KDXR');
  const [dest, setDest] = useState('');
  const [depM, setDepM] = useState<MetarData | null>(null);
  const [destM, setDestM] = useState<MetarData | null>(null);
  const [rwy, setRwy] = useState(0);
  const [ldWx, setLdWx] = useState(false);

  const [fw, setFw] = useState(0);
  const [rw, setRw] = useState(0);
  const [b1, setB1] = useState(0);
  const [b2, setB2] = useState(0);
  const [fuel, setFuel] = useState(0);
  const [burn, setBurn] = useState(0);

  const [pilot, setPilot] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const ac = useMemo(() => AIRCRAFT.find(a => a.tailNumber === sel)!, [sel]);
  useEffect(() => { setFw(0); setRw(0); setB1(0); setB2(0); setFuel(0); setBurn(0); }, [sel]);

  // Weather
  const fetchM = useCallback(async (icao: string): Promise<MetarData | null> => {
    if (!icao || icao.length < 3) return null;
    try { const r = await fetch(`/api/wb/metar?icao=${encodeURIComponent(icao.toUpperCase())}`); return r.ok ? await r.json() : null; } catch { return null; }
  }, []);
  const loadWx = useCallback(async () => {
    setLdWx(true);
    const [d, a] = await Promise.all([dep ? fetchM(dep) : null, dest ? fetchM(dest) : null]);
    setDepM(d); setDestM(a); setLdWx(false);
  }, [dep, dest, fetchM]);
  useEffect(() => { const t = setTimeout(() => { if (dep.length >= 3 || dest.length >= 3) loadWx(); }, 800); return () => clearTimeout(t); }, [dep, dest, loadWx]);

  const wxD = useMemo(() => {
    if (!depM) return null;
    const alt = normalizeAlt(depM.altimeter_inhg), t = depM.temp_c ?? 15, el = depM.elevation_ft || 0;
    const p = pressAlt(el, alt), d = densAlt(p, t), w = wComp(depM.wind_dir, depM.wind_speed_kt, rwy);
    return { alt, t, dp: depM.dewpoint_c, pa: p, da: d, wDir: depM.wind_dir, wSpd: depM.wind_speed_kt, ...w };
  }, [depM, rwy]);
  const wxA = useMemo(() => {
    if (!destM) return null;
    const alt = normalizeAlt(destM.altimeter_inhg), t = destM.temp_c ?? 15, el = destM.elevation_ft || 0;
    const p = pressAlt(el, alt), d = densAlt(p, t), w = wComp(destM.wind_dir, destM.wind_speed_kt, rwy);
    return { alt, t, dp: destM.dewpoint_c, pa: p, da: d, wDir: destM.wind_dir, wSpd: destM.wind_speed_kt, ...w };
  }, [destM, rwy]);

  // W&B
  const c = useMemo(() => {
    const fm = fw * ac.frontArm, rm = rw * ac.rearArm, b1m = b1 * ac.bag1Arm, b2m = b2 * ac.bag2Arm;
    const zfw = ac.basicEmptyWeight + fw + rw + b1 + b2, zM = ac.basicEmptyMoment + fm + rm + b1m + b2m, zA = zfw > 0 ? zM / zfw : 0;
    const fM = fuel * ac.fuelArm, rW = zfw + fuel, rM = zM + fM, rA = rW > 0 ? rM / rW : 0;
    const tM = ac.taxiFuelLbs * ac.fuelArm, toW = rW - ac.taxiFuelLbs, toM = rM - tM, toA = toW > 0 ? toM / toW : 0;
    const bM = burn * ac.fuelArm, lW = toW - burn, lM = toM - bM, lA = lW > 0 ? lM / lW : 0;
    const toOk = cgOk(ac.cgEnvelope, toW, toA) && toW <= ac.maxGrossWeight;
    const lOk = cgOk(ac.cgEnvelope, lW, lA) && lW <= ac.maxGrossWeight && lW > 0;
    return { fm, rm, b1m, b2m, zfw, zA, zM, fM, rW, rA, rM, tM, toW, toA, toM, bM, lW, lA, lM, toOk, lOk, ok: toOk && lOk };
  }, [ac, fw, rw, b1, b2, fuel, burn]);

  const vaBase = ac.model.startsWith('PA-') ? 111 : ac.model === 'C152' ? 88 : ac.model === 'C172-180' ? 104 : 99;
  const vaTo = c.toW > 0 ? vaBase * Math.sqrt(c.toW / ac.maxGrossWeight) : 0;
  const vaLd = c.lW > 0 ? vaBase * Math.sqrt(c.lW / ac.maxGrossWeight) : 0;

  const submit = async () => {
    if (!pilot.trim() || !c.ok) return;
    setSending(true); setMsg('');
    try {
      const r = await fetch('/api/wb/dispatch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilotName: pilot, aircraft: ac.tailNumber, aircraftType: ac.type,
          departure: dep, destination: dest, depMetar: depM?.raw, destMetar: destM?.raw,
          takeoffWeight: c.toW, takeoffCg: c.toA, landingWeight: c.lW, landingCg: c.lA,
          fuelLbs: fuel, fuelBurnLbs: burn, frontWeight: fw, rearWeight: rw, baggage1: b1, baggage2: b2,
          timestamp: new Date().toISOString(),
        }),
      });
      setMsg(r.ok ? '✅ Sent to dispatch!' : 'Failed');
    } catch { setMsg('Network error'); }
    setSending(false);
  };

  const now = new Date();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white py-6 px-4" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div className="max-w-[900px] mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1" />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Weight & Balance</h1>
          </div>
          <div className="flex-1 text-right text-xs text-white/30">
            <div>{now.toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</div>
            <div>{now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
          </div>
        </div>

        <div className="text-center mb-4">
          <select value={sel} onChange={e => setSel(e.target.value)}
            className="bg-white/[0.06] backdrop-blur border border-white/10 text-white text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:border-white/30 cursor-pointer transition">
            {AIRCRAFT.map(a => <option key={a.tailNumber} value={a.tailNumber} className="bg-[#1a1f2e] text-white">{a.tailNumber} {a.type} ({a.model})</option>)}
          </select>
        </div>

        {/* ═══ MAIN LAYOUT ═══ */}
        <div className="flex gap-4">

          {/* ─── LEFT: Conditions + Performance ─── */}
          <GlassCard className="w-[210px] flex-shrink-0 p-3 space-y-1">
            <SecBar dark>Conditions</SecBar>
            <div className="flex text-[10px] font-semibold text-white/40">
              <div className="flex-1 text-center">Departure</div>
              <div className="flex-1 text-center">Destination</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <input type="text" value={dep} onChange={e => setDep(e.target.value.toUpperCase())} maxLength={4} placeholder="ICAO"
                className="w-full text-center text-xs font-bold text-emerald-400 bg-white/5 border border-white/10 rounded-lg py-1.5 uppercase focus:border-emerald-400/50 focus:outline-none transition" />
              <input type="text" value={dest} onChange={e => setDest(e.target.value.toUpperCase())} maxLength={4} placeholder="ICAO"
                className="w-full text-center text-xs font-bold text-emerald-400 bg-white/5 border border-white/10 rounded-lg py-1.5 uppercase focus:border-emerald-400/50 focus:outline-none transition" />
            </div>
            {ldWx && <div className="text-center text-[10px] text-white/30 py-0.5">Loading...</div>}

            <SecBar>Winds</SecBar>
            <DualVal l={wxD ? `${wxD.wDir}° @ ${wxD.wSpd}` : '—'} r={wxA ? `${wxA.wDir}° @ ${wxA.wSpd}` : '—'} />

            <SecBar>Headwind / Crosswind</SecBar>
            <div className="flex items-center justify-center gap-1 text-[11px] text-white/70">
              <span className="text-white/30 text-[9px]">RWY</span>
              <input type="number" value={rwy || ''} onChange={e => setRwy(Number(e.target.value))} placeholder="°" min={0} max={360}
                className="w-8 text-center text-[11px] bg-white/5 border border-white/10 rounded py-0.5 focus:border-blue-400/50 focus:outline-none" />
              <span>: {wxD ? `${wxD.hw} / ${wxD.xw}` : '— / —'}</span>
            </div>

            <SecBar>Temperature / Dew point</SecBar>
            <DualVal l={wxD ? `${wxD.t}°C / ${wxD.dp ?? '—'}°C` : '—'} r={wxA ? `${wxA.t}°C / ${wxA.dp ?? '—'}°C` : '—'} />

            <SecBar>Altimeter</SecBar>
            <DualVal l={wxD ? f(wxD.alt) : '—'} r={wxA ? f(wxA.alt) : '—'} />

            <SecBar><u>Pressure Altitude</u></SecBar>
            <DualVal l={wxD ? f(wxD.pa) : '—'} r={wxA ? f(wxA.pa) : '—'} />

            <SecBar><u>Density Altitude</u></SecBar>
            <DualVal l={wxD ? f(wxD.da) : '—'} r={wxA ? f(wxA.da) : '—'} />

            <SecBar dark>Performance</SecBar>
            <SecBar><u>Maneuvering speed (V<sub>A</sub>)</u></SecBar>
            <div className="flex text-[10px] font-semibold text-white/40">
              <div className="flex-1 text-center">Takeoff</div>
              <div className="flex-1 text-center">Landing</div>
            </div>
            <DualVal l={f(vaTo)} r={f(vaLd)} />

            <SecBar>Takeoff</SecBar>
            <div className="flex text-[10px] font-semibold text-white/40">
              <div className="flex-1 text-center">Ground Roll</div>
              <div className="flex-1 text-center">50' OBS</div>
            </div>
            <DualVal l="—" r="—" />

            <SecBar>Landing</SecBar>
            <div className="flex text-[10px] font-semibold text-white/40">
              <div className="flex-1 text-center">Departure</div>
              <div className="flex-1 text-center">Destination</div>
            </div>
            <DualVal l="—" r="—" />
          </GlassCard>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* W&B TABLE */}
            <GlassCard className="p-4">
              <div className="flex justify-between items-end border-b border-white/10 pb-2 mb-3 text-[11px]">
                {[
                  ['Max Weight', String(ac.maxGrossWeight)],
                  ['Useful Load', f(ac.usefulLoad)],
                  ['Basic Empty Weight', f(ac.basicEmptyWeight)],
                  ['Arm', f(ac.basicEmptyArm)],
                  ['Moment', f(ac.basicEmptyMoment)],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="text-center">
                    <div className="font-semibold text-white/30 text-[10px]">{lbl}</div>
                    <div className="font-bold text-white/90">{val}</div>
                  </div>
                ))}
              </div>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-right pr-1 py-1 w-auto" />
                    <th className="w-4" />
                    <th className="text-right pr-1 py-1 font-semibold text-white/40 w-16">Weight</th>
                    <th className="text-center w-4 text-white/20">×</th>
                    <th className="text-right pr-1 py-1 font-semibold text-white/40 w-14">Arm</th>
                    <th className="w-4" />
                    <th className="text-right py-1 font-semibold text-white/40 w-24">Moment</th>
                  </tr>
                </thead>
                <tbody>
                  <TRow l="Basic Empty Weight" o="" w={ac.basicEmptyWeight} a={ac.basicEmptyArm} m={ac.basicEmptyMoment} oM="" />
                  <TRowE l={ac.frontLabel} o="+" w={fw} a={ac.frontArm} m={c.fm} oM="+" set={setFw} />
                  {ac.hasRear && <TRowE l={ac.rearLabel} o="+" w={rw} a={ac.rearArm} m={c.rm} oM="+" set={setRw} />}
                  <TRowE l={`${ac.bag1Label} (Max ${ac.bag1Max})`} o="+" w={b1} a={ac.bag1Arm} m={c.b1m} oM="+" set={setB1} />
                  {ac.hasBag2 && <TRowE l={`${ac.bag2Label} (Max ${ac.bag2Max})`} o="+" w={b2} a={ac.bag2Arm} m={c.b2m} oM="+" set={setB2} />}
                  <TRow l="Zero Fuel Weight" o="=" w={c.zfw} a={c.zA} m={c.zM} oM="=" green line />
                  <TRowE l={ac.fuelLabel} o="+" w={fuel} a={ac.fuelArm} m={c.fM} oM="+" set={setFuel}
                    hint={`${Math.round(fuel / 6)} gal / ${Math.round(ac.maxFuelLbs / 6)} max`} />
                  <TRow l="Ramp Weight" o="=" w={c.rW} a={c.rA} m={c.rM} oM="=" green line />
                  <TRow l="Taxi Fuel" o="-" w={ac.taxiFuelLbs} a={ac.fuelArm} m={c.tM} oM="-" />
                  <TRow l="Takeoff Weight" o="=" w={c.toW} a={c.toA} m={c.toM} oM="=" green line ok={c.toOk} />
                  <TRowE l="Fuel Burn" o="-" w={burn} a={ac.fuelArm} m={c.bM} oM="-" set={setBurn}
                    hint={`${Math.round(burn / 6)} gal`} />
                  <TRow l="Landing Weight" o="=" w={c.lW} a={c.lA} m={c.lM} oM="=" green line ok={c.lOk} />
                </tbody>
              </table>

              <div className="mt-3 pt-2 border-t border-white/10 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
                <div className="flex justify-between"><span className="text-white/30">Max Gross</span><span className="text-white/90 font-bold">{ac.maxGrossWeight} lbs</span></div>
                <div className="flex justify-between"><span className="text-white/30">T/O Margin</span>
                  <span className={`font-bold ${ac.maxGrossWeight - c.toW >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{f(ac.maxGrossWeight - c.toW, 0)} lbs</span>
                </div>
              </div>
            </GlassCard>

            {/* CG CHART */}
            <GlassCard className="p-4">
              <div className="text-sm font-bold text-center mb-2 text-white/80">Center of Gravity Envelope</div>
              <CgChart aircraft={ac} points={[
                { label: 'Ramp', weight: c.rW, cg: c.rA, color: '#a855f7' },
                { label: 'T/O', weight: c.toW, cg: c.toA, color: '#22c55e' },
                { label: 'Ldg', weight: c.lW, cg: c.lA, color: '#3b82f6' },
              ]} />
            </GlassCard>

            {/* SUBMIT */}
            <GlassCard className="p-4 print:hidden">
              <div className="flex items-center gap-3">
                <input type="text" value={pilot} onChange={e => setPilot(e.target.value)}
                  placeholder="Pilot / Student Name"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition" />
                <button onClick={submit} disabled={sending || !c.ok || !pilot.trim()}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                    c.ok && pilot.trim()
                      ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}>
                  {sending ? 'Sending...' : '📧 Email to Dispatch'}
                </button>
              </div>
              {msg && <p className={`text-xs mt-2 text-center ${msg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
            </GlassCard>
          </div>
        </div>

        <p className="text-center text-[9px] text-white/20 mt-6">Darcy Aviation — KDXR Danbury, CT · For planning purposes — verify with POH/AFM</p>
      </div>
    </div>
  );
}

// ─── Table Rows ──────────────────────────────────────────────────────────────

function TRow({ l, o, w, a, m, oM, green, line, ok }: {
  l: string; o: string; w: number; a: number; m: number; oM: string;
  green?: boolean; line?: boolean; ok?: boolean;
}) {
  const gc = green ? 'font-bold text-emerald-400' : 'text-white/80';
  const bg = ok === false ? 'bg-red-500/10' : '';
  return (
    <tr className={`${line ? 'border-t border-white/10' : ''} ${bg}`}>
      <td className={`text-right pr-1 py-1.5 ${gc}`}>{l}</td>
      <td className={`text-center ${gc}`}>{o}</td>
      <td className={`text-right pr-1 font-mono ${gc}`}>{f(w)}</td>
      <td />
      <td className={`text-right pr-1 font-mono ${gc}`}>{f(a)}</td>
      <td className={`text-center ${gc}`}>{oM}</td>
      <td className={`text-right font-mono ${gc}`}>{f(m)}</td>
    </tr>
  );
}

function TRowE({ l, o, w, a, m, oM, set, hint }: {
  l: string; o: string; w: number; a: number; m: number; oM: string;
  set: (v: number) => void; hint?: string;
}) {
  return (
    <tr>
      <td className="text-right pr-1 py-1.5 text-white/80">{l}</td>
      <td className="text-center text-white/80">{o}</td>
      <td className="text-right pr-1 w-16">
        <NumIn value={w} onChange={set} cls="text-xs text-white" />
        {hint && <div className="text-[9px] text-white/25 text-right mt-0.5">{hint}</div>}
      </td>
      <td />
      <td className="text-right pr-1 font-mono text-white/80">{f(a)}</td>
      <td className="text-center text-white/80">{oM}</td>
      <td className="text-right font-mono text-white/80">{f(m)}</td>
    </tr>
  );
}
