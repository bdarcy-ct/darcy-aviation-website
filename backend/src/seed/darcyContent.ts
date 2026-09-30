// Hard-coded snapshot of Darcy Aviation's fleet and instructors, taken from the
// live CMS at darcyaviation.com on 2026-09-30. This is the safety net: if the
// database is ever empty (fresh volume, lost data), the site re-seeds from here,
// and the photos referenced below ship with the app in backend/bundled-uploads/.
// The CMS stays the source of truth — edits made there are never overwritten.
// Keep this file in sync with frontend/src/data/darcyContent.ts.
export interface SeedAircraft {
  name: string; type: string; engine: string; seats: number; horsepower: number;
  cruise_speed: string; range: string; description: string; image_url: string;
  images: string[]; available: number; sort_order: number;
}

export interface SeedTeamMember {
  name: string; role: string; bio: string; photo_url: string; sort_order: number; is_active: number;
}
export const SNAPSHOT_DATE = '2026-09-30';

export const DARCY_FLEET: SeedAircraft[] = [
  {
    "name": "Piper PA-28 - N8715C",
    "type": "Single Engine",
    "engine": "",
    "seats": 4,
    "horsepower": 150,
    "cruise_speed": "117 kt",
    "range": "",
    "description": "A proven trainer with excellent handling characteristics. Low-wing design offers a different flying perspective.",
    "image_url": "/uploads/1790782842677-02fe7566b3f2423ab630217839e6a052.jpg",
    "images": [
      "/uploads/1790782842677-02fe7566b3f2423ab630217839e6a052.jpg"
    ],
    "available": 1,
    "sort_order": 1
  },
  {
    "name": "C-172N - N121MS",
    "type": "Single Engine",
    "engine": "",
    "seats": 4,
    "horsepower": 160,
    "cruise_speed": "124",
    "range": "",
    "description": "The Cessna 172N is one of the most recognizable and trusted training aircraft in general aviation. N121MS provides a stable, predictable platform for student pilots while offering the performance and capability needed throughout primary flight training.",
    "image_url": "/uploads/1790782515009-604e408b2e884bc9b097bfb31f5375bc.jpg",
    "images": [
      "/uploads/1790782515009-604e408b2e884bc9b097bfb31f5375bc.jpg"
    ],
    "available": 1,
    "sort_order": 2
  },
  {
    "name": "Full-Motion Simulator",
    "type": "Simulator",
    "engine": "N/A",
    "seats": 2,
    "horsepower": 0,
    "cruise_speed": "N/A",
    "range": "N/A",
    "description": "Practice in a risk-free environment. Our full-motion simulator is perfect for instrument training and procedure practice.",
    "image_url": "/uploads/1790783101553--DSC0752-edited.png",
    "images": [
      "/uploads/1790783101553--DSC0752-edited.png"
    ],
    "available": 1,
    "sort_order": 3
  },
  {
    "name": "C-172N - N6475D",
    "type": "Single Engine",
    "engine": "",
    "seats": 4,
    "horsepower": 160,
    "cruise_speed": "124",
    "range": "",
    "description": "The Cessna 172N is one of the most recognizable and trusted training aircraft in general aviation.",
    "image_url": "/uploads/1790782591831-0e7024f1deb745478d895dd4b8967628.jpg",
    "images": [
      "/uploads/1790782591831-0e7024f1deb745478d895dd4b8967628.jpg"
    ],
    "available": 1,
    "sort_order": 4
  },
  {
    "name": "C-172N - N9426E",
    "type": "Single Engine",
    "engine": "",
    "seats": 4,
    "horsepower": 180,
    "cruise_speed": "130",
    "range": "",
    "description": "The Cessna 172N is one of the most recognizable and trusted training aircraft in general aviation.",
    "image_url": "",
    "images": [],
    "available": 1,
    "sort_order": 5
  },
  {
    "name": "C-172N - N5546J",
    "type": "Single Engine",
    "engine": "",
    "seats": 4,
    "horsepower": 160,
    "cruise_speed": "124",
    "range": "",
    "description": "The Cessna 172N is one of the most recognizable and trusted training aircraft in general aviation.",
    "image_url": "",
    "images": [],
    "available": 1,
    "sort_order": 6
  },
  {
    "name": "C-152 - N65563",
    "type": "Single Engine",
    "engine": "",
    "seats": 2,
    "horsepower": 110,
    "cruise_speed": "101",
    "range": "",
    "description": "The Cessna 152 is a compact, economical two-seat trainer that has been a staple of flight schools for decades. N65563 provides an approachable platform for pilots developing the fundamentals of flight.",
    "image_url": "/uploads/1790782950247-8a3da766f73746a89ab21bc3c28beeaf.jpg",
    "images": [
      "/uploads/1790782950247-8a3da766f73746a89ab21bc3c28beeaf.jpg"
    ],
    "available": 1,
    "sort_order": 7
  },
  {
    "name": "Piper PA-28 - N84001",
    "type": "Single Engine",
    "engine": "",
    "seats": 4,
    "horsepower": 160,
    "cruise_speed": "117",
    "range": "",
    "description": "The Piper Warrior is a proven flight-training aircraft known for its responsive handling and practical design. N84001 gives students an opportunity to develop their flying skills in a different training platform while building the fundamentals needed to become a confident pilot.",
    "image_url": "/uploads/1790783036763-511eff22861642e78473f326e27d993e.jpg",
    "images": [
      "/uploads/1790783036763-511eff22861642e78473f326e27d993e.jpg"
    ],
    "available": 1,
    "sort_order": 8
  },
  {
    "name": "Cirrus SR20 - N43VU",
    "type": "Single Engine",
    "engine": "",
    "seats": 4,
    "horsepower": 215,
    "cruise_speed": "160",
    "range": "",
    "description": "The Cirrus SR20 brings a modern approach to flight training. N43VU combines advanced avionics, strong performance, and the Cirrus design philosophy to give pilots experience in a more technologically advanced aircraft.",
    "image_url": "/uploads/1790783578005-IMG-5800.jpeg",
    "images": [
      "/uploads/1790783578005-IMG-5800.jpeg",
      "/uploads/1790783580286-IMG-5814--1-.jpeg"
    ],
    "available": 1,
    "sort_order": 9
  }
];

export const DARCY_TEAM: SeedTeamMember[] = [
  {
    "name": "Brent Darcy",
    "role": "Owner, CFI-I",
    "bio": "Brent graduated with a Bachelors Degree in Aeronautical Sciences and was a Flight Specialist at Embry-Riddle Aeronautical University. He's been an FAA Flight Instructor for over 30 years. Brent was an FAA Part 135 Flight Operations Manager that controlled more than 125 executive jets and 400+ pilots, including a corporate pilot himself. He was an FAA Part 121 Instructor Pilot for a Delta Airlines Connector. When Brent isn't flying, he enjoys boating, reading and spending time with his dogs.",
    "photo_url": "/uploads/team-1790693905340.jpeg",
    "sort_order": 1,
    "is_active": 1
  },
  {
    "name": "Jared Russo",
    "role": "CFI-I",
    "bio": "Jared is a flight instructor who has recently graduated with a Bachelors in Aviation Management at The Florida Insitutue of Technology. He enjoys sharing his love and knowledge of aviation with other aspiring pilots. When he is not flying, Jared enjoys spending time on the beach, reading and working out.",
    "photo_url": "/uploads/team-1790693955826.jpg",
    "sort_order": 2,
    "is_active": 1
  },
  {
    "name": "Kyndal Mynheir",
    "role": "CFI-I",
    "bio": "A true Hoosier, born and raised in Indiana, Kyndal found aviation after graduating high school. She recieved her private license from Sweet Aviation near her home town. Soon after she moved to Florida to continue persuing her dreams of becoming pilot, receiving the rest of her cerificates in ratings. Other than flying, she loves staying active, partaking in calisthenics and working out at the gym.",
    "photo_url": "/uploads/team-1790694011774.png",
    "sort_order": 3,
    "is_active": 1
  },
  {
    "name": "Michael Dayya",
    "role": "CFI-I",
    "bio": "Michael has been flying since 2023 and has a Bachelor of Science from UConn. In addition to aviation, he is passionate about applied science which gives him unique insight towards his instruction. In his spare time, he enjoys fly-fishing, and playing both the guitar and piano.",
    "photo_url": "/uploads/team-1790694077717.JPG",
    "sort_order": 4,
    "is_active": 1
  },
  {
    "name": "Matthew Potashnikov",
    "role": "CFI-I",
    "bio": "Matthew is a CFI-I and MEI from Boston who completed the ATP Career Pilot Program in August 2023. He enjoys helping students succeed and progress on their aviation journey, always doing his best to make sure students accomplish their dreams of flying. Matthew has aspirations to eventually get into corporate aviation, but has a commitment to quality flight instruction. In his free time, he enjoys fishing and reading.",
    "photo_url": "/uploads/team-1790694118762.jpg",
    "sort_order": 5,
    "is_active": 1
  },
  {
    "name": "Jack Clark",
    "role": "CFI",
    "bio": "Jack has been flying seriously for the past three years, however aviation has been apart of his life for as long as he can remember. He's passionate about sharing his knowledge and enthusiasm with aspiring aviators. Outside of flying, Jack enjoys spending time with family and friends, golfing and hiking. \r\n",
    "photo_url": "/uploads/team-1790694155081.jpeg",
    "sort_order": 6,
    "is_active": 1
  },
  {
    "name": "Dena Frederick",
    "role": "CFI-I",
    "bio": "Dena is a CFI-I from New York who began her training at ATP Career Pilot Program and then completed her instructor ratings at Darcy Aviation. Before pursuing aviation she worked as a teacher and a performance coach, bringing her enthusiasm for training into flight instruction. In her free time she enjoys spending quality time with friends and family.",
    "photo_url": "",
    "sort_order": 7,
    "is_active": 1
  },
  {
    "name": "Sam Edwards",
    "role": "CFI-I",
    "bio": "Sam is a Certified Flight Instructor (CFI/CFII) who has been flying since 2019 and started instructing in 2026. He's worked in prehospital healthcare for the past 16 years, bringing the ability to teach and work calmly under pressure with him into aviation. When he's not at either job, you can find him fixing things around his home, taking care of his plants, or reading a good book.",
    "photo_url": "/uploads/team-1790694446352.jpg",
    "sort_order": 8,
    "is_active": 1
  },
  {
    "name": "Davis Thompson",
    "role": "CFI",
    "bio": "Davis is a third generation aviator, raised in Virginia. He received his PPL at Embry-Riddle in Daytona and attended Oklahoma State University to receive Instrument, CMEL, and CFI. When he's not in the air, Davis enjoys fishing, camping, storm chasing, and golfing.",
    "photo_url": "",
    "sort_order": 9,
    "is_active": 1
  }
];
