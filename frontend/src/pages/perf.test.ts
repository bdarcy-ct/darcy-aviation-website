import { computePerformance, computeByProfileKey, PerfInputs } from './perf';

let fails = 0;
function approx(label: string, got: number, want: number, tol = 6) {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: got ${got}, want ~${want} (tol ${tol})`);
}
function log(label: string, v: any) { console.log(`      ${label}:`, JSON.stringify(v)); }

const zero = (o: Partial<PerfInputs>): PerfInputs =>
  ({ pressAlt: 0, oatC: 0, densAlt: 0, weight: 0, headwind: 0, ...o });

console.log('── C152 (N65563) ──');
// POH sample: PA 2000, 30C, 1670 lb, zero wind → GR 980 / 50ft 1820 (direct cell)
let r = computePerformance('N65563', zero({ pressAlt: 2000, oatC: 30, densAlt: 2000, weight: 1670 }))!;
log('SL2000/30C/zerowind', r);
approx('C152 toRoll', r.toRoll, 980, 1);
approx('C152 toObst', r.toObst, 1820, 1);
// 12 kt headwind → ~13% less ground roll (POH note)
r = computePerformance('N65563', zero({ pressAlt: 2000, oatC: 30, densAlt: 2000, weight: 1670, headwind: 12 }))!;
log('+12kt HW', r);
approx('C152 toRoll HW12', r.toRoll, 850, 8);

console.log('── C172N (N121MS) ──');
// table cell weight 2300, oat 20, PA 0 → toRoll 835 / toObst 1490; ldg oat20/alt0 → 530 / 1265
r = computePerformance('N121MS', zero({ pressAlt: 0, oatC: 20, densAlt: 0, weight: 2300 }))!;
log('2300/20C/SL', r);
approx('C172N toRoll', r.toRoll, 835, 1);
approx('C172N toObst', r.toObst, 1490, 1);
approx('C172N ldgRoll', r.ldgRoll, 530, 1);
approx('C172N ldgObst', r.ldgObst, 1265, 1);
// interpolation sanity: weight 2150, oat 15, PA 500 (between cells), light headwind 5
r = computePerformance('N121MS', zero({ pressAlt: 500, oatC: 15, densAlt: 700, weight: 2150, headwind: 5 }))!;
log('2150/15C/PA500/HW5 (interp)', r);
if (!(r.toRoll > 600 && r.toRoll < 900)) { fails++; console.log('FAIL  C172N interp toRoll out of range', r.toRoll); }

console.log('── N9426E (180HP → C172N conservative) ──');
r = computePerformance('N9426E', zero({ pressAlt: 0, oatC: 20, densAlt: 0, weight: 2400, headwind: 0 }))!;
log('2400/20C/SL (extrapolated weight)', r);
if (!(r.toRoll > 835)) { fails++; console.log('FAIL  N9426E heavier should exceed 2300lb roll', r.toRoll); }
log('note', r.note);

console.log('── PA-28-151 (N8715C) ──');
// DA 0 zero wind → toRoll 1100 / toObst 2200 / ldgRoll 595 / ldgObst 1100
r = computePerformance('N8715C', zero({ pressAlt: 0, oatC: 15, densAlt: 0, weight: 2325 }))!;
log('DA0 gross zerowind', r);
approx('PA151 toRoll', r.toRoll, 1100, 1);
approx('PA151 toObst', r.toObst, 2200, 1);
approx('PA151 ldgRoll', r.ldgRoll, 595, 1);
approx('PA151 ldgObst', r.ldgObst, 1100, 1);
// DA 3000 → toRoll 1500
r = computePerformance('N8715C', zero({ pressAlt: 3000, oatC: 20, densAlt: 3000, weight: 2325 }))!;
log('DA3000', r);
approx('PA151 toRoll DA3000', r.toRoll, 1500, 1);

console.log('── PA-28-161 (engine ready, not yet mapped) ──');
// gross 2325, SL, ~15C (≈ base table), zero wind. Base "none" at alt0 interp oat15.5≈985; weightAdj@2325≈base
let c = computeByProfileKey('PA28_161', zero({ pressAlt: 0, oatC: 15, densAlt: 0, weight: 2325 }), 'none');
log('PA161 none gross SL/15C', c);
if (!(c.toRoll > 800 && c.toRoll < 1200)) { fails++; console.log('FAIL  PA161 toRoll range', c.toRoll); }
if (!(c.ldgRoll > 500 && c.ldgRoll < 700)) { fails++; console.log('FAIL  PA161 ldgRoll range', c.ldgRoll); }
// lighter weight should reduce takeoff roll
let c2 = computeByProfileKey('PA28_161', zero({ pressAlt: 0, oatC: 15, densAlt: 0, weight: 1800 }), 'none');
log('PA161 none 1800lb SL/15C', c2);
if (!(c2.toRoll < c.toRoll)) { fails++; console.log('FAIL  PA161 lighter should be shorter', c2.toRoll, c.toRoll); }
// headwind should reduce
let c3 = computeByProfileKey('PA28_161', zero({ pressAlt: 0, oatC: 15, densAlt: 0, weight: 2325, headwind: 15 }), 'none');
log('PA161 none gross +15HW', c3);
if (!(c3.toRoll < c.toRoll)) { fails++; console.log('FAIL  PA161 headwind should shorten', c3.toRoll, c.toRoll); }

console.log('── Landing weight response (all aircraft) ──');
const landingWeightCases: [string, number][] = [
  ['N121MS', 2300],
  ['N6475D', 2300],
  ['N5546J', 2300],
  ['N9426E', 2550],
  ['N65563', 1670],
  ['N8715C', 2325],
  ['N84001', 2325],
];
for (const [tail, referenceWeight] of landingWeightCases) {
  const heavy = computePerformance(tail, zero({ pressAlt: 0, oatC: 20, densAlt: 0, weight: referenceWeight }))!;
  const light = computePerformance(tail, zero({ pressAlt: 0, oatC: 20, densAlt: 0, weight: referenceWeight - 120 }))!;
  const ok = light.ldgRoll < heavy.ldgRoll && light.ldgObst < heavy.ldgObst;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${tail} fuel-burn/landing-weight response: ${heavy.ldgRoll}/${heavy.ldgObst} → ${light.ldgRoll}/${light.ldgObst}`);
}

console.log(`\n${fails === 0 ? '✅ ALL CHECKS PASSED' : '❌ ' + fails + ' CHECK(S) FAILED'}`);
