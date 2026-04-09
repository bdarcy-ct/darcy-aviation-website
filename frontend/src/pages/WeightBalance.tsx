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
  .wb-root .lg\\:w-\\[220px\\] { width: 180px !important; flex-shrink: 0 !important; }
  .wb-root .space-y-4 > * + * { margin-top: 4px !important; }
  .wb-root .space-y-1 > * + * { margin-top: 2px !important; }
  .wb-root .gap-4 { gap: 4px !important; }
  .wb-root .p-4 { padding: 4px 6px !important; }
  .wb-root .p-3 { padding: 3px 4px !important; }
  .wb-root .p-2 { padding: 2px 3px !important; }
  .wb-root .py-1 { padding-top: 1px !important; padding-bottom: 1px !important; }
  .wb-root .py-1\\.5 { padding-top: 1px !important; padding-bottom: 1px !important; }
  .wb-root .py-2 { padding-top: 2px !important; padding-bottom: 2px !important; }
  .wb-root .mb-3 { margin-bottom: 2px !important; }
  .wb-root .mb-4 { margin-bottom: 3px !important; }
  .wb-root .mt-3 { margin-top: 3px !important; }
  .wb-root .pt-2 { padding-top: 2px !important; }
  .wb-root .rounded-2xl { border-radius: 4px !important; }
  .wb-root .rounded-lg { border-radius: 3px !important; }
  .wb-root .text-2xl, .wb-root .text-3xl { font-size: 16px !important; }
  .wb-root .text-sm { font-size: 9px !important; }
  .wb-root .text-xs { font-size: 8px !important; }
  .wb-root .text-\\[11px\\] { font-size: 8px !important; }
  .wb-root .text-\\[10px\\] { font-size: 7px !important; }
  .wb-root .text-\\[9px\\] { font-size: 7px !important; }
  .wb-root h1 { font-size: 16px !important; margin: 0 !important; }
  .wb-root img { height: 50px !important; }
  .wb-root svg { max-height: 180px !important; }
  .wb-root select { padding: 2px 4px !important; font-size: 9px !important; }

  /* Flight details bar compact */
  .wb-root .grid-cols-2 { gap: 3px !important; }
  .wb-root .lg\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; gap: 4px !important; }

  /* Bold boxed inputs for print */
  .wb-root .wb-bold-input { border: 2px solid #333 !important; font-weight: 700 !important; background: #f5f5f5 !important; }
  .wb-root .perf-box { border: 2px solid #333 !important; background: #f5f5f5 !important; padding: 3px !important; }
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

const AIRCRAFT: Aircraft[] = [
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
  {
    tailNumber: 'N9426E', type: 'Cessna 172 (180 HP)', model: 'C172-180',
    basicEmptyWeight: 1525.55, basicEmptyArm: 39.56, basicEmptyMoment: 60344.46,
    maxGrossWeight: 2550, usefulLoad: 1024.45,
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

// ─── Format wind component for display ───────────────────────────────────────
function fmtHw(hw: number): string {
  if (hw > 0) return `HW ${hw}`;
  if (hw < 0) return `TW ${Math.abs(hw)}`;
  return '0';
}

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

// ─── Bold Boxed Input (for W&B fields) ───────────────────────────────────────

function NumIn({ value, onChange, cls }: { value: number; onChange: (v: number) => void; cls?: string }) {
  return (
    <input type="text" inputMode="decimal" value={value || ''} onChange={e => onChange(Number(e.target.value) || 0)}
      placeholder="0"
      className={`wb-bold-input w-full bg-white/[0.15] text-right font-mono font-bold rounded-lg px-2 py-1 border-2 border-white/30 focus:border-blue-400/60 focus:bg-white/[0.20] focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-300 ${cls || 'text-white'}`} />
  );
}

// ─── CG Chart with Utility Category + Weight Labels ─────────────────────────

function CgChart({ aircraft, points }: {
  aircraft: Aircraft; points: { label: string; weight: number; cg: number; color: string }[];
}) {
  const env = aircraft.cgEnvelope;
  const util = aircraft.utilityEnvelope;

  const allEnvs = util ? [...env, ...util] : env;
  const allW = allEnvs.map(e => e.weight);
  const allC = allEnvs.flatMap(e => [e.fwd, e.aft]);
  const minW = Math.min(...allW) - 100, maxW = Math.max(...allW) + 75;
  const minC = Math.min(...allC) - 2, maxC = Math.max(...allC) + 2;

  const W = 460, H = 300, p = { t: 15, r: 20, b: 40, l: 55 };
  const pW = W - p.l - p.r, pH = H - p.t - p.b;
  const sx = (c: number) => p.l + ((c - minC) / (maxC - minC)) * pW;
  const sy = (w: number) => p.t + pH - ((w - minW) / (maxW - minW)) * pH;

  const fwdN = env.map(e => `${sx(e.fwd)},${sy(e.weight)}`);
  const aftN = [...env].reverse().map(e => `${sx(e.aft)},${sy(e.weight)}`);

  let utilPoly = '';
  if (util && util.length >= 2) {
    const fwdU = util.map(e => `${sx(e.fwd)},${sy(e.weight)}`);
    const aftU = [...util].reverse().map(e => `${sx(e.aft)},${sy(e.weight)}`);
    utilPoly = [...fwdU, ...aftU].join(' ');
  }

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

      {/* Data points with glow + weight labels */}
      {points.filter(pt => pt.weight > 0).map((pt, i) => {
        const x = sx(pt.cg), y = sy(pt.weight);
        if (x < p.l || x > p.l + pW || y < p.t || y > p.t + pH) return null;
        return <g key={i}>
          <circle cx={x} cy={y} r="7" fill={pt.color} opacity="0.3" filter="url(#glow-dot)" />
          <circle cx={x} cy={y} r="5" fill={pt.color} stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
          <text x={x + 9} y={y - 2} fill="rgba(255,255,255,0.8)" fontSize="9" fontWeight="bold">{pt.label}</text>
          <text x={x + 9} y={y + 9} fill="rgba(255,255,255,0.5)" fontSize="7.5">{Math.round(pt.weight)} lbs</text>
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
    <div className="flex text-[11px] py-0.5 items-center">
      <div className={`flex-1 text-center ${accent ? 'text-emerald-400 font-semibold' : 'text-white/80'}`}>{l}</div>
      <div className="w-px h-3 bg-white/15 flex-shrink-0 mx-0.5" />
      <div className={`flex-1 text-center ${accent ? 'text-emerald-400 font-semibold' : 'text-white/80'}`}>{r}</div>
    </div>
  );
}

// ─── Performance Box (bold + boxed input) ────────────────────────────────────

function PerfInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || '—'}
      className="perf-box w-full text-center text-[11px] font-bold bg-white/[0.15] border-2 border-blue-400/30 rounded-lg py-1 focus:border-blue-400/60 focus:bg-white/[0.20] focus:outline-none focus:shadow-[0_0_8px_rgba(59,130,246,0.2)] transition-all duration-300 text-white" />
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

  // Student & Instructor names (#3)
  const [studentName, setStudentName] = useState('');
  const [instructorName, setInstructorName] = useState('');

  // Flight details (#6)
  const [directionOfFlight, setDirectionOfFlight] = useState('');
  const [typeOfFlight, setTypeOfFlight] = useState('');

  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const ac = useMemo(() => AIRCRAFT.find(a => a.tailNumber === sel)!, [sel]);
  useEffect(() => { setFw(0); setRw(0); setB1(0); setB2(0); setFuel(0); setBurn(0); setTaxi(ac.taxiFuelLbs); }, [sel, ac]);
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

  // ─── Auto-calculate headwind/crosswind (#1) ──────────────────────────────
  const depWind = useMemo(() => {
    if (!wxD || !rwyDep) return null;
    const rwyHdg = parseInt(rwyDep) * 10;
    if (isNaN(rwyHdg) || rwyHdg < 10 || rwyHdg > 360) return null;
    return wComp(wxD.wDir, wxD.wSpd, rwyHdg);
  }, [wxD, rwyDep]);

  const destWind = useMemo(() => {
    if (!wxA || !rwyDest) return null;
    const rwyHdg = parseInt(rwyDest) * 10;
    if (isNaN(rwyHdg) || rwyHdg < 10 || rwyHdg > 360) return null;
    return wComp(wxA.wDir, wxA.wSpd, rwyHdg);
  }, [wxA, rwyDest]);

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

  // ─── Validation: mandatory fields for emailing (#2, #3, #4, #6) ──────────
  const canSubmit = useMemo(() => {
    return (
      studentName.trim() !== '' &&
      instructorName.trim() !== '' &&
      directionOfFlight.trim() !== '' &&
      typeOfFlight.trim() !== '' &&
      toGr.trim() !== '' &&
      toObs.trim() !== '' &&
      ldGrDest.trim() !== '' &&
      ldObsDest.trim() !== '' &&
      fw > 0 &&
      fuel > 0 &&
      c.ok
    );
  }, [studentName, instructorName, directionOfFlight, typeOfFlight, toGr, toObs, ldGrDest, ldObsDest, fw, fuel, c.ok]);

  const submit = async () => {
    if (!canSubmit) return;
    setSending(true); setMsg('');
    try {
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

      let chartUrl = '';
      try {
        const env = ac.cgEnvelope;
        const normalPoly = [
          ...env.map((e: any) => ({x:e.fwd,y:e.weight})),
          ...[...env].reverse().map((e: any) => ({x:e.aft,y:e.weight})),
          {x:env[0].fwd,y:env[0].weight}
        ];
        const datasets: any[] = [
          { label:'Normal', data:normalPoly, borderColor:'#059669', backgroundColor:'rgba(34,197,94,0.15)', fill:true, showLine:true, pointRadius:0, borderWidth:2, tension:0, datalabels:{display:false} },
        ];
        if (ac.utilityEnvelope) {
          const u = ac.utilityEnvelope;
          const utilPoly = [
            ...u.map((e: any) => ({x:e.fwd,y:e.weight})),
            ...[...u].reverse().map((e: any) => ({x:e.aft,y:e.weight})),
            {x:u[0].fwd,y:u[0].weight}
          ];
          datasets.push({ label:'Utility', data:utilPoly, borderColor:'#d97706', borderDash:[6,3], backgroundColor:'rgba(217,119,6,0.08)', fill:true, showLine:true, pointRadius:0, borderWidth:1.5, tension:0, datalabels:{display:false} });
        }
        if (c.zfw > 0) datasets.push({ label:`ZFW ${Math.round(c.zfw)} lbs`, data:[{x:c.zA,y:c.zfw}], backgroundColor:'#7c3aed', borderColor:'#5b21b6', pointRadius:8, pointBorderWidth:2, showLine:false, legendHidden:true, datalabels:{display:true, align:'right', anchor:'end', offset:6, font:{weight:'bold',size:11}, color:'#5b21b6'} });
        if (c.toW > 0) datasets.push({ label:`T/O ${Math.round(c.toW)} lbs`, data:[{x:c.toA,y:c.toW}], backgroundColor:'#2563eb', borderColor:'#1d4ed8', pointRadius:8, pointBorderWidth:2, showLine:false, legendHidden:true, datalabels:{display:true, align:'right', anchor:'end', offset:6, font:{weight:'bold',size:11}, color:'#1d4ed8'} });
        if (c.lW > 0) datasets.push({ label:`Ldg ${Math.round(c.lW)} lbs`, data:[{x:c.lA,y:c.lW}], backgroundColor:'#059669', borderColor:'#047857', pointRadius:8, pointBorderWidth:2, showLine:false, legendHidden:true, datalabels:{display:true, align:'right', anchor:'end', offset:6, font:{weight:'bold',size:11}, color:'#047857'} });
        const cfg = {
          type:'scatter',
          data:{datasets},
          options:{
            scales:{
              x:{title:{display:true,text:'CG Station (inches)',font:{weight:'bold'}}, grid:{color:'#e5e7eb'}},
              y:{title:{display:true,text:'Weight (lbs)',font:{weight:'bold'}}, grid:{color:'#e5e7eb'}}
            },
            plugins:{
              legend:{display:false},
              datalabels:{display:false}
            }
          }
        };
        const qcRes = await fetch('https://quickchart.io/chart/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ width:520, height:320, backgroundColor:'white', chart: cfg }),
        });
        const qcData = await qcRes.json();
        if (qcData.success && qcData.url) chartUrl = qcData.url;
      } catch {}

      const r = await fetch('/api/wb/dispatch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilotName: studentName, // backward compat
          studentName,
          instructorName,
          directionOfFlight,
          typeOfFlight,
          aircraft: ac.tailNumber, aircraftType: ac.type, model: ac.model,
          departure: dep, destination: dest, depMetar: depM?.raw, destMetar: destM?.raw,
          takeoffWeight: c.toW, takeoffCg: c.toA, landingWeight: c.lW, landingCg: c.lA,
          zfwWeight: c.zfw, zfwCg: c.zA,
          rampWeight: c.rW, rampCg: c.rA,
          maxGross: ac.maxGrossWeight, usefulLoad: ac.usefulLoad,
          bew: ac.basicEmptyWeight, bewArm: ac.basicEmptyArm, bewMoment: ac.basicEmptyMoment,
          cgEnvelope: ac.cgEnvelope,
          utilityEnvelope: ac.utilityEnvelope || null,
          toMargin: ac.maxGrossWeight - c.toW,
          toOk: c.toOk, lOk: c.lOk,
          chartUrl,
          // Conditions
          depWinds: wxD ? `${wxD.wDir}° @ ${wxD.wSpd}` : '', destWinds: wxA ? `${wxA.wDir}° @ ${wxA.wSpd}` : '',
          depHwCw: depWind ? `${fmtHw(depWind.hw)} / XW ${depWind.xw}` : '— / —',
          destHwCw: destWind ? `${fmtHw(destWind.hw)} / XW ${destWind.xw}` : '— / —',
          depTemp: wxD ? `${wxD.t}°C / ${wxD.dp ?? '—'}°C` : '', destTemp: wxA ? `${wxA.t}°C / ${wxA.dp ?? '—'}°C` : '',
          depAlt: wxD ? wxD.alt.toFixed(2) : '', destAlt: wxA ? wxA.alt.toFixed(2) : '',
          depPA: wxD ? wxD.pa.toFixed(0) : '', destPA: wxA ? wxA.pa.toFixed(0) : '',
          depDA: wxD ? wxD.da.toFixed(0) : '', destDA: wxA ? wxA.da.toFixed(0) : '',
          depRwy: rwyDep, destRwy: rwyDest,
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

  // ─── Missing field hints ──────────────────────────────────────────────────
  const missingFields = useMemo(() => {
    const m: string[] = [];
    if (!studentName.trim()) m.push('Student name');
    if (!instructorName.trim()) m.push('Instructor name');
    if (!directionOfFlight.trim()) m.push('Direction of flight');
    if (!typeOfFlight.trim()) m.push('Type of flight');
    if (!toGr.trim()) m.push('TO ground roll');
    if (!toObs.trim()) m.push('TO over 50\'');
    if (!ldGrDest.trim()) m.push('Dest landing roll');
    if (!ldObsDest.trim()) m.push('Dest landing 50\'');
    if (fw <= 0) m.push('Front seat weight');
    if (fuel <= 0) m.push('Fuel');
    if (!c.ok) m.push('W&B within limits');
    return m;
  }, [studentName, instructorName, directionOfFlight, typeOfFlight, toGr, toObs, ldGrDest, ldObsDest, fw, fuel, c.ok]);

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
            <img src="/logo-darcy-v3.png?v=1772822630" alt="Darcy Aviation" className="h-20 w-auto drop-shadow-[0_0_12px_rgba(59,130,246,0.3)] lg:ml-[65px]" />
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

        {/* Aircraft Selector */}
        <div className="text-center mb-3">
          <select value={sel} onChange={e => setSel(e.target.value)}
            className="bg-white/[0.06] backdrop-blur-lg border border-white/10 text-white text-sm font-semibold rounded-xl px-5 py-2.5 focus:outline-none focus:border-blue-400/40 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] cursor-pointer transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20">
            {AIRCRAFT.map(a => <option key={a.tailNumber} value={a.tailNumber} className="bg-[#1a1f2e] text-white">{a.tailNumber} {a.type} ({a.model})</option>)}
          </select>
        </div>

        {/* ═══ FLIGHT DETAILS BAR (#3 + #6) ═══ */}
        <GlassCard className="p-3 mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 mb-1">Student Name <span className="text-red-400">*</span></label>
              <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
                placeholder="Student name"
                className="w-full bg-white/[0.15] border-2 border-white/30 rounded-lg px-2.5 py-1.5 text-sm text-white font-semibold placeholder-white/30 focus:outline-none focus:border-blue-400/40 focus:bg-white/[0.20] transition-all duration-300" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 mb-1">Instructor Name <span className="text-red-400">*</span></label>
              <input type="text" value={instructorName} onChange={e => setInstructorName(e.target.value)}
                placeholder="Instructor name"
                className="w-full bg-white/[0.15] border-2 border-white/30 rounded-lg px-2.5 py-1.5 text-sm text-white font-semibold placeholder-white/30 focus:outline-none focus:border-blue-400/40 focus:bg-white/[0.20] transition-all duration-300" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 mb-1">Route <span className="text-red-400">*</span></label>
              <input type="text" value={directionOfFlight} onChange={e => setDirectionOfFlight(e.target.value)}
                placeholder="e.g. KDXR KBDR"
                className="w-full bg-white/[0.15] border-2 border-white/30 rounded-lg px-2.5 py-1.5 text-sm text-white font-semibold placeholder-white/30 focus:outline-none focus:border-blue-400/40 focus:bg-white/[0.20] transition-all duration-300" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 mb-1">Type of Flight <span className="text-red-400">*</span></label>
              <select value={typeOfFlight} onChange={e => setTypeOfFlight(e.target.value)}
                className="w-full bg-white/[0.15] border-2 border-white/30 rounded-lg px-2.5 py-1.5 text-sm text-white font-semibold focus:outline-none focus:border-blue-400/40 focus:bg-white/[0.20] transition-all duration-300">
                <option value="" className="bg-[#1a1f2e]">Select type...</option>
                <option value="Dual Training" className="bg-[#1a1f2e]">Dual Training</option>
                <option value="Solo" className="bg-[#1a1f2e]">Solo</option>
                <option value="Cross-Country (Dual)" className="bg-[#1a1f2e]">Cross-Country (Dual)</option>
                <option value="Cross-Country (Solo)" className="bg-[#1a1f2e]">Cross-Country (Solo)</option>
                <option value="Check Ride" className="bg-[#1a1f2e]">Check Ride</option>
                <option value="Stage Check" className="bg-[#1a1f2e]">Stage Check</option>
                <option value="Discovery Flight" className="bg-[#1a1f2e]">Discovery Flight</option>
                <option value="BFR / Flight Review" className="bg-[#1a1f2e]">BFR / Flight Review</option>
                <option value="IPC" className="bg-[#1a1f2e]">IPC</option>
                <option value="Other" className="bg-[#1a1f2e]">Other</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* ═══ MAIN LAYOUT ═══ */}
        <div className="flex flex-col lg:flex-row gap-4">

          {/* ─── LEFT: Conditions + Performance ─── */}
          <GlassCard className="w-full lg:w-[220px] lg:flex-shrink-0 p-3 space-y-1">
            <SecBar dark>Conditions</SecBar>
            <div className="flex text-[10px] font-semibold text-white/40">
              <div className="flex-1 text-center">Departure</div>
              <div className="w-px bg-white/20 mx-0.5" />
              <div className="flex-1 text-center">Destination</div>
            </div>
            <div className="flex gap-1 items-center overflow-hidden">
              <input type="text" value={dep} onChange={e => setDep(e.target.value.toUpperCase())} maxLength={4} placeholder="ICAO"
                className="min-w-0 flex-1 text-center text-xs font-bold text-emerald-400 bg-white/[0.15] border-2 border-white/30 rounded-lg py-1.5 uppercase focus:border-emerald-400/50 focus:shadow-[0_0_8px_rgba(52,211,153,0.15)] focus:outline-none transition-all duration-300" />
              <div className="w-px h-6 bg-white/20 flex-shrink-0" />
              <input type="text" value={dest} onChange={e => setDest(e.target.value.toUpperCase())} maxLength={4} placeholder="ICAO"
                className="min-w-0 flex-1 text-center text-xs font-bold text-emerald-400 bg-white/[0.15] border-2 border-white/30 rounded-lg py-1.5 uppercase focus:border-emerald-400/50 focus:shadow-[0_0_8px_rgba(52,211,153,0.15)] focus:outline-none transition-all duration-300" />
            </div>
            {ldWx && <div className="text-center text-[10px] text-white/30 py-0.5">Loading...</div>}

            {/* Runway Headings (#1) */}
            <SecBar>Runway</SecBar>
            <div className="flex gap-1 items-center overflow-hidden">
              <input type="text" value={rwyDep} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); setRwyDep(v); }}
                maxLength={2} placeholder="RWY"
                className="min-w-0 flex-1 text-center text-xs font-bold text-amber-400 bg-white/[0.15] border-2 border-white/30 rounded-lg py-1 uppercase focus:border-amber-400/50 focus:outline-none transition-all duration-300" />
              <div className="w-px h-5 bg-white/20 flex-shrink-0" />
              <input type="text" value={rwyDest} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); setRwyDest(v); }}
                maxLength={2} placeholder="RWY"
                className="min-w-0 flex-1 text-center text-xs font-bold text-amber-400 bg-white/[0.15] border-2 border-white/30 rounded-lg py-1 uppercase focus:border-amber-400/50 focus:outline-none transition-all duration-300" />
            </div>

            <SecBar>Winds</SecBar>
            <DualVal l={wxD ? `${wxD.wDir}° @ ${wxD.wSpd}` : '—'} r={wxA ? `${wxA.wDir}° @ ${wxA.wSpd}` : '—'} />

            {/* Auto-calculated Headwind / Crosswind (#1) */}
            <SecBar>Headwind / Crosswind</SecBar>
            <div className="flex text-[10px] font-semibold text-white/40">
              <div className="flex-1 text-center">Departure</div>
              <div className="flex-1 text-center">Destination</div>
            </div>
            <div className="flex text-[11px] py-0.5 items-center">
              <div className={`flex-1 text-center ${depWind ? (depWind.hw >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white/40'} font-semibold`}>
                {depWind ? `${fmtHw(depWind.hw)} / XW ${depWind.xw}` : (rwyDep ? 'No wind data' : 'Enter RWY')}
              </div>
              <div className="w-px h-3 bg-white/15 flex-shrink-0 mx-0.5" />
              <div className={`flex-1 text-center ${destWind ? (destWind.hw >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white/40'} font-semibold`}>
                {destWind ? `${fmtHw(destWind.hw)} / XW ${destWind.xw}` : (rwyDest ? 'No wind data' : 'Enter RWY')}
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

            {/* ─── Performance (#2) — Bold + Boxed ─── */}
            <SecBar dark>Performance</SecBar>
            <SecBar><u>Maneuvering speed (V<sub>A</sub>)</u></SecBar>
            <div className="flex text-[10px] font-semibold text-white/40">
              <div className="flex-1 text-center">Takeoff</div>
              <div className="flex-1 text-center">Landing</div>
            </div>
            <DualVal l={f(vaTo)} r={f(vaLd)} />

            {/* Takeoff Performance — Departure (BOXED) */}
            <div className="perf-box border-2 border-blue-400/25 rounded-lg p-2 bg-blue-400/[0.04]">
              <div className="text-center text-[10px] font-bold text-blue-400 mb-1">Takeoff — Departure <span className="text-red-400">*</span></div>
              <div className="flex text-[10px] font-semibold text-white/40 mb-0.5">
                <div className="flex-1 text-center">Ground Roll</div>
                <div className="flex-1 text-center">Over 50'</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <PerfInput value={toGr} onChange={setToGr} />
                <PerfInput value={toObs} onChange={setToObs} />
              </div>
            </div>

            {/* Landing Performance — Departure (BOXED) */}
            <div className="perf-box border-2 border-emerald-400/25 rounded-lg p-2 bg-emerald-400/[0.04]">
              <div className="text-center text-[10px] font-bold text-emerald-400 mb-1">Landing — Departure</div>
              <div className="flex text-[10px] font-semibold text-white/40 mb-0.5">
                <div className="flex-1 text-center">Ground Roll</div>
                <div className="flex-1 text-center">Over 50'</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <PerfInput value={ldGrDep} onChange={setLdGrDep} />
                <PerfInput value={ldObsDep} onChange={setLdObsDep} />
              </div>
            </div>

            {/* Landing Performance — Destination (BOXED) */}
            <div className="perf-box border-2 border-emerald-400/25 rounded-lg p-2 bg-emerald-400/[0.04]">
              <div className="text-center text-[10px] font-bold text-emerald-400 mb-1">Landing — Destination <span className="text-red-400">*</span></div>
              <div className="flex text-[10px] font-semibold text-white/40 mb-0.5">
                <div className="flex-1 text-center">Ground Roll</div>
                <div className="flex-1 text-center">Over 50'</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <PerfInput value={ldGrDest} onChange={setLdGrDest} />
                <PerfInput value={ldObsDest} onChange={setLdObsDest} />
              </div>
            </div>
          </GlassCard>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="flex-1 min-w-0 space-y-4 overflow-x-hidden">

            {/* W&B TABLE (#4 — Bold + Boxed inputs) */}
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
                  <TRowE l={ac.frontLabel} o="+" w={fw} a={ac.frontArm} m={c.fm} oM="+" set={setFw} required />
                  {ac.hasRear && <TRowE l={ac.rearLabel} o="+" w={rw} a={ac.rearArm} m={c.rm} oM="+" set={setRw} />}
                  <TRowE l={`${ac.bag1Label} (Max ${ac.bag1Max})`} o="+" w={b1} a={ac.bag1Arm} m={c.b1m} oM="+" set={v => setB1(Math.min(v, ac.bag1Max))} />
                  {ac.hasBag2 && <TRowE l={`${ac.bag2Label} (Max ${ac.bag2Max})`} o="+" w={b2} a={ac.bag2Arm} m={c.b2m} oM="+" set={v => setB2(Math.min(v, ac.bag2Max))} />}
                  <TRow l="Zero Fuel Weight" o="=" w={c.zfw} a={c.zA} m={c.zM} oM="=" line color="text-purple-400" boxed />
                  <TRowE l={ac.fuelLabel} o="+" w={fuel} a={ac.fuelArm} m={c.fM} oM="+" set={v => setFuel(Math.min(v, ac.maxFuelLbs))}
                    hint={`${Math.round(fuel / 6)} gal / ${Math.round(ac.maxFuelLbs / 6)} max`} required />
                  <TRow l="Ramp Weight" o="=" w={c.rW} a={c.rA} m={c.rM} oM="=" green line boxed />
                  <TRowE l="Taxi Fuel" o="-" w={taxi} a={ac.fuelArm} m={c.tM} oM="-" set={v => setTaxi(Math.min(v, fuel))} />
                  <TRow l="Takeoff Weight" o="=" w={c.toW} a={c.toA} m={c.toM} oM="=" line ok={c.toOk} color="text-blue-400" boxed />
                  <TRowE l="Fuel Burn" o="-" w={burn} a={ac.fuelArm} m={c.bM} oM="-" set={v => setBurn(Math.min(v, fuel))}
                    hint={`${Math.round(burn / 6)} gal`} />
                  <TRow l="Landing Weight" o="=" w={c.lW} a={c.lA} m={c.lM} oM="=" line ok={c.lOk} color="text-emerald-400" boxed />
                </tbody>
              </table>

              <div className="mt-3 pt-2 border-t border-white/10 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
                <div className="flex justify-between"><span className="text-white/30">Max Gross</span><span className="text-white/90 font-bold">{ac.maxGrossWeight} lbs</span></div>
                <div className="flex justify-between"><span className="text-white/30">T/O Margin</span>
                  <span className={`font-bold ${ac.maxGrossWeight - c.toW >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{f(ac.maxGrossWeight - c.toW, 0)} lbs</span>
                </div>
              </div>
            </GlassCard>

            {/* CG CHART (#5 — weight labels on graph) */}
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
              {/* Missing fields hint */}
              {missingFields.length > 0 && (
                <div className="mb-3 text-[10px] text-amber-400/70 bg-amber-400/[0.06] border border-amber-400/15 rounded-lg px-3 py-2">
                  <span className="font-semibold">Required:</span> {missingFields.join(' · ')}
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <button onClick={() => window.print()} disabled={!canSubmit}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                      canSubmit
                        ? 'bg-white/[0.08] hover:bg-white/[0.15] text-white/80 hover:text-white border border-white/10 hover:border-white/20 active:scale-95'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}>
                    🖨️ Print
                  </button>
                  <button onClick={submit} disabled={sending || !canSubmit}
                    className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                      canSubmit
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:shadow-xl active:scale-95'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}>
                    {sending ? 'Sending...' : '📧 Dispatch'}
                  </button>
                </div>
              </div>
              {msg && <p className={`text-xs mt-2 text-center ${msg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
            </GlassCard>

            {/* Print-only: Weight summary + Names + signature lines */}
            <div className="hidden print:block" style={{ marginTop: 8, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, padding: '4px 0', borderBottom: '1px solid #ccc' }}>
                <div><strong>ZFW:</strong> {f(c.zfw, 1)} lbs</div>
                <div><strong>T/O Weight:</strong> {f(c.toW, 1)} lbs</div>
                <div><strong>LDG Weight:</strong> {f(c.lW, 1)} lbs</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <div><strong>Route:</strong> {directionOfFlight || '________________________'}</div>
                <div><strong>Type:</strong> {typeOfFlight || '________________________'}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <div><strong>Student:</strong> {studentName || '________________________'}</div>
                <div><strong>Date:</strong> {now.toLocaleDateString('en-US', { timeZone: 'America/New_York' })} {now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 12 }}>
                <div>Student Signature: ________________________</div>
                <div><strong>Instructor:</strong> {instructorName || '________________________'}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 12 }}>
                <div>Instructor Signature: ________________________</div>
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

function TRow({ l, o, w, a, m, oM, green, line, ok, color, boxed }: {
  l: string; o: string; w: number; a: number; m: number; oM: string;
  green?: boolean; line?: boolean; ok?: boolean; color?: string; boxed?: boolean;
}) {
  const gc = color ? `font-bold ${color}` : green ? 'font-bold text-emerald-400' : 'text-white/80';
  const bg = ok === false ? 'bg-red-500/10' : '';
  if (boxed) {
    // Render as a standalone boxed div instead of a table row
    const borderColor = color === 'text-purple-400' ? 'border-purple-400/30 bg-purple-400/[0.04]'
      : color === 'text-blue-400' ? 'border-blue-400/30 bg-blue-400/[0.04]'
      : color === 'text-emerald-400' ? 'border-emerald-400/30 bg-emerald-400/[0.04]'
      : 'border-white/20 bg-white/[0.04]';
    return (
      <tr>
        <td colSpan={7} className="py-1">
          <div className={`border-2 ${borderColor} rounded-lg px-2 py-1.5 ${bg}`}>
            <div className="flex items-center text-[11px] sm:text-xs">
              <div className={`flex-1 text-right pr-1 ${gc}`}>{l}</div>
              <div className={`w-4 text-center ${gc}`}>{o}</div>
              <div className={`w-16 text-right pr-1 font-mono ${gc}`}>{f(w)}</div>
              <div className="w-4 text-center text-white/20">×</div>
              <div className={`w-14 text-right pr-1 font-mono ${gc}`}>{f(a)}</div>
              <div className={`w-4 text-center ${gc}`}>{oM}</div>
              <div className={`w-24 text-right font-mono ${gc}`}>{f(m)}</div>
            </div>
          </div>
        </td>
      </tr>
    );
  }
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

function TRowE({ l, o, w, a, m, oM, set, hint, required }: {
  l: string; o: string; w: number; a: number; m: number; oM: string;
  set: (v: number) => void; hint?: string; required?: boolean;
}) {
  return (
    <tr>
      <td className="text-right pr-1 py-1.5 text-white/80">
        {l}
        {required && <span className="text-red-400 ml-0.5 text-[9px]">*</span>}
      </td>
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
