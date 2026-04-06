const mongoose = require("mongoose");

const workerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mobile: { type: String, required: true },
  jobCategory: { type: String, required: true, index: true },
  experience: { type: Number, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },
  skills: { type: [String], default: [] },
  subSkills: { type: [String], default: [] }, // e.g. ["AC Repair", "Wiring"]
  languages: { type: [String], default: ["Tamil"] },
  availability: { type: Boolean, default: true },
  dob: { type: Date },
  willingToTravel: { type: Boolean, default: false },
  willingDistricts: { type: [String], default: [] },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  coordinates: {
    type: [Number], // [longitude, latitude]
    index: "2dsphere"
  }
}, { timestamps: true });

module.exports = mongoose.model("WorkerProfile", workerProfileSchema);
