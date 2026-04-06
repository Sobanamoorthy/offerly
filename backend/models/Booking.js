const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workerType: { type: String, required: true },
  urgencyType: { type: String, enum: ["Emergency", "Standard"], required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  totalDays: { type: Number }, // Calculated for Standard bookings
  salary: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["pending", "accepted", "in progress", "waiting for customer confirmation", "completed", "cancelled", "rejected"],
    default: "pending"
  },
  paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
  platformFee: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  scheduledDate: { type: Date }, // Legacy support
  requestOTP: { type: String }, // OTP to confirm request
  isRequestVerified: { type: Boolean, default: false },
  
  // ========== COMMUNICATION & OTP FIELDS ==========
  // Generated when worker accepts job
  acceptanceOTP: { type: String }, // OTP sent to worker to confirm they are accepting
  acceptanceOTPVerified: { type: Boolean, default: false },
  startJobOTP: { type: String }, // 6-digit OTP for worker to start job
  otpExpirationTime: { type: Date }, // Expiration time for OTP (5 minutes)
  communicationID: { type: String }, // COM-XXXX format, links customer & worker without sharing phone numbers
  otpVerified: { type: Boolean, default: false }, // Set to true when OTP verified and job started
  
  // Real-time call tracking
  callStatus: { type: String, enum: ["idle", "requesting", "accepted", "rejected", "connected", "ended"], default: "idle" },
  
  // Job timing records
  jobStartTime: { type: Date }, // When worker actually started the job (after OTP verification)
  jobEndTime: { type: Date }, // When worker marked job as complete
  
  // Call logs for audit trail
  callLogs: [{
    callSID: { type: String }, // Unique ID from Twilio/Exotel
    initiatedBy: { type: String, enum: ["customer", "worker"], default: "customer" },
    initiatedAt: { type: Date, default: Date.now },
    status: { type: String, default: "initiated" }, // initiated, ringing, completed, failed
    duration: { type: Number, default: 0 }, // Duration in seconds
    recordingURL: { type: String }, // URL to call recording if available
    metadata: { type: mongoose.Schema.Types.Mixed }
  }],
  
  // Legacy fields kept for backward compatibility
  completionOTP: { type: String } // OTP to confirm completion
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
