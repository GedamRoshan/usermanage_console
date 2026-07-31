const db = require('../src/db');
const bcrypt = require('bcryptjs');

const firstNamesMale = ["Aarav", "Vihaan", "Aditya", "Rohan", "Kabir", "Aryan", "Dhruv", "Ishaan", "Karan", "Kunal", "Rahul", "Samar", "Vivaan", "Arjun", "Dev", "Yash", "Rishi", "Neil", "Ansh", "Laksh", "Aayush", "Pranav", "Shaurya", "Karthik", "Rudra"];
const firstNamesFemale = ["Aanya", "Diya", "Sanya", "Kavya", "Riya", "Myra", "Ananya", "Sara", "Priya", "Nisha", "Avni", "Zara", "Tara", "Kiara", "Isha", "Neha", "Pooja", "Maya", "Meera", "Ayesha", "Kriti", "Aditi", "Shruti", "Sneha", "Tanvi"];
const lastNames = ["Sharma", "Verma", "Singh", "Patel", "Gupta", "Kumar", "Reddy", "Mehta", "Joshi", "Desai", "Iyer", "Nair", "Rao", "Das", "Sen", "Bose", "Chopra", "Malhotra", "Kapur", "Ahluwalia"];

const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"];
const religions = ["Hindu", "Muslim", "Christian", "Sikh", "Jain"];
const diets = ["Veg", "Non Veg", "Vegan"];
const occupations = ["Software Engineer", "Doctor", "Teacher", "Business", "Architect", "Designer"];

console.log('Starting seeder...');

try {
  const insertUser = db.prepare('INSERT INTO users (email, phone, password, name, role, status) VALUES (?, ?, ?, ?, ?, ?)');
  
  const insertProfile = db.prepare(`
    INSERT INTO profiles (
      user_id, profile_created_for, full_name, gender, dob, height_cm, weight,
      marital_status, mother_tongue, religion, caste, manglik,
      highest_education, occupation, company, annual_income, country, state, city,
      pincode, diet, smoking, drinking, exercise, photos
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  let count = 0;

  // Insert 25 Males
  for (let i = 0; i < 25; i++) {
    const fn = firstNamesMale[i % firstNamesMale.length];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${fn} ${ln}`;
    const email = `male${i}@example.com`;
    const phone = `+9199900010${i.toString().padStart(2, '0')}`;
    const hashed = bcrypt.hashSync('password123', 10);
    const city = cities[Math.floor(Math.random() * cities.length)];
    const religion = religions[Math.floor(Math.random() * religions.length)];
    const dob = `199${Math.floor(Math.random() * 9)}-0${Math.floor(Math.random() * 8) + 1}-1${Math.floor(Math.random() * 9)}`;

    // Create User
    const userResult = insertUser.run(email, phone, hashed, fullName, 'USER', 'ACTIVE');
    
    // Create Profile
    insertProfile.run(
      userResult.lastInsertRowid, 'Self', fullName, 'Male', dob,
      160 + Math.floor(Math.random() * 25), // height 160-185
      `${60 + Math.floor(Math.random() * 30)} kg`, // weight 60-90
      'Never Married', 'Hindi', religion, 'General', 'No',
      'B.Tech', occupations[Math.floor(Math.random() * occupations.length)], 'TCS', '10 Lakhs',
      'India', 'Maharashtra', city, '400001',
      diets[Math.floor(Math.random() * diets.length)], 'No', 'No', 'Weekly',
      JSON.stringify(["https://picsum.photos/seed/" + email + "/400/600"])
    );
    count++;
  }

  // Insert 25 Females
  for (let i = 0; i < 25; i++) {
    const fn = firstNamesFemale[i % firstNamesFemale.length];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${fn} ${ln}`;
    const email = `female${i}@example.com`;
    const phone = `+9199900020${i.toString().padStart(2, '0')}`;
    const hashed = bcrypt.hashSync('password123', 10);
    const city = cities[Math.floor(Math.random() * cities.length)];
    const religion = religions[Math.floor(Math.random() * religions.length)];
    const dob = `199${Math.floor(Math.random() * 9)}-0${Math.floor(Math.random() * 8) + 1}-1${Math.floor(Math.random() * 9)}`;

    // Create User
    const userResult = insertUser.run(email, phone, hashed, fullName, 'USER', 'ACTIVE');
    
    // Create Profile
    insertProfile.run(
      userResult.lastInsertRowid, 'Self', fullName, 'Female', dob,
      150 + Math.floor(Math.random() * 20), // height 150-170
      `${50 + Math.floor(Math.random() * 25)} kg`, // weight 50-75
      'Never Married', 'Hindi', religion, 'General', 'No',
      'MBA', occupations[Math.floor(Math.random() * occupations.length)], 'Google', '12 Lakhs',
      'India', 'Maharashtra', city, '400001',
      diets[Math.floor(Math.random() * diets.length)], 'No', 'No', 'Daily',
      JSON.stringify(["https://picsum.photos/seed/" + email + "/400/600"])
    );
    count++;
  }

  console.log(`Successfully seeded ${count} profiles (25 Male, 25 Female).`);
} catch (err) {
  if (err.message.includes('UNIQUE constraint failed')) {
    console.log('Seeder has already been run. Database contains these users.');
  } else {
    console.error('Error seeding profiles:', err);
  }
}
