import type { GameQuestion, GameTrack, GameTrackId } from './dGameQuestions';
import { EXTRA_CATEGORIES } from './dGameCategoryExpansion';

const q = (id: string, value: number, clue: string, answer: string, wrong: string[], explanation: string): GameQuestion => ({ id, value, clue, answer, choices: [answer, ...wrong], explanation });

type ExtraBank = Record<GameTrackId, Record<string, GameQuestion[]>>;

const EXTRA_BANK: ExtraBank = {
  private: {
    Rules: [
      q('px-rules-100',100,'The minimum time required between drinking alcohol and acting as a crewmember.','8 hours',['4 hours','12 hours','24 hours'],'The familiar rule is eight hours “bottle to throttle,” while impairment and blood-alcohol limits still apply.'),
      q('px-rules-200',200,'Over a congested area, minimum altitude is generally 1,000 feet above the highest obstacle within this horizontal distance.','2,000 feet',['1,000 feet','3 statute miles','5,000 feet'],'Except for takeoff or landing, the rule uses 1,000 feet above obstacles within 2,000 feet horizontally.'),
      q('px-rules-300',300,'Two-way radio communication with Class C airspace must be established at this point.','Before entering the airspace',['Before engine start','Only before landing','After crossing the inner ring'],'The controlling facility must respond to the aircraft’s call sign before entry.'),
      q('px-rules-400',400,'Supplemental oxygen is required for required crew above 12,500 through 14,000 feet MSL after this long.','30 minutes',['10 minutes','One hour','Immediately'],'Required crew must use oxygen after more than 30 minutes in that altitude band.'),
      q('px-rules-500',500,'An ELT battery must generally be replaced or recharged after more than this cumulative amount of use.','One hour',['15 minutes','Two hours','Five hours'],'Replacement is required after more than one cumulative hour of operation or when useful life falls below the specified threshold.'),
    ],
    Weather: [
      q('px-wx-100',100,'Stable air most commonly produces this type of cloud and precipitation.','Stratiform clouds and steady precipitation',['Towering cumulus and showers','Dust devils only','Clear skies in every case'],'Stable air resists vertical motion and favors layered clouds and smoother, steady precipitation.'),
      q('px-wx-200',200,'Surface wind direction in a METAR is reported relative to this north reference.','True north',['Magnetic north','Grid north','Runway heading'],'METAR wind direction is referenced to true north; tower wind reports are magnetic.'),
      q('px-wx-300',300,'AIRMET Sierra warns primarily of this.','IFR conditions and mountain obscuration',['Severe turbulence','Volcanic ash','Severe icing only'],'Sierra covers widespread IFR and/or extensive mountain obscuration.'),
      q('px-wx-400',400,'The most hazardous wind-shear portion of a microburst encounter is often this.','A rapid shift from headwind to downdraft and tailwind',['The steady headwind on entry','Light rain outside the cell','A constant crosswind'],'The changing wind can first increase performance, then rapidly remove airspeed and climb capability.'),
      q('px-wx-500',500,'Even a thin layer of frost on a wing can cause this.','A major loss of lift and increase in drag',['Improved low-speed lift','No measurable effect','Only a compass error'],'Frost disrupts smooth airflow; remove it before flight.'),
    ],
    Navigation: [
      q('px-nav-100',100,'Lines running north and south that measure position east or west.','Longitude',['Latitude','Isogonic lines','Victor airways'],'Meridians of longitude converge at the poles and measure east/west position.'),
      q('px-nav-200',200,'The frequency used for advisory calls at many airports without an operating control tower.','CTAF',['Guard only','Flight Watch','FSS voice outlet only'],'The charted Common Traffic Advisory Frequency supports pilot position and intention reports.'),
      q('px-nav-300',300,'DME primarily displays this distance.','Slant-range distance',['Horizontal distance only','Distance to the runway threshold only','Remaining fuel range'],'DME measures direct distance between aircraft and station, so error is greatest high and close.'),
      q('px-nav-400',400,'A magnetic heading differs from magnetic course because of this.','Wind correction angle',['Variation only','Compass deviation only','Runway slope'],'Heading includes the crab required to maintain the desired course over the ground.'),
      q('px-nav-500',500,'After becoming lost, the “five Cs” begin with climb and this action.','Communicate',['Cancel','Circle indefinitely','Close the throttle'],'Common guidance includes climb, communicate, confess, comply, and conserve.'),
    ],
    Systems: [
      q('px-sys-100',100,'Aircraft magnetos allow the engine to keep running after this system fails.','The main electrical system',['The fuel system','The lubrication system','The induction system'],'Magnetos generate ignition energy independently of the battery and alternator.'),
      q('px-sys-200',200,'The mixture control compensates primarily for changes in this.','Air density',['Oil viscosity','Propeller diameter','Static-system pressure only'],'Leaning restores an appropriate fuel-to-air ratio as air density decreases.'),
      q('px-sys-300',300,'Extending flaps generally increases these two aerodynamic forces.','Lift and drag',['Thrust and weight','Only parasite thrust','Weight and inertia'],'Flaps change wing camber, increasing lift and drag for lower-speed operations.'),
      q('px-sys-400',400,'A vacuum-system failure in a traditional six-pack commonly affects these instruments.','Attitude and heading indicators',['Airspeed and altimeter','Turn coordinator and tachometer','VSI and magnetic compass'],'Traditional attitude and heading gyros are often vacuum driven; verify the actual aircraft system.'),
      q('px-sys-500',500,'An oleo strut absorbs landing loads using this combination.','Compressed gas and hydraulic fluid',['Springs and electrical resistance','Vacuum and engine oil','Magnets and brake fluid only'],'The gas acts as a spring while fluid moving through an orifice damps the motion.'),
    ],
    Operations: [
      q('px-ops-100',100,'The emergency transponder code.','7700',['7500','7600','1200'],'7700 indicates a general emergency; 7600 is lost communications and 7500 unlawful interference.'),
      q('px-ops-200',200,'Behind a larger landing aircraft, wake vortices generally sink and move this way in a crosswind.','Downward and with the wind',['Upward and into the wind','Straight upward','Only along the runway centerline'],'Plan to avoid the generating aircraft’s flight path and consider wind drift.'),
      q('px-ops-300',300,'A soft-field takeoff uses elevator back pressure primarily to do this.','Keep weight off the nosewheel',['Increase braking','Hold the tail on the surface','Prevent acceleration'],'The technique protects the nosewheel and transfers weight to the wings as early as practical.'),
      q('px-ops-400',400,'The PAVE checklist evaluates Pilot, Aircraft, enVironment, and this.','External pressures',['Engine power','Visual illusions','Emergency equipment'],'PAVE is a preflight risk-management framework.'),
      q('px-ops-500',500,'On a short-field landing, maximum effective braking should begin after this.','Touchdown with directional control and weight on the wheels',['Turning base','Crossing the threshold','Retracting flaps on final'],'Follow the aircraft procedure; aerodynamic control and positive wheel loading support effective braking.'),
    ],
  },
  instrument: {
    Instruments: [
      q('ix-inst-100',100,'The turn coordinator is normally powered by this source in many training airplanes.','Electricity',['The pitot tube','The static port only','Engine oil pressure'],'Its independent electrical power can provide useful backup after a vacuum failure.'),
      q('ix-inst-200',200,'A traditional vertical-speed indicator has this characteristic.','A short indication lag',['No pressure source','Perfectly instant response','No use during climbs'],'A calibrated leak creates a small lag; trend instruments may respond faster.'),
      q('ix-inst-300',300,'If only the pitot opening is blocked but its drain remains open, the airspeed indicator tends toward this.','Zero',['Maximum airspeed','Current altitude','Standard rate'],'With the drain open, pitot pressure vents and the instrument loses dynamic pressure.'),
      q('ix-inst-400',400,'The heading indicator must be periodically aligned with this instrument.','Magnetic compass',['Altimeter','Airspeed indicator','VSI'],'Gyroscopic precession causes drift, requiring periodic realignment.'),
      q('ix-inst-500',500,'A key benefit of an HSI is that it eliminates this common VOR-navigation trap.','Reverse sensing on a properly selected course',['Magnetic dip','Altimeter lag','DME slant range'],'The HSI combines heading and course information in a rotating display that reduces interpretation errors.'),
    ],
    Procedures: [
      q('ix-proc-100',100,'A clearance void time applies when departing from this type of airport.','An airport without an operating control tower',['Every Class B airport','Only a military airport','Any airport in VMC'],'ATC may issue release and void times to protect IFR separation from a nontowered field.'),
      q('ix-proc-200',200,'A teardrop hold entry uses an outbound course approximately this many degrees from the holding course.','30 degrees',['10 degrees','60 degrees','90 degrees'],'The pilot flies about 30 degrees from the outbound course on the holding side, then turns inbound.'),
      q('ix-proc-300',300,'Crossing a compulsory reporting point without radar contact requires this.','A position report',['An immediate missed approach','Cancellation of IFR','A transponder code change to 1200'],'Compulsory reporting points and specified events require reports in nonradar operations.'),
      q('ix-proc-400',400,'An obstacle departure procedure is designed primarily to provide this.','Obstacle clearance',['A guaranteed radar vector','Landing minimums','A shorter taxi route'],'ODPs provide obstacle clearance from the terminal area; pilots remain responsible for determining their use.'),
      q('ix-proc-500',500,'Unlike a visual approach, a contact approach requires at least this flight visibility.','1 statute mile',['3 statute miles','5 statute miles','No minimum visibility'],'The pilot must request it, remain clear of clouds, have at least 1 SM visibility, and reasonably expect to continue to the destination.'),
    ],
    Weather: [
      q('ix-wx-100',100,'AIRMET Zulu addresses this hazard.','Moderate icing and freezing-level information',['IFR ceilings only','Severe thunderstorms','Surface winds only'],'Zulu provides icing and freezing-level information relevant to en route planning.'),
      q('ix-wx-200',200,'Mountain-wave turbulence is most likely with strong winds blowing this way.','Across a mountain ridge',['Parallel to a flat coastline','Only at calm airports','Down a runway with no terrain'],'Stable air and strong cross-ridge flow can create waves, rotors, and severe vertical currents.'),
      q('ix-wx-300',300,'Heavy precipitation can hide stronger returns behind it on airborne weather radar due to this.','Attenuation',['Refraction only','Static-port error','Magnetic variation'],'Energy absorbed and scattered by nearer precipitation can create a dangerous radar shadow.'),
      q('ix-wx-400',400,'Clear ice forms most readily from this.','Large supercooled water droplets',['Ice crystals in dry air','Snow already frozen solid','Warm rain above 10°C'],'Large droplets spread before freezing, producing dense clear ice and possible runback.'),
      q('ix-wx-500',500,'A rapidly falling pressure trend often suggests this weather change.','An approaching low or deteriorating conditions',['A stationary high forever','Guaranteed VFR','No wind change'],'Pressure tendency is one clue to moving systems and strengthening gradients.'),
    ],
    Regulations: [
      q('ix-reg-100',100,'IFR fuel planning for an airplane includes reaching the destination, then the alternate if required, plus this reserve.','45 minutes at normal cruise',['20 minutes','30 minutes','Two hours'],'The IFR reserve is at least 45 minutes at normal cruising speed.'),
      q('ix-reg-200',200,'For a typical Part 91 operation, published standard takeoff minimums are generally this.','Not regulatory for the pilot',['Always 1 SM','Always 600-2','The same as landing minimums'],'Part 91 pilots still must assess obstacle clearance and risk; other operating parts may impose takeoff minimums.'),
      q('ix-reg-300',300,'A transponder used under the applicable rules must generally be inspected every this many calendar months.','24',['6','12','36'],'The ATC transponder test and inspection interval is 24 calendar months.'),
      q('ix-reg-400',400,'After the six-month instrument currency window and six-month grace period, a pilot needs this.','An instrument proficiency check',['One approach with a safety pilot','A new knowledge test','A flight review only'],'An IPC restores instrument privileges after the additional six-calendar-month period has elapsed.'),
      q('ix-reg-500',500,'In VMC, an IFR flight plan may generally be cancelled with ATC except while operating here.','In Class A airspace',['Below 10,000 feet','At a nontowered airport','Under a Class B shelf'],'Class A operations require IFR.'),
    ],
    Approaches: [
      q('ix-app-100',100,'An LPV approach uses this type of minimum.','Decision altitude',['Minimum descent altitude only','No published minimum','Runway visual range only'],'LPV provides angular lateral and vertical guidance and is flown to a DA.'),
      q('ix-app-200',200,'A localizer becomes more sensitive as the aircraft does this.','Approaches the runway',['Climbs above the glideslope','Moves away from the airport','Slows below holding speed'],'Its course width narrows toward the antenna, demanding smaller corrections.'),
      q('ix-app-300',300,'A visual descent point helps a pilot begin this from MDA.','A normal descent to the runway',['The procedure turn','A missed approach before the MAP','A climb to the MSA'],'The VDP identifies a point from which a normal descent angle may be started when required visual references exist.'),
      q('ix-app-400',400,'The “NoPT” notation means this maneuver is not authorized or required on that segment.','A procedure turn',['A missed approach','A hold at the missed-approach fix','A landing'], 'NoPT routes lead directly into the approach without the course reversal unless ATC authorizes otherwise.'),
      q('ix-app-500',500,'The minimum safe altitude circle on an approach chart normally provides obstacle clearance within this radius.','25 nautical miles',['5 nautical miles','10 statute miles','100 nautical miles'],'The MSA provides emergency-use obstacle clearance, normally within 25 NM of the referenced facility or fix.'),
    ],
  },
  commercial: {
    Aerodynamics: [
      q('cx-aero-100',100,'An accelerated stall occurs at a speed higher than 1-G stall speed because of increased this.','Load factor',['Fuel flow','Aspect ratio','Static pressure'],'Banking or abrupt control input can increase load factor and stall speed.'),
      q('cx-aero-200',200,'P-factor is strongest during this condition.','High power, high angle of attack, and low airspeed',['Power-off cruise','A vertical descent','Level flight at low power'],'The descending propeller blade has greater angle of attack and thrust in this condition.'),
      q('cx-aero-300',300,'A higher aspect-ratio wing generally reduces this at a given lift.','Induced drag',['Skin-friction drag only','Aircraft weight','Propeller torque'],'Longer, narrower wings reduce downwash and vortex strength for a given lift.'),
      q('cx-aero-400',400,'The critical angle of attack is affected by airplane weight in this way.','It remains essentially the same',['It rises directly with weight','It falls to zero when light','It changes with fuel grade'],'Weight changes the speed at which the critical angle is reached, not the basic critical angle itself.'),
      q('cx-aero-500',500,'Propeller efficiency is the ratio of useful thrust power to this.','Engine power delivered to the propeller',['Aircraft weight','Induced drag only','Fuel tank capacity'],'Not all shaft power becomes useful propulsive work.'),
    ],
    Performance: [
      q('cx-perf-100',100,'Pressure altitude is altitude indicated when the altimeter is set to this.','29.92 inches Hg',['Local field elevation','30.92 inches Hg','Zero feet'],'Pressure altitude is referenced to the standard datum plane.'),
      q('cx-perf-200',200,'An upslope runway normally causes takeoff distance to do this.','Increase',['Decrease','Remain unchanged','Equal landing distance'],'Acceleration against the slope takes longer.'),
      q('cx-perf-300',300,'Higher humidity generally changes aircraft performance this way.','Slightly reduces it',['Greatly improves it','Has no density effect','Doubles engine power'],'Water vapor is less dense than dry air, slightly increasing density altitude.'),
      q('cx-perf-400',400,'Service ceiling is commonly defined where maximum climb rate falls to this.','100 feet per minute',['Zero feet per minute','500 feet per minute','1,000 feet per minute'],'For many airplanes, the service ceiling is the altitude where maximum climb rate is 100 fpm.'),
      q('cx-perf-500',500,'At absolute ceiling, maximum rate of climb is this.','Zero',['100 feet per minute','500 feet per minute','Equal to Vx'],'No excess power remains for climb at the absolute ceiling.'),
    ],
    Regulations: [
      q('cx-reg-100',100,'Carriage of persons or property for compensation generally requires checking this part for operator-certification rules.','14 CFR Part 119',['14 CFR Part 43 only','The AIM glossary only','Airport zoning rules'],'Part 119 defines when operating certificates are required and lists exceptions.'),
      q('cx-reg-200',200,'Advertising willingness to transport people to the public is known as this.','Holding out',['Dry leasing','Private carriage','Operational control only'],'Holding out is a key element of common carriage.'),
      q('cx-reg-300',300,'Common carriage includes holding out, transport of persons or property, compensation, and this.','Transportation from place to place',['Aircraft ownership','An instrument approach','A first-class medical'],'All four elements are considered when identifying common carriage.'),
      q('cx-reg-400',400,'An aircraft provided for flight instruction generally requires a 100-hour inspection when the instructor does this.','Provides the aircraft for hire',['Only provides instruction in the owner’s aircraft','Teaches ground school','Conducts a flight review without aircraft rental'],'The inspection rule applies when carrying a person for hire or providing an aircraft for flight instruction for hire.'),
      q('cx-reg-500',500,'A wet lease includes the aircraft plus at least this.','One crewmember',['Fuel only','A hangar','Maintenance records only'],'Crew provision is a central distinction between wet and dry leasing.'),
    ],
    Systems: [
      q('cx-sys-100',100,'A turbocharger wastegate controls this.','Exhaust flow through the turbine',['Mixture cable travel','Propeller blade twist','Brake pressure'],'By bypassing exhaust around the turbine, it regulates compressor speed and manifold pressure.'),
      q('cx-sys-200',200,'Detonation is this abnormal event.','Explosive combustion after normal ignition',['Ignition before the spark','Normal flame-front travel','A magneto grounding check'],'Excessive temperature and pressure can make the remaining charge explode rather than burn smoothly.'),
      q('cx-sys-300',300,'Preignition occurs when the mixture ignites from a hot spot at this time.','Before the spark event',['After the exhaust valve opens','Only during shutdown','Exactly at normal ignition'],'Preignition can cause destructive heat and pressure and may lead to detonation.'),
      q('cx-sys-400',400,'A hydraulic system transmits force effectively because fluid is nearly this.','Incompressible',['Weightless','Magnetic','Volatile'],'Pascal’s principle allows pressure applied to a confined fluid to transmit throughout the system.'),
      q('cx-sys-500',500,'A landing-gear warning system commonly activates with gear up when power is reduced and this occurs.','A landing configuration is approached',['The mixture is leaned','The alternator is off','Cabin heat is selected'],'Actual warning logic varies, but it is designed to catch an unsafe gear-up landing configuration.'),
    ],
    Maneuvers: [
      q('cx-man-100',100,'In a steep turn, most attention should remain here.','Outside on attitude and traffic',['Fixed on one instrument','On the floor','On the checklist only'],'Outside references support attitude control and collision avoidance, with quick instrument cross-checks.'),
      q('cx-man-200',200,'In a chandelle, maximum bank is normally reached at this point in the turn.','About 90 degrees',['At rollout only','Before the turn begins','At 180 degrees'],'Bank builds during the first 90 degrees, then decreases while pitch continues to change.'),
      q('cx-man-300',300,'A lazy eight should display this quality above all.','Smooth, coordinated, constantly changing control',['Abrupt maximum-rate control','Constant pitch and bank','A fixed airspeed throughout'],'The maneuver demonstrates planning and coordination rather than mechanical checkpoints.'),
      q('cx-man-400',400,'In a power-off 180 accuracy approach, energy is managed primarily with this.','Judgment, configuration, and flightpath',['Power throughout final','A fixed base turn in all winds','Brakes before touchdown'],'The maneuver develops judgment to reach a selected landing point without power.'),
      q('cx-man-500',500,'During a steep spiral, wind correction is used to maintain this.','A constant radius around the point',['A constant heading','A constant groundspeed','A standard-rate turn'],'Bank must vary around the circle as groundspeed changes.'),
    ],
  },
  cfi: {
    Learning: [
      q('fx-learn-100',100,'The law of readiness says learning is strongest when the learner is this.','Ready and motivated',['Fatigued','Distracted','Unaware of the objective'],'Clear purpose and willingness improve learning.'),
      q('fx-learn-200',200,'The law of effect favors responses followed by this.','Satisfaction or positive outcomes',['Confusion','Punishment only','No feedback'],'Pleasant or successful results strengthen learning.'),
      q('fx-learn-300',300,'The law of recency says material practiced most recently is this.','Best remembered',['Always forgotten','Transferred negatively','Unrelated to recall'],'A useful lesson closing reinforces the most important points.'),
      q('fx-learn-400',400,'A learner blaming equipment for every error may be using this defense mechanism.','Projection',['Compensation','Repression','Fantasy only'],'Projection places responsibility for one’s own difficulty onto someone or something else.'),
      q('fx-learn-500',500,'Insight occurs when a learner does this.','Sees relationships and understands the whole problem',['Memorizes words without meaning','Avoids all practice','Copies a checklist'],'Insight connects facts, principles, and experience into meaningful understanding.'),
    ],
    Teaching: [
      q('fx-teach-100',100,'The demonstration-performance method begins with explanation, then demonstration, learner performance, and this.','Instructor supervision and evaluation',['A written test only','Immediate solo','No feedback'],'The instructor observes, coaches, and evaluates as the learner performs.'),
      q('fx-teach-200',200,'A lecture is most effective when it is organized, adapted to learners, and supported by this.','Meaningful examples and visual aids',['Unrelated stories','Maximum technical jargon','No questions'],'Varied, relevant support improves attention and comprehension.'),
      q('fx-teach-300',300,'Formative assessment occurs primarily at this time.','During learning',['Only after certification','Before the learner enrolls','Only on the practical test'],'Ongoing assessment guides improvement while learning is happening.'),
      q('fx-teach-400',400,'Building-block instruction moves from this toward more complex performance.','Known and simple elements',['The hardest task first','Random tasks','Evaluation before objectives'],'Sequenced foundations help learners integrate skills safely.'),
      q('fx-teach-500',500,'Integrated flight instruction teaches outside references together with this from the beginning.','Supporting flight-instrument indications',['Autopilot use only','IFR clearances only','No instrument reference'],'Learners connect attitude, performance, and instrument information without fixating inside.'),
    ],
    Endorsements: [
      q('fx-end-100',100,'A flight review endorsement is normally required every this many calendar months to act as PIC.','24',['6','12','36'],'Unless another qualifying event applies, a flight review is required within the preceding 24 calendar months.'),
      q('fx-end-200',200,'A high-performance endorsement applies to an airplane with an engine of more than this horsepower.','200',['150','180','250'],'Training and a one-time endorsement are required, subject to grandfather provisions.'),
      q('fx-end-300',300,'A tailwheel endorsement includes normal and crosswind takeoffs and landings, wheel landings, and this.','Go-around procedures',['Instrument approaches','Aerobatics','Formation flight'],'The pilot must receive and log the applicable ground and flight training.'),
      q('fx-end-400',400,'Practical-test preparation required by §61.39 must occur within the preceding this period.','2 calendar months',['14 days','6 calendar months','One year'],'The instructor certifies preparation within the specified two-calendar-month window.'),
      q('fx-end-500',500,'Before providing initial training to many non-U.S. citizen candidates, a school or instructor must address this program.','TSA Flight Training Security Program',['NASA ASRS','NTSB notification','Customs eAPIS for every lesson'],'Security eligibility and recordkeeping may apply before training begins.'),
    ],
    Maneuvers: [
      q('fx-fly-100',100,'A positive exchange of flight controls uses this sequence.','You have the controls; I have the controls; you have the controls',['A hand signal only','Silence and a nod','The instructor simply lets go'],'A verbal three-step exchange prevents ambiguity about who is flying.'),
      q('fx-fly-200',200,'Introducing a realistic distraction during training should never compromise this.','The safety margin',['The lesson schedule','The surprise','The learner’s radio call'],'Distraction training should be planned and controlled.'),
      q('fx-fly-300',300,'When demonstrating a maneuver, the instructor should divide attention between teaching, traffic, aircraft control, and this.','Learner understanding',['Phone notifications','Unrelated paperwork','Passenger entertainment'],'Observation of the learner helps the instructor pace and adapt the demonstration.'),
      q('fx-fly-400',400,'When teaching a go-around, the first priority is establishing this.','A safe climb configuration and aircraft control',['Immediate radio contact','Maximum flap retraction at once','A turn away from the runway'],'Apply power, manage pitch and configuration per the aircraft procedure, and maintain control.'),
      q('fx-fly-500',500,'Spin-awareness training should emphasize that stall prevention begins with managing this.','Angle of attack and coordination',['Only altitude','Only engine power','Heading indicator alignment'],'A spin requires a stalled wing plus yaw; reducing angle of attack is fundamental to recovery.'),
    ],
    Standards: [
      q('fx-std-100',100,'A CFI must generally retain records of specified endorsements for this long.','3 years',['90 days','One year','10 years'],'Section 61.189 requires specified instructor records to be retained for three years.'),
      q('fx-std-200',200,'A flight instructor may give no more than this many hours of flight training in any 24-consecutive-hour period.','8 hours',['6 hours','10 hours','12 hours'],'The flight-training limit is eight hours in any 24 consecutive hours.'),
      q('fx-std-300',300,'A CFI without a medical may instruct when not acting as PIC or as this.','A required flight crewmember',['A ground instructor','A logbook signer','An evaluator'],'Instructor privileges and medical requirements depend on the instructor’s crewmember role.'),
      q('fx-std-400',400,'Logging instruction should include date, time, aircraft or device, lesson content, and this.','The instructor’s signature and certificate details',['The fuel receipt','Weather screenshots only','The learner’s credit-card number'],'Complete records document training and support later endorsements and eligibility.'),
      q('fx-std-500',500,'An instructor should establish solo weather limits based on regulations plus this.','The learner’s demonstrated judgment and local conditions',['A single universal number','Aircraft paint color','The next renter’s schedule'],'Personalized limits account for experience, environment, aircraft, and risk.'),
    ],
  },
};

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function createExpandedTrack(track: GameTrack): GameTrack {
  return {
    ...track,
    categories: [...track.categories.map((category) => {
      const extras = EXTRA_BANK[track.id][category.shortName] || [];
      return {
        ...category,
        questions: [...category.questions, ...extras],
      };
    }), ...EXTRA_CATEGORIES[track.id]],
  };
}

export function createRandomizedTrack(track: GameTrack): GameTrack {
  const expanded = createExpandedTrack(track);
  return {
    ...expanded,
    categories: expanded.categories.map((category) => ({
      ...category,
      questions: [100, 200, 300, 400, 500].map((value) => randomItem(category.questions.filter((question) => question.value === value))),
    })),
  };
}
