const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'USER',
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  profile_created_for TEXT,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  dob DATE NOT NULL,
  height_cm INTEGER,
  weight TEXT,
  marital_status TEXT,
  mother_tongue TEXT,
  religion TEXT,
  caste TEXT,
  sub_caste TEXT,
  gothram TEXT,
  manglik TEXT,
  highest_education TEXT,
  occupation TEXT,
  company TEXT,
  designation TEXT,
  annual_income TEXT,
  experience TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  pincode TEXT,
  current_address TEXT,
  live_location_enabled BOOLEAN DEFAULT 0,
  work_location TEXT,
  about_me TEXT,
  diet TEXT,
  smoking TEXT,
  drinking TEXT,
  exercise TEXT,
  photos TEXT,
  photo_privacy TEXT DEFAULT 'PUBLIC',
  is_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS partner_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 60,
  min_height_cm INTEGER,
  max_height_cm INTEGER,
  preferred_religions TEXT,
  preferred_castes TEXT,
  preferred_education TEXT,
  preferred_income TEXT,
  preferred_countries TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING',
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shortlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  shortlisted_user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shortlisted_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, shortlisted_user_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id INTEGER NOT NULL,
  reported_user_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  is_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone);
`);


// Seed admin user if not exists
const seedEmail = 'admin@example.com';
const row = db.prepare('SELECT id FROM users WHERE email = ?').get(seedEmail);
if (!row) {
  const hashed = bcrypt.hashSync('password123', 10);
  const stmt = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
  stmt.run(seedEmail, hashed, 'Admin', 'ADMIN');
}

module.exports = db;

