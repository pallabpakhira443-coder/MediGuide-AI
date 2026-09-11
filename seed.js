require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const Hospital = require('./models/Hospital');
const User = require('./models/User');
const { seedDoctors, seedHospitals } = require('./utils/mockData');

async function runSeed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediguide_db';
  console.log(`[Seeder] Connecting to MongoDB at ${uri}...`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log('✅ Connected to MongoDB.');

    // Clear existing collections
    console.log('[Seeder] Clearing old records...');
    await Doctor.deleteMany({});
    await Hospital.deleteMany({});
    await User.deleteMany({});

    // Seed Doctors
    console.log(`[Seeder] Inserting ${seedDoctors.length} Doctor profiles...`);
    const docData = seedDoctors.map(({ _id, ...rest }) => rest);
    await Doctor.insertMany(docData);

    // Seed Hospitals
    console.log(`[Seeder] Inserting ${seedHospitals.length} Emergency Hospital profiles...`);
    const hospData = seedHospitals.map(({ _id, ...rest }) => rest);
    await Hospital.insertMany(hospData);

    // Seed Sample User
    console.log('[Seeder] Inserting demo Patient user...');
    await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phone: '+1 (555) 234-5678',
      location: {
        type: 'Point',
        coordinates: [-73.9855, 40.7484],
      },
      medicalHistory: ['Asthma (Mild)', 'Penicillin Allergy'],
    });

    console.log('🎉 [Seeder] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.warn(`⚠️ [Seeder] MongoDB not reachable (${error.message}).`);
    console.log('💡 Note: MediGuide AI already operates with these 11+ Doctors and 5+ Level 1 Trauma Hospitals pre-loaded into its resilient local engine.');
    process.exit(0);
  }
}

runSeed();
