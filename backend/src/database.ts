import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use Railway volume (/data) if available, otherwise local ./data
const dataDir = fs.existsSync('/data') ? '/data' : path.join(__dirname, '../../data');
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
      images TEXT DEFAULT '[]',
      available BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      text TEXT NOT NULL,
      date TEXT,
      featured BOOLEAN DEFAULT 0,
      source TEXT DEFAULT 'internal'
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

    CREATE TABLE IF NOT EXISTS service_tiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      link TEXT NOT NULL,
      icon_svg TEXT,
      images TEXT, -- JSON array of image paths
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Training Programs CMS
    CREATE TABLE IF NOT EXISTS training_programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      program_name TEXT NOT NULL,
      hero_title TEXT NOT NULL,
      hero_subtitle TEXT NOT NULL,
      hero_description TEXT NOT NULL,
      hero_icon_svg TEXT,
      overview TEXT, -- JSON array of overview paragraphs
      requirements TEXT, -- JSON array of requirements
      curriculum TEXT, -- JSON array of curriculum sections
      timeline_duration TEXT,
      timeline_frequency TEXT,
      timeline_details TEXT,
      cost_note TEXT,
      hide_cost_quote BOOLEAN DEFAULT 0,
      fleet_used TEXT, -- JSON array of fleet items
      faqs TEXT, -- JSON array of FAQ items
      cta_text TEXT NOT NULL,
      cta_link TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Experiences CMS
    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_svg TEXT,
      highlights TEXT, -- JSON array of highlights
      booking_url TEXT, -- FlightCircle or external booking link
      featured BOOLEAN DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Maintenance Services CMS
    CREATE TABLE IF NOT EXISTS maintenance_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_svg TEXT,
      details TEXT, -- JSON array of detail paragraphs
      includes TEXT, -- JSON array of included items
      note TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Certified Flight Instructor',
      bio TEXT NOT NULL DEFAULT '',
      photo_url TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrations: add columns to existing tables
  try { db.prepare("SELECT images FROM fleet LIMIT 1").get(); }
  catch { db.exec("ALTER TABLE fleet ADD COLUMN images TEXT DEFAULT '[]'"); }

  try { db.prepare("SELECT booking_url FROM experiences LIMIT 1").get(); }
  catch { db.exec("ALTER TABLE experiences ADD COLUMN booking_url TEXT"); }

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
      INSERT INTO testimonials (name, rating, text, date, featured, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const testimonialData = [
      // Google Reviews
      ['Michael R.', 5, 'Brent and his team at Darcy are top notch. They were always available to talk and breakdown the process and progress for our son who trained there to get his private pilot license before he started college.', '2024-08-15', 1, 'google'],
      ['James T.', 5, 'If you are looking for the best flight training school in the NY/CT area look no further than Darcy Aviation. Brent and his team of experienced instructors are truly professional and knowledgeable.', '2024-07-22', 1, 'google'],
      ['Captain David L.', 5, 'Darcy Aviation is a class act. As a professional pilot for a major airline, it had been nearly 15 years since flying GA. I wanted to take my kid up flying and Darcy made that happen... in an epic way.', '2024-06-10', 1, 'google'],
      ['Sarah K.', 5, 'I had an excellent experience receiving my Private Pilots License at Darcy Aviation. My instructor John was able to help me pass my check ride.', '2024-05-18', 1, 'google'],
      ['Alex M.', 5, 'I am currently a student pilot working towards my PPL and I have nothing less than incredible things to say. Brent creates a family like culture.', '2024-09-02', 1, 'google'],
      ['Rachel W.', 5, 'Had an amazing experience at Darcy Aviation! My CFI, Archana, is fantastic. All the planes are in great condition. Highly recommend!', '2024-10-05', 1, 'google'],
      ['Christopher P.', 5, 'Outstanding flight school! The instructors are patient, knowledgeable, and really care about your success. Just got my PPL and couldn\'t be happier with the training I received.', '2024-09-28', 1, 'google'],
      ['Jennifer M.', 5, 'Brent runs an exceptional operation. From discovery flight to checkride, every step was professional and well-organized. The aircraft are well-maintained and the facilities are top-notch.', '2024-11-12', 1, 'google'],
      ['Thomas K.', 5, 'Great experience training here. The instructors adapt to your learning style and the scheduling is very flexible. Passed my instrument rating on the first try thanks to their thorough training.', '2024-10-20', 1, 'google'],
      ['Lisa D.', 5, 'Fantastic flight school! The staff is friendly, professional, and creates a welcoming environment. My teenage son got his PPL here and loved every minute of it.', '2024-07-03', 1, 'google'],
      ['Mark B.', 5, 'Darcy Aviation exceeded my expectations. From ground school to solo flight, everything was well-structured and safe. Highly recommend for anyone serious about aviation.', '2024-08-30', 1, 'google'],
      ['Amanda S.', 5, 'Best decision I made was choosing Darcy Aviation for my flight training. Brent and the team are incredible. Just passed my commercial checkride!', '2024-12-01', 1, 'google'],
      // Internal testimonials (website/other sources)
      ['Robert H.', 5, 'The maintenance team at Darcy Aviation is exceptional. They take great care of our aircraft and always explain what needs to be done. Trustworthy and professional.', '2024-06-25', 1, 'internal'],
      ['Patricia J.', 5, 'Took a scenic flight over Candlewood Lake with my family. Absolutely breathtaking! The pilot was knowledgeable and made everyone feel comfortable. Unforgettable experience.', '2024-09-15', 1, 'internal'],
      ['Daniel C.', 5, 'Professional aircraft maintenance at fair prices. They saved me thousands on my annual inspection by catching issues early. Highly skilled A&P mechanics.', '2024-11-08', 1, 'internal'],
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
      ['contact', 'email', 'brent@darcyaviation.com'],
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
      ['experiences', 'discovery_price', '$279'],
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
      ['cta', 'primary_text', 'Book a Discovery Flight — $279'],
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
      ['What is a Discovery Flight?', 'A discovery flight is a 30-minute introductory flight where you actually take the controls of the aircraft under the guidance of a certified flight instructor. It is the perfect way to experience flying before committing to a full training program. Discovery flights are $279 and make great gifts!', 'training', 3],
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

  // Seed service tiles if empty
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM service_tiles').get() as { count: number };
  if (serviceCount.count === 0) {
    const insertTile = db.prepare(`
      INSERT INTO service_tiles (title, description, link, icon_svg, images, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    
    const tilesData = [
      [
        'Flight Training',
        'From Private Pilot to Commercial — structured programs with experienced CFIs who care about your success.',
        '/training',
        '<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>',
        JSON.stringify(['/images/training/train-1.jpg', '/images/training/train-2.jpg', '/images/training/train-3.jpg', '/images/training/train-4.jpg', '/images/training/train-5.jpg']),
        1
      ],
      [
        'Aircraft Maintenance',
        'FAA-certified A&P/IA mechanics. Annuals, 100-hour inspections, engine overhauls, and custom needs tailored to your aircraft.',
        '/maintenance',
        '<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
        JSON.stringify(['/images/maintenance/maint-1.jpg', '/images/maintenance/maint-2.jpg', '/images/maintenance/maint-3.jpg', '/images/maintenance/maint-4.jpg', '/images/maintenance/maint-5.jpg']),
        2
      ],
      [
        'Scenic Tours',
        'From $279 — Discovery flights, Candlewood Lake, West Point, NYC Skyline, and City Lights night tours.',
        '/experiences',
        '<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>',
        JSON.stringify([
          '/images/scenic/scenic-1.jpg', '/images/scenic/scenic-2.jpg', '/images/scenic/scenic-3.jpg', '/images/scenic/scenic-4.jpg', '/images/scenic/scenic-5.jpg', '/images/scenic/scenic-6.jpg', '/images/scenic/scenic-7.jpg', '/images/scenic/scenic-8.jpg', '/images/scenic/scenic-9.jpg', '/images/scenic/scenic-10.jpg', '/images/scenic/scenic-11.jpg', '/images/scenic/scenic-12.jpg', '/images/scenic/scenic-13.jpg'
        ]),
        3
      ]
    ];

    const insertMany = db.transaction(() => {
      for (const [title, description, link, iconSvg, images, sortOrder] of tilesData) {
        insertTile.run(title, description, link, iconSvg, images, sortOrder);
      }
    });
    insertMany();
    console.log('✅ Service tiles seeded with default content');
  }

  // Seed training programs if empty
  const trainingCount = db.prepare('SELECT COUNT(*) as count FROM training_programs').get() as { count: number };
  if (trainingCount.count === 0) {
    const insertTraining = db.prepare(`
      INSERT INTO training_programs (
        slug, program_name, hero_title, hero_subtitle, hero_description, hero_icon_svg,
        overview, requirements, curriculum, timeline_duration, timeline_frequency, timeline_details,
        cost_note, hide_cost_quote, fleet_used, faqs, cta_text, cta_link, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const trainingData = [
      // PPL
      [
        'ppl',
        'Private Pilot License (PPL)',
        'Private Pilot License (PPL)',
        'Certificate Program',
        'Your journey starts here. The Private Pilot License is your gateway to the skies — the foundation certificate that lets you fly single-engine aircraft, carry passengers, and explore the country from above.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>',
        JSON.stringify([
          'The Private Pilot License (PPL) is the most common starting point for aspiring pilots. It authorizes you to act as pilot in command of a single-engine aircraft under Visual Flight Rules (VFR), carry passengers, and fly for personal or recreational purposes.',
          'At Darcy Aviation, our PPL program combines comprehensive ground school with hands-on flight instruction. You will progress from basic maneuvers to solo flights, cross-country navigation, and ultimately your FAA checkride. Our experienced instructors tailor training to your pace and learning style.',
          'Whether you dream of weekend flying, traveling to new destinations, or building toward a professional career, the PPL is where it all begins.'
        ]),
        JSON.stringify([
          'Must be at least 16 years old to solo, 17 years old to earn the certificate',
          'FAA Third Class Medical Certificate (obtained from an Aviation Medical Examiner)',
          'Minimum 40 flight hours (FAA requirement), national average is 60-70 hours',
          'At least 20 hours of flight training with an instructor',
          'At least 10 hours of solo flight time',
          'Minimum 3 hours of night flight training',
          'At least 3 hours of instrument training (by reference to instruments)',
          'Cross-country flight experience: dual and solo',
          'Pass the FAA Knowledge Test (written exam)',
          'Pass the FAA Practical Test (oral exam and checkride with a Designated Pilot Examiner)',
          'Ability to read, speak, write, and understand English'
        ]),
        JSON.stringify([
          {
            title: 'Ground School',
            items: [
              'Aerodynamics and principles of flight',
              'Aircraft systems and instruments',
              'Federal Aviation Regulations (FARs)',
              'Weather theory and aviation weather services',
              'Navigation: charts, pilotage, dead reckoning, VORs, GPS',
              'Airport operations and airspace classifications',
              'Flight planning, weight and balance, performance calculations',
              'Aeromedical factors and crew resource management'
            ]
          },
          {
            title: 'Pre-Solo Flight Training',
            items: [
              'Straight-and-level flight, climbs, and descents',
              'Turns: standard rate, steep, and ground reference maneuvers',
              'Slow flight and stall recognition/recovery',
              'Normal, crosswind, short-field, and soft-field takeoffs and landings',
              'Emergency procedures: engine failures, forced landings',
              'Radio communications and ATC procedures',
              'Traffic pattern operations'
            ]
          },
          {
            title: 'Solo & Cross-Country Phase',
            items: [
              'Solo practice in the traffic pattern',
              'Solo cross-country flights (minimum 150nm total, one 50nm+ leg)',
              'Dual cross-country flight planning and navigation',
              'Diversion and lost procedures',
              'Night flight operations',
              'Basic instrument reference skills'
            ]
          },
          {
            title: 'Checkride Preparation',
            items: [
              'Oral exam review: regulations, systems, weather, planning',
              'Practical test standards (ACS) maneuvers review',
              'Mock checkride with your instructor',
              'Final stage check and sign-off'
            ]
          }
        ]),
        '3 to 6 months',
        '2-3 flights per week recommended',
        'Consistency is key to efficient training. Students who fly 2-3 times per week typically progress faster and retain skills better than those who fly less frequently. Most students complete the program in 60-70 flight hours.',
        'The cost of a Private Pilot License varies based on the number of flight hours needed, which depends on your schedule and aptitude. Most students complete training between 60 and 70 hours. Contact us for a personalized estimate that accounts for aircraft rental, instructor fees, ground school materials, and exam costs.',
        0,
        JSON.stringify([
          {
            name: 'Cessna 172 Skyhawk',
            description: 'The world\'s most popular training aircraft. Stable, forgiving, and ideal for learning the fundamentals of flight.'
          },
          {
            name: 'Piper Warrior',
            description: 'A low-wing trainer that offers a different flying perspective. Great for developing well-rounded piloting skills.'
          },
          {
            name: 'Redbird AATD Simulator',
            description: 'Used for instrument reference training and emergency procedure practice. Saves flight costs while building proficiency.'
          }
        ]),
        JSON.stringify([
          {
            q: 'How long does it take to get a PPL?',
            a: 'Most students complete their PPL in 3-6 months when flying 2-3 times per week. The FAA requires a minimum of 40 flight hours, but the national average is 60-70 hours. Your pace depends on schedule consistency and individual aptitude.'
          },
          {
            q: 'Do I need any prior experience to start?',
            a: 'No prior aviation experience is needed. We start from the very beginning and build your skills progressively. Many students begin with a Discovery Flight to get comfortable before committing to the full program.'
          },
          {
            q: 'What is the FAA medical certificate and how do I get one?',
            a: 'A Third Class Medical Certificate is required to solo and earn your PPL. You obtain it by visiting an FAA-designated Aviation Medical Examiner (AME) for a straightforward physical examination. We can help you find a local AME and guide you through the process.'
          },
          {
            q: 'Can I fly at night with a PPL?',
            a: 'Yes. Night flying privileges are included with your Private Pilot License. You will complete night flight training as part of the program curriculum.'
          },
          {
            q: 'What happens if I fail the checkride?',
            a: 'A failed checkride is not uncommon and is not the end of the road. Your instructor will work with you on the areas that need improvement, and you can retake the test. Additional training and a retest fee will apply.'
          },
          {
            q: 'Can I use my PPL to fly anywhere in the country?',
            a: 'Yes. A Private Pilot License allows you to fly throughout the entire United States and its territories under Visual Flight Rules. You can also fly internationally with proper planning and documentation.'
          }
        ]),
        'Take the first step toward earning your wings. Book a Discovery Flight or contact us to discuss your training plan.',
        '/book',
        1
      ],
      // Instrument Rating
      [
        'instrument',
        'Instrument Rating (IR)',
        'Instrument Rating',
        'Add-On Certificate',
        'Master flying in all weather conditions. The Instrument Rating allows you to fly safely through clouds, fog, and low visibility — greatly expanding your capabilities and safety as a pilot.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M9.75 18.75l2.25-1.636M15 8.25l-6.75 2.25 2.25 6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
        JSON.stringify([
          'The Instrument Rating is one of the most valuable add-on certificates you can earn. It allows you to fly in weather conditions that would ground VFR pilots — through clouds, fog, rain, and low visibility.',
          'This rating dramatically improves your safety and utility as a pilot. You will learn to fly solely by reference to instruments, navigate using radio navigation aids, and execute precision instrument approaches.',
          'Our instrument training program uses both actual aircraft and our full-motion AATD simulator to provide comprehensive, cost-effective instruction.'
        ]),
        JSON.stringify([
          'Must hold a Private Pilot License or higher',
          'Valid FAA medical certificate',
          'Minimum 50 hours of cross-country flight time as pilot in command',
          'At least 40 hours of actual or simulated instrument flight time',
          'At least 15 hours of instrument flight training from a CFII',
          'One cross-country flight of at least 250nm along airways or ATC-directed routing',
          'An instrument approach at each airport and three different kinds of approaches',
          'Pass the FAA Instrument Knowledge Test',
          'Pass the FAA Instrument Practical Test (checkride)',
          'English proficiency'
        ]),
        JSON.stringify([
          {
            title: 'Ground School',
            items: [
              'IFR regulations and ATC procedures',
              'Weather theory and weather services for IFR flight',
              'Navigation systems: VOR, ILS, GPS approaches',
              'Instrument charts and approach plates',
              'Flight planning for IFR flight',
              'Aircraft systems and instrument interpretation',
              'Emergency procedures and lost communication'
            ]
          },
          {
            title: 'Basic Instrument Skills',
            items: [
              'Attitude instrument flying and scan techniques',
              'Straight-and-level, climbs, descents by reference to instruments',
              'Standard rate turns and timed turns',
              'Unusual attitude recovery',
              'Partial panel flying (simulated instrument failures)',
              'Radio navigation using VOR and GPS'
            ]
          },
          {
            title: 'Approaches and Procedures',
            items: [
              'ILS precision approaches',
              'VOR and GPS non-precision approaches',
              'Missed approaches and holding procedures',
              'DME arcs and course intercepts',
              'Circling approaches',
              'Published departure procedures (DPs)'
            ]
          },
          {
            title: 'Cross-Country and Checkride Prep',
            items: [
              'IFR cross-country flight planning',
              'ATC communications and clearances',
              'Actual IMC experience (weather permitting)',
              'Simulated emergencies and system failures',
              'Checkride preparation and mock oral exams'
            ]
          }
        ]),
        '3 to 6 months',
        '2-3 lessons per week recommended',
        'Most students complete instrument training in 3-6 months with consistent practice. Simulator training can accelerate progress and reduce costs while building proficiency.',
        'Instrument rating typically requires 40-50 hours of training. We use our AATD simulator for cost-effective training on procedures and approaches. Contact us for a detailed estimate.',
        0,
        JSON.stringify([
          {
            name: 'Cessna 172 with IFR Equipment',
            description: 'Fully IFR-equipped aircraft with modern GPS and traditional navigation instruments.'
          },
          {
            name: 'Redbird AATD Simulator',
            description: 'FAA-approved training device for cost-effective instrument procedure training.'
          }
        ]),
        JSON.stringify([
          {
            q: 'How much actual IMC time will I get?',
            a: 'We fly in actual instrument conditions whenever weather permits and it\'s safe. However, much of the training uses "simulated" IMC with a view-limiting device (hood) or in our simulator.'
          },
          {
            q: 'Can I use a simulator for instrument training?',
            a: 'Yes. The FAA allows up to 20 hours of the required 40 hours to be completed in an approved simulator or training device. Our Redbird AATD is perfect for this.'
          },
          {
            q: 'Do I need to maintain currency to use my instrument rating?',
            a: 'Yes. To act as pilot in command under IFR, you need 6 instrument approaches, holding procedures, and intercepting courses in the past 6 months.'
          }
        ]),
        'Ready to master instrument flight? The instrument rating will make you a safer, more capable pilot.',
        '/contact',
        2
      ],
      // Commercial
      [
        'commercial',
        'Commercial Pilot License (CPL)',
        'Commercial Pilot License',
        'Professional Certificate',
        'Turn your passion into a profession. The Commercial Pilot License allows you to fly for compensation and opens doors to a career in aviation.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.458V9.359c0-.216-.016-.432-.08-.643a23.77 23.77 0 00-3.075-8.716c-.206-.342-.888-.342-1.094 0a23.77 23.77 0 00-3.075 8.716c-.064.211-.08.427-.08.643v8.323m0-16.25c1.368 0 2.47 0 3.413.387a2.18 2.18 0 011.837 2.175V8.65" /></svg>',
        JSON.stringify([
          'The Commercial Pilot License represents a major milestone in your aviation journey. It allows you to be compensated for flying and is required for most professional pilot positions.',
          'Our commercial training builds upon your private and instrument skills, focusing on advanced maneuvers, precise aircraft control, and the professionalism required of a commercial pilot.',
          'Whether you aspire to be a flight instructor, charter pilot, or airline pilot, the CPL is an essential stepping stone.'
        ]),
        JSON.stringify([
          'Must be at least 18 years old',
          'Hold a Private Pilot License',
          'FAA Second Class Medical Certificate (or higher)',
          'Must hold an Instrument Rating (practical requirement)',
          'Minimum 250 hours total flight time',
          'At least 100 hours as pilot in command',
          'At least 50 hours of cross-country flight time',
          '10 hours of instrument training',
          '10 hours of complex aircraft or TAA training',
          'Pass the Commercial Pilot Knowledge Test',
          'Pass the Commercial Pilot Practical Test (checkride)',
          'English proficiency'
        ]),
        JSON.stringify([
          {
            title: 'Advanced Ground School',
            items: [
              'Commercial pilot privileges and limitations',
              'Advanced aerodynamics and performance',
              'Complex aircraft systems',
              'Weight and balance calculations',
              'Advanced weather interpretation',
              'Commercial regulations (Part 119, 135)',
              'Crew resource management'
            ]
          },
          {
            title: 'Precision Maneuvers',
            items: [
              'Chandelles and lazy eights',
              'Steep spirals and eights on pylons',
              'Short-field and soft-field operations',
              'Power-off 180° accuracy landings',
              'Emergency descent and go-around procedures',
              'Maximum performance takeoffs and climbs'
            ]
          },
          {
            title: 'Complex Aircraft Training',
            items: [
              'Retractable landing gear systems',
              'Constant-speed propellers',
              'Complex aircraft systems management',
              'Advanced performance calculations',
              'Emergency procedures specific to complex aircraft'
            ]
          },
          {
            title: 'Checkride Preparation',
            items: [
              'Commercial maneuvers to ACS standards',
              'Oral examination preparation',
              'Scenario-based training',
              'Professional pilot decision-making',
              'Mock checkride and stage checks'
            ]
          }
        ]),
        '2 to 4 months',
        'Build experience while training',
        'Commercial training focuses on precision and professionalism. Most students complete this certificate in 2-4 months, often while building experience toward airline requirements.',
        'Commercial training cost depends on your current experience level and the aircraft used for training. Complex aircraft training is typically required.',
        0,
        JSON.stringify([
          {
            name: 'Complex Aircraft',
            description: 'Training in aircraft with retractable gear, constant-speed props, and advanced systems.'
          },
          {
            name: 'Multi-Engine Trainer',
            description: 'Multi-engine training available for commercial multi-engine add-on rating.'
          }
        ]),
        JSON.stringify([
          {
            q: 'Do I need my instrument rating first?',
            a: 'While not legally required, having an instrument rating is practically essential for commercial operations and most employers require it.'
          },
          {
            q: 'What can I do with a commercial license?',
            a: 'You can be a flight instructor, charter pilot, cargo pilot, aerial photographer, pipeline patrol pilot, and more. It\'s required for most paid flying jobs.'
          },
          {
            q: 'How many hours do I need for airlines?',
            a: 'Airlines require 1,500 hours total time for an Airline Transport Pilot License (ATPL). The commercial license gets you started building that experience.'
          }
        ]),
        'Ready to turn pro? Contact us to discuss your commercial pilot training and career goals.',
        '/contact',
        3
      ],
      // Multi-Engine
      [
        'multi-engine',
        'Multi-Engine Rating',
        'Multi-Engine Rating',
        'Add-On Rating',
        'Master twin-engine aircraft operations. The Multi-Engine Rating qualifies you to fly aircraft with two or more engines, opening opportunities in charter and airline flying.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>',
        JSON.stringify([
          'The Multi-Engine Rating qualifies you to act as pilot in command of aircraft with more than one engine. This rating is essential for charter work, airline careers, and flying larger, more capable aircraft.',
          'Multi-engine training focuses on the unique challenges of flying twin-engine aircraft, including engine-out procedures, systems management, and the aerodynamics of asymmetric flight.',
          'Our comprehensive program covers both normal operations and emergency procedures in multi-engine aircraft.'
        ]),
        JSON.stringify([
          'Must hold a Private Pilot License or higher',
          'Valid FAA medical certificate',
          'English proficiency',
          'No minimum flight time required for the rating itself',
          'Instrument rating highly recommended',
          'Pass the Multi-Engine Knowledge Test (if adding to private license)',
          'Pass the Multi-Engine Practical Test (checkride)'
        ]),
        JSON.stringify([
          {
            title: 'Ground School',
            items: [
              'Multi-engine aerodynamics and performance',
              'Engine-out procedures and VMC considerations',
              'Multi-engine aircraft systems',
              'Weight and balance for twin-engine aircraft',
              'Emergency procedures and abnormal operations',
              'Multi-engine regulations and limitations'
            ]
          },
          {
            title: 'Normal Operations',
            items: [
              'Multi-engine aircraft preflight and systems',
              'Normal takeoffs and landings',
              'Multi-engine traffic patterns',
              'Performance calculations and planning',
              'Cockpit resource management',
              'Radio communications and ATC procedures'
            ]
          },
          {
            title: 'Emergency Procedures',
            items: [
              'Engine failure during takeoff',
              'Engine failure in flight',
              'Single-engine approaches and landings',
              'VMC demonstration and recovery',
              'Engine restart procedures',
              'Single-engine go-around procedures'
            ]
          },
          {
            title: 'Checkride Preparation',
            items: [
              'ACS maneuvers and procedures',
              'Oral examination preparation',
              'Emergency scenario practice',
              'Single-engine precision flying',
              'Systems knowledge and troubleshooting'
            ]
          }
        ]),
        '1 to 2 weeks',
        'Intensive training program',
        'Multi-engine training is typically completed in 1-2 weeks of intensive training. The rating requires a minimum of 10 hours of multi-engine training.',
        'Multi-engine training is completed in our twin-engine aircraft. Contact us for current pricing and aircraft availability.',
        1,
        JSON.stringify([
          {
            name: 'Twin-Engine Trainer',
            description: 'Well-maintained multi-engine aircraft equipped for comprehensive twin-engine training.'
          }
        ]),
        JSON.stringify([
          {
            q: 'How long does multi-engine training take?',
            a: 'Most students complete their multi-engine rating in 7-14 days with intensive training. The minimum is 10 hours of multi-engine flight training.'
          },
          {
            q: 'Is the multi-engine rating difficult?',
            a: 'Multi-engine training requires learning new procedures and emergency techniques, but most pilots find it exciting and manageable with proper instruction.'
          },
          {
            q: 'Do I need an instrument rating?',
            a: 'While not required, an instrument rating is highly recommended and practically essential for most multi-engine flying opportunities.'
          }
        ]),
        'Ready to step up to twin-engine aircraft? Multi-engine training opens new opportunities in aviation.',
        '/contact',
        4
      ],
      // Discovery Flight
      [
        'discovery',
        'Discovery Flight',
        'Discovery Flight Experience',
        'First Flight',
        'Take the controls and experience the thrill of flight. A Discovery Flight is the perfect introduction to aviation — no experience necessary.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.58-5.84a14.927 14.927 0 015.84 2.58m-2.58 5.84a6.02 6.02 0 01-5.84-2.58m5.84 2.58a14.927 14.927 0 002.58 5.84" /></svg>',
        JSON.stringify([
          'A Discovery Flight is your first taste of what it\'s like to be a pilot. You\'ll take the controls of a real aircraft with an experienced flight instructor beside you, guiding you through the basics of flight.',
          'This introductory flight includes a pre-flight briefing, hands-on flying experience, and a post-flight discussion about flight training. It\'s the perfect way to see if aviation is for you.',
          'Many of our students start their journey with a Discovery Flight. It\'s also a popular gift for aviation enthusiasts, birthdays, and special occasions.'
        ]),
        JSON.stringify([
          'No prior experience necessary',
          'Must be at least 12 years old',
          'Valid government-issued ID',
          'Comfortable clothing and closed-toe shoes',
          'Weight restrictions may apply for aircraft balance'
        ]),
        JSON.stringify([
          {
            title: 'Pre-Flight Briefing',
            items: [
              'Introduction to the aircraft and its systems',
              'Basic flight controls and instruments',
              'Safety briefing and emergency procedures',
              'Flight route planning and weather discussion'
            ]
          },
          {
            title: 'Hands-On Flying',
            items: [
              'Pre-flight inspection with instructor',
              'Taxi, takeoff, and departure procedures',
              'You take the controls in flight',
              'Basic maneuvers: climbs, descents, turns',
              'Scenic flight over local area',
              'Instructor demonstrates landing'
            ]
          },
          {
            title: 'Post-Flight Discussion',
            items: [
              'Review of the flight experience',
              'Questions and answers about flying',
              'Information about flight training programs',
              'Next steps if you want to pursue training'
            ]
          }
        ]),
        '~30 minutes flight time',
        'One-time experience',
        'The Discovery Flight includes approximately 30 minutes of flight time, plus pre-flight briefing and post-flight discussion. Total time is about 1 hour.',
        'Discovery Flights are $279 and make excellent gifts. Gift certificates are available online.',
        1,
        JSON.stringify([
          {
            name: 'Cessna 172 Skyhawk',
            description: 'Safe, stable training aircraft perfect for your first flying experience.'
          }
        ]),
        JSON.stringify([
          {
            q: 'Do I get to fly the plane?',
            a: 'Yes! After takeoff, you\'ll take the controls and actually fly the aircraft with guidance from your instructor. You\'ll experience climbs, turns, and level flight.'
          },
          {
            q: 'Is it safe for someone who has never flown?',
            a: 'Absolutely. Discovery Flights are conducted with experienced flight instructors in well-maintained aircraft. Safety is our top priority.'
          },
          {
            q: 'Can I bring a passenger?',
            a: 'Yes, most of our aircraft can accommodate one passenger in addition to you and the instructor, subject to weight and balance limitations.'
          },
          {
            q: 'What if the weather is bad?',
            a: 'We\'ll reschedule your flight for safe weather conditions. Your safety and enjoyment are our priorities.'
          }
        ]),
        'Ready for your first flying experience? Book a Discovery Flight and take the first step toward your aviation dreams.',
        '/book',
        5
      ],
      // Simulator Training
      [
        'simulator',
        'Simulator Training',
        'Flight Simulator Training',
        'Professional Training Device',
        'Master flight procedures safely and cost-effectively. Our full-motion AATD simulator provides realistic training for instrument procedures, emergency scenarios, and skill building.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
        JSON.stringify([
          'Our FAA-approved Aviation Training Device (AATD) provides realistic flight training in a controlled environment. The simulator is perfect for instrument training, emergency procedure practice, and building proficiency.',
          'Simulator training is more cost-effective than aircraft training and allows practice of scenarios that would be unsafe or impractical in actual flight.',
          'The simulator counts toward FAA training requirements for instrument rating, commercial certificate, and instrument proficiency checks.'
        ]),
        JSON.stringify([
          'Hold at least a Private Pilot License for advanced training',
          'No certificate required for introductory simulator experience',
          'Valid medical certificate for loggable training time',
          'Basic understanding of flight instruments helpful'
        ]),
        JSON.stringify([
          {
            title: 'Instrument Training',
            items: [
              'ILS, VOR, and GPS approach procedures',
              'Holding patterns and course intercepts',
              'Partial panel and instrument failures',
              'Navigation using various radio aids',
              'Missed approaches and emergency procedures'
            ]
          },
          {
            title: 'Emergency Procedures',
            items: [
              'Engine failures and forced landings',
              'System failures and malfunctions',
              'Unusual attitude recovery',
              'Weather encounters and turbulence',
              'Loss of communication procedures'
            ]
          },
          {
            title: 'Proficiency and Currency',
            items: [
              'Instrument proficiency checks (IPC)',
              'Currency requirements for instrument flight',
              'Skill refresher training',
              'Preparation for checkrides'
            ]
          },
          {
            title: 'Introduction to Flying',
            items: [
              'Basic flight controls and instruments',
              'Traffic pattern operations',
              'Navigation and flight planning',
              'Radio communications practice'
            ]
          }
        ]),
        'Flexible scheduling',
        'As needed for proficiency',
        'Simulator sessions can be scheduled flexibly based on your needs. Sessions typically range from 1-2 hours depending on training objectives.',
        'Simulator training is significantly less expensive than aircraft training while providing excellent learning value.',
        0,
        JSON.stringify([
          {
            name: 'Redbird AATD Simulator',
            description: 'FAA-approved Advanced Aviation Training Device with realistic flight controls and instrumentation.'
          }
        ]),
        JSON.stringify([
          {
            q: 'Does simulator time count toward FAA requirements?',
            a: 'Yes, our FAA-approved AATD allows up to 20 hours toward the 40 hours required for instrument rating, and time counts for currency and proficiency training.'
          },
          {
            q: 'Is simulator training as good as actual flight?',
            a: 'For instruments and procedures, simulator training is excellent. It allows practice of emergency scenarios safely and repeatedly. However, actual flight experience is also important.'
          },
          {
            q: 'Can beginners use the simulator?',
            a: 'Yes! The simulator is great for introduction to flying, instrument familiarization, and building confidence before actual flight training.'
          }
        ]),
        'Experience professional-level flight training in our state-of-the-art simulator.',
        '/contact',
        6
      ]
    ];

    const insertMany = db.transaction(() => {
      for (const data of trainingData) {
        insertTraining.run(...data);
      }
    });
    insertMany();
    console.log('✅ Training programs seeded with hardcoded content');
  }

  // Seed experiences if empty
  const experiencesCount = db.prepare('SELECT COUNT(*) as count FROM experiences').get() as { count: number };
  if (experiencesCount.count === 0) {
    const insertExperience = db.prepare(`
      INSERT INTO experiences (slug, title, price, description, icon_svg, highlights, featured, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const experiencesData = [
      [
        'discovery-flight',
        'Discovery Flight',
        '$279',
        'Take the captain\'s seat and experience the thrill of flying firsthand. Whether it\'s been a lifelong dream or a spark of curiosity, grab the controls with an experienced instructor by your side and see the world from above.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>',
        JSON.stringify(['~30 minutes', 'You fly the plane', 'No experience needed']),
        1,
        1
      ],
      [
        'candlewood-lake-tour',
        'Candlewood Lake Tour',
        '$290',
        'Soar over the majestically wooded Candlewood Lake region. Take in sweeping views of Connecticut\'s largest lake, rolling hills, and charming shoreline communities from the best seat in the house.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>',
        JSON.stringify(['~45 minutes', 'Scenic lake views', 'Perfect for families']),
        0,
        2
      ],
      [
        'west-point-hudson-river-tour',
        'West Point & Hudson River Tour',
        '$379',
        'Fly over the storied grounds of the West Point Military Academy, then navigate your way down the legendary Hudson River. A stunning blend of American history and natural beauty from an altitude most only dream of.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>',
        JSON.stringify(['~1 hour', 'West Point flyover', 'Hudson River corridor']),
        0,
        3
      ],
      [
        'nyc-skyline-tour',
        'NYC Skyline Tour',
        '$550',
        'Fly through America\'s most iconic skyline at eye level with breathtaking skyscrapers along the Hudson River. See the Statue of Liberty, the Empire State Building, and Central Park from a perspective that will leave you speechless.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>',
        JSON.stringify(['~1.5 hours', 'Manhattan skyline', 'A flight you\'ll never forget']),
        0,
        4
      ],
      [
        'city-lights-night-tour',
        'City Lights Night Tour',
        '$680',
        'The most spectacular flight you and your loved ones will ever experience. Cruise down the Hudson River through the glittering Manhattan skyline, then sweep out over the East River — all under the magic of city lights after dark.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>',
        JSON.stringify(['~1.5 hours', 'Night flight over NYC', 'Unforgettable date night']),
        1,
        5
      ]
    ];

    const insertMany = db.transaction(() => {
      for (const data of experiencesData) {
        insertExperience.run(...data);
      }
    });
    insertMany();
    console.log('✅ Experiences seeded with hardcoded content');
  }

  // Seed maintenance services if empty
  const maintenanceCount = db.prepare('SELECT COUNT(*) as count FROM maintenance_services').get() as { count: number };
  if (maintenanceCount.count === 0) {
    const insertMaintenance = db.prepare(`
      INSERT INTO maintenance_services (title, description, icon_svg, details, includes, note, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const maintenanceData = [
      [
        'Annual Inspections',
        'Comprehensive annual inspections to keep your aircraft airworthy and compliant with FAA regulations.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>',
        JSON.stringify([
          'Required every 12 calendar months for all certificated aircraft under 14 CFR Part 91.',
          'Our IA-certified mechanics perform a thorough top-to-bottom inspection covering airframe, engine, propeller, and all aircraft systems.',
          'We document all findings in detail and work with you on any discrepancies before returning the aircraft to service.'
        ]),
        JSON.stringify([
          'Complete airframe structural inspection',
          'Engine and propeller examination',
          'Flight control rigging and cable tension checks',
          'Landing gear, brakes, and tire inspection',
          'Avionics and electrical system check',
          'Logbook entries and AD compliance review',
          'Detailed written report of all findings'
        ]),
        null,
        1
      ],
      [
        '100-Hour Inspections',
        'Required for aircraft used in commercial operations or flight training. Thorough and detailed.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
        JSON.stringify([
          'Identical in scope to an annual inspection, but required every 100 hours of operation for aircraft used for hire — including flight training.',
          'Our team ensures minimal downtime so your aircraft is back in service quickly.',
          'We track hours and can set up reminders so you never miss an inspection window.'
        ]),
        JSON.stringify([
          'Same comprehensive scope as annual inspection',
          'Engine compression checks',
          'Oil filter cut and analysis',
          'Brake and tire wear measurement',
          'All flight control surfaces and hinges',
          'AD compliance verification',
          'Priority scheduling for training fleet'
        ]),
        null,
        2
      ],
      [
        'Oil Changes',
        'Regular oil changes and oil analysis to keep your engine running smoothly and catch issues early.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>',
        JSON.stringify([
          'Recommended every 50 hours or 4 months — whichever comes first. Regular oil changes are the single best thing you can do for engine longevity.',
          'We include oil filter inspection (cut and examine) and optional oil analysis to detect early signs of internal wear, corrosion, or contamination.',
          'Quick turnaround — most oil changes completed same day.'
        ]),
        JSON.stringify([
          'Drain and replace engine oil (Aeroshell or equivalent)',
          'Oil filter removal, cut, and visual inspection',
          'Optional oil sample for spectrometric analysis',
          'Check for metal particles or contamination',
          'Top off other fluids as needed',
          'Update engine logbook'
        ]),
        'Oil analysis is one of the best early warning systems for engine health. We recommend it every change.',
        3
      ],
      [
        'Engine Overhaul',
        'Complete engine overhaul services to extend the life of your powerplant and ensure peak performance.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
        JSON.stringify([
          'When your engine reaches TBO (Time Between Overhaul) or shows signs of wear, a major overhaul restores it to like-new condition.',
          'We work with trusted overhaul shops and can coordinate the entire process — from removal to reinstallation and test flight.',
          'Options include factory overhaul, field overhaul, or exchange programs depending on your budget and timeline.'
        ]),
        JSON.stringify([
          'Engine removal and disassembly',
          'Complete inspection of all internal components',
          'Replacement of worn cylinders, bearings, and seals',
          'Crankshaft inspection and reconditioning',
          'Reassembly to factory tolerances',
          'Test run and break-in procedures',
          'Fresh logbook entries with new TBO times'
        ]),
        'We can discuss overhaul vs. exchange options to find the best fit for your aircraft and budget.',
        4
      ],
      [
        'Custom Needs',
        'Have a unique project or special requirement? We work with you to find the right solution.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
        JSON.stringify([
          'Every aircraft and owner has unique needs. Whether it is an avionics upgrade, a custom modification, a ferry flight inspection, or something else entirely — talk to us.',
          'We have experience with STCs, field approvals, and working with the FAA on non-standard projects.',
          'If we cannot do it in-house, we will connect you with the right specialist and help coordinate the work.'
        ]),
        JSON.stringify([
          'Avionics installation and upgrades (GPS, ADS-B, autopilot)',
          'Custom panel work and instrument upgrades',
          'STC installations and field approvals',
          'Corrosion treatment and prevention',
          'Interior refurbishment coordination',
          'Ferry flight and relocation inspections',
          'Consultation on modifications and upgrades'
        ]),
        'Contact us to discuss your specific project. We are happy to provide a free consultation and estimate.',
        5
      ],
      [
        'Pre-Buy Inspections',
        'Thinking of buying an aircraft? Our thorough pre-buy inspection gives you confidence in your purchase.',
        '<svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0110.607 10.607z" /></svg>',
        JSON.stringify([
          'Buying an aircraft is a major investment. A pre-buy inspection gives you a clear, honest picture of the aircraft\'s true condition before you commit.',
          'We go beyond a standard annual inspection scope — checking for hidden corrosion, previous damage repairs, AD compliance history, and overall airworthiness.',
          'Our detailed written report gives you the information you need to negotiate with confidence or walk away if needed.'
        ]),
        JSON.stringify([
          'Comprehensive airframe and engine inspection',
          'Logbook review and AD compliance audit',
          'Corrosion inspection (especially hidden areas)',
          'Previous damage and repair quality assessment',
          'Engine compression and oil analysis',
          'Avionics and electrical system evaluation',
          'Detailed written report with photos',
          'Honest assessment and recommendation'
        ]),
        'We work for you, the buyer — not the seller. Our goal is to give you the full picture so you can make an informed decision.',
        6
      ]
    ];

    const insertMany = db.transaction(() => {
      for (const data of maintenanceData) {
        insertMaintenance.run(...data);
      }
    });
    insertMany();
    console.log('✅ Maintenance services seeded with hardcoded content');
  }

  // Seed page meta — INSERT OR IGNORE so new pages are added without overwriting edits
  {
    const insertMeta = db.prepare('INSERT OR IGNORE INTO pages_meta (page_slug, title, description) VALUES (?, ?, ?)');
    
    const defaultMeta = [
      ['home', 'Darcy Aviation — Premier Flight Training & Scenic Tours | KDXR Danbury CT', 'Darcy Aviation — premier flight training and aircraft maintenance at Danbury Municipal Airport (KDXR), Connecticut. Discovery flights from $279. Private Pilot through Commercial licenses.'],
      ['about', 'About Us — Darcy Aviation | KDXR Danbury CT', 'Learn about Darcy Aviation — founded in 2019 at Danbury Municipal Airport (KDXR), Connecticut. Meet our team of experienced flight instructors and mechanics.'],
      ['training', 'Flight Training Programs — Darcy Aviation', 'From Private Pilot License to Commercial training — comprehensive flight programs with experienced CFIs at KDXR.'],
      ['fleet', 'Our Aircraft Fleet — Darcy Aviation', 'Modern, well-maintained Cessna and Piper aircraft plus full-motion simulator at KDXR.'],
      ['maintenance', 'Aircraft Maintenance — Darcy Aviation', 'FAA-certified A&P/IA mechanics. Annuals, 100-hour inspections, engine overhauls at KDXR Danbury CT.'],
      ['contact', 'Contact Us — Darcy Aviation', 'Get in touch with Darcy Aviation — call (203) 617-0645, email brent@darcyaviation.com, or visit us at 1 Wallingford Rd, Danbury, CT 06810.'],
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
    ['contact', 'email', 'brent@darcyaviation.com', 'brent@darcyaviation.com'],
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
      'Darcy Aviation — premier flight training and aircraft maintenance at Danbury Municipal Airport (KDXR), Connecticut. Discovery flights from $279. Private Pilot through Commercial licenses.',
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
