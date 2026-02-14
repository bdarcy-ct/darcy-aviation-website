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

    -- CMS Admin Tables
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      key TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(section, key)
    );

    CREATE TABLE IF NOT EXISTS media_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT,
      file_size INTEGER,
      file_path TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pages_meta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_slug TEXT UNIQUE NOT NULL,
      title TEXT,
      description TEXT,
      og_title TEXT,
      og_description TEXT,
      og_image TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // Seed admin user if none exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (adminCount.count === 0) {
    // We'll handle password hashing in the admin routes file
    const bcrypt = require('bcryptjs');
    const defaultPassword = bcrypt.hashSync('darcy2026', 10);
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', defaultPassword);
    console.log('✅ Default admin user created (admin/darcy2026)');
  }

  // Seed default site content
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM site_content').get() as { count: number };
  if (contentCount.count === 0) {
    const insertContent = db.prepare('INSERT INTO site_content (section, key, content) VALUES (?, ?, ?)');
    
    const defaultContent = [
      ['hero', 'headline', 'Welcome to Darcy Aviation'],
      ['hero', 'subheadline', 'Professional flight training in the heart of Connecticut'],
      ['hero', 'cta_text', 'Start Your Journey'],
      ['hero', 'cta_link', '/training'],
      ['about', 'main_text', 'Darcy Aviation has been training pilots for over 15 years...'],
      ['about', 'team_info', 'Our experienced instructors are dedicated to your success...'],
      ['contact', 'phone', '(203) 555-0123'],
      ['contact', 'email', 'info@darcyaviation.com'],
      ['contact', 'address', '123 Airport Road, Danbury, CT 06810'],
      ['contact', 'hours', 'Monday-Friday: 8AM-6PM, Saturday-Sunday: 9AM-5PM'],
    ];

    const insertMany = db.transaction(() => {
      for (const [section, key, content] of defaultContent) {
        insertContent.run(section, key, content);
      }
    });
    insertMany();
  }

  // Seed default page meta
  const metaCount = db.prepare('SELECT COUNT(*) as count FROM pages_meta').get() as { count: number };
  if (metaCount.count === 0) {
    const insertMeta = db.prepare('INSERT INTO pages_meta (page_slug, title, description) VALUES (?, ?, ?)');
    
    const defaultMeta = [
      ['home', 'Darcy Aviation - Professional Flight Training', 'Learn to fly with Connecticut\'s premier flight school. Professional training, modern fleet, experienced instructors.'],
      ['about', 'About Us - Darcy Aviation', 'Learn about our experienced team and commitment to aviation excellence.'],
      ['training', 'Flight Training Programs - Darcy Aviation', 'From Private Pilot License to Commercial training - comprehensive flight programs.'],
      ['fleet', 'Our Aircraft Fleet - Darcy Aviation', 'Modern, well-maintained aircraft for all your training needs.'],
      ['maintenance', 'Aircraft Maintenance - Darcy Aviation', 'Professional aircraft maintenance services by certified technicians.'],
      ['contact', 'Contact Us - Darcy Aviation', 'Get in touch with our team to start your aviation journey.'],
    ];

    const insertMany = db.transaction(() => {
      for (const [slug, title, description] of defaultMeta) {
        insertMeta.run(slug, title, description);
      }
    });
    insertMany();
  }

  console.log('✅ Database initialized and seeded');
}

export default db;
