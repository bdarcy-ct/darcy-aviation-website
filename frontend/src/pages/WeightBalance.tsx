import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ─── Aircraft Database ───────────────────────────────────────────────────────

interface CgLimit { weight: number; fwd: number; aft: number; }
interface Station { label: string; arm: number; maxWeight?: number; }

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
  stations: Station[];
  cgEnvelope: CgLimit[];
  hasBaggage2: boolean;
  baggage1Max: number;
  baggage2Max: number;
}

const AIRCRAFT: Aircraft[] = [
  {
    tailNumber: 'N121MS',
    type: 'Cessna 172',
    model: 'C172',
    basicEmptyWeight: 1493.44,
    basicEmptyArm: 39.39,
    basicEmptyMoment: 58819.45,
    maxGrossWeight: 2300,
    usefulLoad: 806.56,
    fuelArm: 47.9,
    maxFuelLbs: 336, // 56 gal usable × 6 lbs
    taxiFuelLbs: 8,
    stations: [
      { label: 'Front Seats', arm: 37, maxWeight: 400 },
      { label: 'Rear Seats', arm: 73 },
      { label: 'Baggage 1', arm: 95, maxWeight: 120 },
      { label: 'Baggage 2', arm: 123, maxWeight: 120 },
    ],
    cgEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 47.0 },
      { weight: 1600, fwd: 35.0, aft: 47.0 },
      { weight: 1700, fwd: 35.0, aft: 47.0 },
      { weight: 1800, fwd: 37.0, aft: 47.0 },
      { weight: 1900, fwd: 38.0, aft: 47.0 },
      { weight: 2000, fwd: 39.0, aft: 47.0 },
      { weight: 2100, fwd: 40.0, aft: 47.0 },
      { weight: 2200, fwd: 40.5, aft: 47.0 },
      { weight: 2300, fwd: 41.0, aft: 47.0 },
    ],
    hasBaggage2: true,
    baggage1Max: 120,
    baggage2Max: 120,
  },
  {
    tailNumber: 'N6475D',
    type: 'Cessna 172',
    model: 'C172',
    basicEmptyWeight: 1478.95,
    basicEmptyArm: 39.13,
    basicEmptyMoment: 57865.08,
    maxGrossWeight: 2300,
    usefulLoad: 821.05,
    fuelArm: 47.9,
    maxFuelLbs: 336,
    taxiFuelLbs: 8,
    stations: [
      { label: 'Front Seats', arm: 37, maxWeight: 400 },
      { label: 'Rear Seats', arm: 73 },
      { label: 'Baggage 1', arm: 95, maxWeight: 120 },
      { label: 'Baggage 2', arm: 123, maxWeight: 120 },
    ],
    cgEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 47.0 },
      { weight: 1600, fwd: 35.0, aft: 47.0 },
      { weight: 1700, fwd: 35.0, aft: 47.0 },
      { weight: 1800, fwd: 37.0, aft: 47.0 },
      { weight: 1900, fwd: 38.0, aft: 47.0 },
      { weight: 2000, fwd: 39.0, aft: 47.0 },
      { weight: 2100, fwd: 40.0, aft: 47.0 },
      { weight: 2200, fwd: 40.5, aft: 47.0 },
      { weight: 2300, fwd: 41.0, aft: 47.0 },
    ],
    hasBaggage2: true,
    baggage1Max: 120,
    baggage2Max: 120,
  },
  {
    tailNumber: 'N34LC',
    type: 'Cessna 172 (180 HP)',
    model: 'C172-180',
    basicEmptyWeight: 1498.10,
    basicEmptyArm: 38.71,
    basicEmptyMoment: 57994.26,
    maxGrossWeight: 2550,
    usefulLoad: 1051.90,
    fuelArm: 47.9,
    maxFuelLbs: 336,
    taxiFuelLbs: 8,
    stations: [
      { label: 'Front Seats', arm: 37, maxWeight: 400 },
      { label: 'Rear Seats', arm: 73 },
      { label: 'Baggage 1', arm: 95, maxWeight: 120 },
      { label: 'Baggage 2', arm: 123, maxWeight: 120 },
    ],
    cgEnvelope: [
      { weight: 1500, fwd: 35.0, aft: 47.0 },
      { weight: 1600, fwd: 35.0, aft: 47.0 },
      { weight: 1700, fwd: 35.0, aft: 47.0 },
      { weight: 1800, fwd: 36.0, aft: 47.0 },
      { weight: 1900, fwd: 37.0, aft: 47.0 },
      { weight: 2000, fwd: 38.0, aft: 47.0 },
      { weight: 2100, fwd: 38.5, aft: 47.0 },
      { weight: 2200, fwd: 39.5, aft: 47.0 },
      { weight: 2300, fwd: 40.5, aft: 47.0 },
      { weight: 2400, fwd: 41.0, aft: 47.0 },
      { weight: 2550, fwd: 41.0, aft: 47.0 },
    ],
    hasBaggage2: true,
    baggage1Max: 120,
    baggage2Max: 120,
  },
  {
    tailNumber: 'N65563',
    type: 'Cessna 152',
    model: 'C152',
    basicEmptyWeight: 1161.1,
    basicEmptyArm: 30.27,
    basicEmptyMoment: 35146.50,
    maxGrossWeight: 1670,
    usefulLoad: 508.9,
    fuelArm: 42,
    maxFuelLbs: 156, // 26 gal usable × 6 lbs
    taxiFuelLbs: 4,
    stations: [
      { label: 'Front Seats', arm: 39 },
      { label: 'Baggage 1', arm: 64, maxWeight: 120 },
      { label: 'Baggage 2', arm: 84, maxWeight: 40 },
    ],
    cgEnvelope: [
      { weight: 1100, fwd: 31.0, aft: 36.5 },
      { weight: 1200, fwd: 31.5, aft: 36.5 },
      { weight: 1300, fwd: 32.0, aft: 36.5 },
      { weight: 1400, fwd: 33.0, aft: 36.5 },
      { weight: 1500, fwd: 33.5, aft: 36.5 },
      { weight: 1600, fwd: 34.0, aft: 36.5 },
      { weight: 1670, fwd: 34.5, aft: 36.5 },
    ],
    hasBaggage2: true,
    baggage1Max: 120,
    baggage2Max: 40,
  },
  {
    tailNumber: 'N8715C',
    type: 'Piper Warrior II',
    model: 'PA-28-161',
    basicEmptyWeight: 1498.84,
    basicEmptyArm: 85.32,
    basicEmptyMoment: 127881.03,
    maxGrossWeight: 2325,
    usefulLoad: 826.16,
    fuelArm: 95.0,
    maxFuelLbs: 288, // 48 gal × 6 lbs
    taxiFuelLbs: 8,
    stations: [
      { label: 'Front Seats', arm: 80.5 },
      { label: 'Rear Seats', arm: 118.1 },
      { label: 'Baggage', arm: 142.8, maxWeight: 200 },
    ],
    cgEnvelope: [
      { weight: 1200, fwd: 83.0, aft: 93.0 },
      { weight: 1400, fwd: 83.0, aft: 93.0 },
      { weight: 1600, fwd: 83.0, aft: 93.0 },
      { weight: 1800, fwd: 83.0, aft: 93.0 },
      { weight: 1900, fwd: 84.0, aft: 93.0 },
      { weight: 2000, fwd: 85.0, aft: 93.0 },
      { weight: 2100, fwd: 86.0, aft: 93.0 },
      { weight: 2200, fwd: 87.0, aft: 93.0 },
      { weight: 2325, fwd: 87.0, aft: 93.0 },
    ],
    hasBaggage2: false,
    baggage1Max: 200,
    baggage2Max: 0,
  },
  {
    tailNumber: 'N84001',
    type: 'Piper Warrior II',
    model: 'PA-28-161',
    basicEmptyWeight: 1467.70,
    basicEmptyArm: 84.10,
    basicEmptyMoment: 123389.00,
    maxGrossWeight: 2325,
    usefulLoad: 857.30,
    fuelArm: 95.0,
    maxFuelLbs: 288,
    taxiFuelLbs: 8,
    stations: [
      { label: 'Front Seats', arm: 80.5 },
      { label: 'Rear Seats', arm: 118.1 },
      { label: 'Baggage', arm: 142.8, maxWeight: 200 },
    ],
    cgEnvelope: [
      { weight: 1200, fwd: 83.0, aft: 93.0 },
      { weight: 1400, fwd: 83.0, aft: 93.0 },
      { weight: 1600, fwd: 83.0, aft: 93.0 },
      { weight: 1800, fwd: 83.0, aft: 93.0 },
      { weight: 1900, fwd: 84.0, aft: 93.0 },
      { weight: 2000, fwd: 85.0, aft: 93.0 },
      { weight: 2100, fwd: 86.0, aft: 93.0 },
      { weight: 2200, fwd: 87.0, aft: 93.0 },
      { weight: 2325, fwd: 87.0, aft: 93.0 },
    ],
    hasBaggage2: false,
    baggage1Max: 200,
    baggage2Max: 0,
  },
];

// ─── Weather Types ───────────────────────────────────────────────────────────

interface MetarData {
  raw: string;
  temp_c: number | null;
  dewpoint_c: number | null;
  altimeter_inhg: number | null;
  wind_dir: number;
  wind_speed_kt: number;
  wind_gust_kt: number | null;
  flight_category: string;
  station: string;
  elevation_ft: number | null;
}

interface WindsAloft {
  altitude: number;
  direction: number;
  speed: number;
}

// ─── Utility Functions ───────────────────────────────────────────────────────

function pressureAltitude(fieldElev: number, altimeter: number): number {
  return fieldElev + (29.92 - altimeter) * 1000;
}

function densityAltitude(pressAlt: number, tempC: number): number {
  const stdTemp = 15 - (pressAlt / 1000) * 2; // ISA temp at altitude
  return pressAlt + 120 * (tempC - stdTemp);
}

function headwindCrosswind(windDir: number, windSpeed: number, runwayHeading: number) {
  const diff = ((windDir - runwayHeading + 360) % 360) * (Math.PI / 180);
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
  if (weight < envelope[0].weight || weight > envelope[envelope.length - 1].weight) return false;
  const fwd = interpolateCg(envelope, weight, 'fwd');
  const aft = interpolateCg(envelope, weight, 'aft');
  return cg >= fwd && cg <= aft;
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

  const W = 480, H = 340;
  const pad = { top: 20, right: 30, bottom: 50, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const scaleX = (cg: number) => pad.left + ((cg - minCg) / (maxCg - minCg)) * plotW;
  const scaleY = (w: number) => pad.top + plotH - ((w - minW) / (maxW - minW)) * plotH;

  // Build envelope polygon (fwd going up, aft going down)
  const fwdPoints = env.map(e => `${scaleX(e.fwd)},${scaleY(e.weight)}`);
  const aftPoints = [...env].reverse().map(e => `${scaleX(e.aft)},${scaleY(e.weight)}`);
  const polygon = [...fwdPoints, ...aftPoints].join(' ');

  // Grid lines
  const weightTicks: number[] = [];
  const step = maxW - minW > 800 ? 200 : 100;
  for (let w = Math.ceil(minW / step) * step; w <= maxW; w += step) weightTicks.push(w);
  const cgStep = maxCg - minCg > 20 ? 5 : 2;
  const cgTicks: number[] = [];
  for (let c = Math.ceil(minCg / cgStep) * cgStep; c <= maxCg; c += cgStep) cgTicks.push(c);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 400 }}>
      {/* Background */}
      <rect x={pad.left} y={pad.top} width={plotW} height={plotH} fill="#0f172a" rx="4" />

      {/* Grid */}
      {weightTicks.map(w => (
        <g key={`wg-${w}`}>
          <line x1={pad.left} y1={scaleY(w)} x2={pad.left + plotW} y2={scaleY(w)}
            stroke="#334155" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x={pad.left - 8} y={scaleY(w) + 4} textAnchor="end"
            fill="#94a3b8" fontSize="10">{w}</text>
        </g>
      ))}
      {cgTicks.map(c => (
        <g key={`cg-${c}`}>
          <line x1={scaleX(c)} y1={pad.top} x2={scaleX(c)} y2={pad.top + plotH}
            stroke="#334155" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x={scaleX(c)} y={pad.top + plotH + 16} textAnchor="middle"
            fill="#94a3b8" fontSize="10">{c}</text>
        </g>
      ))}

      {/* Envelope */}
      <polygon points={polygon} fill="rgba(34,197,94,0.15)" stroke="#22c55e"
        strokeWidth="1.5" />

      {/* Fwd/Aft labels */}
      <text x={scaleX(env[0].fwd) + 4} y={scaleY(env[0].weight) - 6}
        fill="#22c55e" fontSize="9" fontWeight="bold">FWD</text>
      <text x={scaleX(env[0].aft) - 4} y={scaleY(env[0].weight) - 6}
        fill="#22c55e" fontSize="9" fontWeight="bold" textAnchor="end">AFT</text>

      {/* Data points */}
      {points.filter(p => p.weight > 0).map((p, i) => {
        const x = scaleX(p.cg);
        const y = scaleY(p.weight);
        const inBounds = x >= pad.left && x <= pad.left + plotW && y >= pad.top && y <= pad.top + plotH;
        if (!inBounds) return null;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill={p.color} stroke="white" strokeWidth="1.5" />
            <text x={x + 8} y={y + 4} fill={p.color} fontSize="9" fontWeight="bold">
              {p.label}
            </text>
          </g>
        );
      })}

      {/* Axis labels */}
      <text x={pad.left + plotW / 2} y={H - 4} textAnchor="middle"
        fill="#cbd5e1" fontSize="11" fontWeight="bold">C.G. Location (inches aft of datum)</text>
      <text x={14} y={pad.top + plotH / 2} textAnchor="middle"
        fill="#cbd5e1" fontSize="11" fontWeight="bold"
        transform={`rotate(-90, 14, ${pad.top + plotH / 2})`}>Weight (lbs)</text>
    </svg>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
      ok ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30' : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
    }`}>
      <span className={`w-2 h-2 rounded-full ${ok ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'}`} />
      {ok ? 'WITHIN LIMITS' : 'OUT OF LIMITS'}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WeightBalance() {
  const [selectedTail, setSelectedTail] = useState(AIRCRAFT[0].tailNumber);
  const [depAirport, setDepAirport] = useState('KDXR');
  const [destAirport, setDestAirport] = useState('');
  const [depMetar, setDepMetar] = useState<MetarData | null>(null);
  const [destMetar, setDestMetar] = useState<MetarData | null>(null);
  const [depWindsAloft, setDepWindsAloft] = useState<WindsAloft[]>([]);
  const [destWindsAloft, setDestWindsAloft] = useState<WindsAloft[]>([]);
  const [runwayHeading, setRunwayHeading] = useState(0);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  // Station weights
  const [frontWeight, setFrontWeight] = useState(0);
  const [rearWeight, setRearWeight] = useState(0);
  const [baggage1, setBaggage1] = useState(0);
  const [baggage2, setBaggage2] = useState(0);
  const [fuelGallons, setFuelGallons] = useState(0);
  const [fuelBurnGallons, setFuelBurnGallons] = useState(0);

  // Pilot info for dispatch
  const [pilotName, setPilotName] = useState('');
  const [flightRoute, setFlightRoute] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const formRef = useRef<HTMLDivElement>(null);

  const aircraft = useMemo(() => AIRCRAFT.find(a => a.tailNumber === selectedTail)!, [selectedTail]);

  // Reset weights when aircraft changes
  useEffect(() => {
    setFrontWeight(0);
    setRearWeight(0);
    setBaggage1(0);
    setBaggage2(0);
    setFuelGallons(0);
    setFuelBurnGallons(0);
  }, [selectedTail]);

  // ─── Weather Fetching ──────────────────────────────────────────────────

  const fetchMetar = useCallback(async (icao: string): Promise<MetarData | null> => {
    if (!icao || icao.length < 3) return null;
    try {
      const res = await fetch(`/api/wb/metar?icao=${encodeURIComponent(icao.toUpperCase())}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  const fetchWindsAloft = useCallback(async (icao: string): Promise<WindsAloft[]> => {
    if (!icao || icao.length < 3) return [];
    try {
      const res = await fetch(`/api/wb/winds?icao=${encodeURIComponent(icao.toUpperCase())}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }, []);

  const loadWeather = useCallback(async () => {
    setLoadingWeather(true);
    setWeatherError('');
    try {
      const results = await Promise.all([
        depAirport ? fetchMetar(depAirport) : null,
        destAirport ? fetchMetar(destAirport) : null,
        depAirport ? fetchWindsAloft(depAirport) : [],
        destAirport ? fetchWindsAloft(destAirport) : [],
      ]);
      setDepMetar(results[0] as MetarData | null);
      setDestMetar(results[1] as MetarData | null);
      setDepWindsAloft((results[2] as WindsAloft[]) || []);
      setDestWindsAloft((results[3] as WindsAloft[]) || []);
      if (depAirport && !results[0]) setWeatherError(`Could not fetch METAR for ${depAirport}`);
    } catch {
      setWeatherError('Failed to fetch weather data');
    }
    setLoadingWeather(false);
  }, [depAirport, destAirport, fetchMetar, fetchWindsAloft]);

  // Auto-fetch weather on airport change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (depAirport.length >= 3 || destAirport.length >= 3) {
        loadWeather();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [depAirport, destAirport, loadWeather]);

  // ─── Weight & Balance Calculations ─────────────────────────────────────

  const fuelLbs = fuelGallons * 6;
  const fuelBurnLbs = fuelBurnGallons * 6;

  const calc = useMemo(() => {
    const bew = aircraft.basicEmptyWeight;
    const bewArm = aircraft.basicEmptyArm;
    const bewMoment = aircraft.basicEmptyMoment;

    // Determine station values based on aircraft type
    const isPiper = aircraft.model.startsWith('PA-');
    const isCessna152 = aircraft.model === 'C152';

    let frontArm: number, rearArm: number, bag1Arm: number, bag2Arm: number;
    if (isPiper) {
      frontArm = 80.5;
      rearArm = 118.1;
      bag1Arm = 142.8;
      bag2Arm = 0;
    } else if (isCessna152) {
      frontArm = 39;
      rearArm = 0;
      bag1Arm = 64;
      bag2Arm = 84;
    } else {
      frontArm = 37;
      rearArm = 73;
      bag1Arm = 95;
      bag2Arm = 123;
    }

    const frontMoment = frontWeight * frontArm;
    const rearMoment = rearWeight * rearArm;
    const bag1Moment = baggage1 * bag1Arm;
    const bag2Moment = baggage2 * bag2Arm;

    // Zero Fuel Weight
    const zfw = bew + frontWeight + rearWeight + baggage1 + baggage2;
    const zfwMoment = bewMoment + frontMoment + rearMoment + bag1Moment + bag2Moment;
    const zfwArm = zfw > 0 ? zfwMoment / zfw : 0;

    // Ramp Weight (with fuel)
    const fuelMoment = fuelLbs * aircraft.fuelArm;
    const rampW = zfw + fuelLbs;
    const rampMoment = zfwMoment + fuelMoment;
    const rampArm = rampW > 0 ? rampMoment / rampW : 0;

    // Takeoff Weight (minus taxi fuel)
    const taxiMoment = aircraft.taxiFuelLbs * aircraft.fuelArm;
    const toW = rampW - aircraft.taxiFuelLbs;
    const toMoment = rampMoment - taxiMoment;
    const toArm = toW > 0 ? toMoment / toW : 0;

    // Landing Weight (minus fuel burn)
    const burnMoment = fuelBurnLbs * aircraft.fuelArm;
    const ldgW = toW - fuelBurnLbs;
    const ldgMoment = toMoment - burnMoment;
    const ldgArm = ldgW > 0 ? ldgMoment / ldgW : 0;

    // Check limits
    const toWithinCg = isWithinEnvelope(aircraft.cgEnvelope, toW, toArm);
    const ldgWithinCg = isWithinEnvelope(aircraft.cgEnvelope, ldgW, ldgArm);
    const toWithinWeight = toW <= aircraft.maxGrossWeight;
    const ldgWithinWeight = ldgW <= aircraft.maxGrossWeight && ldgW > 0;

    const allGood = toWithinCg && ldgWithinCg && toWithinWeight && ldgWithinWeight;

    return {
      bew, bewArm, bewMoment,
      frontWeight, frontArm, frontMoment,
      rearWeight, rearArm, rearMoment,
      baggage1, bag1Arm, bag1Moment,
      baggage2, bag2Arm, bag2Moment,
      zfw, zfwArm, zfwMoment,
      fuelLbs, fuelArm: aircraft.fuelArm, fuelMoment,
      rampW, rampArm, rampMoment,
      taxiFuel: aircraft.taxiFuelLbs, taxiMoment,
      toW, toArm, toMoment,
      fuelBurnLbs, burnMoment,
      ldgW, ldgArm, ldgMoment,
      toWithinCg, ldgWithinCg, toWithinWeight, ldgWithinWeight, allGood,
      isPiper, isCessna152,
    };
  }, [aircraft, frontWeight, rearWeight, baggage1, baggage2, fuelLbs, fuelBurnLbs]);

  // ─── Performance Data ──────────────────────────────────────────────────

  const performance = useMemo(() => {
    if (!depMetar) return null;

    const alt = depMetar.altimeter_inhg || 29.92;
    const temp = depMetar.temp_c ?? 15;
    const elev = depMetar.elevation_ft || 0;
    const pa = pressureAltitude(elev, alt);
    const da = densityAltitude(pa, temp);

    const wind = headwindCrosswind(depMetar.wind_dir, depMetar.wind_speed_kt, runwayHeading);

    // Maneuvering speed estimation (Va proportional to sqrt(W/Wmax))
    // Base Va: C172 ≈ 99, C152 ≈ 88, PA-28 ≈ 111
    let vaMax: number;
    if (aircraft.model.startsWith('PA-')) vaMax = 111;
    else if (aircraft.model === 'C152') vaMax = 88;
    else if (aircraft.model === 'C172-180') vaMax = 104;
    else vaMax = 99;

    const vaTo = vaMax * Math.sqrt(calc.toW / aircraft.maxGrossWeight);
    const vaLdg = vaMax * Math.sqrt(Math.max(calc.ldgW, 0) / aircraft.maxGrossWeight);

    return {
      pressureAlt: pa,
      densityAlt: da,
      headwind: wind.headwind,
      crosswind: wind.crosswind,
      vaTo: Math.round(vaTo * 100) / 100,
      vaLdg: Math.round(vaLdg * 100) / 100,
    };
  }, [depMetar, runwayHeading, aircraft, calc]);

  // ─── Submit to Dispatch ────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!pilotName.trim()) {
      setSubmitMsg('Please enter pilot name');
      return;
    }
    if (!calc.allGood) {
      setSubmitMsg('Cannot submit — weight and balance is out of limits!');
      return;
    }

    setSubmitting(true);
    setSubmitMsg('');
    try {
      const res = await fetch('/api/wb/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilotName,
          aircraft: aircraft.tailNumber,
          aircraftType: aircraft.type,
          departure: depAirport,
          destination: destAirport,
          route: flightRoute,
          depMetar: depMetar?.raw || '',
          destMetar: destMetar?.raw || '',
          takeoffWeight: Math.round(calc.toW * 100) / 100,
          takeoffCg: Math.round(calc.toArm * 100) / 100,
          landingWeight: Math.round(calc.ldgW * 100) / 100,
          landingCg: Math.round(calc.ldgArm * 100) / 100,
          fuelGallons,
          fuelBurnGallons,
          frontWeight,
          rearWeight,
          baggage1,
          baggage2,
          performance,
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSubmitMsg('✅ Weight & Balance sheet sent to dispatch!');
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitMsg(data.error || 'Failed to send to dispatch');
      }
    } catch {
      setSubmitMsg('Network error — please try again');
    }
    setSubmitting(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────

  const chartPoints = [
    { label: 'T/O', weight: calc.toW, cg: calc.toArm, color: '#3b82f6' },
    { label: 'LDG', weight: calc.ldgW, cg: calc.ldgArm, color: '#f59e0b' },
  ];

  const isPiper = calc.isPiper;
  const isCessna152 = calc.isCessna152;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Weight & Balance Calculator
          </h1>
          <p className="text-slate-400">Darcy Aviation — KDXR Danbury, CT</p>
        </div>

        {/* Aircraft Selector */}
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 mb-6 ring-1 ring-white/10">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Aircraft</label>
          <select
            value={selectedTail}
            onChange={e => setSelectedTail(e.target.value)}
            className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 text-lg font-mono ring-1 ring-white/10 focus:ring-gold focus:outline-none"
          >
            {AIRCRAFT.map(a => (
              <option key={a.tailNumber} value={a.tailNumber}>
                {a.tailNumber} — {a.type}
              </option>
            ))}
          </select>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
            <span>Empty Weight: <b className="text-white">{aircraft.basicEmptyWeight.toFixed(2)} lbs</b></span>
            <span>Useful Load: <b className="text-white">{aircraft.usefulLoad.toFixed(2)} lbs</b></span>
            <span>Max Gross: <b className="text-white">{aircraft.maxGrossWeight} lbs</b></span>
          </div>
        </div>

        <div ref={formRef} className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Conditions / Weather */}
            <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">🌤️</span> Conditions
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Departure (ICAO)</label>
                  <input
                    type="text"
                    value={depAirport}
                    onChange={e => setDepAirport(e.target.value.toUpperCase())}
                    placeholder="KDXR"
                    maxLength={4}
                    className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 font-mono uppercase ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Destination (ICAO)</label>
                  <input
                    type="text"
                    value={destAirport}
                    onChange={e => setDestAirport(e.target.value.toUpperCase())}
                    placeholder="KBDR"
                    maxLength={4}
                    className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 font-mono uppercase ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-1">Runway Heading (°)</label>
                <input
                  type="number"
                  value={runwayHeading || ''}
                  onChange={e => setRunwayHeading(Number(e.target.value))}
                  placeholder="260"
                  min={0} max={360}
                  className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                />
              </div>

              {loadingWeather && (
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-gold animate-spin" />
                  Fetching weather...
                </div>
              )}
              {weatherError && <p className="text-red-400 text-sm mb-3">{weatherError}</p>}

              {/* Departure Weather */}
              {depMetar && (
                <div className="bg-slate-900/50 rounded-xl p-4 mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Departure — {depMetar.station}</h3>
                  <p className="font-mono text-xs text-green-400 mb-2 break-all">{depMetar.raw}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-slate-400">Temp / Dewpt:
                      <span className="text-white ml-1">{depMetar.temp_c ?? '—'}°C / {depMetar.dewpoint_c ?? '—'}°C</span>
                    </div>
                    <div className="text-slate-400">Altimeter:
                      <span className="text-white ml-1">{depMetar.altimeter_inhg?.toFixed(2) ?? '—'}"</span>
                    </div>
                    <div className="text-slate-400">Wind:
                      <span className="text-white ml-1">{depMetar.wind_dir}° @ {depMetar.wind_speed_kt}kt{depMetar.wind_gust_kt ? ` G${depMetar.wind_gust_kt}` : ''}</span>
                    </div>
                    <div className="text-slate-400">Category:
                      <span className={`ml-1 font-bold ${
                        depMetar.flight_category === 'VFR' ? 'text-green-400' :
                        depMetar.flight_category === 'MVFR' ? 'text-blue-400' :
                        depMetar.flight_category === 'IFR' ? 'text-red-400' : 'text-purple-400'
                      }`}>{depMetar.flight_category}</span>
                    </div>
                  </div>
                  {depWindsAloft.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <span className="text-xs text-slate-500">Winds Aloft: </span>
                      {depWindsAloft.map((w, i) => (
                        <span key={i} className="text-xs text-slate-300 mr-3">
                          {w.altitude}ft: {w.direction}°@{w.speed}kt
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Destination Weather */}
              {destMetar && (
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Destination — {destMetar.station}</h3>
                  <p className="font-mono text-xs text-green-400 mb-2 break-all">{destMetar.raw}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-slate-400">Temp / Dewpt:
                      <span className="text-white ml-1">{destMetar.temp_c ?? '—'}°C / {destMetar.dewpoint_c ?? '—'}°C</span>
                    </div>
                    <div className="text-slate-400">Altimeter:
                      <span className="text-white ml-1">{destMetar.altimeter_inhg?.toFixed(2) ?? '—'}"</span>
                    </div>
                    <div className="text-slate-400">Wind:
                      <span className="text-white ml-1">{destMetar.wind_dir}° @ {destMetar.wind_speed_kt}kt{destMetar.wind_gust_kt ? ` G${destMetar.wind_gust_kt}` : ''}</span>
                    </div>
                    <div className="text-slate-400">Category:
                      <span className={`ml-1 font-bold ${
                        destMetar.flight_category === 'VFR' ? 'text-green-400' :
                        destMetar.flight_category === 'MVFR' ? 'text-blue-400' :
                        destMetar.flight_category === 'IFR' ? 'text-red-400' : 'text-purple-400'
                      }`}>{destMetar.flight_category}</span>
                    </div>
                  </div>
                  {destWindsAloft.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <span className="text-xs text-slate-500">Winds Aloft: </span>
                      {destWindsAloft.map((w, i) => (
                        <span key={i} className="text-xs text-slate-300 mr-3">
                          {w.altitude}ft: {w.direction}°@{w.speed}kt
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Performance */}
              {performance && (
                <div className="bg-slate-900/50 rounded-xl p-4 mt-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Performance</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-slate-400">Pressure Alt:
                      <span className="text-white ml-1">{performance.pressureAlt.toFixed(0)} ft</span>
                    </div>
                    <div className="text-slate-400">Density Alt:
                      <span className="text-white ml-1">{performance.densityAlt.toFixed(0)} ft</span>
                    </div>
                    <div className="text-slate-400">Headwind:
                      <span className="text-white ml-1">{performance.headwind} kt</span>
                    </div>
                    <div className="text-slate-400">Crosswind:
                      <span className="text-white ml-1">{performance.crosswind} kt</span>
                    </div>
                    <div className="text-slate-400">V<sub>A</sub> (T/O):
                      <span className="text-white ml-1">{performance.vaTo.toFixed(1)} kt</span>
                    </div>
                    <div className="text-slate-400">V<sub>A</sub> (Ldg):
                      <span className="text-white ml-1">{performance.vaLdg.toFixed(1)} kt</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Loading Inputs */}
            <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">⚖️</span> Loading
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>{isCessna152 ? 'Front Seats' : 'Front Pilots'} (lbs)</span>
                    {aircraft.stations[0].maxWeight && (
                      <span className="text-slate-500">max {aircraft.stations[0].maxWeight}</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={frontWeight || ''}
                    onChange={e => setFrontWeight(Number(e.target.value))}
                    placeholder="0"
                    min={0}
                    className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                  />
                </div>

                {!isCessna152 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Rear {isPiper ? 'Passengers' : 'Passengers'} (lbs)
                    </label>
                    <input
                      type="number"
                      value={rearWeight || ''}
                      onChange={e => setRearWeight(Number(e.target.value))}
                      placeholder="0"
                      min={0}
                      className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>{isPiper ? 'Baggage' : 'Baggage 1'} (lbs)</span>
                    <span className="text-slate-500">max {aircraft.baggage1Max}</span>
                  </label>
                  <input
                    type="number"
                    value={baggage1 || ''}
                    onChange={e => setBaggage1(Number(e.target.value))}
                    placeholder="0"
                    min={0}
                    className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                  />
                </div>

                {aircraft.hasBaggage2 && !isPiper && (
                  <div>
                    <label className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                      <span>Baggage 2 (lbs)</span>
                      <span className="text-slate-500">max {aircraft.baggage2Max}</span>
                    </label>
                    <input
                      type="number"
                      value={baggage2 || ''}
                      onChange={e => setBaggage2(Number(e.target.value))}
                      placeholder="0"
                      min={0}
                      className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-700">
                  <label className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Usable Fuel (gallons)</span>
                    <span className="text-slate-500">max {Math.round(aircraft.maxFuelLbs / 6)} gal ({aircraft.maxFuelLbs} lbs)</span>
                  </label>
                  <input
                    type="number"
                    value={fuelGallons || ''}
                    onChange={e => setFuelGallons(Number(e.target.value))}
                    placeholder="0"
                    min={0}
                    max={Math.round(aircraft.maxFuelLbs / 6)}
                    className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">{fuelLbs.toFixed(0)} lbs @ {aircraft.fuelArm}" arm</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Fuel Burn (gallons)
                  </label>
                  <input
                    type="number"
                    value={fuelBurnGallons || ''}
                    onChange={e => setFuelBurnGallons(Number(e.target.value))}
                    placeholder="0"
                    min={0}
                    max={fuelGallons}
                    className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">{fuelBurnLbs.toFixed(0)} lbs burn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* W&B Table */}
            <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-xl">📊</span> Weight & Balance
                </h2>
                <StatusBadge ok={calc.allGood} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase">
                      <th className="text-left py-2 pr-2">Item</th>
                      <th className="text-right py-2 px-2">Weight</th>
                      <th className="text-right py-2 px-2">Arm</th>
                      <th className="text-right py-2 pl-2">Moment</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-t border-slate-700/50">
                      <td className="py-1.5 pr-2">Basic Empty Weight</td>
                      <td className="text-right px-2 font-mono">{calc.bew.toFixed(2)}</td>
                      <td className="text-right px-2 font-mono">{calc.bewArm.toFixed(2)}</td>
                      <td className="text-right pl-2 font-mono">{calc.bewMoment.toFixed(2)}</td>
                    </tr>
                    <tr className="border-t border-slate-700/50">
                      <td className="py-1.5 pr-2 text-blue-300">+ {isCessna152 ? 'Front Seats' : 'Front Pilots'}</td>
                      <td className="text-right px-2 font-mono">{calc.frontWeight.toFixed(0)}</td>
                      <td className="text-right px-2 font-mono">{calc.frontArm.toFixed(2)}</td>
                      <td className="text-right pl-2 font-mono">{calc.frontMoment.toFixed(2)}</td>
                    </tr>
                    {!isCessna152 && (
                      <tr className="border-t border-slate-700/50">
                        <td className="py-1.5 pr-2 text-blue-300">+ Rear Passengers</td>
                        <td className="text-right px-2 font-mono">{calc.rearWeight.toFixed(0)}</td>
                        <td className="text-right px-2 font-mono">{calc.rearArm.toFixed(2)}</td>
                        <td className="text-right pl-2 font-mono">{calc.rearMoment.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="border-t border-slate-700/50">
                      <td className="py-1.5 pr-2 text-blue-300">+ {isPiper ? 'Baggage' : 'Baggage 1'}</td>
                      <td className="text-right px-2 font-mono">{calc.baggage1.toFixed(0)}</td>
                      <td className="text-right px-2 font-mono">{calc.bag1Arm.toFixed(2)}</td>
                      <td className="text-right pl-2 font-mono">{calc.bag1Moment.toFixed(2)}</td>
                    </tr>
                    {aircraft.hasBaggage2 && !isPiper && (
                      <tr className="border-t border-slate-700/50">
                        <td className="py-1.5 pr-2 text-blue-300">+ Baggage 2</td>
                        <td className="text-right px-2 font-mono">{calc.baggage2.toFixed(0)}</td>
                        <td className="text-right px-2 font-mono">{calc.bag2Arm.toFixed(2)}</td>
                        <td className="text-right pl-2 font-mono">{calc.bag2Moment.toFixed(2)}</td>
                      </tr>
                    )}

                    {/* Zero Fuel Weight */}
                    <tr className="border-t-2 border-slate-600 bg-slate-700/30 font-bold">
                      <td className="py-2 pr-2 text-white">= Zero Fuel Weight</td>
                      <td className="text-right px-2 font-mono text-white">{calc.zfw.toFixed(2)}</td>
                      <td className="text-right px-2 font-mono text-white">{calc.zfwArm.toFixed(2)}</td>
                      <td className="text-right pl-2 font-mono text-white">{calc.zfwMoment.toFixed(2)}</td>
                    </tr>

                    <tr className="border-t border-slate-700/50">
                      <td className="py-1.5 pr-2 text-emerald-300">+ Usable Fuel</td>
                      <td className="text-right px-2 font-mono">{calc.fuelLbs.toFixed(0)}</td>
                      <td className="text-right px-2 font-mono">{calc.fuelArm.toFixed(2)}</td>
                      <td className="text-right pl-2 font-mono">{calc.fuelMoment.toFixed(2)}</td>
                    </tr>

                    {/* Ramp Weight */}
                    <tr className="border-t-2 border-slate-600 bg-slate-700/30 font-bold">
                      <td className="py-2 pr-2 text-white">= Ramp Weight</td>
                      <td className="text-right px-2 font-mono text-white">{calc.rampW.toFixed(2)}</td>
                      <td className="text-right px-2 font-mono text-white">{calc.rampArm.toFixed(2)}</td>
                      <td className="text-right pl-2 font-mono text-white">{calc.rampMoment.toFixed(2)}</td>
                    </tr>

                    <tr className="border-t border-slate-700/50">
                      <td className="py-1.5 pr-2 text-red-300">− Taxi Fuel</td>
                      <td className="text-right px-2 font-mono">{calc.taxiFuel}</td>
                      <td className="text-right px-2 font-mono">{calc.fuelArm.toFixed(2)}</td>
                      <td className="text-right pl-2 font-mono">{calc.taxiMoment.toFixed(2)}</td>
                    </tr>

                    {/* Takeoff Weight */}
                    <tr className={`border-t-2 border-slate-600 font-bold ${calc.toWithinCg && calc.toWithinWeight ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                      <td className="py-2 pr-2 text-white">= Takeoff Weight</td>
                      <td className={`text-right px-2 font-mono ${calc.toWithinWeight ? 'text-green-400' : 'text-red-400'}`}>
                        {calc.toW.toFixed(2)}
                      </td>
                      <td className={`text-right px-2 font-mono ${calc.toWithinCg ? 'text-green-400' : 'text-red-400'}`}>
                        {calc.toArm.toFixed(2)}
                      </td>
                      <td className="text-right pl-2 font-mono text-white">{calc.toMoment.toFixed(2)}</td>
                    </tr>

                    <tr className="border-t border-slate-700/50">
                      <td className="py-1.5 pr-2 text-red-300">− Fuel Burn</td>
                      <td className="text-right px-2 font-mono">{calc.fuelBurnLbs.toFixed(0)}</td>
                      <td className="text-right px-2 font-mono">{calc.fuelArm.toFixed(2)}</td>
                      <td className="text-right pl-2 font-mono">{calc.burnMoment.toFixed(2)}</td>
                    </tr>

                    {/* Landing Weight */}
                    <tr className={`border-t-2 border-slate-600 font-bold ${calc.ldgWithinCg && calc.ldgWithinWeight ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                      <td className="py-2 pr-2 text-white">= Landing Weight</td>
                      <td className={`text-right px-2 font-mono ${calc.ldgWithinWeight ? 'text-green-400' : 'text-red-400'}`}>
                        {calc.ldgW.toFixed(2)}
                      </td>
                      <td className={`text-right px-2 font-mono ${calc.ldgWithinCg ? 'text-green-400' : 'text-red-400'}`}>
                        {calc.ldgArm.toFixed(2)}
                      </td>
                      <td className="text-right pl-2 font-mono text-white">{calc.ldgMoment.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Limits summary */}
              <div className="mt-4 pt-3 border-t border-slate-700 grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-400">
                  Max Gross: <span className="text-white font-bold">{aircraft.maxGrossWeight} lbs</span>
                </div>
                <div className="text-slate-400">
                  T/O Margin: <span className={`font-bold ${aircraft.maxGrossWeight - calc.toW >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(aircraft.maxGrossWeight - calc.toW).toFixed(0)} lbs
                  </span>
                </div>
                <div className="text-slate-400">
                  CG Fwd Limit: <span className="text-white font-bold">
                    {interpolateCg(aircraft.cgEnvelope, calc.toW, 'fwd').toFixed(1)}"
                  </span>
                </div>
                <div className="text-slate-400">
                  CG Aft Limit: <span className="text-white font-bold">
                    {interpolateCg(aircraft.cgEnvelope, calc.toW, 'aft').toFixed(1)}"
                  </span>
                </div>
              </div>
            </div>

            {/* CG Envelope Chart */}
            <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📈</span> CG Envelope
              </h2>
              <CgEnvelopeChart aircraft={aircraft} points={chartPoints} />
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" /> Takeoff
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" /> Landing
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-green-500/30 ring-1 ring-green-500" /> Envelope
                </span>
              </div>
            </div>

            {/* Submit to Dispatch */}
            <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">✈️</span> Submit to Dispatch
              </h2>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Pilot / Student Name *</label>
                  <input
                    type="text"
                    value={pilotName}
                    onChange={e => setPilotName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Flight Route / Notes</label>
                  <input
                    type="text"
                    value={flightRoute}
                    onChange={e => setFlightRoute(e.target.value)}
                    placeholder="KDXR → KBDR → KDXR"
                    className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 ring-1 ring-white/10 focus:ring-gold focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !calc.allGood || !pilotName.trim()}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                  calc.allGood && pilotName.trim()
                    ? 'bg-gradient-to-r from-gold to-gold-light text-slate-900 hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98]'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                    Sending...
                  </span>
                ) : calc.allGood ? (
                  '📧 Send to Dispatch'
                ) : (
                  '⚠️ Out of Limits — Cannot Submit'
                )}
              </button>

              {submitMsg && (
                <p className={`mt-3 text-sm text-center ${submitMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {submitMsg}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-500 mt-8">
          This tool is for planning purposes. Always verify with the aircraft's official POH/AFM.
          <br />© {new Date().getFullYear()} Darcy Aviation — KDXR Danbury, CT
        </p>
      </div>
    </div>
  );
}
