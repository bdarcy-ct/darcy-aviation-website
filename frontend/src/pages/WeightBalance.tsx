import { useState, useEffect, useMemo, useCallback } from 'react';

// Hide number input spinners + print styles
const printStyles = `
/* Kill all number input spinners */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; appearance: textfield; }

@media print {
  @page { size: letter; margin: 0.4in; }
  html, body { background: white !important; color: black !important; font-size: 10px !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .print\\:hidden { display: none !important; }
  .print\\:block { display: block !important; }
  .print\\:flex { display: flex !important; }
  .print\\:text-black { color: black !important; }

  /* Override dark theme */
  .wb-root { background: white !important; color: #1a1a1a !important; padding: 0 !important; min-height: auto !important; overflow: visible !important; }
  .wb-root * { color: #1a1a1a !important; border-color: #ccc !important; }
  .wb-root .glass-card { background: white !important; backdrop-filter: none !important; border: 1px solid #ddd !important; box-shadow: none !important; border-radius: 6px !important; }
  .wb-root select, .wb-root input { background: white !important; border: 1px solid #999 !important; color: black !important; }
  .wb-root table { font-size: 9px !important; }
  .wb-root td, .wb-root th { padding: 2px 4px !important; color: #1a1a1a !important; }
  .wb-root .glow-orb { display: none !important; }

  /* Status colors preserved for print */
  .wb-root .text-emerald-400 { color: #059669 !important; }
  .wb-root .text-blue-400 { color: #2563eb !important; }
  .wb-root .text-purple-400 { color: #7c3aed !important; }
  .wb-root .text-red-400 { color: #dc2626 !important; }
  .wb-root .bg-red-500\\/10 { background: #fee2e2 !important; }

  /* CG chart — darken for print */
  .wb-root svg text { fill: #333 !important; }
  .wb-root svg line { stroke: #ddd !important; }
  .wb-root svg rect { stroke: #ccc !important; }

  /* Fit one page */
  .wb-root .max-w-\\[900px\\] { max-width: 100% !important; }
  .wb-root .flex-col { flex-direction: row !important; }
  .wb-root .lg\\:flex-row { flex-direction: row !important; }
  .wb-root .lg\\:w-\\[210px\\] { width: 200px !important; flex-shrink: 0 !important; }
  .wb-root .space-y-4 > * + * { margin-top: 8px !important; }
  .wb-root .gap-4 { gap: 8px !important; }
  .wb-root .p-4 { padding: 8px !important; }
  .wb-root .p-3 { padding: 6px !important; }
}
`;

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
  // ── Cessna 172 — N121MS (C172N, max 2300) ──
  // TCDS 3A12 + WVFC verified:
  // Normal: fwd 35.0 at ≤1950, linear to 40.5 at 2300, aft 47.3 constant
  // Utility: fwd 35.0 at ≤1950, fwd 35.8 at 2000 (clamped to normal interp 35.79), aft 40.5, max 2000
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
  // ── Cessna 172 — N6475D (C172N, max 2300) ──
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
  // ── Cessna 172N 180HP — N9426E (replaces N34LC, sold) ──
  // FAA: Cessna 172N, 1979, S/N 17272261, Lycoming O-320 w/ 180HP STC
  // Normal: fwd 35.0 at ≤1950, linear to 41.0 at 2537, aft 47.3 constant
  // Utility: fwd 35.0 at ≤1950, linear to 37.5 at 2200, aft 40.5, max 2200
  {
    tailNumber: 'N9426E', type: 'Cessna 172 (180 HP)', model: 'C172-180',
    basicEmptyWeight: 1527.25, basicEmptyArm: 39.63, basicEmptyMoment: 60522.01,
    maxGrossWeight: 2537, usefulLoad: 1009.75,
    fuelArm: 47.9, maxFuelLbs: 336, taxiFuelLbs: 8,
    frontArm: 37, rearArm: 73, bag1Arm: 95, bag2Arm: 123,
    bag1Max: 120, bag2Max: 120, hasRear: true, hasBag2: true,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2', fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 47.3 },
      { weight: 1950, fwd: 35.0, aft: 47.3 },
      { weight: 2537, fwd: 41.0, aft: 47.3 },
    ],
    utilityEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 40.5 },
      { weight: 1950, fwd: 35.0, aft: 40.5 },
      { weight: 2200, fwd: 37.5, aft: 40.5 },
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
  // ── Piper Warrior — N8715C (PA-28-151 w/ high-compression STC) ──
  // FAA registry: PA-28-151, S/N 28-7615124, 1976, engine O&VO-360 (180HP via STC)
  // Airframe is -151 so max gross = 2325 lbs, same CG envelope as N84001
  // Normal: fwd 82.0 vertical to 1950, diagonal to 87.0 at 2325, aft 93.0
  // Utility: fwd 82.0, aft 86.5, max 1950 (from N84001 POH)
  {
    tailNumber: 'N8715C', type: 'Piper Warrior', model: 'PA-28-151',
    basicEmptyWeight: 1498.84, basicEmptyArm: 85.32, basicEmptyMoment: 127881.03,
    maxGrossWeight: 2325, usefulLoad: 826.16,
    fuelArm: 95.0, maxFuelLbs: 288, taxiFuelLbs: 8,
    frontArm: 80.5, rearArm: 118.1, bag1Arm: 142.8, bag2Arm: 0,
    bag1Max: 200, bag2Max: 0, hasRear: true, hasBag2: false,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage Back', bag2Label: '', fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1200, fwd: 82.0, aft: 93.0 },
      { weight: 1950, fwd: 82.0, aft: 93.0 },
      { weight: 2325, fwd: 87.0, aft: 93.0 },
    ],
    utilityEnvelope: [
      { weight: 1200, fwd: 82.0, aft: 86.5 },
      { weight: 1950, fwd: 82.0, aft: 86.5 },
    ],
  },
  // ── Piper Warrior — N84001 (PA-28-151) ──
  // FROM ACTUAL POH (1974 Piper Warrior PA28-151) + Ludwig's video walkthrough:
  // Normal: fwd 82.0 vertical to 1950, diagonal to 87.0 at 2325, aft 93.0 constant
  // Utility: rectangle — fwd 82.0, aft 86.5, max 1950 lbs
  // At 1950 lbs the normal fwd limit starts its 45° diagonal
  {
    tailNumber: 'N84001', type: 'Piper Warrior', model: 'PA-28-151',
    basicEmptyWeight: 1467.70, basicEmptyArm: 84.10, basicEmptyMoment: 123389.00,
    maxGrossWeight: 2325, usefulLoad: 857.30,
    fuelArm: 95.0, maxFuelLbs: 288, taxiFuelLbs: 8,
    frontArm: 80.5, rearArm: 118.1, bag1Arm: 142.8, bag2Arm: 0,
    bag1Max: 200, bag2Max: 0, hasRear: true, hasBag2: false,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage Back', bag2Label: '', fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1200, fwd: 82.0, aft: 93.0 },
      { weight: 1950, fwd: 82.0, aft: 93.0 },
      { weight: 2325, fwd: 87.0, aft: 93.0 },
    ],
    utilityEnvelope: [
      { weight: 1200, fwd: 82.0, aft: 86.5 },
      { weight: 1950, fwd: 82.0, aft: 86.5 },
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

const glass = 'bg-white/[0.04] backdrop-blur-xl border rounded-2xl transition-all duration-300';
const glassIdle = 'border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-white/[0.12]';
const glassActive = 'border-blue-400/30 shadow-[0_0_24px_rgba(59,130,246,0.15),0_0_48px_rgba(59,130,246,0.08)]';

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const [active, setActive] = useState(false);
  return (
    <div className={`glass-card ${glass} ${active ? glassActive : glassIdle} ${className || ''}`}
      onFocusCapture={() => setActive(true)} onBlurCapture={() => setActive(false)}>
      {children}
    </div>
  );
}

// ─── Editable Input ──────────────────────────────────────────────────────────

function NumIn({ value, onChange, cls }: { value: number; onChange: (v: number) => void; cls?: string }) {
  return (
    <input type="text" inputMode="decimal" value={value || ''} onChange={e => onChange(Number(e.target.value) || 0)}
      placeholder="0"
      className={`w-full bg-white/5 text-right font-mono rounded px-1.5 py-0.5 border border-white/10 focus:border-blue-400/50 focus:bg-white/10 focus:outline-none transition ${cls || 'text-white'}`} />
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
      <defs>
        <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-dot" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width={W} height={H} fill="transparent" />
      <rect x={p.l} y={p.t} width={pW} height={pH} fill="rgba(255,255,255,0.02)" rx="6" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

      {wT.map(w => <g key={w}><line x1={p.l} y1={sy(w)} x2={p.l + pW} y2={sy(w)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" /><text x={p.l - 6} y={sy(w) + 3} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="9">{w}</text></g>)}
      {cT.map(c => <g key={c}><line x1={sx(c)} y1={p.t} x2={sx(c)} y2={p.t + pH} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" /><text x={sx(c)} y={p.t + pH + 14} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9">{c}</text></g>)}

      {/* Normal category — glowing green */}
      <polygon points={[...fwdN, ...aftN].join(' ')} fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" strokeLinejoin="miter" shapeRendering="crispEdges" />
      <polygon points={[...fwdN, ...aftN].join(' ')} fill="none" stroke="rgba(34,197,94,0.3)" strokeWidth="4" strokeLinejoin="miter" filter="url(#glow-green)" shapeRendering="crispEdges" />

      {/* Utility category — glowing amber dashed */}
      {utilPoly && <>
        <polygon points={utilPoly} fill="rgba(234,179,8,0.05)" stroke="rgba(234,179,8,0.45)" strokeWidth="1.5" strokeDasharray="8,4" strokeLinejoin="miter" shapeRendering="crispEdges" />
        <polygon points={utilPoly} fill="none" stroke="rgba(234,179,8,0.2)" strokeWidth="3" strokeDasharray="8,4" filter="url(#glow-yellow)" strokeLinejoin="miter" shapeRendering="crispEdges" />
      </>}

      {/* Legend */}
      {util && (
        <g>
          <line x1={p.l + 8} y1={p.t + 12} x2={p.l + 28} y2={p.t + 12} stroke="rgba(34,197,94,0.6)" strokeWidth="1.5" />
          <text x={p.l + 32} y={p.t + 15} fill="rgba(255,255,255,0.5)" fontSize="8">Normal</text>
          <line x1={p.l + 8} y1={p.t + 24} x2={p.l + 28} y2={p.t + 24} stroke="rgba(234,179,8,0.5)" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x={p.l + 32} y={p.t + 27} fill="rgba(255,255,255,0.5)" fontSize="8">Utility</text>
        </g>
      )}

      {/* Data points with glow */}
      {points.filter(pt => pt.weight > 0).map((pt, i) => {
        const x = sx(pt.cg), y = sy(pt.weight);
        if (x < p.l || x > p.l + pW || y < p.t || y > p.t + pH) return null;
        return <g key={i}>
          <circle cx={x} cy={y} r="7" fill={pt.color} opacity="0.3" filter="url(#glow-dot)" />
          <circle cx={x} cy={y} r="5" fill={pt.color} stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
          <text x={x + 9} y={y + 3} fill="rgba(255,255,255,0.8)" fontSize="9" fontWeight="bold">{pt.label}</text>
        </g>;
      })}

      <text x={p.l + pW / 2} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">C.G. Location (inches)</text>
      <text x={14} y={p.t + pH / 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold" transform={`rotate(-90, 14, ${p.t + pH / 2})`}>Weight (lbs)</text>
    </svg>
  );
}

// ─── Section Bar & DualVal ───────────────────────────────────────────────────

function SecBar({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return <div className={`text-center text-[11px] font-semibold py-1 px-2 rounded-lg ${dark ? 'bg-gradient-to-r from-white/[0.06] via-white/[0.12] to-white/[0.06] text-white border border-white/[0.06]' : 'bg-white/[0.06] text-white/70'}`}>{children}</div>;
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
  const [rwyDep, setRwyDep] = useState('');
  const [rwyDest, setRwyDest] = useState('');
  const [hwDep, setHwDep] = useState('');
  const [xwDep, setXwDep] = useState('');
  const [hwDest, setHwDest] = useState('');
  const [xwDest, setXwDest] = useState('');
  const [toGr, setToGr] = useState('');
  const [toObs, setToObs] = useState('');
  const [ldGrDep, setLdGrDep] = useState('');
  const [ldObsDep, setLdObsDep] = useState('');
  const [ldGrDest, setLdGrDest] = useState('');
  const [ldObsDest, setLdObsDest] = useState('');
  const [ldWx, setLdWx] = useState(false);

  const [fw, setFw] = useState(0);
  const [rw, setRw] = useState(0);
  const [b1, setB1] = useState(0);
  const [b2, setB2] = useState(0);
  const [fuel, setFuel] = useState(0);
  const [burn, setBurn] = useState(0);
  const [taxi, setTaxi] = useState(0);

  const [pilot, setPilot] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const ac = useMemo(() => AIRCRAFT.find(a => a.tailNumber === sel)!, [sel]);
  useEffect(() => { setFw(0); setRw(0); setB1(0); setB2(0); setFuel(0); setBurn(0); setTaxi(ac.taxiFuelLbs); }, [sel, ac]);
  // Auto-clamp burn if fuel is reduced below it
  useEffect(() => { if (burn > fuel) setBurn(fuel); }, [fuel]);

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
    const p = pressAlt(el, alt), d = densAlt(p, t);
    return { alt, t, dp: depM.dewpoint_c, pa: p, da: d, wDir: depM.wind_dir, wSpd: depM.wind_speed_kt };
  }, [depM]);
  const wxA = useMemo(() => {
    if (!destM) return null;
    const alt = normalizeAlt(destM.altimeter_inhg), t = destM.temp_c ?? 15, el = destM.elevation_ft || 0;
    const p = pressAlt(el, alt), d = densAlt(p, t);
    return { alt, t, dp: destM.dewpoint_c, pa: p, da: d, wDir: destM.wind_dir, wSpd: destM.wind_speed_kt };
  }, [destM]);

  // W&B
  const c = useMemo(() => {
    const fm = fw * ac.frontArm, rm = rw * ac.rearArm, b1m = b1 * ac.bag1Arm, b2m = b2 * ac.bag2Arm;
    const zfw = ac.basicEmptyWeight + fw + rw + b1 + b2, zM = ac.basicEmptyMoment + fm + rm + b1m + b2m, zA = zfw > 0 ? zM / zfw : 0;
    const fM = fuel * ac.fuelArm, rW = zfw + fuel, rM = zM + fM, rA = rW > 0 ? rM / rW : 0;
    const tM = taxi * ac.fuelArm, toW = rW - taxi, toM = rM - tM, toA = toW > 0 ? toM / toW : 0;
    const bM = burn * ac.fuelArm, lW = toW - burn, lM = toM - bM, lA = lW > 0 ? lM / lW : 0;
    const toOk = cgOk(ac.cgEnvelope, toW, toA) && toW <= ac.maxGrossWeight;
    const lOk = cgOk(ac.cgEnvelope, lW, lA) && lW <= ac.maxGrossWeight && lW > 0;
    return { fm, rm, b1m, b2m, zfw, zA, zM, fM, rW, rA, rM, tM, toW, toA, toM, bM, lW, lA, lM, toOk, lOk, ok: toOk && lOk };
  }, [ac, fw, rw, b1, b2, fuel, burn, taxi]);

  const vaBase = ac.model.startsWith('PA-') ? 111 : ac.model === 'C152' ? 88 : ac.model === 'C172-180' ? 104 : 99;
  const vaTo = c.toW > 0 ? vaBase * Math.sqrt(c.toW / ac.maxGrossWeight) : 0;
  const vaLd = c.lW > 0 ? vaBase * Math.sqrt(c.lW / ac.maxGrossWeight) : 0;

  const submit = async () => {
    if (!pilot.trim() || !c.ok) return;
    setSending(true); setMsg('');
    try {
      // Build W&B rows for the email template
      const rows = [
        { label: 'Basic Empty Weight', op: '', weight: ac.basicEmptyWeight, arm: ac.basicEmptyArm, moment: ac.basicEmptyMoment, opM: '' },
        { label: ac.frontLabel, op: '+', weight: fw, arm: ac.frontArm, moment: c.fm, opM: '+' },
        ...(ac.hasRear ? [{ label: ac.rearLabel, op: '+', weight: rw, arm: ac.rearArm, moment: c.rm, opM: '+' }] : []),
        { label: ac.bag1Label, op: '+', weight: b1, arm: ac.bag1Arm, moment: c.b1m, opM: '+' },
        ...(ac.hasBag2 ? [{ label: ac.bag2Label, op: '+', weight: b2, arm: ac.bag2Arm, moment: c.b2m, opM: '+' }] : []),
        { label: 'Zero Fuel Weight', op: '=', weight: c.zfw, arm: c.zA, moment: c.zM, opM: '=', bold: true, subtotal: true, color: 'purple' },
        { label: ac.fuelLabel, op: '+', weight: fuel, arm: ac.fuelArm, moment: c.fM, opM: '+' },
        { label: 'Ramp Weight', op: '=', weight: c.rW, arm: c.rA, moment: c.rM, opM: '=', bold: true, subtotal: true, color: 'green' },
        { label: 'Taxi Fuel', op: '-', weight: taxi, arm: ac.fuelArm, moment: c.tM, opM: '-' },
        { label: 'Takeoff Weight', op: '=', weight: c.toW, arm: c.toA, moment: c.toM, opM: '=', bold: true, subtotal: true, color: 'blue', overweight: !c.toOk },
        { label: 'Fuel Burn', op: '-', weight: burn, arm: ac.fuelArm, moment: c.bM, opM: '-' },
        { label: 'Landing Weight', op: '=', weight: c.lW, arm: c.lA, moment: c.lM, opM: '=', bold: true, subtotal: true, color: 'green', overweight: !c.lOk },
      ];

      const r = await fetch('/api/wb/dispatch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilotName: pilot, aircraft: ac.tailNumber, aircraftType: ac.type, model: ac.model,
          departure: dep, destination: dest, depMetar: depM?.raw, destMetar: destM?.raw,
          takeoffWeight: c.toW, takeoffCg: c.toA, landingWeight: c.lW, landingCg: c.lA,
          maxGross: ac.maxGrossWeight, usefulLoad: ac.usefulLoad,
          bew: ac.basicEmptyWeight, bewArm: ac.basicEmptyArm, bewMoment: ac.basicEmptyMoment,
          // Conditions
          depWinds: wxD ? `${wxD.wDir}° @ ${wxD.wSpd}` : '', destWinds: wxA ? `${wxA.wDir}° @ ${wxA.wSpd}` : '',
          depHwCw: `${hwDep || '—'} / ${xwDep || '—'}`, destHwCw: `${hwDest || '—'} / ${xwDest || '—'}`,
          depTemp: wxD ? `${wxD.t}°C / ${wxD.dp ?? '—'}°C` : '', destTemp: wxA ? `${wxA.t}°C / ${wxA.dp ?? '—'}°C` : '',
          depAlt: wxD ? wxD.alt.toFixed(2) : '', destAlt: wxA ? wxA.alt.toFixed(2) : '',
          depPA: wxD ? wxD.pa.toFixed(0) : '', destPA: wxA ? wxA.pa.toFixed(0) : '',
          depDA: wxD ? wxD.da.toFixed(0) : '', destDA: wxA ? wxA.da.toFixed(0) : '',
          // Performance
          vaTo: vaTo.toFixed(1), vaLd: vaLd.toFixed(1),
          toGr, toObs, ldGrDep, ldObsDep, ldGrDest, ldObsDest,
          // W&B rows
          rows,
          timestamp: new Date().toISOString(),
        }),
      });
      setMsg(r.ok ? '✅ Sent to dispatch!' : 'Failed');
    } catch { setMsg('Network error'); }
    setSending(false);
  };

  const now = new Date();

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: printStyles }} />
    <div className="wb-root min-h-screen bg-[#0a0e1a] text-white py-4 sm:py-6 px-2 sm:px-4 relative overflow-hidden" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Ambient glow orbs */}
      <div className="glow-orb pointer-events-none absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-blue-500/[0.07] rounded-full blur-[120px]" />
      <div className="glow-orb pointer-events-none absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-emerald-500/[0.05] rounded-full blur-[120px]" />
      <div className="glow-orb pointer-events-none absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-purple-500/[0.04] rounded-full blur-[100px] -translate-x-1/2" />

      <div className="max-w-[900px] mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <img src="/logo-darcy-v3.png?v=1772822630" alt="Darcy Aviation" className="h-20 w-auto brightness-[1.8] contrast-[1.2] drop-shadow-[0_0_12px_rgba(59,130,246,0.3)] lg:ml-[65px]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">Weight & Balance</h1>
            <div className="text-[10px] text-white/20 tracking-[0.3em] uppercase mt-0.5">Darcy Aviation — KDXR</div>
          </div>
          <div className="flex-1 text-right text-xs text-white/30">
            <div>{now.toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</div>
            <div>{now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
          </div>
        </div>

        <div className="text-center mb-4">
          <select value={sel} onChange={e => setSel(e.target.value)}
            className="bg-white/[0.06] backdrop-blur-lg border border-white/10 text-white text-sm font-semibold rounded-xl px-5 py-2.5 focus:outline-none focus:border-blue-400/40 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] cursor-pointer transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20">
            {AIRCRAFT.map(a => <option key={a.tailNumber} value={a.tailNumber} className="bg-[#1a1f2e] text-white">{a.tailNumber} {a.type} ({a.model})</option>)}
          </select>
        </div>

        {/* ═══ MAIN LAYOUT ═══ */}
        <div className="flex flex-col lg:flex-row gap-4">

          {/* ─── LEFT: Conditions + Performance ─── */}
          <GlassCard className="w-full lg:w-[210px] lg:flex-shrink-0 p-3 space-y-1">
            <SecBar dark>Conditions</SecBar>
            <div className="flex text-[10px] font-semibold text-white/40">
              <div className="flex-1 text-center">Departure</div>
              <div className="flex-1 text-center">Destination</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <input type="text" value={dep} onChange={e => setDep(e.target.value.toUpperCase())} maxLength={4} placeholder="ICAO"
                className="w-full text-center text-xs font-bold text-emerald-400 bg-white/5 border border-white/10 rounded-lg py-1.5 uppercase focus:border-emerald-400/50 focus:shadow-[0_0_8px_rgba(52,211,153,0.15)] focus:outline-none transition-all duration-300" />
              <input type="text" value={dest} onChange={e => setDest(e.target.value.toUpperCase())} maxLength={4} placeholder="ICAO"
                className="w-full text-center text-xs font-bold text-emerald-400 bg-white/5 border border-white/10 rounded-lg py-1.5 uppercase focus:border-emerald-400/50 focus:shadow-[0_0_8px_rgba(52,211,153,0.15)] focus:outline-none transition-all duration-300" />
            </div>
            {ldWx && <div className="text-center text-[10px] text-white/30 py-0.5">Loading...</div>}

            <SecBar>Winds</SecBar>
            <DualVal l={wxD ? `${wxD.wDir}° @ ${wxD.wSpd}` : '—'} r={wxA ? `${wxA.wDir}° @ ${wxA.wSpd}` : '—'} />

            <SecBar>Headwind / Crosswind</SecBar>
            <div className="flex text-[10px] font-semibold text-white/40 mb-0.5">
              <div className="flex-1 text-center">Departure</div>
              <div className="flex-1 text-center">Destination</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center gap-0.5">
                <input type="text" value={hwDep} onChange={e => setHwDep(e.target.value)} placeholder="HW"
                  className="w-10 text-center text-[11px] bg-white/5 border border-white/10 rounded py-0.5 focus:border-blue-400/50 focus:outline-none" />
                <span className="text-white/40 text-[11px]">/</span>
                <input type="text" value={xwDep} onChange={e => setXwDep(e.target.value)} placeholder="CW"
                  className="w-10 text-center text-[11px] bg-white/5 border border-white/10 rounded py-0.5 focus:border-blue-400/50 focus:outline-none" />
              </div>
              <div className="flex items-center justify-center gap-0.5">
                <input type="text" value={hwDest} onChange={e => setHwDest(e.target.value)} placeholder="HW"
                  className="w-10 text-center text-[11px] bg-white/5 border border-white/10 rounded py-0.5 focus:border-blue-400/50 focus:outline-none" />
                <span className="text-white/40 text-[11px]">/</span>
                <input type="text" value={xwDest} onChange={e => setXwDest(e.target.value)} placeholder="CW"
                  className="w-10 text-center text-[11px] bg-white/5 border border-white/10 rounded py-0.5 focus:border-blue-400/50 focus:outline-none" />
              </div>
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
            <div className="flex text-[10px] font-semibold text-white/40 mb-0.5">
              <div className="flex-1 text-center">Ground Roll</div>
              <div className="flex-1 text-center">50' OBS</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <input type="text" value={toGr} onChange={e => setToGr(e.target.value)} placeholder="—"
                className="w-full text-center text-[11px] bg-white/5 border border-white/10 rounded py-0.5 focus:border-blue-400/50 focus:outline-none" />
              <input type="text" value={toObs} onChange={e => setToObs(e.target.value)} placeholder="—"
                className="w-full text-center text-[11px] bg-white/5 border border-white/10 rounded py-0.5 focus:border-blue-400/50 focus:outline-none" />
            </div>

            <SecBar>Landing Performance</SecBar>
            <div className="grid grid-cols-2 gap-1">
              <input type="text" value={ldGrDep} onChange={e => setLdGrDep(e.target.value)}
                className="w-full text-center text-[11px] bg-white/5 border border-white/10 rounded py-0.5 focus:border-blue-400/50 focus:outline-none" />
              <input type="text" value={ldGrDest} onChange={e => setLdGrDest(e.target.value)}
                className="w-full text-center text-[11px] bg-white/5 border border-white/10 rounded py-0.5 focus:border-blue-400/50 focus:outline-none" />
            </div>
          </GlassCard>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="flex-1 min-w-0 space-y-4 overflow-x-hidden">

            {/* W&B TABLE */}
            <GlassCard className="p-4">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 border-b border-white/10 pb-2 mb-3 text-[11px]">
                {[
                  ['Max Weight', String(ac.maxGrossWeight)],
                  ['Useful Load', f(ac.usefulLoad)],
                  ['BEW', f(ac.basicEmptyWeight)],
                  ['Arm', f(ac.basicEmptyArm)],
                  ['Moment', f(ac.basicEmptyMoment)],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="text-center">
                    <div className="font-semibold text-white/30 text-[10px]">{lbl}</div>
                    <div className="font-bold text-white/90">{val}</div>
                  </div>
                ))}
              </div>

              <table className="w-full text-[11px] sm:text-xs border-collapse">
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
                  <TRowE l={`${ac.bag1Label} (Max ${ac.bag1Max})`} o="+" w={b1} a={ac.bag1Arm} m={c.b1m} oM="+" set={v => setB1(Math.min(v, ac.bag1Max))} />
                  {ac.hasBag2 && <TRowE l={`${ac.bag2Label} (Max ${ac.bag2Max})`} o="+" w={b2} a={ac.bag2Arm} m={c.b2m} oM="+" set={v => setB2(Math.min(v, ac.bag2Max))} />}
                  <TRow l="Zero Fuel Weight" o="=" w={c.zfw} a={c.zA} m={c.zM} oM="=" line color="text-purple-400" />
                  <TRowE l={ac.fuelLabel} o="+" w={fuel} a={ac.fuelArm} m={c.fM} oM="+" set={v => setFuel(Math.min(v, ac.maxFuelLbs))}
                    hint={`${Math.round(fuel / 6)} gal / ${Math.round(ac.maxFuelLbs / 6)} max`} />
                  <TRow l="Ramp Weight" o="=" w={c.rW} a={c.rA} m={c.rM} oM="=" green line />
                  <TRowE l="Taxi Fuel" o="-" w={taxi} a={ac.fuelArm} m={c.tM} oM="-" set={v => setTaxi(Math.min(v, fuel))} />
                  <TRow l="Takeoff Weight" o="=" w={c.toW} a={c.toA} m={c.toM} oM="=" line ok={c.toOk} color="text-blue-400" />
                  <TRowE l="Fuel Burn" o="-" w={burn} a={ac.fuelArm} m={c.bM} oM="-" set={v => setBurn(Math.min(v, fuel))}
                    hint={`${Math.round(burn / 6)} gal`} />
                  <TRow l="Landing Weight" o="=" w={c.lW} a={c.lA} m={c.lM} oM="=" line ok={c.lOk} color="text-emerald-400" />
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
                { label: 'ZFW', weight: c.zfw, cg: c.zA, color: '#a855f7' },
                { label: 'T/O', weight: c.toW, cg: c.toA, color: '#3b82f6' },
                { label: 'Ldg', weight: c.lW, cg: c.lA, color: '#22c55e' },
              ]} />
            </GlassCard>

            {/* SUBMIT + PRINT */}
            <GlassCard className="p-4 print:hidden">
              <div className="flex items-center gap-3">
                <input type="text" value={pilot} onChange={e => setPilot(e.target.value)}
                  placeholder="Pilot / Student Name"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-400/30 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)] transition-all duration-300" />
                <button onClick={() => window.print()} disabled={!c.ok || !pilot.trim()}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    c.ok && pilot.trim()
                      ? 'bg-white/[0.08] hover:bg-white/[0.15] text-white/80 hover:text-white border border-white/10 hover:border-white/20 active:scale-95'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}>
                  🖨️ Print
                </button>
                <button onClick={submit} disabled={sending || !c.ok || !pilot.trim()}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    c.ok && pilot.trim()
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:shadow-xl active:scale-95'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}>
                  {sending ? 'Sending...' : '📧 Email to Dispatch'}
                </button>
              </div>
              {msg && <p className={`text-xs mt-2 text-center ${msg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
            </GlassCard>

            {/* Print-only: Pilot name + signature line */}
            <div className="hidden print:block" style={{ marginTop: 8, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <div><strong>Pilot/Student:</strong> {pilot || '________________________'}</div>
                <div><strong>Date:</strong> {now.toLocaleDateString('en-US', { timeZone: 'America/New_York' })} {now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 12 }}>
                <div>Signature: ________________________</div>
                <div>Instructor: ________________________</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[9px] text-white/20 mt-6 print:text-black/40">Darcy Aviation — KDXR Danbury, CT · For planning purposes — verify with POH/AFM</p>
      </div>
    </div>
    </>
  );
}

// ─── Table Rows ──────────────────────────────────────────────────────────────

function TRow({ l, o, w, a, m, oM, green, line, ok, color }: {
  l: string; o: string; w: number; a: number; m: number; oM: string;
  green?: boolean; line?: boolean; ok?: boolean; color?: string;
}) {
  const gc = color ? `font-bold ${color}` : green ? 'font-bold text-emerald-400' : 'text-white/80';
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
