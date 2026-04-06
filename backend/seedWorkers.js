const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const User = require('./models/User');
const WorkerProfile = require('./models/WorkerProfile');

const workersData = require('../worker_data_fixed.json');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bluecollar');
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Helper to parse "26/06/1984" -> Date object
const parseDOB = (dobStr) => {
    if (!dobStr) return null;
    const parts = dobStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
};

const importData = async () => {
    try {
        await connectDB();

        console.log(`Starting to insert ${workersData.length} workers...`);
        let inserted = 0;
        let skipped = 0;

        for (let workerData of workersData) {
            // Check if user already exists
            let existingUser = await User.findOne({ email: workerData.email });
            if (existingUser) {
                console.log(`  SKIP: ${workerData.email} already exists.`);
                skipped++;
                continue;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(workerData.password, salt);

            // 1. Create User Document
            const newUser = await User.create({
                name: workerData.name,
                email: workerData.email,
                password: hashedPassword,
                role: 'worker',
                isActive: true
            });

            // 2. Create WorkerProfile Document (matching actual schema fields)
            await WorkerProfile.create({
                userId: newUser._id,
                mobile: workerData.mobileNumber,
                jobCategory: workerData.mainProfession,
                experience: parseInt(workerData.experience),   // "15 Years" -> 15
                location: workerData.primaryLocation,
                salary: workerData.dailyRate,
                skills: workerData.additionalSkills || [],
                subSkills: [],
                languages: ['Tamil'],
                availability: workerData.availability === 'Available Now',
                dob: parseDOB(workerData.dateOfBirth),
                willingToTravel: workerData.willingToTravel === 'Yes',
                willingDistricts: workerData.preferredDistricts || [],
                isVerified: true,
                coordinates: [78.1460, 11.6643]  // Default Tamil Nadu coords
            });

            inserted++;
            console.log(`  OK: ${workerData.name} (${workerData.email})`);
        }

        console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);
        process.exit();
    } catch (error) {
        console.error(`Error with import: ${error.message}`);
        process.exit(1);
    }
};

importData();
