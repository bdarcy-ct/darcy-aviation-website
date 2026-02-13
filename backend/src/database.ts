import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'darcy.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      preferred_date TEXT,
      preferred_time TEXT,
      passengers INTEGER DEFAULT 1,
      is_gift_card BOOLEAN DEFAULT 0,
      experience_type TEXT DEFAULT 'Discovery Flight',
      experience_price TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fleet (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      engine TEXT,
      seats INTEGER,
      horsepower INTEGER,
      cruise_speed TEXT,
      range TEXT,
      description TEXT,
      image_url TEXT,
      available BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      text TEXT NOT NULL,
      date TEXT,
      featured BOOLEAN DEFAULT 0
    );
  `);

  // Seed data if tables are empty
  const fleetCount = db.prepare('SELECT COUNT(*) as count FROM fleet').get() as { count: number };
  if (fleetCount.count === 0) {
    const insertFleet = db.prepare(`
      INSERT INTO fleet (name, type, engine, seats, horsepower, cruise_speed, range, description, image_url, available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const fleetData = [
      ['Cessna 172 Skyhawk', 'Single Engine', 'Lycoming IO-360-L2A', 4, 180, '124 kt', '640 nm', 'The world\'s most popular training aircraft. Reliable, forgiving, and perfect for building your foundation as a pilot.', '/images/cessna172.jpg', 1],
      ['Piper PA-28 Warrior', 'Single Engine', 'Lycoming O-320-D3G', 4, 160, '117 kt', '522 nm', 'A proven trainer with excellent handling characteristics. Low-wing design offers a different flying perspective.', '/images/piper-warrior.jpg', 1],
      ['Multi-Engine Trainer', 'Twin Engine', 'Dual Lycoming', 4, 360, '160 kt', '800 nm', 'Train for your multi-engine rating in our well-maintained twin-engine aircraft.', '/images/multi-engine.jpg', 1],
      ['Full-Motion Simulator', 'Simulator', 'N/A', 2, 0, 'N/A', 'N/A', 'Practice in a risk-free environment. Our full-motion simulator is perfect for instrument training and procedure practice.', '/images/simulator.jpg', 1],
    ];

    const insertMany = db.transaction(() => {
      for (const data of fleetData) {
        insertFleet.run(...data);
      }
    });
    insertMany();
  }

  const testimonialCount = db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number };
  if (testimonialCount.count === 0) {
    const insertTestimonial = db.prepare(`
      INSERT INTO testimonials (name, rating, text, date, featured)
      VALUES (?, ?, ?, ?, ?)
    `);

    const testimonialData = [
      ['Michael R.', 5, 'Brent and his team at Darcy are top notch. They were always available to talk and breakdown the process and progress for our son who trained there to get his private pilot license before he started college.', '2024-08-15', 1],
      ['James T.', 5, 'If you are looking for the best flight training school in the NY/CT area look no further than Darcy Aviation. Brent and his team of experienced instructors are truly professional and knowledgeable.', '2024-07-22', 1],
      ['Captain David L.', 5, 'Darcy Aviation is a class act. As a professional pilot for a major airline, it had been nearly 15 years since flying GA. I wanted to take my kid up flying and Darcy made that happen... in an epic way.', '2024-06-10', 1],
      ['Sarah K.', 5, 'I had an excellent experience receiving my Private Pilots License at Darcy Aviation. My instructor John was able to help me pass my check ride.', '2024-05-18', 1],
      ['Alex M.', 5, 'I am currently a student pilot working towards my PPL and I have nothing less than incredible things to say. Brent creates a family like culture.', '2024-09-02', 1],
      ['Rachel W.', 5, 'Had an amazing experience at Darcy Aviation! My CFI, Archana, is fantastic. All the planes are in great condition. Highly recommend!', '2024-10-05', 1],
    ];

    const insertMany = db.transaction(() => {
      for (const data of testimonialData) {
        insertTestimonial.run(...data);
      }
    });
    insertMany();
  }

  console.log('✅ Database initialized and seeded');
}

export default db;
