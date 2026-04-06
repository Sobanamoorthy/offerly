const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  salary: { type: Number },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // must match worker userId
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
