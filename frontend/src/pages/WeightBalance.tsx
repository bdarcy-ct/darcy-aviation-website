import { useState, useEffect, useMemo, useCallback } from 'react';

// ─── Aircraft Database ───────────────────────────────────────────────────────

interface CgLimit { weight: number; fwd: number; aft: number; }

interface Aircraft {
  tailNumber: string;
  type: string;
  model: string;
  basicEmptyWeight: number;
  basicEmptyArm: number;
  basicEmptyMoment: number;
  maxGrossWeight: number;
  usefulLoad: number;
  fuelArm: number;
  maxFuelLbs: number;
  taxiFuelLbs: number;
  frontArm: number;
  rearArm: number;
  bag1Arm: number;
  bag2Arm: number;
  bag1Max: number;
  bag2Max: number;
  hasRear: boolean;
  hasBag2: boolean;
  cgEnvelope: CgLimit[];
  frontLabel: string;
  rearLabel: string;
  bag1Label: string;
  bag2Label: string;
  fuelLabel: string;
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
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2',
    fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 47.0 }, { weight: 1600, fwd: 35.0, aft: 47.0 },
      { weight: 1700, fwd: 35.0, aft: 47.0 }, { weight: 1800, fwd: 37.0, aft: 47.0 },
      { weight: 1900, fwd: 38.0, aft: 47.0 }, { weight: 2000, fwd: 39.0, aft: 47.0 },
      { weight: 2100, fwd: 40.0, aft: 47.0 }, { weight: 2200, fwd: 40.5, aft: 47.0 },
      { weight: 2300, fwd: 41.0, aft: 47.0 },
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
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2',
    fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 47.0 }, { weight: 1600, fwd: 35.0, aft: 47.0 },
      { weight: 1700, fwd: 35.0, aft: 47.0 }, { weight: 1800, fwd: 37.0, aft: 47.0 },
      { weight: 1900, fwd: 38.0, aft: 47.0 }, { weight: 2000, fwd: 39.0, aft: 47.0 },
      { weight: 2100, fwd: 40.0, aft: 47.0 }, { weight: 2200, fwd: 40.5, aft: 47.0 },
      { weight: 2300, fwd: 41.0, aft: 47.0 },
    ],
  },
  {
    tailNumber: 'N34LC', type: 'Cessna 172 (180 HP)', model: 'C172-180',
    basicEmptyWeight: 1498.10, basicEmptyArm: 38.71, basicEmptyMoment: 57994.26,
    maxGrossWeight: 2550, usefulLoad: 1051.90,
    fuelArm: 47.9, maxFuelLbs: 336, taxiFuelLbs: 8,
    frontArm: 37, rearArm: 73, bag1Arm: 95, bag2Arm: 123,
    bag1Max: 120, bag2Max: 120, hasRear: true, hasBag2: true,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2',
    fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 47.0 }, { weight: 1600, fwd: 35.0, aft: 47.0 },
      { weight: 1700, fwd: 35.0, aft: 47.0 }, { weight: 1800, fwd: 36.0, aft: 47.0 },
      { weight: 1900, fwd: 37.0, aft: 47.0 }, { weight: 2000, fwd: 38.0, aft: 47.0 },
      { weight: 2100, fwd: 38.5, aft: 47.0 }, { weight: 2200, fwd: 39.5, aft: 47.0 },
      { weight: 2300, fwd: 40.5, aft: 47.0 }, { weight: 2400, fwd: 41.0, aft: 47.0 },
      { weight: 2550, fwd: 41.0, aft: 47.0 },
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
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2',
    fuelLabel: 'Usable Fuel',
    cgEnvelope: [
      { weight: 1100, fwd: 31.0, aft: 36.5 }, { weight: 1200, fwd: 31.5, aft: 36.5 },
      { weight: 1300, fwd: 32.0, aft: 36.5 }, { weight: 1400, fwd: 33.0, aft: 36.5 },
      { weight: 1500, fwd: 33.5, aft: 36.5 }, { weight: 1600, fwd: 34.0, aft: 36.5 },
      { weight: 1670, fwd: 34.5, aft: 36.5 },
    ],
  },
  {
    tailNumber: 'N8715C', type: 'Piper Warrior II', model: 'PA-28-161',
    basicEmptyWeight: 1498.84, basicEmptyArm: 85.32, basicEmptyMoment: 127881.03,
    maxGrossWeight: 2325, usefulLoad: 826.16,
    fuelArm: 95.0, maxFuelLbs: 288, taxiFuelLbs: 8,
    frontArm: 80.5, rearArm: 118.1, bag1Arm: 142.8, bag2Arm: 0,
    bag1Max: 200, bag2Max: 0, hasRear: true, hasBag2: false,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage Back', bag2Label: '',
    fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1200, fwd: 83.0, aft: 93.0 }, { weight: 1400, fwd: 83.0, aft: 93.0 },
      { weight: 1600, fwd: 83.0, aft: 93.0 }, { weight: 1800, fwd: 83.0, aft: 93.0 },
      { weight: 1900, fwd: 84.0, aft: 93.0 }, { weight: 2000, fwd: 85.0, aft: 93.0 },
      { weight: 2100, fwd: 86.0, aft: 93.0 }, { weight: 2200, fwd: 87.0, aft: 93.0 },
      { weight: 2325, fwd: 87.0, aft: 93.0 },
    ],
  },
  {
    tailNumber: 'N84001', type: 'Piper Warrior II', model: 'PA-28-161',
    basicEmptyWeight: 1467.70, basicEmptyArm: 84.10, basicEmptyMoment: 123389.00,
    maxGrossWeight: 2325, usefulLoad: 857.30,
    fuelArm: 95.0, maxFuelLbs: 288, taxiFuelLbs: 8,
    frontArm: 80.5, rearArm: 118.1, bag1Arm: 142.8, bag2Arm: 0,
    bag1Max: 200, bag2Max: 0, hasRear: true, hasBag2: false,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage Back', bag2Label: '',
    fuelLabel: 'Usable Fuel (wings)',
    cgEnvelope: [
      { weight: 1200, fwd: 83.0, aft: 93.0 }, { weight: 1400, fwd: 83.0, aft: 93.0 },
      { weight: 1600, fwd: 83.0, aft: 93.0 }, { weight: 1800, fwd: 83.0, aft: 93.0 },
      { weight: 1900, fwd: 84.0, aft: 93.0 }, { weight: 2000, fwd: 85.0, aft: 93.0 },
      { weight: 2100, fwd: 86.0, aft: 93.0 }, { weight: 2200, fwd: 87.0, aft: 93.0 },
      { weight: 2325, fwd: 87.0, aft: 93.0 },
    ],
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface MetarData {
  raw: string;
  temp_c: number | null;
  dewpoint_c: number | null;
  altimeter_inhg: number | null;
  wind_dir: number | string;
  wind_speed_kt: number;
  wind_gust_kt: number | null;
  flight_category: string;
  station: string;
  elevation_ft: number | null;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function normalizeAltimeter(val: number | null): number {
  if (val === null) return 29.92;
  if (val > 100) return val * 0.02953;
  return val;
}

function pressureAltitude(elev: number, altInHg: number): number {
  return elev + (29.92 - altInHg) * 1000;
}

function densityAltitude(pa: number, tempC: number): number {
  const std = 15 - (pa / 1000) * 2;
  return pa + 120 * (tempC - std);
}

function windComponents(dir: number | string, spd: number, rwy: number) {
  if (typeof dir === 'string' || isNaN(Number(dir))) return { hw: 0, xw: 0 };
  const d = ((Number(dir) - rwy + 360) % 360) * (Math.PI / 180);
  return { hw: Math.round(spd * Math.cos(d)), xw: Math.round(Math.abs(spd * Math.sin(d))) };
}

function interpolateCg(env: CgLimit[], w: number, side: 'fwd' | 'aft'): number {
  if (w <= env[0].weight) return env[0][side];
  if (w >= env[env.length - 1].weight) return env[env.length - 1][side];
  for (let i = 0; i < env.length - 1; i++) {
    if (w >= env[i].weight && w <= env[i + 1].weight) {
      const r = (w - env[i].weight) / (env[i + 1].weight - env[i].weight);
      return env[i][side] + r * (env[i + 1][side] - env[i][side]);
    }
  }
  return env[0][side];
}

function cgOk(env: CgLimit[], w: number, cg: number): boolean {
  if (w < env[0].weight) return cg >= env[0].fwd && cg <= env[0].aft;
  if (w > env[env.length - 1].weight) return false;
  return cg >= interpolateCg(env, w, 'fwd') && cg <= interpolateCg(env, w, 'aft');
}

function f(n: number, d = 2): string { return n.toFixed(d); }

// ─── Editable Input ──────────────────────────────────────────────────────────

function NumIn({ value, onChange, className }: { value: number; onChange: (v: number) => void; className?: string }) {
  return (
    <input type="number" value={value || ''} onChange={e => onChange(Number(e.target.value) || 0)}
      placeholder="0" min={0}
      className={`w-full bg-transparent text-right font-sans focus:bg-blue-50 focus:outline-none rounded px-1 py-0.5 border-b border-dashed border-gray-300 focus:border-blue-400 ${className || ''}`}
      style={{ MozAppearance: 'textfield' }} />
  );
}

// ─── CG Envelope Chart (white bg, green fill) ───────────────────────────────

function CgChart({ aircraft, points }: {
  aircraft: Aircraft;
  points: { label: string; weight: number; cg: number; color: string }[];
}) {
  const env = aircraft.cgEnvelope;
  const minW = env[0].weight - 100;
  const maxW = env[env.length - 1].weight + 75;
  const allCgs = env.flatMap(e => [e.fwd, e.aft]);
  const minCg = Math.min(...allCgs) - 2;
  const maxCg = Math.max(...allCgs) + 2;

  const W = 460, H = 320;
  const p = { t: 15, r: 20, b: 40, l: 50 };
  const pW = W - p.l - p.r, pH = H - p.t - p.b;

  const sx = (c: number) => p.l + ((c - minCg) / (maxCg - minCg)) * pW;
  const sy = (w: number) => p.t + pH - ((w - minW) / (maxW - minW)) * pH;

  const fwd = env.map(e => `${sx(e.fwd)},${sy(e.weight)}`);
  const aft = [...env].reverse().map(e => `${sx(e.aft)},${sy(e.weight)}`);
  const poly = [...fwd, ...aft].join(' ');

  const wStep = maxW - minW > 800 ? 200 : 100;
  const wTicks: number[] = [];
  for (let w = Math.ceil(minW / wStep) * wStep; w <= maxW; w += wStep) wTicks.push(w);
  const cStep = maxCg - minCg > 20 ? 5 : 2;
  const cTicks: number[] = [];
  for (let c = Math.ceil(minCg / cStep) * cStep; c <= maxCg; c += cStep) cTicks.push(c);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto border border-gray-200 rounded">
      <rect width={W} height={H} fill="white" />
      <rect x={p.l} y={p.t} width={pW} height={pH} fill="white" stroke="#ccc" strokeWidth="0.5" />
      {wTicks.map(w => (
        <g key={w}>
          <line x1={p.l} y1={sy(w)} x2={p.l + pW} y2={sy(w)} stroke="#e5e7eb" strokeWidth="0.5" />
          <text x={p.l - 5} y={sy(w) + 3} textAnchor="end" fill="#666" fontSize="9">{w}</text>
        </g>
      ))}
      {cTicks.map(c => (
        <g key={c}>
          <line x1={sx(c)} y1={p.t} x2={sx(c)} y2={p.t + pH} stroke="#e5e7eb" strokeWidth="0.5" />
          <text x={sx(c)} y={p.t + pH + 14} textAnchor="middle" fill="#666" fontSize="9">{c}</text>
        </g>
      ))}
      <polygon points={poly} fill="rgba(144,238,144,0.35)" stroke="#228B22" strokeWidth="2" />
      {points.filter(pt => pt.weight > 0).map((pt, i) => {
        const x = sx(pt.cg), y = sy(pt.weight);
        if (x < p.l || x > p.l + pW || y < p.t || y > p.t + pH) return null;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill={pt.color} stroke="#333" strokeWidth="1.5" />
            <text x={x + 8} y={y + 4} fill="#333" fontSize="9" fontWeight="bold">{pt.label}</text>
          </g>
        );
      })}
      <text x={p.l + pW / 2} y={H - 4} textAnchor="middle" fill="#333" fontSize="10" fontWeight="bold">C.G. Location (inches)</text>
      <text x={12} y={p.t + pH / 2} textAnchor="middle" fill="#333" fontSize="10" fontWeight="bold" transform={`rotate(-90, 12, ${p.t + pH / 2})`}>Weight (lbs)</text>
    </svg>
  );
}

// ─── Section Header (gray bar) ───────────────────────────────────────────────

function SectionHeader({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`text-center text-xs font-bold py-1 px-2 ${dark ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
      {children}
    </div>
  );
}

// ─── Two-value row (departure / destination) ─────────────────────────────────

function DualVal({ left, right, green }: { left: string; right: string; green?: boolean }) {
  const cls = green ? 'text-green-700 font-bold' : 'text-gray-800';
  return (
    <div className="flex text-xs py-0.5">
      <div className={`flex-1 text-center ${cls}`}>{left}</div>
      <div className={`flex-1 text-center ${cls}`}>{right}</div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WeightBalance() {
  const [selectedTail, setSelectedTail] = useState(AIRCRAFT[0].tailNumber);
  const [depAirport, setDepAirport] = useState('KDXR');
  const [destAirport, setDestAirport] = useState('');
  const [depMetar, setDepMetar] = useState<MetarData | null>(null);
  const [destMetar, setDestMetar] = useState<MetarData | null>(null);
  const [runwayHeading, setRunwayHeading] = useState(0);
  const [loadingWx, setLoadingWx] = useState(false);

  const [frontWeight, setFrontWeight] = useState(0);
  const [rearWeight, setRearWeight] = useState(0);
  const [baggage1, setBaggage1] = useState(0);
  const [baggage2, setBaggage2] = useState(0);
  const [fuelLbs, setFuelLbs] = useState(0);
  const [fuelBurnLbs, setFuelBurnLbs] = useState(0);

  const [pilotName, setPilotName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const ac = useMemo(() => AIRCRAFT.find(a => a.tailNumber === selectedTail)!, [selectedTail]);

  useEffect(() => {
    setFrontWeight(0); setRearWeight(0); setBaggage1(0); setBaggage2(0);
    setFuelLbs(0); setFuelBurnLbs(0);
  }, [selectedTail]);

  // ── Weather ────────────────────────────────────────────────────────────

  const fetchMetar = useCallback(async (icao: string): Promise<MetarData | null> => {
    if (!icao || icao.length < 3) return null;
    try {
      const r = await fetch(`/api/wb/metar?icao=${encodeURIComponent(icao.toUpperCase())}`);
      return r.ok ? await r.json() : null;
    } catch { return null; }
  }, []);

  const loadWx = useCallback(async () => {
    setLoadingWx(true);
    const [d, a] = await Promise.all([depAirport ? fetchMetar(depAirport) : null, destAirport ? fetchMetar(destAirport) : null]);
    setDepMetar(d); setDestMetar(a);
    setLoadingWx(false);
  }, [depAirport, destAirport, fetchMetar]);

  useEffect(() => {
    const t = setTimeout(() => { if (depAirport.length >= 3 || destAirport.length >= 3) loadWx(); }, 800);
    return () => clearTimeout(t);
  }, [depAirport, destAirport, loadWx]);

  // ── Computed weather values ────────────────────────────────────────────

  const wxDep = useMemo(() => {
    if (!depMetar) return null;
    const alt = normalizeAltimeter(depMetar.altimeter_inhg);
    const t = depMetar.temp_c ?? 15;
    const elev = depMetar.elevation_ft || 0;
    const pa = pressureAltitude(elev, alt);
    const da = densityAltitude(pa, t);
    const w = windComponents(depMetar.wind_dir, depMetar.wind_speed_kt, runwayHeading);
    return { alt, t, dp: depMetar.dewpoint_c, pa, da, windDir: depMetar.wind_dir, windSpd: depMetar.wind_speed_kt, windGust: depMetar.wind_gust_kt, ...w };
  }, [depMetar, runwayHeading]);

  const wxDest = useMemo(() => {
    if (!destMetar) return null;
    const alt = normalizeAltimeter(destMetar.altimeter_inhg);
    const t = destMetar.temp_c ?? 15;
    const elev = destMetar.elevation_ft || 0;
    const pa = pressureAltitude(elev, alt);
    const da = densityAltitude(pa, t);
    const w = windComponents(destMetar.wind_dir, destMetar.wind_speed_kt, runwayHeading);
    return { alt, t, dp: destMetar.dewpoint_c, pa, da, windDir: destMetar.wind_dir, windSpd: destMetar.wind_speed_kt, windGust: destMetar.wind_gust_kt, ...w };
  }, [destMetar, runwayHeading]);

  // ── W&B Calc ───────────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const fm = frontWeight * ac.frontArm;
    const rm = rearWeight * ac.rearArm;
    const b1m = baggage1 * ac.bag1Arm;
    const b2m = baggage2 * ac.bag2Arm;
    const zfw = ac.basicEmptyWeight + frontWeight + rearWeight + baggage1 + baggage2;
    const zfwM = ac.basicEmptyMoment + fm + rm + b1m + b2m;
    const zfwA = zfw > 0 ? zfwM / zfw : 0;
    const fM = fuelLbs * ac.fuelArm;
    const rW = zfw + fuelLbs; const rM = zfwM + fM; const rA = rW > 0 ? rM / rW : 0;
    const tM = ac.taxiFuelLbs * ac.fuelArm;
    const toW = rW - ac.taxiFuelLbs; const toM = rM - tM; const toA = toW > 0 ? toM / toW : 0;
    const bM = fuelBurnLbs * ac.fuelArm;
    const lW = toW - fuelBurnLbs; const lM = toM - bM; const lA = lW > 0 ? lM / lW : 0;

    const toOk = cgOk(ac.cgEnvelope, toW, toA) && toW <= ac.maxGrossWeight;
    const lOk = cgOk(ac.cgEnvelope, lW, lA) && lW <= ac.maxGrossWeight && lW > 0;

    return { fm, rm, b1m, b2m, zfw, zfwA, zfwM, fM, rW, rA, rM, tM, toW, toA, toM, bM, lW, lA, lM, toOk, lOk, allGood: toOk && lOk };
  }, [ac, frontWeight, rearWeight, baggage1, baggage2, fuelLbs, fuelBurnLbs]);

  // ── Va ─────────────────────────────────────────────────────────────────

  const va = useMemo(() => {
    let base: number;
    if (ac.model.startsWith('PA-')) base = 111;
    else if (ac.model === 'C152') base = 88;
    else if (ac.model === 'C172-180') base = 104;
    else base = 99;
    const toVa = calc.toW > 0 ? base * Math.sqrt(calc.toW / ac.maxGrossWeight) : 0;
    const lVa = calc.lW > 0 ? base * Math.sqrt(calc.lW / ac.maxGrossWeight) : 0;
    return { to: toVa, ldg: lVa };
  }, [ac, calc]);

  // ── Submit ─────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!pilotName.trim() || !calc.allGood) return;
    setSubmitting(true); setSubmitMsg('');
    try {
      const r = await fetch('/api/wb/dispatch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilotName, aircraft: ac.tailNumber, aircraftType: ac.type,
          departure: depAirport, destination: destAirport,
          depMetar: depMetar?.raw, destMetar: destMetar?.raw,
          takeoffWeight: calc.toW, takeoffCg: calc.toA,
          landingWeight: calc.lW, landingCg: calc.lA,
          fuelLbs, fuelBurnLbs, frontWeight, rearWeight, baggage1, baggage2,
          timestamp: new Date().toISOString(),
        }),
      });
      setSubmitMsg(r.ok ? '✅ Sent to dispatch!' : 'Failed — try again');
    } catch { setSubmitMsg('Network error'); }
    setSubmitting(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  const depWind = wxDep ? `${wxDep.windDir}° @ ${wxDep.windSpd}` : '—';
  const destWind = wxDest ? `${wxDest.windDir}° @ ${wxDest.windSpd}` : '—';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
  const timeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen bg-white text-gray-900 py-4 px-4 print:py-0 print:px-0" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="max-w-[850px] mx-auto">

        {/* ═══ HEADER ═══ */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1" />
          <div className="text-center flex-shrink-0">
            <h1 className="text-xl font-bold">Weight & Balance</h1>
          </div>
          <div className="flex-1 text-right text-xs text-gray-500">
            <div>{dateStr}</div>
            <div>{timeStr}</div>
          </div>
        </div>

        {/* Aircraft selector + info */}
        <div className="text-center mb-2">
          <select value={selectedTail} onChange={e => setSelectedTail(e.target.value)}
            className="text-sm font-bold bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-400 print:border-none print:appearance-none">
            {AIRCRAFT.map(a => <option key={a.tailNumber} value={a.tailNumber}>{a.tailNumber} {a.type} ({a.model})</option>)}
          </select>
        </div>

        {/* ═══ TWO COLUMN LAYOUT ═══ */}
        <div className="flex gap-3">

          {/* ─── LEFT COLUMN: Conditions + Performance ─── */}
          <div className="w-[200px] flex-shrink-0 border border-gray-300 text-[11px]">

            {/* Conditions */}
            <SectionHeader>Conditions</SectionHeader>
            <div className="flex text-[10px] font-bold text-gray-500 border-b border-gray-200">
              <div className="flex-1 text-center py-0.5">Departure</div>
              <div className="flex-1 text-center py-0.5">Destination</div>
            </div>

            {/* Airport codes (editable) */}
            <div className="flex border-b border-gray-200">
              <div className="flex-1 text-center py-0.5">
                <input type="text" value={depAirport} onChange={e => setDepAirport(e.target.value.toUpperCase())}
                  maxLength={4} placeholder="ICAO"
                  className="w-14 text-center text-xs font-bold text-green-700 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-400 focus:outline-none uppercase" />
              </div>
              <div className="flex-1 text-center py-0.5">
                <input type="text" value={destAirport} onChange={e => setDestAirport(e.target.value.toUpperCase())}
                  maxLength={4} placeholder="ICAO"
                  className="w-14 text-center text-xs font-bold text-green-700 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-400 focus:outline-none uppercase" />
              </div>
            </div>

            {loadingWx && <div className="text-center text-[10px] text-gray-400 py-1">Loading...</div>}

            <SectionHeader>Winds</SectionHeader>
            <DualVal left={depWind} right={destWind} />

            <SectionHeader>Headwind / Crosswind</SectionHeader>
            <div className="text-center text-xs py-0.5">
              <input type="number" value={runwayHeading || ''} onChange={e => setRunwayHeading(Number(e.target.value))}
                placeholder="RWY°" min={0} max={360}
                className="w-10 text-center text-[10px] bg-transparent border-b border-dashed border-gray-300 focus:border-blue-400 focus:outline-none" />
              {': '}
              {wxDep ? `${wxDep.hw} / ${wxDep.xw}` : '— / —'}
            </div>

            <SectionHeader>Temperature / Dew point</SectionHeader>
            <DualVal
              left={wxDep ? `${wxDep.t}°C / ${wxDep.dp ?? '—'}°C` : '—'}
              right={wxDest ? `${wxDest.t}°C / ${wxDest.dp ?? '—'}°C` : '—'} />

            <SectionHeader>Altimeter</SectionHeader>
            <DualVal
              left={wxDep ? f(wxDep.alt) : '—'}
              right={wxDest ? f(wxDest.alt) : '—'} />

            <SectionHeader><span className="underline">Pressure Altitude</span></SectionHeader>
            <DualVal
              left={wxDep ? f(wxDep.pa) : '—'}
              right={wxDest ? f(wxDest.pa) : '—'} />

            <SectionHeader><span className="underline">Density Altitude</span></SectionHeader>
            <DualVal
              left={wxDep ? f(wxDep.da) : '—'}
              right={wxDest ? f(wxDest.da) : '—'} />

            {/* Performance */}
            <SectionHeader dark>Performance</SectionHeader>

            <SectionHeader><span className="underline">Maneuvering speed (V<sub>A</sub>)</span></SectionHeader>
            <div className="flex text-[10px] font-bold text-gray-500">
              <div className="flex-1 text-center">Takeoff</div>
              <div className="flex-1 text-center">Landing</div>
            </div>
            <DualVal left={f(va.to)} right={f(va.ldg)} />

            <SectionHeader>Takeoff</SectionHeader>
            <div className="flex text-[10px] font-bold text-gray-500">
              <div className="flex-1 text-center">Ground Roll</div>
              <div className="flex-1 text-center">50' OBS</div>
            </div>
            <DualVal left="—" right="—" />

            <SectionHeader>Landing</SectionHeader>
            <div className="flex text-[10px] font-bold text-gray-500">
              <div className="flex-1 text-center">Departure</div>
              <div className="flex-1 text-center">Destination</div>
            </div>
            <DualVal left="—" right="—" />
          </div>

          {/* ─── RIGHT COLUMN: Summary + W&B Table + CG Chart ─── */}
          <div className="flex-1 min-w-0">

            {/* Summary bar */}
            <div className="flex justify-between items-end border-b border-gray-300 pb-1 mb-2 text-[11px]">
              {[
                ['Max Weight', String(ac.maxGrossWeight)],
                ['Useful Load', f(ac.usefulLoad)],
                ['Basic Empty Weight', f(ac.basicEmptyWeight)],
                ['Arm', f(ac.basicEmptyArm)],
                ['Moment', f(ac.basicEmptyMoment)],
              ].map(([label, val]) => (
                <div key={label} className="text-center">
                  <div className="font-bold text-gray-500 text-[10px]">{label}</div>
                  <div className="font-bold">{val}</div>
                </div>
              ))}
            </div>

            {/* W&B Table */}
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-right pr-1 py-1 font-normal text-gray-500 w-auto" />
                  <th className="w-5" />
                  <th className="text-right pr-1 py-1 font-bold text-gray-600 w-16">Weight</th>
                  <th className="text-center w-4 text-gray-400 font-normal">×</th>
                  <th className="text-right pr-1 py-1 font-bold text-gray-600 w-14">Arm</th>
                  <th className="w-5" />
                  <th className="text-right py-1 font-bold text-gray-600 w-24">Moment</th>
                </tr>
              </thead>
              <tbody>
                {/* Basic Empty Weight */}
                <WBRow label="Basic Empty Weight" op="" wt={ac.basicEmptyWeight} arm={ac.basicEmptyArm} mom={ac.basicEmptyMoment} opM="" />

                {/* Front */}
                <WBRowEdit label={ac.frontLabel} op="+" wt={frontWeight} arm={ac.frontArm} mom={calc.fm} opM="+" onChange={setFrontWeight} />

                {/* Rear */}
                {ac.hasRear && <WBRowEdit label={ac.rearLabel} op="+" wt={rearWeight} arm={ac.rearArm} mom={calc.rm} opM="+" onChange={setRearWeight} />}

                {/* Baggage 1 */}
                <WBRowEdit label={`${ac.bag1Label} (Max ${ac.bag1Max})`} op="+" wt={baggage1} arm={ac.bag1Arm} mom={calc.b1m} opM="+" onChange={setBaggage1} />

                {/* Baggage 2 */}
                {ac.hasBag2 && <WBRowEdit label={`${ac.bag2Label} (Max ${ac.bag2Max})`} op="+" wt={baggage2} arm={ac.bag2Arm} mom={calc.b2m} opM="+" onChange={setBaggage2} />}

                {/* Zero Fuel Weight */}
                <WBRow label="Zero Fuel Weight" op="=" wt={calc.zfw} arm={calc.zfwA} mom={calc.zfwM} opM="=" green line />

                {/* Fuel */}
                <WBRowEdit label={ac.fuelLabel} op="+" wt={fuelLbs} arm={ac.fuelArm} mom={calc.fM} opM="+" onChange={setFuelLbs}
                  hint={`${Math.round(fuelLbs / 6)} gal / ${Math.round(ac.maxFuelLbs / 6)} max`} />

                {/* Ramp Weight */}
                <WBRow label="Ramp Weight" op="=" wt={calc.rW} arm={calc.rA} mom={calc.rM} opM="=" green line />

                {/* Taxi Fuel */}
                <WBRow label="Taxi Fuel" op="-" wt={ac.taxiFuelLbs} arm={ac.fuelArm} mom={calc.tM} opM="-" />

                {/* Takeoff Weight */}
                <WBRow label="Takeoff Weight" op="=" wt={calc.toW} arm={calc.toA} mom={calc.toM} opM="=" green line ok={calc.toOk} />

                {/* Fuel Burn */}
                <WBRowEdit label="Fuel Burn" op="-" wt={fuelBurnLbs} arm={ac.fuelArm} mom={calc.bM} opM="-" onChange={setFuelBurnLbs}
                  hint={`${Math.round(fuelBurnLbs / 6)} gal`} />

                {/* Landing Weight */}
                <WBRow label="Landing Weight" op="=" wt={calc.lW} arm={calc.lA} mom={calc.lM} opM="=" green line ok={calc.lOk} />
              </tbody>
            </table>

            {/* CG Envelope Chart */}
            <div className="mt-4">
              <div className="text-sm font-bold text-center mb-1">Center of Gravity Envelope</div>
              <CgChart aircraft={ac} points={[
                { label: 'Ramp', weight: calc.rW, cg: calc.rA, color: '#9333ea' },
                { label: 'T/O', weight: calc.toW, cg: calc.toA, color: '#22c55e' },
                { label: 'Ldg', weight: calc.lW, cg: calc.lA, color: '#3b82f6' },
              ]} />
            </div>

            {/* Submit */}
            <div className="mt-4 border-t border-gray-200 pt-3 flex items-center gap-2 print:hidden">
              <input type="text" value={pilotName} onChange={e => setPilotName(e.target.value)}
                placeholder="Pilot / Student Name"
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
              <button onClick={handleSubmit} disabled={submitting || !calc.allGood || !pilotName.trim()}
                className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${
                  calc.allGood && pilotName.trim()
                    ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                {submitting ? 'Sending...' : '📧 Email to Dispatch'}
              </button>
              {submitMsg && <span className={`text-xs ${submitMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{submitMsg}</span>}
            </div>
          </div>
        </div>

        <div className="text-center text-[9px] text-gray-400 mt-4 print:mt-2">
          Darcy Aviation — KDXR Danbury, CT · For planning purposes — verify with POH/AFM
        </div>
      </div>
    </div>
  );
}

// ─── W&B Table Row Components ────────────────────────────────────────────────

function WBRow({ label, op, wt, arm, mom, opM, green, line, ok }: {
  label: string; op: string; wt: number; arm: number; mom: number; opM: string;
  green?: boolean; line?: boolean; ok?: boolean;
}) {
  const cls = green ? 'font-bold text-green-700' : '';
  const bgCls = ok === false ? 'bg-red-50' : '';
  return (
    <tr className={`${line ? 'border-t border-gray-300' : ''} ${bgCls}`}>
      <td className={`text-right pr-1 py-1 ${cls}`}>{label}</td>
      <td className={`text-center ${cls}`}>{op}</td>
      <td className={`text-right pr-1 font-mono ${cls}`}>{f(wt)}</td>
      <td />
      <td className={`text-right pr-1 font-mono ${cls}`}>{f(arm)}</td>
      <td className={`text-center ${cls}`}>{opM}</td>
      <td className={`text-right font-mono ${cls}`}>{f(mom)}</td>
    </tr>
  );
}

function WBRowEdit({ label, op, wt, arm, mom, opM, onChange, hint }: {
  label: string; op: string; wt: number; arm: number; mom: number; opM: string;
  onChange: (v: number) => void; hint?: string;
}) {
  return (
    <tr>
      <td className="text-right pr-1 py-1">{label}</td>
      <td className="text-center">{op}</td>
      <td className="text-right pr-1 w-16">
        <NumIn value={wt} onChange={onChange} className="text-xs" />
        {hint && <div className="text-[9px] text-gray-400 text-right">{hint}</div>}
      </td>
      <td />
      <td className="text-right pr-1 font-mono">{f(arm)}</td>
      <td className="text-center">{opM}</td>
      <td className="text-right font-mono">{f(mom)}</td>
    </tr>
  );
}
