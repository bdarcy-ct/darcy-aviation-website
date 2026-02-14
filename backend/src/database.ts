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

  // Seed site content — uses INSERT OR IGNORE so new entries are added
  // without overwriting existing CMS edits
  {
    const insertContent = db.prepare('INSERT OR IGNORE INTO site_content (section, key, content) VALUES (?, ?, ?)');
    
    const defaultContent = [
      // Hero Section
      ['hero', 'headline', 'Take Flight at Darcy Aviation'],
      ['hero', 'subheadline', "Connecticut's premier flight training destination. Professional instruction, premium fleet, and unforgettable scenic tours at Danbury Municipal Airport."],
      ['hero', 'cta_text', 'Book an Experience'],
      ['hero', 'cta_link', '/experiences'],
      ['hero', 'cta_secondary_text', 'Explore Programs →'],
      ['hero', 'cta_secondary_link', '/training'],
      ['hero', 'badge_text', 'Now accepting students at KDXR — Danbury, CT'],
      ['hero', 'stat_students', '600+'],
      ['hero', 'stat_days', '7'],
      ['hero', 'stat_rating', '4.9★'],
      ['hero', 'stat_established', '2019'],

      // About Section
      ['about', 'story_title', 'Our Story'],
      ['about', 'story_p1', 'Founded in 2019, Darcy Aviation was born from a simple vision: to create the best flight training experience in the New York/Connecticut area. Located at Danbury Municipal Airport (KDXR), we have grown from a small operation into one of the region\'s most respected flight schools.'],
      ['about', 'story_p2', 'Our founder, Brent Darcy, set out to build more than just a flight school — he wanted to create a community. A place where students feel like family, where instructors genuinely care about each student\'s progress, and where the joy of aviation is shared every single day.'],
      ['about', 'story_p3', 'Today, with over 600 students trained, a premium fleet of well-maintained aircraft, and a team of experienced instructors, Darcy Aviation continues to set the standard for flight training in Connecticut.'],
      ['about', 'team_brent', 'Brent founded Darcy Aviation with a vision to create a premier flight training environment in Connecticut.'],
      ['about', 'team_john', 'Dedicated CFI known for patient instruction and helping students pass their checkrides with confidence.'],
      ['about', 'team_archana', 'An exceptional CFI who brings enthusiasm and expertise to every lesson. A student favorite.'],

      // Contact Info
      ['contact', 'phone', '(203) 617-0645'],
      ['contact', 'email', 'admin@darcyaviation.com'],
      ['contact', 'address', '1 Wallingford Rd, Danbury, CT 06810'],
      ['contact', 'hours', '7 Days/Week, 9AM–5PM'],
      ['contact', 'facebook', 'https://www.facebook.com/darcyaviation/'],
      ['contact', 'instagram', 'https://www.instagram.com/darcyaviation/'],
      ['contact', 'google_maps', 'https://www.google.com/maps?q=Darcy+Aviation+Danbury+CT'],

      // Training Overview
      ['training', 'headline', 'Flight Training Programs'],
      ['training', 'subheadline', 'From your first flight to advanced ratings — structured programs with experienced CFIs who care about your success.'],
      ['training', 'ppl_desc', 'Start your aviation journey with our comprehensive Private Pilot License program.'],
      ['training', 'instrument_desc', 'Master flying in all weather conditions and expand your capabilities as a pilot.'],
      ['training', 'commercial_desc', 'Turn your passion into a career with our Commercial Pilot License program.'],
      ['training', 'multiengine_desc', 'Add multi-engine to your certificate with our twin-engine training program.'],

      // Maintenance
      ['maintenance', 'headline', 'Aircraft Maintenance Services'],
      ['maintenance', 'subheadline', 'FAA-certified A&P/IA mechanics. Annuals, 100-hour inspections, engine overhauls, and custom needs tailored to your aircraft.'],
      ['maintenance', 'services', 'Annual Inspections, 100-Hour Inspections, Oil Changes, Engine Overhauls, Avionics Installation & Repair, Pre-Buy Inspections'],

      // Experiences
      ['experiences', 'headline', 'Unforgettable Flying Experiences'],
      ['experiences', 'subheadline', 'From your first discovery flight to a breathtaking night tour over the Manhattan skyline — five unique flying experiences for every occasion.'],
      ['experiences', 'discovery_price', '$249'],
      ['experiences', 'candlewood_price', '$290'],
      ['experiences', 'westpoint_price', '$379'],
      ['experiences', 'nyc_price', '$550'],
      ['experiences', 'citylights_price', '$680'],

      // Fleet
      ['fleet', 'headline', 'Our Aircraft Fleet'],
      ['fleet', 'subheadline', 'Modern, well-maintained Cessna and Piper aircraft plus an AATD full-motion simulator.'],

      // CTA / General
      ['cta', 'headline', 'Ready to Start Your Aviation Journey?'],
      ['cta', 'subheadline', "Whether you're dreaming of your private pilot license or looking for a unique gift, we're here to help you take flight."],
      ['cta', 'primary_text', 'Book a Discovery Flight — $249'],
      ['cta', 'primary_link', '/book'],
      ['cta', 'gift_link', 'https://www.flightcircle.com/shop/97822f668fb9/4000001831'],
    ];

    const insertMany = db.transaction(() => {
      for (const [section, key, content] of defaultContent) {
        insertContent.run(section, key, content);
      }
    });
    insertMany();
  }

  // Seed FAQ data if empty
  const faqCount = db.prepare('SELECT COUNT(*) as count FROM faqs').get() as { count: number };
  if (faqCount.count === 0) {
    const insertFaq = db.prepare('INSERT INTO faqs (question, answer, category, sort_order, is_active) VALUES (?, ?, ?, ?, 1)');
    
    const faqData = [
      // Flight Training
      ['How long does it take to get a Private Pilot License?', 'Most students complete their PPL in 3-6 months, depending on how frequently they fly. The FAA requires a minimum of 40 flight hours, but the national average is around 60-70 hours. Flying 2-3 times per week is recommended for the best learning curve.', 'training', 1],
      ['Do I need any experience to start flying?', 'No prior experience is needed! Everyone starts from zero. You must be at least 16 years old to fly solo and 17 to earn your private pilot certificate. You will also need an FAA medical certificate, which we can help you obtain.', 'training', 2],
      ['What is a Discovery Flight?', 'A discovery flight is a 30-minute introductory flight where you actually take the controls of the aircraft under the guidance of a certified flight instructor. It is the perfect way to experience flying before committing to a full training program. Discovery flights are $249 and make great gifts!', 'training', 3],
      ['How often should I fly during training?', 'We recommend flying at least 2-3 times per week for optimal progress and knowledge retention. Flying less frequently can extend your training timeline and overall cost. We are open 7 days a week to accommodate your schedule.', 'training', 4],
      ['What ratings and certificates do you offer?', 'We offer Private Pilot License (PPL), Instrument Rating (IR), Commercial Pilot License (CPL), and Multi-Engine Rating. We also have a full-motion simulator for instrument training and procedure practice.', 'training', 5],
      ['What aircraft will I train in?', 'Our fleet includes Cessna 172 Skyhawks and Piper PA-28 Warriors for primary training, a multi-engine trainer for your multi-engine rating, and a full-motion simulator. All our aircraft are meticulously maintained.', 'training', 6],
      // Costs & Scheduling
      ['How much does flight training cost?', 'The total cost varies based on the certificate or rating you are pursuing and your individual learning pace. A Private Pilot License typically costs between $12,000-$18,000 total. Contact us for a detailed breakdown and personalized estimate based on your goals.', 'pricing', 10],
      ['Do you offer financing or payment plans?', 'We can discuss payment options that work for your budget. Reach out to us and we will find a solution that makes your aviation dreams achievable.', 'pricing', 11],
      ['What are your hours of operation?', 'We are open 7 days a week, from 9:00 AM to 5:00 PM. We can sometimes accommodate early morning or evening flights by arrangement.', 'booking', 12],
      ['Do you offer gift cards?', 'Yes! Gift cards are available for discovery flights and can be purchased online through our Flight Circle page. They make unforgettable gifts for aviation enthusiasts, birthdays, holidays, and special occasions.', 'booking', 13],
      // Aircraft Maintenance
      ['What maintenance services do you offer?', 'We offer annual inspections, 100-hour inspections, oil changes, engine overhauls, avionics installation and repair, and pre-buy inspections. Our FAA-certified A&P/IA mechanics handle everything from routine maintenance to major repairs.', 'aircraft', 20],
      ['What types of aircraft do you service?', 'We specialize in Cessna and Piper aircraft maintenance. Whether you fly a Cessna 172, Piper Warrior, or similar single and light twin-engine aircraft, our experienced mechanics can keep it in top condition.', 'aircraft', 21],
      ['How do I schedule a maintenance appointment?', 'Simply call us at (203) 617-0645 or send us a message through our contact page. We will work with you to find a convenient time and discuss the scope of work needed.', 'aircraft', 22],
    ];

    const insertMany = db.transaction(() => {
      for (const [question, answer, category, sort_order] of faqData) {
        insertFaq.run(question, answer, category, sort_order);
      }
    });
    insertMany();
    console.log('✅ FAQs seeded with real content');
  }

  // Seed page meta — INSERT OR IGNORE so new pages are added without overwriting edits
  {
    const insertMeta = db.prepare('INSERT OR IGNORE INTO pages_meta (page_slug, title, description) VALUES (?, ?, ?)');
    
    const defaultMeta = [
      ['home', 'Darcy Aviation — Premier Flight Training & Scenic Tours | KDXR Danbury CT', 'Darcy Aviation — premier flight training and aircraft maintenance at Danbury Municipal Airport (KDXR), Connecticut. Discovery flights from $249. Private Pilot through Commercial licenses.'],
      ['about', 'About Us — Darcy Aviation | KDXR Danbury CT', 'Learn about Darcy Aviation — founded in 2019 at Danbury Municipal Airport (KDXR), Connecticut. Meet our team of experienced flight instructors and mechanics.'],
      ['training', 'Flight Training Programs — Darcy Aviation', 'From Private Pilot License to Commercial training — comprehensive flight programs with experienced CFIs at KDXR.'],
      ['fleet', 'Our Aircraft Fleet — Darcy Aviation', 'Modern, well-maintained Cessna and Piper aircraft plus full-motion simulator at KDXR.'],
      ['maintenance', 'Aircraft Maintenance — Darcy Aviation', 'FAA-certified A&P/IA mechanics. Annuals, 100-hour inspections, engine overhauls at KDXR Danbury CT.'],
      ['contact', 'Contact Us — Darcy Aviation', 'Get in touch with Darcy Aviation — call (203) 617-0645, email admin@darcyaviation.com, or visit us at 1 Wallingford Rd, Danbury, CT 06810.'],
      ['faq', 'FAQ — Darcy Aviation', 'Frequently asked questions about flight training, costs, scheduling, and aircraft maintenance at Darcy Aviation in Danbury, CT.'],
      ['experiences', 'Scenic Tours & Flying Experiences — Darcy Aviation', 'Discovery flights, Candlewood Lake, West Point, NYC Skyline, and City Lights night tours from Danbury CT.'],
      ['book', 'Book Now — Darcy Aviation', 'Book a discovery flight, scenic tour, or start your flight training at Darcy Aviation, KDXR Danbury CT.'],
    ];

    const insertMany = db.transaction(() => {
      for (const [slug, title, description] of defaultMeta) {
        insertMeta.run(slug, title, description);
      }
    });
    insertMany();
  }

  // One-time migration: update old placeholder content with real values
  // Only updates if the content still matches the original placeholder
  const migrations = [
    ['hero', 'headline', 'Welcome to Darcy Aviation', 'Take Flight at Darcy Aviation'],
    ['hero', 'subheadline', 'Professional flight training in the heart of Connecticut', "Connecticut's premier flight training destination. Professional instruction, premium fleet, and unforgettable scenic tours at Danbury Municipal Airport."],
    ['hero', 'cta_text', 'Start Your Journey', 'Book an Experience'],
    ['hero', 'cta_link', '/training', '/experiences'],
    ['about', 'main_text', 'Darcy Aviation has been training pilots for over 15 years...', 'Founded in 2019, Darcy Aviation was born from a simple vision: to create the best flight training experience in the New York/Connecticut area. Located at Danbury Municipal Airport (KDXR), we have grown from a small operation into one of the region\'s most respected flight schools.'],
    ['about', 'team_info', 'Our experienced instructors are dedicated to your success...', 'Our founder, Brent Darcy, set out to build more than just a flight school — he wanted to create a community. A place where students feel like family, where instructors genuinely care about each student\'s progress, and where the joy of aviation is shared every single day.'],
    ['contact', 'phone', '(203) 555-0123', '(203) 617-0645'],
    ['contact', 'email', 'info@darcyaviation.com', 'admin@darcyaviation.com'],
    ['contact', 'address', '123 Airport Road, Danbury, CT 06810', '1 Wallingford Rd, Danbury, CT 06810'],
    ['contact', 'hours', 'Monday-Friday: 8AM-6PM, Saturday-Sunday: 9AM-5PM', '7 Days/Week, 9AM–5PM'],
    // Update SEO meta too
  ];

  const migrateContent = db.prepare('UPDATE site_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE section = ? AND key = ? AND content = ?');
  const migrateMeta = db.prepare('UPDATE pages_meta SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE page_slug = ? AND title = ?');

  const runMigrations = db.transaction(() => {
    for (const [section, key, oldVal, newVal] of migrations) {
      migrateContent.run(newVal, section, key, oldVal);
    }
    // Update SEO meta from old values to new
    migrateMeta.run(
      'Darcy Aviation — Premier Flight Training & Scenic Tours | KDXR Danbury CT',
      'Darcy Aviation — premier flight training and aircraft maintenance at Danbury Municipal Airport (KDXR), Connecticut. Discovery flights from $249. Private Pilot through Commercial licenses.',
      'home',
      'Darcy Aviation - Professional Flight Training'
    );
    migrateMeta.run(
      'About Us — Darcy Aviation | KDXR Danbury CT',
      'Learn about Darcy Aviation — founded in 2019 at Danbury Municipal Airport (KDXR), Connecticut. Meet our team of experienced flight instructors and mechanics.',
      'about',
      'About Us - Darcy Aviation'
    );
  });
  runMigrations();

  console.log('✅ Database initialized and seeded');
}

export default db;
