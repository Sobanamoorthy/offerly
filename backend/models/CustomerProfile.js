const mongoose = require("mongoose");

const customerProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    mobile: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"] },
    address: { type: String },
    city: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },
    profilePhoto: { type: String },
    location: { type: String },
    isVerified: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("CustomerProfile", customerProfileSchema);
