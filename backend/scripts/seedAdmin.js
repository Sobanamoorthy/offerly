/**
 * Admin Seed Script
 * Creates the single admin account for Offerly.
 *
 * Usage:  node scripts/seedAdmin.js
 *
 * Default credentials:
 *   Email:    admin@offerly.com
 *   Password: Admin@123
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@offerly.com").toLowerCase();
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Offerly Admin";

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected.");

        // Check if admin already exists
        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log("Admin account already exists. No action taken.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        const admin = new User({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();

        console.log("=== Admin Account Created ===");
        console.log(`  Email:    ${ADMIN_EMAIL}`);
        console.log(`  Password: ${ADMIN_PASSWORD}`);
        console.log("=============================");
        console.log("IMPORTANT: Change this password after first login.");

        process.exit(0);
    } catch (err) {
        console.error("Error seeding admin:", err.message);
        process.exit(1);
    }
};

seedAdmin();
