// POH takeoff/landing performance engine for the Darcy W&B sheet.
// Pure functions — no React. Tables live in perfData.ts (auto-generated from POH sources).
import { PERF_TABLES } from './perfData';

export type PNode = { p: number | string; v?: number; a?: PNode[] };
export type PTable = { parmNames: string[]; a: PNode[] };

export interface PerfInputs {
  pressAlt: number;   // ft (pressure altitude)
  oatC: number;       // deg C (outside air temp)
  densAlt: number;    // ft (density altitude)
  weight: number;     // lbs (takeoff or landing weight as appropriate)
  headwind: number;   // kt, +headwind / -tailwind component along runway
}

export interface PerfResult {
  toRoll: number; toObst: number; ldgRoll: number; ldgObst: number;
  profile: string; note?: string;
}

// ── Interpolation ────────────────────────────────────────────────────────────
function lerp(x: number, x0: number, x1: number, v0: number, v1: number): number {
  if (x1 === x0) return v0;
  return v0 + (x - x0) * (v1 - v0) / (x1 - x0);
}

// Linear lookup over a nested numeric table. keys length == remaining depth.
// extrapHigh[d]: if true, linearly extrapolate above the top breakpoint (else clamp).
// Below the lowest breakpoint we always clamp (cold/low/light → use nearest edge).
function lookupNumeric(nodes: PNode[], keys: number[], extrapHigh: boolean[]): number {
  const x = keys[0];
  const rest = keys.slice(1);
  const restExt = extrapHigh.slice(1);
  const ev = (n: PNode): number =>
    rest.length === 0 ? (n.v as number) : lookupNumeric(n.a as PNode[], rest, restExt);

  const first = nodes[0];
  if (x <= (first.p as number)) return ev(first);
  const last = nodes[nodes.length - 1];
  if (x >= (last.p as number)) {
    if (extrapHigh[0] && nodes.length >= 2) {
      const a = nodes[nodes.length - 2], b = last;
      return lerp(x, a.p as number, b.p as number, ev(a), ev(b));
    }
    return ev(last);
  }
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i + 1];
    if (x >= (a.p as number) && x <= (b.p as number)) {
      return lerp(x, a.p as number, b.p as number, ev(a), ev(b));
    }
  }
  return ev(first);
}

function flapsBranch(table: PTable, flap: string): PNode[] {
  const node = table.a.find(n => n.p === flap) || table.a[0];
  return node.a as PNode[];
}

function clamp(x: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, x)); }
function round5(x: number): number { return Math.round(x / 5) * 5; }

// Cessna-style wind factor: -10% per 9 kt headwind, +10% per 2 kt tailwind.
function cessnaWindFactor(headwind: number): number {
  if (headwind >= 0) return Math.max(0.45, 1 - 0.10 * headwind / 9);
  return 1 + 0.10 * (-headwind) / 2;
}

// ── Per-type methods ──────────────────────────────────────────────────────────

// Cessna 172N: tables keyed by weight × oat × pressureAlt (takeoff) and oat × alt (landing).
function calcC172N(inp: PerfInputs): Omit<PerfResult, 'profile' | 'note'> {
  const T = PERF_TABLES.C172N as Record<string, PTable>;
  const wf = cessnaWindFactor(inp.headwind);
  const k3: boolean[] = [true, true, true];
  const k2: boolean[] = [true, true];
  return {
    toRoll: round5(lookupNumeric(T.TOroll.a, [inp.weight, inp.oatC, inp.pressAlt], k3) * wf),
    toObst: round5(lookupNumeric(T.TOobst.a, [inp.weight, inp.oatC, inp.pressAlt], k3) * wf),
    ldgRoll: round5(lookupNumeric(T.ldgRoll.a, [inp.oatC, inp.pressAlt], k2) * wf),
    ldgObst: round5(lookupNumeric(T.ldgObst.a, [inp.oatC, inp.pressAlt], k2) * wf),
  };
}

// Cessna 152: single gross weight (1670). Tables keyed altitude × oat.
function calcC152(inp: PerfInputs): Omit<PerfResult, 'profile' | 'note'> {
  const T = PERF_TABLES.C152 as Record<string, PTable>;
  const wf = cessnaWindFactor(inp.headwind);
  const k2: boolean[] = [true, true];
  return {
    toRoll: round5(lookupNumeric(T.TOroll.a, [inp.pressAlt, inp.oatC], k2) * wf),
    toObst: round5(lookupNumeric(T.TOobst.a, [inp.pressAlt, inp.oatC], k2) * wf),
    ldgRoll: round5(lookupNumeric(T.ldgRoll.a, [inp.pressAlt, inp.oatC], k2) * wf),
    ldgObst: round5(lookupNumeric(T.ldgObst.a, [inp.pressAlt, inp.oatC], k2) * wf),
  };
}

// PA-28-161 Warrior II: factored charts (base alt×oat → weight adj → headwind adj).
function calcPA28_161(inp: PerfInputs, flap: 'none' | 'partial' = 'none'): Omit<PerfResult, 'profile' | 'note'> {
  const T = PERF_TABLES.PA28_161 as Record<string, any>;
  const applyWind = (dist: number, windAdj: PTable, hw: number): number => {
    if (hw >= 0) return lookupNumeric(flapsBranch(windAdj, flap), [dist, clamp(hw, 0, 15)], [true, false]);
    return dist * (1 + 0.10 * (-hw) / 2); // tailwind penalty (chart doesn't tabulate)
  };
  // takeoff ground roll
  const toBase = lookupNumeric(flapsBranch(T.TOroll, flap), [inp.pressAlt, inp.oatC], [true, true]);
  const toW = lookupNumeric(flapsBranch(T.TOrollWeightAdj, flap), [toBase, inp.weight], [true, true]);
  let toRoll = applyWind(toW, T.TOrollHeadwindAdj, inp.headwind);
  const toMin = (T.TOrollMin.a.find((n: PNode) => n.p === flap)?.v) ?? 0;
  toRoll = Math.max(toRoll, toMin);
  // takeoff over 50'
  const obBase = lookupNumeric(flapsBranch(T.TOobst, flap), [inp.pressAlt, inp.oatC], [true, true]);
  const obW = lookupNumeric(flapsBranch(T.TOobstWeightAdj, flap), [obBase, inp.weight], [true, true]);
  let toObst = applyWind(obW, T.TOobstHeadwindAdj, inp.headwind);
  const obMin = (T.TOobstMin.a.find((n: PNode) => n.p === flap)?.v) ?? 0;
  toObst = Math.max(toObst, obMin);
  // landing (headwind × density altitude, gross weight, built-in wind correction)
  const hwL = clamp(inp.headwind, -5, 15);
  const ldgRoll = lookupNumeric(T.ldgRoll.a, [hwL, inp.densAlt], [false, true]);
  const ldgObst = lookupNumeric(T.ldgObst.a, [hwL, inp.densAlt], [false, true]);
  return { toRoll: round5(toRoll), toObst: round5(toObst), ldgRoll: round5(ldgRoll), ldgObst: round5(ldgObst) };
}

// PA-28-151 Warrior: density-altitude charts at gross weight (coarse). + Cessna-style wind factor.
function calcPA28_151(inp: PerfInputs, flap: 'none' | 'partial' = 'none'): Omit<PerfResult, 'profile' | 'note'> {
  const T = PERF_TABLES.PA28_151 as Record<string, any>;
  const wf = cessnaWindFactor(inp.headwind);
  const toRollDA = (flapsBranch(T.TOroll, flap)[0].a) as PNode[];      // headwind 0 branch → DA list
  const toObstDA = (flapsBranch(T.TOobst, flap)[0].a) as PNode[];
  const ldgRollDA = (T.ldgRoll.a[0].a) as PNode[];
  const ldgObstDA = (T.ldgObst.a[0].a) as PNode[];
  return {
    toRoll: round5(lookupNumeric(toRollDA, [inp.densAlt], [true]) * wf),
    toObst: round5(lookupNumeric(toObstDA, [inp.densAlt], [true]) * wf),
    ldgRoll: round5(lookupNumeric(ldgRollDA, [inp.densAlt], [true]) * wf),
    ldgObst: round5(lookupNumeric(ldgObstDA, [inp.densAlt], [true]) * wf),
  };
}

// ── Aircraft → profile map ─────────────────────────────────────────────────────
type ProfileKey = 'C172N' | 'C152' | 'PA28_161' | 'PA28_151';
interface Profile { key: ProfileKey; source: string; note?: string; flap?: 'none' | 'partial'; }

const PROFILES: Record<string, Profile> = {
  N121MS: { key: 'C172N', source: '1978 Cessna 172N POH (160 HP)' },
  N6475D: { key: 'C172N', source: '1978 Cessna 172N POH (160 HP)' },
  N9426E: { key: 'C172N', source: '1978 Cessna 172N POH',
            note: '180 HP STC — using stock 160 HP POH as a conservative baseline (longer than actual). Load STC perf supplement for exact figures.' },
  N65563: { key: 'C152', source: 'Cessna 152 POH (Fig 5-4 / 5-10, 1670 lb)' },
  N8715C: { key: 'PA28_151', source: 'Cherokee Warrior PA-28-151 POH (density-altitude charts, gross)' },
  // N84001: master currently lists this as PA-28-151. Its FAA serial (28-8516080) is a
  // PA-28-161 Warrior II (2440 lb). Kept on -151 until Ludwig confirms; -161 engine is ready.
  N84001: { key: 'PA28_151', source: 'Cherokee Warrior PA-28-151 POH (density-altitude charts, gross)',
            note: 'Identity check: FAA serial indicates PA-28-161 (2440 lb). Confirm to switch to the granular -161 charts.' },
};

export function getPerfProfile(tail: string): Profile | null {
  return PROFILES[tail] || null;
}

export function hasPerfProfile(tail: string): boolean { return !!PROFILES[tail]; }

// Direct compute by profile key (used for tests / future tail wiring).
export function computeByProfileKey(key: ProfileKey, inp: PerfInputs, flap: 'none' | 'partial' = 'none'): Omit<PerfResult, 'profile' | 'note'> {
  switch (key) {
    case 'C172N': return calcC172N(inp);
    case 'C152': return calcC152(inp);
    case 'PA28_161': return calcPA28_161(inp, flap);
    case 'PA28_151': return calcPA28_151(inp, flap);
  }
}

export function computePerformance(tail: string, inp: PerfInputs): PerfResult | null {
  const prof = PROFILES[tail];
  if (!prof) return null;
  let core: Omit<PerfResult, 'profile' | 'note'>;
  switch (prof.key) {
    case 'C172N': core = calcC172N(inp); break;
    case 'C152': core = calcC152(inp); break;
    case 'PA28_161': core = calcPA28_161(inp, prof.flap); break;
    case 'PA28_151': core = calcPA28_151(inp, prof.flap); break;
    default: return null;
  }
  return { ...core, profile: prof.source, note: prof.note };
}
