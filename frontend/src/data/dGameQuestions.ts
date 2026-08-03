export type GameTrackId = 'private' | 'instrument' | 'commercial' | 'cfi';

export type GameQuestion = {
  id: string;
  value: number;
  clue: string;
  answer: string;
  choices: string[];
  explanation: string;
};

export type GameCategory = { name: string; shortName: string; questions: GameQuestion[] };
export type GameTrack = {
  id: GameTrackId;
  eyebrow: string;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  categories: GameCategory[];
};

const q = (id: string, value: number, clue: string, answer: string, wrong: string[], explanation: string): GameQuestion => ({
  id, value, clue, answer, choices: [answer, ...wrong], explanation,
});

export const GAME_TRACKS: GameTrack[] = [
  {
    id: 'private', eyebrow: 'Student → Pilot', name: 'Private Pilot', shortName: 'Private', accent: '#f6b73c',
    description: 'Core knowledge for safe VFR flying, checkride preparation, and confident decision-making.',
    categories: [
      { name: 'Rules of the Sky', shortName: 'Rules', questions: [
        q('p-rules-100', 100, 'The minimum age to solo an airplane in the United States.', '16 years old', ['14 years old', '17 years old', '18 years old'], 'A student pilot must be at least 16 to solo an airplane or helicopter.'),
        q('p-rules-200', 200, 'The minimum daytime VFR fuel reserve for an airplane.', '30 minutes at normal cruise', ['20 minutes at best economy', '45 minutes at normal cruise', 'One hour at normal cruise'], 'Day VFR requires enough fuel to reach the first point of intended landing plus at least 30 minutes at normal cruise.'),
        q('p-rules-300', 300, 'When two aircraft of the same category converge at roughly the same altitude, this aircraft has the right-of-way.', 'The aircraft to the other’s right', ['The faster aircraft', 'The aircraft at the lower altitude', 'The aircraft to the other’s left'], 'For converging aircraft, the aircraft to the other’s right has the right-of-way.'),
        q('p-rules-400', 400, 'Unless otherwise authorized, the speed limit beneath Class B airspace is this value.', '200 knots indicated', ['180 knots indicated', '230 knots true', '250 knots indicated'], '14 CFR 91.117(c) limits operations beneath Class B or in a VFR corridor through it to 200 KIAS.'),
        q('p-rules-500', 500, 'A private pilot may share operating expenses with passengers only when this condition is met.', 'The pilot pays at least a pro rata share', ['The passengers pay all fuel costs', 'The flight is less than 100 NM', 'The pilot has 200 flight hours'], 'Allowed shared expenses are limited, and the pilot must pay at least an equal pro rata share while sharing a common purpose with passengers.'),
      ]},
      { name: 'Weather Desk', shortName: 'Weather', questions: [
        q('p-weather-100', 100, 'This report gives observed weather at an airport.', 'METAR', ['TAF', 'AIRMET', 'Convective SIGMET'], 'A METAR is an aviation routine weather observation; a TAF is a forecast.'),
        q('p-weather-200', 200, 'Closely spaced isobars on a surface chart usually indicate this.', 'Strong winds', ['Light winds', 'Freezing rain', 'High ceilings'], 'A tighter pressure gradient generally produces stronger winds.'),
        q('p-weather-300', 300, 'This cloud type is the classic signal of a mature thunderstorm.', 'Cumulonimbus', ['Stratus', 'Nimbostratus', 'Altocumulus'], 'Cumulonimbus clouds contain strong vertical development, turbulence, icing, lightning, and precipitation.'),
        q('p-weather-400', 400, 'When temperature and dew point converge near the surface, this becomes more likely.', 'Fog or low clouds', ['A stronger pressure gradient', 'Clear-air turbulence', 'A temperature inversion aloft only'], 'A small temperature/dew point spread indicates air nearing saturation.'),
        q('p-weather-500', 500, 'The phase of a thunderstorm containing both updrafts and downdrafts.', 'Mature stage', ['Cumulus stage', 'Dissipating stage', 'Anvil stage'], 'The mature stage begins when precipitation reaches the surface and downdrafts develop alongside updrafts.'),
      ]},
      { name: 'Chart & Compass', shortName: 'Navigation', questions: [
        q('p-nav-100', 100, 'The angular difference between true north and magnetic north.', 'Variation', ['Deviation', 'Drift', 'Dip'], 'Variation is geographic; deviation is compass error caused by the aircraft.'),
        q('p-nav-200', 200, 'On a sectional chart, a dashed blue line identifies this airspace.', 'Class D', ['Class B', 'Class C', 'Class E to the surface'], 'Class D is depicted by a dashed blue boundary.'),
        q('p-nav-300', 300, 'A VOR indication with a centered CDI and a FROM flag tells you this.', 'Your selected course leads away from the station', ['You are directly over the station', 'Your selected course leads to the station', 'The VOR is unusable'], 'With a FROM indication, the selected course describes a radial leading away from the station.'),
        q('p-nav-400', 400, 'Wind from the left generally requires this correction to hold a ground track.', 'A left crab', ['A right crab', 'A lower pitch attitude', 'No correction until final'], 'Point the nose into the wind to offset drift.'),
        q('p-nav-500', 500, 'The altitude printed in each sectional-chart quadrangle that provides obstacle clearance.', 'Maximum Elevation Figure', ['Minimum Enroute Altitude', 'Minimum Safe Altitude', 'Airport Reference Point'], 'The MEF represents the elevation of the highest terrain or obstacle, rounded up with an allowance.'),
      ]},
      { name: 'Aircraft Systems', shortName: 'Systems', questions: [
        q('p-systems-100', 100, 'This flight control moves the airplane about its longitudinal axis.', 'Ailerons', ['Elevator', 'Rudder', 'Trim tab'], 'Ailerons control roll about the longitudinal axis.'),
        q('p-systems-200', 200, 'Carburetor heat generally causes this immediate engine indication.', 'An RPM drop', ['An RPM rise', 'An oil-pressure spike', 'A fuel-flow cutoff'], 'Heated, less-dense induction air usually reduces power and RPM in a fixed-pitch airplane.'),
        q('p-systems-300', 300, 'If the pitot opening and drain hole are blocked, the airspeed indicator behaves like this instrument.', 'An altimeter', ['A tachometer', 'A turn coordinator', 'A vertical card compass'], 'Trapped pitot pressure expands and contracts relative to static pressure, causing altitude-like indications.'),
        q('p-systems-400', 400, 'In most training airplanes, a failed alternator first means this.', 'The battery begins powering the electrical system', ['The engine immediately stops', 'The magnetos lose ignition', 'The pitot-static instruments fail'], 'Magnetos are independent of the main electrical system; the battery temporarily carries the electrical load.'),
        q('p-systems-500', 500, 'A forward center of gravity generally produces this combination.', 'Greater stability and a longer takeoff roll', ['Less stability and a shorter takeoff roll', 'Lower stall speed and less control force', 'Greater cruise speed with no handling change'], 'A forward CG increases stability and tail-down force, often increasing stall speed and takeoff distance.'),
      ]},
      { name: 'Pilot Operations', shortName: 'Operations', questions: [
        q('p-ops-100', 100, 'The universal priority when an abnormal situation occurs in flight.', 'Aviate, navigate, communicate', ['Communicate, navigate, aviate', 'Navigate, aviate, communicate', 'Checklist, radio, land'], 'Maintain aircraft control first, determine where you are going, then communicate.'),
        q('p-ops-200', 200, 'Density altitude increases when temperature does this.', 'Increases', ['Decreases', 'Reaches the dew point only', 'Remains below freezing'], 'Hotter air is less dense, increasing density altitude and reducing performance.'),
        q('p-ops-300', 300, 'The recommended traffic-pattern entry at a nontowered airport when approaching from the pattern side.', '45 degrees to the downwind at pattern altitude', ['Straight into final', 'Overhead at 500 feet AGL', 'A right turn directly onto base'], 'The standard entry is midfield at 45 degrees to the downwind, unless other procedures are published.'),
        q('p-ops-400', 400, 'During a power-off glide, maximum distance is achieved at this speed.', 'Best glide speed', ['Minimum sink speed', 'Maneuvering speed', 'Rotation speed'], 'Best glide provides the greatest distance for altitude in the published configuration.'),
        q('p-ops-500', 500, 'A runway marked 18 is aligned approximately with this magnetic heading.', '180 degrees', ['018 degrees', '090 degrees', '360 degrees'], 'Runway numbers are magnetic direction rounded to the nearest 10 degrees with the final zero omitted.'),
      ]},
    ],
  },
  {
    id: 'instrument', eyebrow: 'Clouds → Clearance', name: 'Instrument Rating', shortName: 'IFR', accent: '#58c7ff',
    description: 'Procedures, weather, regulations, and approach decisions for precise flight in the system.',
    categories: [
      { name: 'Panel Scan', shortName: 'Instruments', questions: [
        q('i-inst-100', 100, 'The primary pitch instrument during straight-and-level instrument flight.', 'Attitude indicator', ['Heading indicator', 'Turn coordinator', 'Airspeed indicator'], 'The attitude indicator provides the most direct pitch information in a conventional control-performance scan.'),
        q('i-inst-200', 200, 'A blocked static port causes these three instruments to be affected.', 'Altimeter, VSI, and airspeed indicator', ['Tachometer, oil pressure, and compass', 'Attitude indicator, DG, and turn coordinator', 'CDI, DME, and transponder'], 'The altimeter, VSI, and airspeed indicator all use static pressure.'),
        q('i-inst-300', 300, 'A standard-rate turn completes 360 degrees in this amount of time.', '2 minutes', ['1 minute', '3 minutes', '4 minutes'], 'Standard rate is 3 degrees per second: 360 degrees takes two minutes.'),
        q('i-inst-400', 400, 'An altimeter set too high causes the indicated altitude to read this way.', 'Higher than true altitude', ['Lower than true altitude', 'Correct only in turns', 'Zero until airborne'], 'From high pressure to low pressure, look out below; an overly high setting makes indicated altitude too high.'),
        q('i-inst-500', 500, 'Acceleration on an east or west heading in the Northern Hemisphere causes this magnetic-compass error.', 'An indication of a turn toward north', ['An indication of a turn toward south', 'No compass error', 'A steady turn toward west'], 'ANDS: accelerate north, decelerate south on east/west headings in the Northern Hemisphere.'),
      ]},
      { name: 'Clearance Lab', shortName: 'Procedures', questions: [
        q('i-proc-100', 100, 'The “C” in the CRAFT clearance mnemonic.', 'Clearance limit', ['Cruise altitude', 'Course heading', 'Contact frequency'], 'CRAFT: clearance limit, route, altitude, frequency, transponder.'),
        q('i-proc-200', 200, 'The standard outbound timing for a holding pattern at or below 14,000 feet MSL.', '1 minute', ['30 seconds', '1.5 minutes', '2 minutes'], 'Standard timing is one minute inbound/outbound at or below 14,000 feet and 1.5 minutes above.'),
        q('i-proc-300', 300, 'The preferred maximum holding speed from 6,001 through 14,000 feet MSL.', '230 KIAS', ['200 KIAS', '210 KIAS', '265 KIAS'], 'The standard maximum is 230 KIAS in this altitude band unless otherwise published.'),
        q('i-proc-400', 400, 'On lost communications, the route mnemonic AVEF ends with this choice.', 'Filed', ['Final', 'Fix', 'Flight planned altitude'], 'Fly Assigned, Vectored, Expected, then Filed—the first applicable route in that order.'),
        q('i-proc-500', 500, 'A pilot may descend below DA or MDA only when required visibility exists, the aircraft can land normally, and this is available.', 'At least one required visual reference', ['The runway is within five miles', 'Approach lights are always enough to touchdown', 'Tower has issued a landing clearance'], 'Section 91.175 requires the necessary flight visibility, a normal descent, and specified visual references.'),
      ]},
      { name: 'IFR Weather', shortName: 'Weather', questions: [
        q('i-wx-100', 100, 'This advisory covers significant weather that may affect all aircraft, including severe icing or turbulence.', 'SIGMET', ['METAR', 'TAF', 'PIREP only'], 'SIGMETs identify significant en route weather hazards.'),
        q('i-wx-200', 200, 'Freezing rain most strongly signals this icing threat.', 'Severe icing and supercooled large droplets', ['Only frost on the ground', 'No airframe icing above freezing', 'Light rime icing only'], 'Freezing rain can rapidly overwhelm an aircraft’s ice-protection capability.'),
        q('i-wx-300', 300, 'A temperature inversion can trap moisture and contaminants, commonly producing this.', 'Low ceilings, fog, and poor visibility', ['Guaranteed clear skies', 'Only mountain-wave turbulence', 'A strong lapse rate'], 'Stable air beneath an inversion favors stratiform clouds, haze, fog, and poor visibility.'),
        q('i-wx-400', 400, 'Embedded thunderstorms are especially hazardous to IFR aircraft for this reason.', 'They can be hidden inside cloud layers', ['They never appear on radar', 'They contain no precipitation', 'They occur only below 3,000 feet'], 'Visual avoidance may be impossible when cells are obscured by widespread clouds.'),
        q('i-wx-500', 500, 'A PIREP reporting “NEG ICG” means this.', 'No icing was encountered', ['Negative outside-air temperature', 'Icing equipment is inoperative', 'Forecast icing is cancelled'], 'NEG reports that the stated phenomenon was not encountered in the described area/altitude.'),
      ]},
      { name: 'Regulation Radar', shortName: 'Regulations', questions: [
        q('i-reg-100', 100, 'To act as PIC under IFR, the familiar recent-experience shorthand is this.', 'Six approaches, holding, and intercepting/tracking in six months', ['Three approaches in 90 days', 'One IPC every year', 'Ten hours of actual instrument time'], 'The core recent-experience tasks are six approaches, holding procedures, and intercepting/tracking courses within the preceding six calendar months.'),
        q('i-reg-200', 200, 'A VOR used for IFR navigation must have been checked within the preceding this many days.', '30 days', ['10 days', '60 days', '90 days'], 'An operational VOR check is required within the preceding 30 days for IFR use.'),
        q('i-reg-300', 300, 'The altimeter/static-system inspection interval for IFR flight is this.', '24 calendar months', ['12 calendar months', '18 calendar months', '36 calendar months'], 'The required tests and inspections must be current within the preceding 24 calendar months.'),
        q('i-reg-400', 400, 'An alternate is not required under the basic “1-2-3 rule” when the forecast spans one hour before to one hour after ETA and meets this.', 'At least 2,000-foot ceiling and 3 SM visibility', ['1,000 feet and 2 SM', '3,000 feet and 5 SM', 'Clear skies and 10 SM'], 'The familiar rule is ±1 hour, 2,000-foot ceiling, and 3 statute miles visibility.'),
        q('i-reg-500', 500, 'When an alternate has only a nonprecision approach, the standard planning minimum is this.', '800-foot ceiling and 2 SM visibility', ['600 feet and 2 SM', '400 feet and 1 SM', '1,000 feet and 3 SM'], 'Unless nonstandard minima are published, use 800-2 for a nonprecision alternate and 600-2 for precision.'),
      ]},
      { name: 'Approach Plate', shortName: 'Approaches', questions: [
        q('i-app-100', 100, 'The final approach fix on an ILS is typically identified by this.', 'Glideslope intercept at the published altitude', ['The outer compass rose', 'The missed-approach point', 'The runway threshold'], 'For a precision approach, the FAF is normally the point of glidepath intercept at the published altitude.'),
        q('i-app-200', 200, 'A black triangle containing the letter “A” on an approach chart means this.', 'Nonstandard alternate minimums are published', ['The airport has no approaches', 'A circling approach is prohibited', 'A radar vector is mandatory'], 'The triangle-A symbol directs pilots to the alternate-minimums publication.'),
        q('i-app-300', 300, 'The missed-approach point for many nonprecision approaches is identified by this.', 'Timing, a fix, or a waypoint', ['Glideslope intercept only', 'The top of descent', 'The airport beacon'], 'Depending on the procedure, the MAP may be a fix, waypoint, navaid passage, or elapsed time.'),
        q('i-app-400', 400, 'If only the approach-light system is visible at DA, a pilot may generally descend no lower than this height above touchdown zone elevation.', '100 feet', ['50 feet', '200 feet', 'The runway surface'], 'Approach lights alone permit descent below DA/MDA only to 100 feet above TDZE unless the red terminating or side-row bars are also visible.'),
        q('i-app-500', 500, 'When circling, approach category is based on this speed.', 'The speed used for the maneuver', ['Maximum structural cruise speed', 'Published best-glide speed', 'Groundspeed on final only'], 'If the circling speed exceeds the aircraft’s normal category range, use the higher category minimums.'),
      ]},
    ],
  },
  {
    id: 'commercial', eyebrow: 'Precision → Professional', name: 'Commercial Pilot', shortName: 'Commercial', accent: '#ff7a55',
    description: 'Deeper aerodynamics, performance, regulations, and professional-level aircraft control.',
    categories: [
      { name: 'Advanced Aero', shortName: 'Aerodynamics', questions: [
        q('c-aero-100', 100, 'In a level 60-degree bank, the airplane experiences approximately this load factor.', '2 G', ['1.2 G', '1.5 G', '3 G'], 'A coordinated level turn at 60 degrees of bank produces a load factor of 2.'),
        q('c-aero-200', 200, 'As airplane weight decreases, maneuvering speed does this.', 'Decreases', ['Increases', 'Remains constant', 'Equals best glide'], 'A lighter aircraft reaches the critical angle of attack at a lower speed, so maneuvering speed is lower.'),
        q('c-aero-300', 300, 'Induced drag is greatest under this condition.', 'High lift coefficient and low airspeed', ['Low angle of attack and high speed', 'Zero lift', 'Maximum RPM in level cruise'], 'Induced drag rises as the wing works harder to produce lift, especially at low speed/high angle of attack.'),
        q('c-aero-400', 400, 'In ground effect, induced drag does this.', 'Decreases', ['Increases sharply', 'Remains exactly constant', 'Becomes parasite drag'], 'The ground disrupts wingtip vortices and downwash, reducing induced drag.'),
        q('c-aero-500', 500, 'Pivotal altitude for eights on pylons varies with this quantity.', 'Groundspeed squared', ['Indicated airspeed only', 'Bank angle squared', 'Density altitude only'], 'Pivotal altitude rises and falls with the square of groundspeed.'),
      ]},
      { name: 'Performance Office', shortName: 'Performance', questions: [
        q('c-perf-100', 100, 'High density altitude generally causes takeoff distance to do this.', 'Increase', ['Decrease', 'Remain unchanged', 'Depend only on runway heading'], 'Less-dense air reduces engine, propeller, and wing performance.'),
        q('c-perf-200', 200, 'Maximum range in a propeller airplane occurs near this aerodynamic condition.', 'Maximum lift-to-drag ratio', ['Maximum power available', 'Minimum controllable airspeed', 'Maximum rate of climb'], 'For a propeller airplane, best range is closely associated with L/D max.'),
        q('c-perf-300', 300, 'A tailwind on landing normally causes landing distance to do this.', 'Increase', ['Decrease', 'Remain unchanged', 'Become equal to takeoff distance'], 'More groundspeed at a given indicated airspeed increases the distance traveled during touchdown and rollout.'),
        q('c-perf-400', 400, 'Climb angle is maximized at this published speed.', 'Vx', ['Vy', 'Va', 'Vno'], 'Vx gives the greatest altitude gain per unit of horizontal distance.'),
        q('c-perf-500', 500, 'Climb rate is maximized at this published speed.', 'Vy', ['Vx', 'Vfe', 'Vle'], 'Vy gives the greatest altitude gain per unit of time.'),
      ]},
      { name: 'Professional Rules', shortName: 'Regulations', questions: [
        q('c-reg-100', 100, 'The minimum age for a commercial pilot certificate.', '18 years old', ['17 years old', '19 years old', '21 years old'], 'An applicant for a commercial pilot certificate must be at least 18.'),
        q('c-reg-200', 200, 'A commercial pilot certificate alone does this.', 'Allows compensation only when the operation is otherwise legal', ['Authorizes any passenger charter', 'Creates an air carrier certificate', 'Removes all medical requirements'], 'Commercial privileges do not by themselves authorize an operation that requires an operator certificate.'),
        q('c-reg-300', 300, 'A pilot who holds out transportation to the public may trigger this requirement.', 'An operating certificate', ['Only a complex endorsement', 'A second-class radio permit', 'An aircraft dealer license'], 'Common carriage generally involves holding out and requires appropriate FAA operating authority.'),
        q('c-reg-400', 400, 'For commercial pilot privileges, the required medical class is generally this.', 'Second class', ['First class only', 'Third class', 'No medical certificate'], 'A second-class medical is generally required to exercise commercial pilot privileges.'),
        q('c-reg-500', 500, 'A commercial pilot conducting nonstop sightseeing flights within 25 SM under Part 91 needs this FAA authorization.', 'A Letter of Authorization', ['An ATP certificate', 'A type rating in every airplane', 'An IFR flight plan'], 'Commercial air tours under 14 CFR 91.147 require an FAA Letter of Authorization and compliance with other applicable requirements.'),
      ]},
      { name: 'Aircraft Command', shortName: 'Systems', questions: [
        q('c-sys-100', 100, 'A constant-speed propeller governor maintains selected RPM by changing this.', 'Blade angle', ['Mixture ratio', 'Magneto timing', 'Wing incidence'], 'The governor adjusts oil flow to change propeller blade pitch.'),
        q('c-sys-200', 200, 'Moving the propeller control forward commands this.', 'Higher RPM', ['Lower RPM', 'Leaner mixture', 'Lower manifold pressure only'], 'Forward is high RPM/fine pitch in normal constant-speed propeller operation.'),
        q('c-sys-300', 300, 'In a normally aspirated engine, manifold pressure generally does this as altitude increases at full throttle.', 'Decreases', ['Increases', 'Remains constant', 'Drops to zero immediately'], 'Ambient pressure decreases with altitude, limiting full-throttle manifold pressure.'),
        q('c-sys-400', 400, 'An aft center of gravity generally makes an airplane do this.', 'Less stable and harder to recover from a stall', ['More stable with higher control forces', 'Unable to rotate', 'Immune to spins'], 'An aft CG reduces longitudinal stability and may degrade stall/spin recovery.'),
        q('c-sys-500', 500, 'Cowl flaps primarily control this.', 'Cooling airflow through the engine compartment', ['Fuel flow to the carburetor', 'Cabin pressure', 'Propeller blade angle'], 'Opening cowl flaps improves cooling at the cost of additional drag.'),
      ]},
      { name: 'Maneuver Room', shortName: 'Maneuvers', questions: [
        q('c-man-100', 100, 'A chandelle combines a maximum-performance climb with this.', 'A 180-degree turn', ['A 90-degree turn', 'A full 360-degree turn', 'A constant-altitude spiral'], 'The chandelle is a climbing 180-degree turn ending near minimum controllable airspeed.'),
        q('c-man-200', 200, 'The lazy eight is built around this repeated change.', 'Pitch and bank through two 180-degree turns', ['Constant bank through one 360', 'A vertical climb and spin', 'Level steep turns only'], 'The maneuver coordinates smooth, constantly changing pitch and bank through two 180-degree turns.'),
        q('c-man-300', 300, 'The steep-spiral maneuver is performed around this.', 'A selected ground reference', ['A VOR radial', 'An ILS localizer', 'A moving aircraft'], 'The pilot glides in a constant-radius turn around a selected point while correcting for wind.'),
        q('c-man-400', 400, 'During eights on pylons, the pylon appearing to move aft means the pivotal altitude is this.', 'Too high', ['Too low', 'Correct', 'Unrelated to altitude'], 'If the pylon moves aft, descend; if it moves forward, climb.'),
        q('c-man-500', 500, 'Before any commercial maneuver, the first operational priority is this.', 'Clear the area', ['Retract all flaps', 'Lean to peak EGT', 'Select landing lights off'], 'Collision avoidance begins with an effective clearing procedure.'),
      ]},
    ],
  },
  {
    id: 'cfi', eyebrow: 'Knowledge → Teaching', name: 'Flight Instructor', shortName: 'CFI', accent: '#84e0a4',
    description: 'Fundamentals of instruction, endorsements, risk management, and teaching from the right seat.',
    categories: [
      { name: 'How People Learn', shortName: 'Learning', questions: [
        q('f-learn-100', 100, 'The three domains of learning.', 'Cognitive, affective, and psychomotor', ['Rote, insight, and habit', 'Primacy, intensity, and recency', 'Verbal, visual, and tactile'], 'The domains address knowledge, attitudes/values, and physical skills.'),
        q('f-learn-200', 200, 'The learning level where a learner can use knowledge in real situations.', 'Application', ['Rote', 'Awareness', 'Primacy'], 'Application goes beyond memorization and understanding to practical use.'),
        q('f-learn-300', 300, 'The law of learning stating that things learned first create a strong impression.', 'Primacy', ['Exercise', 'Effect', 'Readiness'], 'Primacy is why instructors should teach correctly the first time.'),
        q('f-learn-400', 400, 'A plateau in learning is best treated as this.', 'A normal phase requiring practice or a changed approach', ['Proof the learner cannot continue', 'A reason to skip the task permanently', 'Immediate grounds for discontinuing training'], 'Plateaus are common; instructors can vary methods, reinforce progress, and allow consolidation.'),
        q('f-learn-500', 500, 'Positive transfer of learning occurs when this happens.', 'Prior learning helps a new task', ['Old habits interfere with a new task', 'Knowledge is forgotten', 'The learner changes instructors'], 'Transfer is positive when existing knowledge or skill makes new learning easier.'),
      ]},
      { name: 'Teaching Craft', shortName: 'Teaching', questions: [
        q('f-teach-100', 100, 'A complete lesson objective should describe the behavior, conditions, and this.', 'Standards', ['Aircraft model', 'Instructor preference', 'Student age'], 'Performance-based objectives define what is done, under what conditions, and to what standard.'),
        q('f-teach-200', 200, 'The teaching method built around instructor questions and learner responses.', 'Guided discussion', ['Lecture only', 'Drill and practice only', 'Independent study'], 'Guided discussion uses purposeful questions to lead learners toward desired conclusions.'),
        q('f-teach-300', 300, 'An effective critique should be objective, flexible, acceptable, comprehensive, constructive, organized, and this.', 'Thoughtful', ['Lengthy', 'Competitive', 'Unscheduled'], 'A thoughtful critique respects the learner and focuses on meaningful improvement.'),
        q('f-teach-400', 400, 'Scenario-based training is especially useful for developing this.', 'Aeronautical decision-making', ['Rote recall only', 'Handwriting speed', 'Mechanical memory without context'], 'Realistic scenarios help learners practice judgment, risk management, and consequence-based decisions.'),
        q('f-teach-500', 500, 'The best instructor response when a learner makes an error that threatens safety.', 'Intervene early enough to preserve safety, then teach from it', ['Wait until control is lost', 'Ignore it to build confidence', 'End all future training'], 'The instructor balances learner experience with an uncompromising safety margin.'),
      ]},
      { name: 'Endorsement Desk', shortName: 'Endorsements', questions: [
        q('f-end-100', 100, 'A student pilot’s solo endorsement for a specific make and model is valid for this period.', '90 days', ['30 days', '6 calendar months', 'One year'], 'The instructor must renew the student’s solo flight endorsement every 90 days.'),
        q('f-end-200', 200, 'Before solo, a student must pass this instructor-administered test.', 'A pre-solo aeronautical knowledge test', ['The FAA private pilot knowledge test', 'An instrument proficiency check', 'A practical test with a DPE'], 'The student must pass a written pre-solo test covering applicable rules, airport procedures, and aircraft characteristics.'),
        q('f-end-300', 300, 'A student’s repeated solo cross-country flights within 50 NM require this.', 'A specific endorsement for the route or repeated flights', ['No endorsement after initial solo', 'A commercial certificate', 'An instrument rating'], 'Cross-country solo privileges require route planning review and the applicable instructor endorsement.'),
        q('f-end-400', 400, 'Training for a complex-airplane endorsement must include ground and flight instruction plus this.', 'A one-time logbook endorsement', ['A new pilot certificate', 'A recurring 90-day endorsement', 'A knowledge test at an FAA center'], 'Complex-airplane privileges require appropriate training and a logbook endorsement, subject to regulatory exceptions.'),
        q('f-end-500', 500, 'The FAA publication containing recommended certification endorsement wording.', 'Advisory Circular 61-65', ['Aeronautical Information Manual Chapter 1', 'Pilot/Controller Glossary only', 'Airport/Facility Directory'], 'AC 61-65 provides current guidance and sample endorsements for pilots and instructors.'),
      ]},
      { name: 'Right-Seat Flying', shortName: 'Maneuvers', questions: [
        q('f-fly-100', 100, 'During a learner’s first flight-control demonstration, the instructor should do this.', 'Explain, demonstrate, then let the learner practice', ['Remain silent throughout', 'Demand checkride tolerances immediately', 'Avoid all demonstrations'], 'A clear demonstration followed by coached practice builds correct mental and motor patterns.'),
        q('f-fly-200', 200, 'The instructor should guard the controls most closely during this phase.', 'Any phase with reduced safety margin', ['Only cruise flight', 'Only after the learner asks', 'Never; guarding reduces learning'], 'Proximity to terrain, low airspeed, traffic, and task saturation all demand closer instructor readiness.'),
        q('f-fly-300', 300, 'A learner fixating inside during a maneuver should be coached to do this.', 'Reestablish an outside visual scan', ['Close one eye', 'Use instruments exclusively', 'Increase bank immediately'], 'Visual-flight maneuvers require outside references and traffic scanning, supported by quick instrument checks.'),
        q('f-fly-400', 400, 'When teaching stalls, the central recovery concept is this.', 'Reduce angle of attack', ['Add full power before changing pitch', 'Level the wings with aileron at any cost', 'Retract all flaps immediately'], 'A stall ends only when the wing’s angle of attack is reduced below critical.'),
        q('f-fly-500', 500, 'When the learner repeats the same maneuver error, the instructor should first do this.', 'Diagnose the underlying cause', ['Repeat the same words louder', 'Take the controls for the rest of training', 'Lower the published standard'], 'The visible error may come from misunderstanding, perception, coordination, workload, or an ineffective teaching method.'),
      ]},
      { name: 'Instructor Standards', shortName: 'Standards', questions: [
        q('f-std-100', 100, 'A flight instructor’s professional priority above completing the syllabus.', 'Safety', ['Schedule speed', 'Aircraft utilization', 'Student entertainment'], 'Instructional goals never outrank safe operation.'),
        q('f-std-200', 200, 'An instructor signing a learner for a practical test is certifying this.', 'Required training is complete and the learner is prepared', ['The examiner must pass the learner', 'All future training is unnecessary', 'The learner owns an aircraft'], 'The endorsement reflects the instructor’s professional judgment and record review.'),
        q('f-std-300', 300, 'The ACS uses risk management alongside knowledge and this.', 'Skill', ['Seniority', 'Aircraft ownership', 'Dispatch speed'], 'ACS tasks integrate knowledge, risk management, and skill.'),
        q('f-std-400', 400, 'If a learner is not ready for solo, an instructor should do this.', 'Withhold the endorsement and explain the training plan', ['Endorse them to preserve confidence', 'Let another student decide', 'Alter the logbook later'], 'Solo authorization is a safety decision based on demonstrated proficiency and judgment.'),
        q('f-std-500', 500, 'A good instructor models checklist discipline because learners also absorb this type of lesson.', 'Unintended attitudes and habits', ['Only spoken facts', 'Only maneuvers on the syllabus', 'Nothing not written in the lesson plan'], 'Instructors teach by example; professionalism, risk tolerance, and cockpit habits transfer to learners.'),
      ]},
    ],
  },
];

export const getTrack = (id: GameTrackId) => GAME_TRACKS.find((track) => track.id === id)!;
