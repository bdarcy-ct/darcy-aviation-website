import type { GameCategory, GameQuestion, GameTrackId } from './dGameQuestions';

const q = (id: string, value: number, clue: string, answer: string, wrong: string[], explanation: string): GameQuestion => ({ id, value, clue, answer, choices: [answer, ...wrong], explanation });

export const EXTRA_CATEGORIES: Record<GameTrackId, GameCategory[]> = {
  private: [
    { name: 'Airspace Decoder', shortName: 'Airspace', questions: [
      q('pc-air-100',100,'The airspace that begins at 18,000 feet MSL over the contiguous United States.','Class A',['Class B','Class E','Class G'],'Class A generally extends from 18,000 feet MSL up to and including FL600.'),
      q('pc-air-200',200,'A dashed magenta line on a sectional normally identifies this.','Class E airspace beginning at the surface',['Class C airspace','A military operations area','A VFR flyway'],'Surface-based Class E is shown by a dashed magenta boundary.'),
      q('pc-air-300',300,'A magenta vignette indicates Class E begins at this altitude unless otherwise noted.','700 feet AGL',['The surface','1,200 feet MSL','10,000 feet MSL'],'The shaded side of a magenta vignette marks Class E beginning at 700 feet AGL.'),
      q('pc-air-400',400,'Entry into a prohibited area is permitted only with this.','Permission from the using or controlling agency',['A VFR flight plan','A private pilot certificate','Three miles visibility'],'Prohibited areas protect security or national welfare and require authorization for entry.'),
      q('pc-air-500',500,'A Mode C veil normally extends this far from a primary Class B airport.','30 nautical miles',['10 nautical miles','20 statute miles','50 nautical miles'],'The veil generally requires altitude-reporting transponder equipment within 30 NM, subject to exceptions.'),
    ]},
    { name: 'Airport Operations', shortName: 'Airports', questions: [
      q('pc-apt-100',100,'A steady green light to an aircraft on the ground means this.','Cleared for takeoff',['Cleared to taxi','Return for landing','Stop'],'Tower light-gun signals use steady green for takeoff clearance on the ground.'),
      q('pc-apt-200',200,'A runway holding-position marking consists of this.','Two solid and two dashed yellow lines',['A single white line','Blue edge lights','Red chevrons'],'Stop on the solid-line side unless cleared across by ATC.'),
      q('pc-apt-300',300,'Runway edge lights are normally this color.','White',['Blue','Green','Amber only'],'Runway edges are white, while taxiway edges are blue.'),
      q('pc-apt-400',400,'A segmented circle provides information about this.','Traffic-pattern direction and wind indicators',['Runway strength only','Fuel prices','Class B clearance limits'],'It may contain wind and landing-direction indicators and traffic-pattern indicators.'),
      q('pc-apt-500',500,'A displaced threshold allows this operation before the threshold when markings permit.','Taxiing and takeoff roll',['Landing touchdown','Low approaches only','Parking overnight'],'The pavement before a displaced threshold may support taxi and takeoff but not landing touchdown from that direction.'),
    ]},
    { name: 'Human Performance', shortName: 'Human Factors', questions: [
      q('pc-human-100',100,'The IMSAFE checklist begins with this risk factor.','Illness',['Inexperience','Ice','Instruments'],'IMSAFE covers Illness, Medication, Stress, Alcohol, Fatigue, and Emotion/Eating.'),
      q('pc-human-200',200,'Hyperventilation is commonly treated by doing this.','Slowing and controlling breathing',['Climbing immediately','Taking more rapid breaths','Turning off cabin heat'],'Intentional slower breathing helps restore normal carbon-dioxide balance.'),
      q('pc-human-300',300,'Carbon monoxide poisoning often first resembles this.','Headache, dizziness, and fatigue',['A broken bone','Motion sickness only after landing','Improved night vision'],'CO binds strongly to hemoglobin; use cabin heat cautiously and respond promptly to symptoms or detector alerts.'),
      q('pc-human-400',400,'The hazardous attitude “It won’t happen to me” is called this.','Invulnerability',['Macho','Resignation','Antiauthority'],'The antidote is: It could happen to me.'),
      q('pc-human-500',500,'At night, staring directly at a dim object can make it disappear because of this.','The night blind spot in the fovea',['Autokinesis only','Empty-field myopia','Pressure altitude'],'Off-center viewing uses rod-rich peripheral vision to detect dim objects.'),
    ]},
    { name: 'Flight Planning', shortName: 'Planning', questions: [
      q('pc-plan-100',100,'Groundspeed equals true airspeed adjusted for this.','Wind',['Variation only','Pressure altitude only','Compass deviation only'],'Wind changes speed and direction across the ground.'),
      q('pc-plan-200',200,'A flight of 240 NM at 120 knots groundspeed takes this long.','2 hours',['1 hour','1.5 hours','2.5 hours'],'Time equals distance divided by groundspeed.'),
      q('pc-plan-300',300,'At 9 gallons per hour for 2 hours plus a 30-minute reserve, fuel required is this.','22.5 gallons',['18 gallons','20 gallons','27 gallons'],'Two and a half hours at 9 GPH requires 22.5 gallons.'),
      q('pc-plan-400',400,'The NOTAM category most likely to describe a closed runway.','Airport or movement-area NOTAM',['GPS almanac only','AIRMET Tango','Convective SIGMET'],'Runway closures and airport hazards are published through the NOTAM system.'),
      q('pc-plan-500',500,'A magnetic course of 090°, wind correction 5° left, and 3° west variation produces approximately this true heading before deviation.','098° true',['082° true','088° true','095° magnetic'],'A 5° left correction gives 085° magnetic heading; west variation is added to convert magnetic to true.'),
    ]},
    { name: 'Emergency Playbook', shortName: 'Emergencies', questions: [
      q('pc-emg-100',100,'The first action after an engine failure in flight.','Maintain aircraft control and establish the appropriate glide',['Call the tower','Change fuel tanks before pitching','Extend full flaps'],'Airspeed and control come first.'),
      q('pc-emg-200',200,'An electrical fire is initially addressed by removing this when practical.','Electrical power to the affected equipment',['All engine oil','Pitot heat only','Cabin ventilation only'],'Follow the aircraft checklist; isolate electrical sources and use the proper extinguisher.'),
      q('pc-emg-300',300,'After an alternator failure, reducing electrical load does this.','Extends remaining battery time',['Restarts the magnetos','Increases fuel pressure','Repairs the alternator'],'Conserve the battery for essential equipment and landing.'),
      q('pc-emg-400',400,'If a cabin door opens after takeoff in a typical trainer, the priority is this.','Fly the airplane and land when practical',['Reach outside immediately','Shut down the engine','Enter a steep turn'],'An open door is usually more distracting than aerodynamically dangerous; control the aircraft first.'),
      q('pc-emg-500',500,'After an off-airport landing, activating the ELT manually may be appropriate when this is true.','Rescue assistance is needed and automatic activation is uncertain',['The airplane is parked normally','ATC already closed the flight plan','The battery is low before departure'],'Use emergency signaling equipment to aid location and rescue.'),
    ]},
  ],
  instrument: [
    { name: 'Enroute Chart Lab', shortName: 'Enroute Charts', questions: [
      q('ic-chart-100',100,'A blue airport symbol on a low enroute chart generally means this.','An airport with an approved instrument approach',['A private airport only','No fuel available','Class B airspace'],'Instrument-approach airports are shown in blue; others are magenta.'),
      q('ic-chart-200',200,'MEA guarantees obstacle clearance and this navigation coverage.','Acceptable navigation signal coverage',['Radar coverage','VFR cloud clearance','A tailwind'],'Minimum enroute altitude provides obstacle clearance and adequate navaid reception on the route segment.'),
      q('ic-chart-300',300,'MOCA guarantees navaid reception within this distance of a VOR.','22 nautical miles',['10 nautical miles','50 nautical miles','The entire airway'],'MOCA provides obstacle clearance and VOR signal coverage within 22 NM.'),
      q('ic-chart-400',400,'A minimum crossing altitude requires reaching a specified altitude by this point.','A particular fix',['The final approach fix only','Top of climb','The destination airport'],'An MCA protects obstacle clearance when proceeding in a particular direction beyond a fix.'),
      q('ic-chart-500',500,'A changeover point tells pilots where to do this.','Switch primary VOR navigation from one facility to the next',['Change transponder codes','Begin descent','Cancel IFR'],'COPs balance reception and course guidance between facilities.'),
    ]},
    { name: 'Holding Patterns', shortName: 'Holding', questions: [
      q('ic-hold-100',100,'A standard holding pattern uses turns in this direction.','Right',['Left','Alternating','Toward the wind only'],'Unless nonstandard left turns are published or assigned, holding turns are right.'),
      q('ic-hold-200',200,'The three recommended holding entries are direct, parallel, and this.','Teardrop',['Procedure turn','Chandelle','Racetrack descent'],'Entry guidance divides the arrival area into direct, parallel, and teardrop sectors.'),
      q('ic-hold-300',300,'Outbound timing is adjusted primarily to achieve this inbound result.','The published inbound leg time or distance',['A constant bank angle','Maximum groundspeed','The same wind correction on both legs'],'Timing and wind correction aim to produce the desired inbound leg.'),
      q('ic-hold-400',400,'A strong crosswind correction on the outbound leg is commonly about this multiple of the inbound correction.','Three times',['One-half','Exactly the same','Five times'],'Tripling the inbound correction is a useful starting estimate for outbound wind correction.'),
      q('ic-hold-500',500,'When cleared to a fix without an expect-further-clearance time and communication fails, the pilot should use this regulatory framework.','The lost-communications route and clearance-limit rules',['VFR right-of-way rules only','Special VFR','A contact approach'],'The clearance limit, approach timing, route, and altitude rules in §91.185 govern the response.'),
    ]},
    { name: 'Navigation Systems', shortName: 'Nav Systems', questions: [
      q('ic-nav-100',100,'RAIM monitors the integrity of this navigation system.','GPS',['VOR only','DME only','ADF only'],'Receiver Autonomous Integrity Monitoring checks GPS solution integrity.'),
      q('ic-nav-200',200,'Before using GPS for an IFR approach, the procedure must be this.','Loaded from the current approved database',['Manually drawn from memory','Copied from a sectional','Entered only as latitude and longitude'],'Approved procedures should be retrieved by name from a current navigation database.'),
      q('ic-nav-300',300,'DME hold mode allows the display to continue referencing this.','A previously tuned DME station',['Any nearest airport automatically','The localizer antenna','The transponder'],'Hold decouples DME tuning from a newly selected navigation frequency.'),
      q('ic-nav-400',400,'An RNAV system permits navigation on this type of path.','Any desired path within system capability',['Only directly over ground stations','Only published VOR radials','Only in visual conditions'],'Area navigation supports flexible routes without requiring station overflight.'),
      q('ic-nav-500',500,'WAAS enables this class of vertically guided GPS approach.','LPV',['ILS Category III','PAR','Localizer back course'],'WAAS supports high-integrity angular guidance for LPV procedures.'),
    ]},
    { name: 'ATC Communications', shortName: 'ATC Comms', questions: [
      q('ic-atc-100',100,'The standard readback items include runway assignments, hold-short instructions, altitudes, and this.','Headings',['Weather only','Passenger count','Fuel price'],'Read back safety-critical clearances and instructions.'),
      q('ic-atc-200',200,'“Unable” should be used when a pilot cannot safely or legally do this.','Accept an ATC instruction or clearance',['Receive ATIS','Start the engine','Read a chart'],'Pilots retain final authority and should state limitations clearly.'),
      q('ic-atc-300',300,'A clearance to “maintain 3,000 until established” requires holding 3,000 until this.','Established on a published segment of the approach',['The airport is visible','The gear is down','Crossing the runway threshold'],'Do not descend early; meet all clearance and procedure restrictions.'),
      q('ic-atc-400',400,'When ATC says “radar contact,” this responsibility remains with the pilot.','Terrain and obstruction avoidance under applicable conditions',['All position reporting','Transponder operation','Radio monitoring'],'Radar contact does not automatically transfer every obstacle-clearance responsibility.'),
      q('ic-atc-500',500,'A pilot receiving an amended clearance should first do this before accepting it.','Understand and evaluate the entire change',['Read back only the altitude','Immediately turn before understanding','Cancel the flight plan'],'Ask for clarification or say unable if the clearance creates a safety, fuel, weather, or performance problem.'),
    ]},
    { name: 'IFR Abnormals', shortName: 'IFR Emergencies', questions: [
      q('ic-abn-100',100,'The transponder code for lost radio communications.','7600',['7500','7700','1200'],'7600 signals a communications failure.'),
      q('ic-abn-200',200,'After a vacuum failure, the pilot should cover unreliable instruments and emphasize this.','Reliable instruments and partial-panel control',['The failed indications','Outside lights only','DME groundspeed only'],'Identify the failure, reduce workload, and transition to dependable sources.'),
      q('ic-abn-300',300,'If pitot heat fails in icing, the best response is generally to do this.','Exit icing conditions promptly',['Descend regardless of terrain','Continue until the airspeed reaches zero','Turn off all electrical equipment'],'Airspeed reliability and ice accumulation can worsen rapidly; change altitude or route with ATC assistance.'),
      q('ic-abn-400',400,'A complete electrical failure in IMC makes this planning item especially important.','A no-gyro, limited-navigation diversion plan',['A higher cruise power setting','Opening cabin vents','Changing oil grade'],'Preserve control, use independent backups, communicate if possible, and get to suitable conditions or an airport.'),
      q('ic-abn-500',500,'Spatial disorientation is best countered by trusting this.','Reliable flight instruments',['Body sensations','Seat pressure','The apparent horizon in cloud'],'Vestibular sensations can be compelling and false; disciplined instrument reference is essential.'),
    ]},
  ],
  commercial: [
    { name: 'Weight & Balance', shortName: 'Weight & Balance', questions: [
      q('cc-wb-100',100,'Moment equals weight multiplied by this.','Arm',['Density altitude','Load factor','Airspeed'],'Moment is the turning effect of weight at a distance from the datum.'),
      q('cc-wb-200',200,'Adding weight aft of the current CG moves the CG this way.','Aft',['Forward','Nowhere','To the datum'],'The resulting total moment shifts the balance point toward the added weight.'),
      q('cc-wb-300',300,'A 180-pound passenger at a 40-inch arm produces this moment.','7,200 pound-inches',['4,500 pound-inches','9,000 pound-inches','220 pound-inches'],'Multiply 180 by 40.'),
      q('cc-wb-400',400,'Burning fuel from tanks ahead of the CG tends to move the CG this way.','Aft',['Forward','Exactly to zero','Outside the envelope in every case'],'Removing forward weight shifts the balance aft; verify the actual aircraft loading data.'),
      q('cc-wb-500',500,'An overweight takeoff generally increases stall speed, takeoff distance, and this.','Structural and performance risk',['Maximum range','Climb rate','Allowable load factor'],'Excess weight degrades acceleration, climb, landing performance, and structural margins.'),
    ]},
    { name: 'Weather Services', shortName: 'Weather Services', questions: [
      q('cc-wxs-100',100,'A TAF forecasts weather primarily within this area around an airport.','The terminal vicinity',['An entire state','Only the runway surface','All airspace within 100 NM'],'TAFs describe expected terminal conditions for a defined period.'),
      q('cc-wxs-200',200,'A Convective SIGMET is issued for hazards including severe thunderstorms, embedded cells, or this.','A line of thunderstorms',['Light rain','Thin cloud layers','A surface inversion only'],'Convective SIGMET criteria focus on significant thunderstorm hazards.'),
      q('cc-wxs-300',300,'A center weather advisory is issued by this organization.','A Center Weather Service Unit',['A local FBO','The NTSB','An aircraft manufacturer'],'CWSUs provide short-term aviation weather advisories to ARTCC operations.'),
      q('cc-wxs-400',400,'The Graphical Forecasts for Aviation combine observations and forecasts to support this.','A broad weather picture for flight planning',['Aircraft maintenance release','Pilot certification','Runway weight limits'],'GFA products help visualize clouds, weather, wind, icing, and turbulence.'),
      q('cc-wxs-500',500,'A pilot report is especially valuable because it provides this.','Actual conditions encountered in flight',['A guaranteed future forecast','Only airport surface weather','Regulatory authorization'],'PIREPs add real-world cloud, turbulence, icing, and visibility information.'),
    ]},
    { name: 'High-Altitude Flight', shortName: 'High Altitude', questions: [
      q('cc-high-100',100,'True airspeed for a given indicated airspeed generally does this with altitude.','Increases',['Decreases','Remains identical','Becomes groundspeed'],'Lower density requires greater true speed for the same dynamic pressure.'),
      q('cc-high-200',200,'Time of useful consciousness decreases as this increases.','Altitude',['Humidity','Runway length','Fuel octane'],'Lower oxygen partial pressure produces more rapid hypoxia.'),
      q('cc-high-300',300,'At high altitude, the gap between low-speed and high-speed buffet may become this.','Very narrow',['Unlimited','Exactly 100 knots','Independent of weight'],'The reduced margin is sometimes called coffin corner.'),
      q('cc-high-400',400,'A rapid decompression may produce fog because of this.','Temperature and pressure drop',['Fuel vapor','Engine exhaust','Static electricity only'],'Expanding cabin air cools and may condense visible moisture.'),
      q('cc-high-500',500,'Mach tuck describes a tendency for the nose to do this as shock-induced lift shifts aft.','Pitch down',['Pitch up sharply','Yaw left only','Remain fixed'],'Compressibility effects can move the center of pressure and create a nose-down pitching moment.'),
    ]},
    { name: 'Multi-Engine Concepts', shortName: 'Multi Engine', questions: [
      q('cc-me-100',100,'The critical engine is the engine whose failure most adversely affects this.','Performance and handling',['Cabin heat','Radio reception','Fuel price'],'On applicable twins, asymmetric effects make one engine more critical.'),
      q('cc-me-200',200,'Vmc is marked by this line on many airspeed indicators.','Red radial',['Blue radial','White arc','Yellow arc'],'The red radial marks minimum control speed with the critical engine inoperative under specified conditions.'),
      q('cc-me-300',300,'The blue line commonly marks this speed.','Best single-engine rate-of-climb speed',['Minimum control speed','Maximum flap speed','Best glide with both engines'],'Vyse is the target for best single-engine climb performance.'),
      q('cc-me-400',400,'After an engine failure, “identify, verify, feather” helps prevent this.','Shutting down the operating engine',['Extending the gear','Using rudder','Declaring an emergency'],'Positive identification and verification are crucial before securing an engine.'),
      q('cc-me-500',500,'Zero sideslip for best single-engine performance commonly uses a slight bank toward this.','The operating engine',['The failed engine','Whichever wing is lower','The nearest airport'],'A small bank into the good engine helps minimize drag while maintaining directional control.'),
    ]},
    { name: 'Professional Operations', shortName: 'Professionalism', questions: [
      q('cc-pro-100',100,'Operational control means authority over initiating, conducting, and doing this to a flight.','Terminating',['Advertising','Insuring','Financing'],'Responsibility for operational control is central to legal commercial operations.'),
      q('cc-pro-200',200,'A professional pilot should document maintenance discrepancies in this.','The appropriate aircraft record or discrepancy system',['A personal text only','The weather briefing','The passenger manifest only'],'Clear documentation prevents unsafe dispatch and supports maintenance action.'),
      q('cc-pro-300',300,'Pressure to complete a revenue flight despite deteriorating weather is an example of this.','External pressure',['Positive transfer','Wake turbulence','Static stability'],'External pressure can distort risk decisions and should be managed before flight.'),
      q('cc-pro-400',400,'A passenger asking a pilot to exceed a limitation should receive this response.','A clear refusal grounded in safety and regulation',['Quiet compliance','A vote among passengers','A logbook correction afterward'],'Professional authority includes setting and defending safe limits.'),
      q('cc-pro-500',500,'A strong safety culture treats a go/no-go cancellation as this.','A normal professional risk decision',['A personal failure','Evidence of poor skill','A violation of customer service'],'Conservative decisions protect people, aircraft, and the organization.'),
    ]},
  ],
  cfi: [
    { name: 'Human Behavior', shortName: 'Behavior', questions: [
      q('fc-beh-100',100,'Motivation is best described as this.','The force directing behavior toward a goal',['A physical reflex only','A test score','An aircraft limitation'],'Understanding goals and needs helps instructors create meaningful learning.'),
      q('fc-beh-200',200,'A learner refusing to acknowledge an obvious weakness may be using this defense mechanism.','Denial',['Compensation','Reaction formation','Displacement only'],'Denial protects the person from an uncomfortable reality but blocks improvement.'),
      q('fc-beh-300',300,'Anxiety can help learning at a moderate level but becomes harmful when it is this.','Excessive',['Connected to a goal','Brief','Discussed openly'],'High anxiety narrows attention, impairs memory, and interferes with performance.'),
      q('fc-beh-400',400,'A learner’s self-concept strongly affects willingness to do this.','Take risks required for learning',['Read a METAR only','Use a checklist','Pay for fuel'],'Respectful instruction builds confidence without hiding performance gaps.'),
      q('fc-beh-500',500,'A learner redirecting anger at an examiner toward an instructor demonstrates this.','Displacement',['Projection','Denial','Compensation'],'Displacement shifts emotion from its original target to a safer target.'),
    ]},
    { name: 'Communication Skills', shortName: 'Communication', questions: [
      q('fc-com-100',100,'Communication succeeds only when the receiver does this.','Understands the intended meaning',['Hears every word','Agrees completely','Takes notes'],'Transmission alone is not communication; meaning must be shared.'),
      q('fc-com-200',200,'Using unfamiliar technical jargon creates this barrier.','Lack of common experience',['Positive transfer','Primacy','Readiness'],'Instructor and learner need shared definitions and context.'),
      q('fc-com-300',300,'Active listening includes paraphrasing primarily to do this.','Confirm understanding',['End the conversation','Display authority','Avoid questions'],'Restating the learner’s message exposes misunderstandings early.'),
      q('fc-com-400',400,'An instructor’s body language can contradict this part of communication.','The spoken message',['Aircraft performance','Weather data','A regulation only'],'Nonverbal cues strongly affect credibility and interpretation.'),
      q('fc-com-500',500,'A question beginning with “What factors led to that decision?” is this type.','Open-ended',['Binary','Rhetorical only','Leading toward one word'],'Open-ended questions reveal reasoning and support higher-order learning.'),
    ]},
    { name: 'Lesson Architecture', shortName: 'Lesson Planning', questions: [
      q('fc-les-100',100,'A lesson plan begins with clear objectives and this.','Standards',['Aircraft ownership','A final grade','Marketing copy'],'Learners need to know the expected outcome and acceptable performance.'),
      q('fc-les-200',200,'A lesson introduction should gain attention, show relevance, and provide this.','An overview',['A practical-test endorsement','A surprise emergency','The final score'],'An overview organizes expectations and connects the lesson to prior learning.'),
      q('fc-les-300',300,'The conclusion of a lesson should review key points and do this.','Preview the next step',['Introduce unrelated material','Avoid learner questions','Replace assessment'],'A strong close consolidates learning and maintains continuity.'),
      q('fc-les-400',400,'A syllabus differs from a lesson plan because it organizes this.','The sequence of an entire course',['One maneuver demonstration only','A single critique','Only regulatory citations'],'The syllabus provides the overall training roadmap.'),
      q('fc-les-500',500,'Scenario-based lessons should include triggers requiring learners to do this.','Make decisions and manage risk',['Recite facts only','Follow hidden instructor commands','Ignore changing conditions'],'Good scenarios create realistic choices with observable consequences.'),
    ]},
    { name: 'Risk Management', shortName: 'Risk Management', questions: [
      q('fc-risk-100',100,'The first step in risk management is to do this.','Identify hazards',['Accept every risk','Transfer control','Complete the flight'],'Hazards must be recognized before their risk can be assessed and controlled.'),
      q('fc-risk-200',200,'Risk is commonly evaluated using likelihood and this.','Severity',['Cost only','Flight time','Student age'],'A risk matrix combines probability with consequence.'),
      q('fc-risk-300',300,'The 3P model stands for Perceive, Process, and this.','Perform',['Plan','Prevent','Prove'],'Pilots perceive hazards, process risk, and perform risk controls.'),
      q('fc-risk-400',400,'A good personal minimum is normally more conservative than this.','The regulatory minimum',['The POH limitation','A runway closure','An instructor endorsement'],'Personal minimums reflect current proficiency, conditions, and experience.'),
      q('fc-risk-500',500,'Single-pilot resource management integrates automation, task management, risk management, and this.','Aeronautical decision-making',['Only radio phraseology','Aircraft sales','Maintenance licensing'],'SRM uses all available resources to manage workload and make sound decisions.'),
    ]},
    { name: 'Assessment Lab', shortName: 'Assessment', questions: [
      q('fc-assess-100',100,'A valid assessment measures this.','What it is intended to measure',['The learner’s personality','Only speed','Instructor popularity'],'Validity ties the assessment directly to the stated objective.'),
      q('fc-assess-200',200,'A reliable assessment produces this.','Consistent results',['The highest possible score','Different standards each time','Only written feedback'],'Reliability means similar performance receives similar evaluation.'),
      q('fc-assess-300',300,'A rubric improves assessment by doing this.','Defining observable performance criteria',['Removing all judgment','Replacing objectives','Guaranteeing a pass'],'Clear criteria make expectations and feedback more consistent.'),
      q('fc-assess-400',400,'Authentic assessment evaluates learning through this.','Realistic tasks and decisions',['Rote recall only','Unrelated puzzles','Attendance'],'Real-world performance reveals integration of knowledge, risk management, and skill.'),
      q('fc-assess-500',500,'A learner self-assessment is strongest when compared against this.','Specific objective standards and evidence',['Feelings alone','Another learner’s personality','The easiest past lesson'],'Evidence-based reflection helps learners calibrate judgment and take ownership.'),
    ]},
  ],
};

export const TOTAL_CATEGORY_COUNT = 40;
