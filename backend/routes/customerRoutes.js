const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CustomerProfile = require("../models/CustomerProfile");
const { protect } = require("../middleware/authMiddleware");

// Get customer profile
router.get("/profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("name email");
        let profile = await CustomerProfile.findOne({ userId: req.user.id });

        if (!profile) {
            profile = { mobile: "", location: "", dateOfBirth: "", gender: "", address: "", city: "", district: "", state: "", pincode: "", profilePhoto: "" };
        }

        res.json({ ...profile._doc, ...profile, name: user.name, email: user.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Update customer profile
router.post("/profile", protect, async (req, res) => {
    try {
        const { name, email, mobile, location, dateOfBirth, gender, address, city, district, state, pincode, profilePhoto } = req.body;

        // Update user
        if (name || email) {
            const user = await User.findById(req.user.id);
            if (name) user.name = name;
            if (email) user.email = email;
            await user.save();
        }

        let profile = await CustomerProfile.findOne({ userId: req.user.id });

        const profileData = {
            mobile, location, dateOfBirth, gender, address, city, district, state, pincode, profilePhoto
        };

        if (profile) {
            Object.assign(profile, profileData);
            await profile.save();
        } else {
            profile = new CustomerProfile({
                userId: req.user.id,
                ...profileData
            });
            await profile.save();
        }
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
