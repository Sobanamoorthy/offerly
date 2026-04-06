const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
require("dotenv").config();

const User = require("../models/User");
const WorkerProfile = require("../models/WorkerProfile");

const workersFilePath = "c:\\Users\\Sobana\\Downloads\\worker_list_300_unique_passwords (1).json";

const seedAllWorkers = async () => {
    try {
        const rawData = fs.readFileSync(workersFilePath, 'utf8');
        const workers = JSON.parse(rawData);

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected.\n");

        let created = 0;
        let skipped = 0;

        for (const w of workers) {
            const email = w.email.toLowerCase();
            const existing = await User.findOne({ email });
            if (existing) {
                console.log(`  ⏭  SKIP: ${w.name} (${email}) — already exists`);
                skipped++;
                continue;
            }

            let dobDate = null;
            if (w.dateOfBirth) {
                const parts = w.dateOfBirth.split("/");
                if (parts.length === 3) {
                    dobDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00.000Z`);
                }
            }

            const hashedPassword = await bcrypt.hash(w.password, 10);
            const user = new User({
                name: w.name,
                email,
                password: hashedPassword,
                role: "worker"
            });
            await user.save();

            const profile = new WorkerProfile({
                userId: user._id,
                mobile: w.mobileNumber,
                jobCategory: w.mainProfession,
                experience: parseInt(w.experience, 10) || 0,
                location: w.primaryLocation,
                salary: w.dailyRate,
                skills: [w.mainProfession],
                subSkills: w.additionalSkills || [],
                languages: ["Tamil", "English"],
                availability: w.availability && w.availability.includes("Available"),
                isVerified: true,
                dob: dobDate,
                willingToTravel: w.willingToTravel === "Yes",
                willingDistricts: w.preferredDistricts || []
            });
            await profile.save();

            console.log(`  ✅ ADDED: ${w.name} — ${w.mainProfession} (${w.primaryLocation}) — ₹${w.dailyRate}/day`);
            created++;
        }

        console.log(`\n========================================`);
        console.log(`  Total Workers Added:   ${created}`);
        console.log(`  Already Existed:       ${skipped}`);
        console.log(`  Total in Script:       ${workers.length}`);
        console.log(`========================================\n`);

        process.exit(0);
    } catch (err) {
        console.error("Error seeding workers:", err.message);
        process.exit(1);
    }
};

seedAllWorkers();
