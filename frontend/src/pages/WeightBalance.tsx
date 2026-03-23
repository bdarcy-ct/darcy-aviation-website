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
  frontMax: number;
  bag1Max: number;
  bag2Max: number;
  hasRear: boolean;
  hasBag2: boolean;
  cgEnvelope: CgLimit[];
  frontLabel: string;
  rearLabel: string;
  bag1Label: string;
  bag2Label: string;
}

const AIRCRAFT: Aircraft[] = [
  {
    tailNumber: 'N121MS', type: 'Cessna 172', model: 'C172',
    basicEmptyWeight: 1493.44, basicEmptyArm: 39.39, basicEmptyMoment: 58819.45,
    maxGrossWeight: 2300, usefulLoad: 806.56,
    fuelArm: 47.9, maxFuelLbs: 336, taxiFuelLbs: 8,
    frontArm: 37, rearArm: 73, bag1Arm: 95, bag2Arm: 123,
    frontMax: 400, bag1Max: 120, bag2Max: 120,
    hasRear: true, hasBag2: true,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2',
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
    frontMax: 400, bag1Max: 120, bag2Max: 120,
    hasRear: true, hasBag2: true,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2',
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
    frontMax: 400, bag1Max: 120, bag2Max: 120,
    hasRear: true, hasBag2: true,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2',
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
    frontMax: 0, bag1Max: 120, bag2Max: 40,
    hasRear: false, hasBag2: true,
    frontLabel: 'Front Seats', rearLabel: '',
    bag1Label: 'Baggage 1', bag2Label: 'Baggage 2',
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
    frontMax: 0, bag1Max: 200, bag2Max: 0,
    hasRear: true, hasBag2: false,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage Back', bag2Label: '',
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
    frontMax: 0, bag1Max: 200, bag2Max: 0,
    hasRear: true, hasBag2: false,
    frontLabel: 'Front Pilots', rearLabel: 'Rear Passengers',
    bag1Label: 'Baggage Back', bag2Label: '',
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

// ─── Utility Functions ───────────────────────────────────────────────────────

function pressureAltitude(fieldElev: number, altimeterInHg: number): number {
  return fieldElev + (29.92 - altimeterInHg) * 1000;
}

function densityAltitude(pressAlt: number, tempC: number): number {
  const stdTemp = 15 - (pressAlt / 1000) * 2;
  return pressAlt + 120 * (tempC - stdTemp);
}

function headwindCrosswind(windDir: number | string, windSpeed: number, runwayHeading: number) {
  // Handle VRB (variable) winds
  if (typeof windDir === 'string' || isNaN(Number(windDir))) {
    return { headwind: 0, crosswind: 0 };
  }
  const dir = Number(windDir);
  const diff = ((dir - runwayHeading + 360) % 360) * (Math.PI / 180);
  return {
    headwind: Math.round(windSpeed * Math.cos(diff)),
    crosswind: Math.round(Math.abs(windSpeed * Math.sin(diff))),
  };
}

function interpolateCg(envelope: CgLimit[], weight: number, side: 'fwd' | 'aft'): number {
  if (weight <= envelope[0].weight) return envelope[0][side];
  if (weight >= envelope[envelope.length - 1].weight) return envelope[envelope.length - 1][side];
  for (let i = 0; i < envelope.length - 1; i++) {
    if (weight >= envelope[i].weight && weight <= envelope[i + 1].weight) {
      const ratio = (weight - envelope[i].weight) / (envelope[i + 1].weight - envelope[i].weight);
      return envelope[i][side] + ratio * (envelope[i + 1][side] - envelope[i][side]);
    }
  }
  return envelope[0][side];
}

function isWithinEnvelope(envelope: CgLimit[], weight: number, cg: number): boolean {
  // Below minimum envelope weight — use the limits at minimum weight
  if (weight < envelope[0].weight) {
    return cg >= envelope[0].fwd && cg <= envelope[0].aft;
  }
  if (weight > envelope[envelope.length - 1].weight) return false;
  const fwd = interpolateCg(envelope, weight, 'fwd');
  const aft = interpolateCg(envelope, weight, 'aft');
  return cg >= fwd && cg <= aft;
}

// Convert hPa/mb to inHg if needed (API sometimes returns hPa)
function normalizeAltimeter(val: number | null): number {
  if (val === null) return 29.92;
  if (val > 100) return val * 0.02953; // hPa → inHg
  return val;
}

function fmt(n: number, d = 2): string {
  return n.toFixed(d);
}

// ─── Inline Editable Number Cell ─────────────────────────────────────────────

function NumInput({ value, onChange, placeholder, className }: {
  value: number; onChange: (v: number) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      type="number"
      value={value || ''}
      onChange={e => onChange(Number(e.target.value) || 0)}
      placeholder={placeholder || '0'}
      min={0}
      className={`w-full bg-transparent text-right font-mono focus:bg-slate-700/50 focus:outline-none rounded px-1 py-0.5 ${className || 'text-white'}`}
    />
  );
}

// ─── CG Envelope SVG Chart ──────────────────────────────────────────────────

function CgEnvelopeChart({ aircraft, points }: {
  aircraft: Aircraft;
  points: { label: string; weight: number; cg: number; color: string }[];
}) {
  const env = aircraft.cgEnvelope;
  const minW = env[0].weight - 100;
  const maxW = env[env.length - 1].weight + 50;
  const allCgs = env.flatMap(e => [e.fwd, e.aft]);
  const minCg = Math.min(...allCgs) - 2;
  const maxCg = Math.max(...allCgs) + 2;

  const W = 440, H = 300;
  const pad = { top: 15, right: 25, bottom: 40, left: 55 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const scaleX = (cg: number) => pad.left + ((cg - minCg) / (maxCg - minCg)) * plotW;
  const scaleY = (w: number) => pad.top + plotH - ((w - minW) / (maxW - minW)) * plotH;

  const fwdPoints = env.map(e => `${scaleX(e.fwd)},${scaleY(e.weight)}`);
  const aftPoints = [...env].reverse().map(e => `${scaleX(e.aft)},${scaleY(e.weight)}`);
  const polygon = [...fwdPoints, ...aftPoints].join(' ');

  const weightTicks: number[] = [];
  const step = maxW - minW > 800 ? 200 : 100;
  for (let w = Math.ceil(minW / step) * step; w <= maxW; w += step) weightTicks.push(w);
  const cgStep = maxCg - minCg > 20 ? 5 : 2;
  const cgTicks: number[] = [];
  for (let c = Math.ceil(minCg / cgStep) * cgStep; c <= maxCg; c += cgStep) cgTicks.push(c);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <rect x={pad.left} y={pad.top} width={plotW} height={plotH} fill="#0f172a" rx="3" />
      {weightTicks.map(w => (
        <g key={`wg-${w}`}>
          <line x1={pad.left} y1={scaleY(w)} x2={pad.left + plotW} y2={scaleY(w)} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={pad.left - 6} y={scaleY(w) + 3} textAnchor="end" fill="#94a3b8" fontSize="9">{w}</text>
        </g>
      ))}
      {cgTicks.map(c => (
        <g key={`cg-${c}`}>
          <line x1={scaleX(c)} y1={pad.top} x2={scaleX(c)} y2={pad.top + plotH} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={scaleX(c)} y={pad.top + plotH + 14} textAnchor="middle" fill="#94a3b8" fontSize="9">{c}</text>
        </g>
      ))}
      <polygon points={polygon} fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1.5" />
      {points.filter(p => p.weight > 0).map((p, i) => {
        const x = scaleX(p.cg), y = scaleY(p.weight);
        if (x < pad.left || x > pad.left + plotW || y < pad.top || y > pad.top + plotH) return null;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="4.5" fill={p.color} stroke="white" strokeWidth="1.5" />
            <text x={x + 7} y={y + 3} fill={p.color} fontSize="8" fontWeight="bold">{p.label}</text>
          </g>
        );
      })}
      <text x={pad.left + plotW / 2} y={H - 2} textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">C.G. Location (inches)</text>
      <text x={12} y={pad.top + plotH / 2} textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold" transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}>Weight (lbs)</text>
    </svg>
  );
}

// ─── Flight Category Badge Color ─────────────────────────────────────────────

function catColor(cat: string) {
  if (cat === 'VFR') return 'text-green-400';
  if (cat === 'MVFR') return 'text-blue-400';
  if (cat === 'IFR') return 'text-red-400';
  return 'text-purple-400';
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WeightBalance() {
  const [selectedTail, setSelectedTail] = useState(AIRCRAFT[0].tailNumber);
  const [depAirport, setDepAirport] = useState('KDXR');
  const [destAirport, setDestAirport] = useState('');
  const [depMetar, setDepMetar] = useState<MetarData | null>(null);
  const [destMetar, setDestMetar] = useState<MetarData | null>(null);
  const [runwayHeading, setRunwayHeading] = useState(0);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Editable weights
  const [frontWeight, setFrontWeight] = useState(0);
  const [rearWeight, setRearWeight] = useState(0);
  const [baggage1, setBaggage1] = useState(0);
  const [baggage2, setBaggage2] = useState(0);
  const [fuelGallons, setFuelGallons] = useState(0);
  const [fuelBurnGallons, setFuelBurnGallons] = useState(0);

  // Dispatch
  const [pilotName, setPilotName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const aircraft = useMemo(() => AIRCRAFT.find(a => a.tailNumber === selectedTail)!, [selectedTail]);

  useEffect(() => {
    setFrontWeight(0); setRearWeight(0); setBaggage1(0); setBaggage2(0);
    setFuelGallons(0); setFuelBurnGallons(0);
  }, [selectedTail]);

  // ─── Weather ───────────────────────────────────────────────────────────

  const fetchMetar = useCallback(async (icao: string): Promise<MetarData | null> => {
    if (!icao || icao.length < 3) return null;
    try {
      const res = await fetch(`/api/wb/metar?icao=${encodeURIComponent(icao.toUpperCase())}`);
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }, []);

  const loadWeather = useCallback(async () => {
    setLoadingWeather(true);
    const [dep, dest] = await Promise.all([
      depAirport ? fetchMetar(depAirport) : null,
      destAirport ? fetchMetar(destAirport) : null,
    ]);
    setDepMetar(dep); setDestMetar(dest);
    setLoadingWeather(false);
  }, [depAirport, destAirport, fetchMetar]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (depAirport.length >= 3 || destAirport.length >= 3) loadWeather();
    }, 800);
    return () => clearTimeout(t);
  }, [depAirport, destAirport, loadWeather]);

  // ─── Calculations ──────────────────────────────────────────────────────

  const fuelLbs = fuelGallons * 6;
  const fuelBurnLbs = fuelBurnGallons * 6;

  const calc = useMemo(() => {
    const a = aircraft;
    const frontMom = frontWeight * a.frontArm;
    const rearMom = rearWeight * a.rearArm;
    const bag1Mom = baggage1 * a.bag1Arm;
    const bag2Mom = baggage2 * a.bag2Arm;

    const zfw = a.basicEmptyWeight + frontWeight + rearWeight + baggage1 + baggage2;
    const zfwMom = a.basicEmptyMoment + frontMom + rearMom + bag1Mom + bag2Mom;
    const zfwArm = zfw > 0 ? zfwMom / zfw : 0;

    const fuelMom = fuelLbs * a.fuelArm;
    const rampW = zfw + fuelLbs;
    const rampMom = zfwMom + fuelMom;
    const rampArm = rampW > 0 ? rampMom / rampW : 0;

    const taxiMom = a.taxiFuelLbs * a.fuelArm;
    const toW = rampW - a.taxiFuelLbs;
    const toMom = rampMom - taxiMom;
    const toArm = toW > 0 ? toMom / toW : 0;

    const burnMom = fuelBurnLbs * a.fuelArm;
    const ldgW = toW - fuelBurnLbs;
    const ldgMom = toMom - burnMom;
    const ldgArm = ldgW > 0 ? ldgMom / ldgW : 0;

    const toOkCg = isWithinEnvelope(a.cgEnvelope, toW, toArm);
    const ldgOkCg = isWithinEnvelope(a.cgEnvelope, ldgW, ldgArm);
    const toOkWt = toW <= a.maxGrossWeight;
    const ldgOkWt = ldgW <= a.maxGrossWeight && ldgW > 0;
    const allGood = toOkCg && ldgOkCg && toOkWt && ldgOkWt;

    return {
      frontMom, rearMom, bag1Mom, bag2Mom,
      zfw, zfwArm, zfwMom,
      fuelMom, rampW, rampArm, rampMom,
      taxiMom, toW, toArm, toMom,
      burnMom, ldgW, ldgArm, ldgMom,
      toOkCg, ldgOkCg, toOkWt, ldgOkWt, allGood,
    };
  }, [aircraft, frontWeight, rearWeight, baggage1, baggage2, fuelLbs, fuelBurnLbs]);

  // ─── Performance ───────────────────────────────────────────────────────

  const perf = useMemo(() => {
    if (!depMetar) return null;
    const alt = normalizeAltimeter(depMetar.altimeter_inhg);
    const temp = depMetar.temp_c ?? 15;
    const elev = depMetar.elevation_ft || 0;
    const pa = pressureAltitude(elev, alt);
    const da = densityAltitude(pa, temp);
    const wind = headwindCrosswind(depMetar.wind_dir, depMetar.wind_speed_kt, runwayHeading);

    let vaMax: number;
    if (aircraft.model.startsWith('PA-')) vaMax = 111;
    else if (aircraft.model === 'C152') vaMax = 88;
    else if (aircraft.model === 'C172-180') vaMax = 104;
    else vaMax = 99;

    const vaTo = calc.toW > 0 ? vaMax * Math.sqrt(calc.toW / aircraft.maxGrossWeight) : 0;
    const vaLdg = calc.ldgW > 0 ? vaMax * Math.sqrt(calc.ldgW / aircraft.maxGrossWeight) : 0;

    return { pa, da, ...wind, vaTo, vaLdg, altInHg: alt };
  }, [depMetar, runwayHeading, aircraft, calc]);

  // ─── Submit ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!pilotName.trim() || !calc.allGood) return;
    setSubmitting(true); setSubmitMsg('');
    try {
      const res = await fetch('/api/wb/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilotName, aircraft: aircraft.tailNumber, aircraftType: aircraft.type,
          departure: depAirport, destination: destAirport,
          depMetar: depMetar?.raw || '', destMetar: destMetar?.raw || '',
          takeoffWeight: calc.toW, takeoffCg: calc.toArm,
          landingWeight: calc.ldgW, landingCg: calc.ldgArm,
          fuelGallons, fuelBurnGallons, frontWeight, rearWeight, baggage1, baggage2,
          performance: perf, timestamp: new Date().toISOString(),
        }),
      });
      setSubmitMsg(res.ok ? '✅ Sent to dispatch!' : 'Failed — try again');
    } catch { setSubmitMsg('Network error'); }
    setSubmitting(false);
  };

  // ─── Table Row Helper ──────────────────────────────────────────────────

  const Row = ({ label, weight, arm, moment, bold, highlight, editable, onChange, prefix }: {
    label: string; weight: number | string; arm: number; moment: number;
    bold?: boolean; highlight?: 'green' | 'red' | 'none'; editable?: boolean;
    onChange?: (v: number) => void; prefix?: string;
  }) => {
    const w = typeof weight === 'number' ? weight : parseFloat(weight);
    const hCls = highlight === 'green' ? 'bg-green-900/20' : highlight === 'red' ? 'bg-red-900/20' : '';
    const bCls = bold ? 'font-bold text-white' : 'text-slate-300';
    return (
      <tr className={`border-t border-slate-700/50 ${hCls} ${bCls}`}>
        <td className="py-1 pr-2 text-xs whitespace-nowrap">
          {prefix && <span className="text-slate-500 mr-0.5">{prefix}</span>}
          {label}
        </td>
        <td className="text-right px-1 w-20">
          {editable && onChange ? (
            <NumInput value={w} onChange={onChange} className="text-blue-300 text-xs" />
          ) : (
            <span className="font-mono text-xs">{fmt(w)}</span>
          )}
        </td>
        <td className="text-right px-1 font-mono text-xs w-16">{fmt(arm)}</td>
        <td className="text-right pl-1 font-mono text-xs w-24">{fmt(moment)}</td>
      </tr>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────

  const chartPoints = [
    { label: 'T/O', weight: calc.toW, cg: calc.toArm, color: '#3b82f6' },
    { label: 'LDG', weight: calc.ldgW, cg: calc.ldgArm, color: '#f59e0b' },
  ];

  const maxFuelGal = Math.round(aircraft.maxFuelLbs / 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header + Aircraft Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Weight & Balance</h1>
            <p className="text-slate-400 text-sm">Darcy Aviation — KDXR Danbury, CT</p>
          </div>
          <select
            value={selectedTail}
            onChange={e => setSelectedTail(e.target.value)}
            className="bg-slate-800 text-white rounded-lg px-3 py-2 text-sm font-mono ring-1 ring-white/10 focus:ring-gold focus:outline-none"
          >
            {AIRCRAFT.map(a => (
              <option key={a.tailNumber} value={a.tailNumber}>{a.tailNumber} — {a.type}</option>
            ))}
          </select>
        </div>

        {/* Aircraft Info Bar */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-4 bg-slate-800/40 rounded-xl px-4 py-2 ring-1 ring-white/5">
          <span>Max Weight: <b className="text-white">{aircraft.maxGrossWeight} lbs</b></span>
          <span>Useful Load: <b className="text-white">{fmt(aircraft.usefulLoad)} lbs</b></span>
          <span>Empty Weight: <b className="text-white">{fmt(aircraft.basicEmptyWeight)} lbs</b></span>
          <span>Arm: <b className="text-white">{fmt(aircraft.basicEmptyArm)}"</b></span>
          <span>Moment: <b className="text-white">{fmt(aircraft.basicEmptyMoment)}</b></span>
        </div>

        {/* ═══ TWO COLUMN LAYOUT ═══ */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* ─── LEFT: Conditions + Performance ─── */}
          <div className="space-y-4">

            {/* Conditions */}
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-4 ring-1 ring-white/10">
              <h2 className="text-sm font-bold text-white mb-3">Conditions</h2>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-0.5">Departure</label>
                  <input type="text" value={depAirport} onChange={e => setDepAirport(e.target.value.toUpperCase())}
                    placeholder="KDXR" maxLength={4}
                    className="w-full bg-slate-900 text-white rounded px-2 py-1.5 text-sm font-mono uppercase ring-1 ring-white/10 focus:ring-gold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-0.5">Destination</label>
                  <input type="text" value={destAirport} onChange={e => setDestAirport(e.target.value.toUpperCase())}
                    placeholder="KBDR" maxLength={4}
                    className="w-full bg-slate-900 text-white rounded px-2 py-1.5 text-sm font-mono uppercase ring-1 ring-white/10 focus:ring-gold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-0.5">Runway (°)</label>
                  <input type="number" value={runwayHeading || ''} onChange={e => setRunwayHeading(Number(e.target.value))}
                    placeholder="260" min={0} max={360}
                    className="w-full bg-slate-900 text-white rounded px-2 py-1.5 text-sm ring-1 ring-white/10 focus:ring-gold focus:outline-none" />
                </div>
              </div>

              {loadingWeather && (
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <span className="w-3 h-3 rounded-full border-2 border-slate-600 border-t-gold animate-spin" />
                  Fetching...
                </div>
              )}

              {/* Weather Grid — Departure / Destination side by side */}
              {(depMetar || destMetar) && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Departure', m: depMetar },
                    { label: 'Destination', m: destMetar },
                  ].map(({ label, m }) => m ? (
                    <div key={label} className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</div>
                      <p className="font-mono text-[10px] text-green-400 mb-2 break-all leading-tight">{m.raw}</p>
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Wind</span>
                          <span className="text-white">{m.wind_dir}° @ {m.wind_speed_kt}kt{m.wind_gust_kt ? ` G${m.wind_gust_kt}` : ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Temp/Dew</span>
                          <span className="text-white">{m.temp_c ?? '—'}°C / {m.dewpoint_c ?? '—'}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Altimeter</span>
                          <span className="text-white">{normalizeAltimeter(m.altimeter_inhg).toFixed(2)}"</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Category</span>
                          <span className={`font-bold ${catColor(m.flight_category)}`}>{m.flight_category}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={label} className="bg-slate-900/30 rounded-lg p-3 flex items-center justify-center text-xs text-slate-600">
                      {label} — enter ICAO
                    </div>
                  ))}
                </div>
              )}

              {/* Performance */}
              {perf && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Performance</div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 text-[11px]">
                    <div className="flex justify-between"><span className="text-slate-500">Press. Alt</span><span className="text-white">{fmt(perf.pa, 0)} ft</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Dens. Alt</span><span className="text-white">{fmt(perf.da, 0)} ft</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Altimeter</span><span className="text-white">{perf.altInHg.toFixed(2)}"</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Headwind</span><span className="text-white">{perf.headwind} kt</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Crosswind</span><span className="text-white">{perf.crosswind} kt</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">V<sub>A</sub></span><span className="text-white">{fmt(perf.vaTo, 1)} / {fmt(perf.vaLdg, 1)} kt</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* CG Envelope */}
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-4 ring-1 ring-white/10">
              <h2 className="text-sm font-bold text-white mb-2">Center of Gravity Envelope</h2>
              <CgEnvelopeChart aircraft={aircraft} points={chartPoints} />
              <div className="flex items-center gap-4 mt-2 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Takeoff</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Landing</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500/30 ring-1 ring-green-500" /> Envelope</span>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: W&B Sheet (editable) + Submit ─── */}
          <div className="space-y-4">

            {/* W&B Table — editable inline */}
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-4 ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white">
                  {aircraft.tailNumber} {aircraft.type}
                </h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  calc.allGood
                    ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30'
                    : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${calc.allGood ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                  {calc.allGood ? 'WITHIN LIMITS' : 'OUT OF LIMITS'}
                </span>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase">
                    <th className="text-left py-1 pr-2">Item</th>
                    <th className="text-right py-1 px-1 w-20">Weight</th>
                    <th className="text-right py-1 px-1 w-16">× Arm</th>
                    <th className="text-right py-1 pl-1 w-24">= Moment</th>
                  </tr>
                </thead>
                <tbody>
                  <Row label="Basic Empty Weight" weight={aircraft.basicEmptyWeight} arm={aircraft.basicEmptyArm} moment={aircraft.basicEmptyMoment} />

                  <Row label={aircraft.frontLabel} weight={frontWeight} arm={aircraft.frontArm} moment={calc.frontMom}
                    editable onChange={setFrontWeight} prefix="+" />

                  {aircraft.hasRear && (
                    <Row label={aircraft.rearLabel} weight={rearWeight} arm={aircraft.rearArm} moment={calc.rearMom}
                      editable onChange={setRearWeight} prefix="+" />
                  )}

                  <Row label={aircraft.bag1Label} weight={baggage1} arm={aircraft.bag1Arm} moment={calc.bag1Mom}
                    editable onChange={setBaggage1} prefix="+" />

                  {aircraft.hasBag2 && (
                    <Row label={aircraft.bag2Label} weight={baggage2} arm={aircraft.bag2Arm} moment={calc.bag2Mom}
                      editable onChange={setBaggage2} prefix="+" />
                  )}

                  <Row label="Zero Fuel Weight" weight={calc.zfw} arm={calc.zfwArm} moment={calc.zfwMom} bold />

                  {/* Fuel — editable as gallons, displayed as lbs */}
                  <tr className="border-t border-slate-700/50 text-slate-300">
                    <td className="py-1 pr-2 text-xs whitespace-nowrap">
                      <span className="text-slate-500 mr-0.5">+</span>
                      Usable Fuel
                      <span className="text-slate-600 ml-1">({maxFuelGal}gal max)</span>
                    </td>
                    <td className="text-right px-1 w-20">
                      <div className="flex items-center justify-end gap-0.5">
                        <NumInput value={fuelGallons} onChange={setFuelGallons} className="text-emerald-300 text-xs" />
                        <span className="text-[9px] text-slate-600 whitespace-nowrap">gal</span>
                      </div>
                      <div className="text-[9px] text-slate-600 text-right">{fmt(fuelLbs, 0)} lbs</div>
                    </td>
                    <td className="text-right px-1 font-mono text-xs w-16">{fmt(aircraft.fuelArm)}</td>
                    <td className="text-right pl-1 font-mono text-xs w-24">{fmt(calc.fuelMom)}</td>
                  </tr>

                  <Row label="Ramp Weight" weight={calc.rampW} arm={calc.rampArm} moment={calc.rampMom} bold />
                  <Row label="Taxi Fuel" weight={aircraft.taxiFuelLbs} arm={aircraft.fuelArm} moment={calc.taxiMom} prefix="−" />

                  {/* Takeoff Weight — highlighted */}
                  <tr className={`border-t-2 border-slate-600 font-bold ${calc.toOkCg && calc.toOkWt ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                    <td className="py-1.5 pr-2 text-xs text-white">= Takeoff Weight</td>
                    <td className={`text-right px-1 font-mono text-xs ${calc.toOkWt ? 'text-green-400' : 'text-red-400'}`}>{fmt(calc.toW)}</td>
                    <td className={`text-right px-1 font-mono text-xs ${calc.toOkCg ? 'text-green-400' : 'text-red-400'}`}>{fmt(calc.toArm)}</td>
                    <td className="text-right pl-1 font-mono text-xs text-white">{fmt(calc.toMom)}</td>
                  </tr>

                  {/* Fuel Burn — editable */}
                  <tr className="border-t border-slate-700/50 text-slate-300">
                    <td className="py-1 pr-2 text-xs whitespace-nowrap">
                      <span className="text-slate-500 mr-0.5">−</span> Fuel Burn
                    </td>
                    <td className="text-right px-1 w-20">
                      <div className="flex items-center justify-end gap-0.5">
                        <NumInput value={fuelBurnGallons} onChange={setFuelBurnGallons} className="text-red-300 text-xs" />
                        <span className="text-[9px] text-slate-600 whitespace-nowrap">gal</span>
                      </div>
                      <div className="text-[9px] text-slate-600 text-right">{fmt(fuelBurnLbs, 0)} lbs</div>
                    </td>
                    <td className="text-right px-1 font-mono text-xs w-16">{fmt(aircraft.fuelArm)}</td>
                    <td className="text-right pl-1 font-mono text-xs w-24">{fmt(calc.burnMom)}</td>
                  </tr>

                  {/* Landing Weight — highlighted */}
                  <tr className={`border-t-2 border-slate-600 font-bold ${calc.ldgOkCg && calc.ldgOkWt ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                    <td className="py-1.5 pr-2 text-xs text-white">= Landing Weight</td>
                    <td className={`text-right px-1 font-mono text-xs ${calc.ldgOkWt ? 'text-green-400' : 'text-red-400'}`}>{fmt(calc.ldgW)}</td>
                    <td className={`text-right px-1 font-mono text-xs ${calc.ldgOkCg ? 'text-green-400' : 'text-red-400'}`}>{fmt(calc.ldgArm)}</td>
                    <td className="text-right pl-1 font-mono text-xs text-white">{fmt(calc.ldgMom)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Limits summary */}
              <div className="mt-3 pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-500">Max Gross</span><span className="text-white font-bold">{aircraft.maxGrossWeight} lbs</span></div>
                <div className="flex justify-between"><span className="text-slate-500">T/O Margin</span>
                  <span className={`font-bold ${aircraft.maxGrossWeight - calc.toW >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {fmt(aircraft.maxGrossWeight - calc.toW, 0)} lbs
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-slate-500">CG Fwd Limit</span><span className="text-white">{fmt(interpolateCg(aircraft.cgEnvelope, calc.toW, 'fwd'), 1)}"</span></div>
                <div className="flex justify-between"><span className="text-slate-500">CG Aft Limit</span><span className="text-white">{fmt(interpolateCg(aircraft.cgEnvelope, calc.toW, 'aft'), 1)}"</span></div>
              </div>
            </div>

            {/* Submit to Dispatch */}
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-4 ring-1 ring-white/10">
              <h2 className="text-sm font-bold text-white mb-3">Submit to Dispatch</h2>
              <div className="flex gap-2 mb-3">
                <input type="text" value={pilotName} onChange={e => setPilotName(e.target.value)}
                  placeholder="Pilot / Student Name"
                  className="flex-1 bg-slate-900 text-white rounded px-3 py-2 text-sm ring-1 ring-white/10 focus:ring-gold focus:outline-none" />
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !calc.allGood || !pilotName.trim()}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                  calc.allGood && pilotName.trim()
                    ? 'bg-gradient-to-r from-gold to-gold-light text-slate-900 hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98]'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Sending...' : calc.allGood ? '📧 Send to Dispatch' : '⚠️ Out of Limits'}
              </button>
              {submitMsg && <p className={`mt-2 text-xs text-center ${submitMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{submitMsg}</p>}
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-6">
          For planning purposes only — verify with aircraft POH/AFM. © {new Date().getFullYear()} Darcy Aviation
        </p>
      </div>
    </div>
  );
}
