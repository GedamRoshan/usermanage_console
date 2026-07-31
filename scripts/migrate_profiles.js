const db = require('../src/db');

const newColumns = [
  { name: 'profile_created_for', type: 'TEXT' },
  { name: 'weight', type: 'TEXT' },
  { name: 'pincode', type: 'TEXT' },
  { name: 'current_address', type: 'TEXT' },
  { name: 'live_location_enabled', type: 'BOOLEAN DEFAULT 0' },
  { name: 'manglik', type: 'TEXT' },
  { name: 'company', type: 'TEXT' },
  { name: 'designation', type: 'TEXT' },
  { name: 'experience', type: 'TEXT' },
  { name: 'work_location', type: 'TEXT' },
  { name: 'exercise', type: 'TEXT' },
  { name: 'photos', type: 'TEXT' } // Store as JSON string array
];

console.log('Running migration: Adding new profile fields...');

const columns = db.pragma('table_info(profiles)');
const existingColumnNames = columns.map(c => c.name);

for (const col of newColumns) {
  if (!existingColumnNames.includes(col.name)) {
    console.log(`Adding column ${col.name}...`);
    try {
      db.exec(`ALTER TABLE profiles ADD COLUMN ${col.name} ${col.type}`);
    } catch (err) {
      console.error(`Failed to add column ${col.name}:`, err.message);
    }
  } else {
    console.log(`Column ${col.name} already exists.`);
  }
}

console.log('Migration complete!');
process.exit(0);
