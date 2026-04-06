const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const WorkerProfile = require("../models/WorkerProfile");
const Notification = require("../models/Notification");
const { createNotification } = require("./notificationController");
const communicationService = require("../services/communicationService");
const User = require("../models/User");
const CustomerProfile = require("../models/CustomerProfile");

// CREATE DIRECT BOOKING
exports.createBooking = async (req, res) => {
  try {
    const {
      workerId,
      workerType,
      urgencyType,
      startDateTime,
      endDateTime,
      salary,
      location,
      description
    } = req.body;
    const customerId = req.user.id;

    if (!workerId || !mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({ message: "Invalid worker ID" });
    }

    if (!urgencyType || !["Emergency", "Standard"].includes(urgencyType)) {
      return res.status(400).json({ message: "Invalid urgency type" });
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid start or end date/time" });
    }

    if (start >= end) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    // STRICT OVERLAP VALIDATION
    // Check if worker has any overlapping active bookings (pending, accepted, in progress, or awaiting confirmation)
    const overlappingBooking = await Booking.findOne({
      assignedWorkerId: workerId,
      status: { $in: ["pending", "accepted", "in progress", "waiting for customer confirmation"] },
      $or: [
        { startDateTime: { $lt: end }, endDateTime: { $gt: start } }
      ]
    });

    if (overlappingBooking) {
      const overlapStart = new Date(overlappingBooking.startDateTime).toLocaleString();
      const overlapEnd = new Date(overlappingBooking.endDateTime).toLocaleString();
      return res.status(400).json({
        message: `This worker is already booked from ${overlapStart} to ${overlapEnd}. Please choose a different time slot.`
      });
    }

    let totalDays = 0;
    if (urgencyType === "Standard") {
      const diffTime = Math.abs(end - start);
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Generate completion OTP and Communication ID immediately
    const completionOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const communicationID = `COM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const booking = new Booking({
      customerId,
      assignedWorkerId: workerId,
      workerType,
      urgencyType,
      startDateTime: start,
      endDateTime: end,
      totalDays,
      salary,
      location,
      description,
      status: "pending",
      scheduledDate: start, // Legacy support
      completionOTP,
      communicationID
    });

    await booking.save();

    // Fetch details for Notification
    const customer = await User.findById(customerId);
    const workerProfile = await WorkerProfile.findOne({ userId: workerId });
    const customerProfile = await CustomerProfile.findOne({ userId: customerId });

    const workerMobile = workerProfile?.mobile || "N/A";
    const customerMobile = customerProfile?.mobile || "N/A";
    const dateRangeStr = `${start.toLocaleString()} to ${end.toLocaleString()}`;

    const detailedMsg = `
--- [NEW BOOKING ALERT] ---
To: ${workerMobile} (Worker)
Details:
- Customer: ${customer?.name}
- Job: ${workerType}
- Urgency: ${urgencyType}
- Salary: ₹${salary}
- Location: ${location}
- Time Range: ${dateRangeStr}
- Total Days: ${urgencyType === "Standard" ? totalDays : "N/A (Emergency)"}
- Notes: ${description || "None"}
---------------------------
`;
    // Mock Real Mobile Notification to Worker
    console.log(detailedMsg);

    // 6. Notify Worker in App
    await createNotification(
      workerId,
      `💼 New Booking Request: You have a new ${workerType} request from ${customer?.name}. Please check your dashboard to accept or reject.`,
      "INFO"
    );

    res.status(201).json({
      message: "Booking request sent! The professional has been notified on their mobile.",
      booking
    });
  } catch (err) {
    console.error("Booking Controller Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// VERIFY REQUEST OTP (Confirm Request)
exports.verifyRequestOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.requestOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    booking.status = "pending";
    booking.isRequestVerified = true;
    await booking.save();

    // Notify the Worker only After Verification
    const customer = await User.findById(booking.customerId);
    const customerProfile = await CustomerProfile.findOne({ userId: booking.customerId });
    const customerMobile = customerProfile?.mobile || "N/A";
    const dateStr = booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleString() : "ASAP";

    const msg = `New VERIFIED Request: ${customer?.name || "A customer"} needs a ${booking.workerType} in ${booking.location} at ${dateStr}. Please check your dashboard to accept.`;

    await createNotification(booking.assignedWorkerId, msg, "ALERT");

    // Mock SMS Notification for Worker
    const workerProfile = await WorkerProfile.findOne({ userId: booking.assignedWorkerId });
    if (workerProfile?.mobile) {
      console.log(`[SMS-MOCK] Sent Job Alert to Worker Mobile (${workerProfile.mobile}): ${msg}`);
    }

    res.json({ message: "Request verified! Worker has been notified.", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET BOOKINGS FOR WORKER
exports.getWorkerBookings = async (req, res) => {
  try {
    const workerId = req.user.id;
    const bookings = await Booking.find({
      assignedWorkerId: workerId,
      status: { $ne: "cancelled" }
    })
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    const updatedBookings = bookings.map(b => b.toObject());

    res.json(updatedBookings);
  } catch (err) {
    console.error("Booking Controller Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET BOOKINGS FOR CUSTOMER
exports.getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user.id;
    const bookings = await Booking.find({ customerId })
      .populate("assignedWorkerId", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Booking Controller Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// UPDATE STATUS (Accept, Reject, Cancel, Start Work, Finish Work)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id).populate("assignedWorkerId", "name");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!booking.customerId) {
      return res.status(400).json({ message: "Booking data is corrupted (missing customerId)" });
    }

    const workerName = booking.assignedWorkerId?.name || "The worker";
    let message = `Your booking for ${booking.workerType} has been updated to ${status}.`;
    let notifyType = "INFO";

    if (status === "accepted") {
      // Worker clicks Accept -> Status becomes 'accepted'. We generate a 4-digit startJobOTP for Customer
      booking.status = "accepted";
      
      const startJobOTP = Math.floor(1000 + Math.random() * 9000).toString();
      booking.startJobOTP = startJobOTP; 
      booking.otpExpirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      
      await booking.save();
      
      // Send Official Notification with OTP to CUSTOMER
      const { createNotification } = require("./notificationController");
      await createNotification(
        booking.customerId,
        `🔑 Offerly Admin: ${workerName} has accepted your ${booking.workerType} job! Your service OTP is: ${startJobOTP}. Provide this to the worker when they arrive.`,
        "INFO"
      );
      
      // Send standard Accepted alert to worker without OTP
      await createNotification(
        booking.assignedWorkerId,
        `You have successfully accepted the ${booking.workerType} job. You will need to get the Start Job OTP from the customer to begin the work.`,
        "INFO"
      );
      
      return res.json({ 
        message: "Job accepted successfully. You will need the OTP from the customer to start the job.",
        requiresOTP: false,
        booking 
      });
    } else if (status === "rejected") {
      booking.status = "rejected";
      message = `Sorry, ${workerName} has rejected your booking request for ${booking.workerType}.`;
    } else if (status === "in progress") {
      if (booking.status !== "accepted") {
        return res.status(400).json({ message: "Work can only be started for an accepted booking." });
      }

      booking.status = "in progress";
      booking.jobStartTime = new Date();
      message = `${workerName} has started the job: ${booking.workerType}.`;
      notifyType = "SUCCESS";
    } else if (status === "waiting for customer confirmation") {
      if (booking.status !== "in progress") {
        return res.status(400).json({ message: "Only in-progress work can be marked as completed." });
      }
      booking.status = "waiting for customer confirmation";
      message = `${workerName} has finished the work. Please review and confirm completion to submit your review.`;
      notifyType = "ALERT";
    } else if (status === "cancelled") {
      booking.status = "cancelled";
      message = `The booking for ${booking.workerType} has been cancelled.`;
    } else {
      return res.status(400).json({ message: "Invalid status transition." });
    }

    await booking.save();

    // Notify the Customer
    try {
      await createNotification(booking.customerId, message, notifyType);
    } catch (notifyErr) {
      console.error("Non-fatal Notification Error:", notifyErr);
    }

    // Decision Alert (Console/SMS Mock)
    const customerProfile = await CustomerProfile.findOne({ userId: booking.customerId });
    if (customerProfile?.mobile) {
      console.log(`\n--- [BOOKING STATUS UPDATE] ---\nTo: ${customerProfile.mobile}\nMessage: ${message}\n-------------------------------\n`);
    }

    res.json({ message: `Status updated to ${status}`, booking });
  } catch (err) {
    console.error("Booking Controller Error in updateBookingStatus:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PROCESS PAYMENT AND FINALIZE BOOKING
exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentDetails } = req.body;
    const customerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    const booking = await Booking.findById(id).populate("assignedWorkerId", "name");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // CHECK AUTHORIZATION: Only the customer who booked can confirm/pay
    if (booking.customerId.toString() !== customerId) {
      console.warn(`[AUTH] Unauthorized payment attempt by user ${customerId} for booking ${id}`);
      return res.status(403).json({ message: "You are not authorized to confirm this booking." });
    }

    if (booking.status !== "waiting for customer confirmation") {
      return res.status(400).json({
        message: `Booking status is '${booking.status}'. Payment can only be processed when status is 'waiting for customer confirmation'.`
      });
    }

    // Logic: Calculate fees
    const serviceCharge = booking.salary * (booking.urgencyType === "Standard" ? (booking.totalDays || 1) : 1);
    const platformFee = Math.round(serviceCharge * 0.05);
    const totalAmount = serviceCharge + platformFee;

    // Update Booking Status
    booking.status = "completed";
    booking.paymentStatus = "paid";
    booking.platformFee = platformFee;
    booking.totalAmount = totalAmount;

    await booking.save();
    console.log(`[PAYMENT] Booking ${id} marked as COMPLETED and PAID. Amount: ₹${totalAmount}`);

    // Update Worker Earnings Record
    try {
      const workerProfile = await WorkerProfile.findOne({ userId: booking.assignedWorkerId });
      if (workerProfile) {
        workerProfile.totalEarnings = (workerProfile.totalEarnings || 0) + serviceCharge;
        await workerProfile.save();
        console.log(`[EARNINGS] Updated for worker ${booking.assignedWorkerId}: +₹${serviceCharge}`);
      }

      const msg = `Payment Successful! You earned ₹${serviceCharge} for the ${booking.workerType} job.`;
      await createNotification(booking.assignedWorkerId, msg, "SUCCESS");
    } catch (earnErr) {
      console.error("[EARNINGS] Error updating worker profile:", earnErr.message);
    }

    // Notify Customer
    await createNotification(
      booking.customerId,
      `Payment Successful! Your job with ${booking.assignedWorkerId?.name} is completed. Total: ₹${totalAmount}.`,
      "SUCCESS"
    );

    res.status(200).json({
      success: true,
      message: "Payment confirmed and booking completed.",
      booking
    });
  } catch (err) {
    console.error(`[PAYMENT ERROR] ID: ${req.params.id}:`, err);
    res.status(500).json({ message: "An internal server error occurred during payment processing.", error: err.message });
  }
};

// CUSTOMER CONFIRMS COMPLETION
exports.confirmCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    const booking = await Booking.findById(id).populate("assignedWorkerId", "name");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.customerId.toString() !== customerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status !== "waiting for customer confirmation") {
      return res.status(400).json({ message: "Job is not awaiting confirmation." });
    }

    booking.status = "completed";
    await booking.save();

    // Create Notification for Worker
    const { createNotification } = require("./notificationController");
    await createNotification(
      booking.assignedWorkerId._id,
      `🙌 Job Completed! ${req.user.name} has confirmed the completion of the ${booking.workerType} job.`,
      "SUCCESS"
    );

    res.json({ success: true, message: "Job completion confirmed!", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
