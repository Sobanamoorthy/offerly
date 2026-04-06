/**
 * Communication Controller
 * Handles OTP verification, call initiation, and communication endpoints
 */

const Booking = require("../models/Booking");
const User = require("../models/User");
const WorkerProfile = require("../models/WorkerProfile");
const communicationService = require("../services/communicationService");

// ============================================================================
// 1. GENERATE OTP & COMMUNICATION ID WHEN WORKER ACCEPTS JOB
// ============================================================================

/**
 * Called when worker accepts a job
 * Generates Start Job OTP and Communication ID
 * These are stored in the booking record
 */
exports.generateOTPOnAccept = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "pending") {
      throw new Error("Only pending bookings can be accepted");
    }

    // Generate OTP and Communication ID
    const startJobOTP = communicationService.generateOTP();
    const communicationID = communicationService.generateCommunicationID();
    const otpExpiration = communicationService.getOTPExpiration();

    // Update booking with generated values
    booking.status = "accepted";
    booking.startJobOTP = startJobOTP;
    booking.communicationID = communicationID;
    booking.otpExpirationTime = otpExpiration;
    booking.otpVerified = false;

    await booking.save();

    return {
      success: true,
      message: "Job accepted. OTP and Communication ID generated.",
      data: {
        communicationID,
        otpExpirationTime: otpExpiration,
        // NOTE: startJobOTP is NOT returned to frontend
        // Worker will request it from Customer
      }
    };
  } catch (err) {
    console.error("Error in generateOTPOnAccept:", err.message);
    throw err;
  }
};

// ============================================================================
// 1b. VERIFY ACCEPTANCE OTP - WORKER CONFIRMS JOB ACCEPTANCE
// ============================================================================

/**
 * API Endpoint: POST /api/communication/:bookingId/verify-acceptance-otp
 * Called when worker enters the OTP received after clicking "Accept Job"
 * If correct, booking status changes to "accepted"
 */
exports.verifyAcceptanceOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;
    const workerId = req.user.id;

    const booking = await Booking.findById(bookingId).populate("assignedWorkerId customerId", "name");
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.assignedWorkerId._id.toString() !== workerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.acceptanceOTP !== otp) {
      return res.status(400).json({ message: "Invalid Acceptance OTP" });
    }

    // Success - Set status to accepted
    booking.status = "accepted";
    booking.acceptanceOTPVerified = true;
    
    // Generate the communication details for the NEXT step (Start Job)
    booking.startJobOTP = communicationService.generateOTP();
    if (!booking.communicationID) {
      booking.communicationID = communicationService.generateCommunicationID();
    }
    booking.otpExpirationTime = communicationService.getOTPExpiration();

    await booking.save();

    // Create Notification for Customer
    const { createNotification } = require("./notificationController");
    await createNotification(
      booking.customerId._id,
      `🔑 Offerly Admin: The worker has officially accepted your service request! Provide them this Start Job OTP: ${booking.startJobOTP} when they arrive, or relay it over a Secure Call to officially begin the job.`,
      "INFO"
    );

    return res.json({
      success: true,
      message: "Job acceptance confirmed! Status updated to 'accepted'.",
      booking
    });
  } catch (err) {
    console.error("Error verifying acceptance OTP:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================================================
// 2. INITIATE CALL - CUSTOMER CALLS WORKER VIA PLATFORM
// ============================================================================

/**
 * API Endpoint: POST /api/bookings/:id/initiate-call
 * Called when customer clicks "📞 Call Worker"
 * Initiates call: Customer → Platform Number → Worker
 */
exports.initiateCallToWorker = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const customerId = req.user.id;

    // Fetch booking
    const booking = await Booking.findById(bookingId)
      .populate("customerId", "phone")
      .populate("assignedWorkerId", "phone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify this is the customer's booking
    if (booking.customerId._id.toString() !== customerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Booking must be pending, accepted or in progress
    if (!["pending", "accepted", "in progress"].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot call. Booking status is ${booking.status}.`
      });
    }

    const customerPhone = booking.customerId.phone;
    const workerPhone = booking.assignedWorkerId.phone;
    const platformPhoneNumber = process.env.PLATFORM_PHONE_NUMBER || "+1234567890";

    // Initiate call through Twilio or simulation
    let callResult;
    if (process.env.TWILIO_ACCOUNT_SID) {
      callResult = await communicationService.initiateCallViaTwilio(
        customerPhone,
        workerPhone,
        platformPhoneNumber,
        bookingId
      );
    } else {
      // Simulation mode
      callResult = {
        callSID: `call-${Date.now()}`,
        status: "initiated",
        message: "Call initiated (simulation mode - Twilio not configured)",
        routing: {
          from: platformPhoneNumber,
          to: platformPhoneNumber,
          actualRouting: `${customerPhone} → ${platformPhoneNumber} → ${workerPhone}`
        }
      };
    }

    // Log the call
    const callLog = communicationService.createCallLog({
      bookingId,
      callSID: callResult.callSID,
      initiatedBy: "customer",
      status: callResult.status
    });

    // Store call log in booking (optional - can be separate collection)
    if (!booking.callLogs) booking.callLogs = [];
    booking.callLogs.push(callLog);
    await booking.save();

    // Send notification to worker
    // TODO: Add socket.io or push notification here

    return res.json({
      success: true,
      message: "Call initiated. Connecting...",
      callSID: callResult.callSID,
      displayNumber: platformPhoneNumber, // Customer and worker see this
      note: "Both you and the worker will see the platform number"
    });
  } catch (err) {
    console.error("Error initiating call:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * API Endpoint: POST /api/bookings/:id/initiate-call-to-customer
 * Called when worker clicks "📞 Call Customer"
 * Initiates call: Worker → Platform Number → Customer
 */
exports.initiateCallToCustomer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const workerId = req.user.id;

    // Fetch booking
    const booking = await Booking.findById(bookingId)
      .populate("customerId", "phone")
      .populate("assignedWorkerId", "phone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify this is the assigned worker
    if (booking.assignedWorkerId._id.toString() !== workerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Booking must be accepted or in progress
    if (!["accepted", "in progress"].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot call. Booking status is ${booking.status}.`
      });
    }

    const customerPhone = booking.customerId.phone;
    const workerPhone = booking.assignedWorkerId.phone;
    const platformPhoneNumber = process.env.PLATFORM_PHONE_NUMBER || "+1234567890";

    // Initiate call through communication service
    let callResult;
    if (process.env.TWILIO_ACCOUNT_SID) {
      callResult = await communicationService.initiateCallViaTwilio(
        workerPhone,   // From Worker
        customerPhone, // To Customer
        platformPhoneNumber,
        bookingId
      );
    } else {
      // Simulation mode
      callResult = {
        callSID: `call-${Date.now()}`,
        status: "initiated",
        message: "Call initiated (simulation mode - Twilio not configured)",
        routing: {
          from: platformPhoneNumber,
          to: platformPhoneNumber,
          actualRouting: `${workerPhone} → ${platformPhoneNumber} → ${customerPhone}`
        }
      };
    }

    // Log the call
    const callLog = communicationService.createCallLog({
      bookingId,
      callSID: callResult.callSID,
      initiatedBy: "worker",
      status: callResult.status
    });

    if (!booking.callLogs) booking.callLogs = [];
    booking.callLogs.push(callLog);
    await booking.save();

    return res.json({
      success: true,
      message: "Call initiated. Connecting to customer...",
      callSID: callResult.callSID,
      displayNumber: platformPhoneNumber,
      note: "Both you and the customer will see the platform number"
    });
  } catch (err) {
    console.error("Error initiating worker call:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

// ============================================================================
// 3. REQUEST START JOB OTP - WORKER REQUESTS OTP FROM CUSTOMER
// ============================================================================

/**
 * API Endpoint: POST /api/bookings/:id/request-otp
 * Called when worker clicks "Request OTP to Start Job" button
 * Returns a notification to be sent to customer
 */
exports.requestOTPToStartJob = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const workerId = req.user.id;

    const booking = await Booking.findById(bookingId).populate(
      "assignedWorkerId customerId",
      "name"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify this is the assigned worker
    if (booking.assignedWorkerId._id.toString() !== workerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Booking must be accepted
    if (booking.status !== "accepted") {
      return res.status(400).json({
        message: `Cannot request OTP. Booking status is ${booking.status}. Job must be accepted first.`
      });
    }

    // Notification message for customer
    const notificationMessage = `${booking.assignedWorkerId.name} is requesting the Start Job OTP. Communication ID: ${booking.communicationID}`;

    // In production, send via:
    // - SMS: ${booking.customerId.phone}
    // - In-App Notification
    // - Email

    return res.json({
      success: true,
      message: "OTP request sent to customer",
      communicationID: booking.communicationID,
      notification: notificationMessage,
      customerDetails: {
        name: booking.customerId.name,
        // Note: Phone number NOT exposed to worker
      }
    });
  } catch (err) {
    console.error("Error requesting OTP:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

// ============================================================================
// 4. VERIFY OTP & START JOB
// ============================================================================

/**
 * API Endpoint: POST /api/bookings/:id/verify-start-job-otp
 * Called when worker enters OTP and clicks "Start Job"
 * If OTP is correct, booking status changes to "in progress"
 */
exports.verifyStartJobOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;
    const workerId = req.user.id;

    if (!otp || otp.length !== 4) {
      return res.status(400).json({
        message: "Invalid OTP format. Must be 4 digits."
      });
    }

    // Fetch booking
    const booking = await Booking.findById(bookingId).populate(
      "assignedWorkerId customerId",
      "name"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify worker
    if (booking.assignedWorkerId._id.toString() !== workerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Booking must be accepted
    if (booking.status !== "accepted") {
      return res.status(400).json({
        message: `Cannot start job. Booking status is ${booking.status}`
      });
    }

    // Check if already started
    if (booking.otpVerified) {
      return res.status(400).json({
        message: "Job has already been started"
      });
    }

    // Rate limiting check
    const attemptCheck = communicationService.recordOTPAttempt(bookingId);
    if (!attemptCheck.allowed) {
      return res.status(429).json({
        message: attemptCheck.message,
        attemptsLeft: 0,
        lockoutUntil: attemptCheck.lockoutUntil
      });
    }

    // Verify OTP
    const verification = communicationService.verifyOTP(
      otp,
      booking.startJobOTP,
      booking.otpExpirationTime
    );

    if (!verification.valid) {
      return res.status(400).json({
        message: verification.message,
        attemptsLeft: attemptCheck.attemptsLeft
      });
    }

    // OTP verified - Update booking status
    booking.status = "in progress";
    booking.otpVerified = true;
    booking.jobStartTime = new Date();
    await booking.save();

    // Clear OTP attempts
    communicationService.clearOTPAttempts(bookingId);

    // Send notification to customer
    // TODO: Socket.io or push notification

    return res.json({
      success: true,
      message: "OTP verified! Job started.",
      booking: {
        id: booking._id,
        status: booking.status,
        jobStartTime: booking.jobStartTime,
        workerName: booking.assignedWorkerId.name,
        customerName: booking.customerId.name
      }
    });
  } catch (err) {
    console.error("Error verifying OTP:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

// ============================================================================
// 5. GET BOOKING COMMUNICATION DETAILS
// ============================================================================

/**
 * API Endpoint: GET /api/bookings/:id/communication
 * Returns communication details for customer or worker dashboard
 * Filters what information is shown based on user role
 */
exports.getBookingCommunication = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate("assignedWorkerId", "name email")
      .populate("customerId", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify user is part of this booking
    const isCustomer = booking.customerId._id.toString() === userId;
    const isWorker = booking.assignedWorkerId && booking.assignedWorkerId._id.toString() === userId;

    if (!isCustomer && !isWorker) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let communicationData = {
      bookingId: booking._id,
      communicationID: booking.communicationID,
      status: booking.status,
      jobStartTime: booking.jobStartTime,
      callStatus: booking.callStatus || "idle"
    };

    if (isCustomer) {
      // Customer view
      communicationData = {
        ...communicationData,
        workerName: booking.assignedWorkerId?.name || "Pending assignment",
        workerEmail: booking.assignedWorkerId?.email,
        canCallWorker: ["accepted", "in progress"].includes(booking.status),
        callButtonLabel: "Request Call",
        otpExpirationTime: booking.otpExpirationTime,
        isJobInProgress: booking.status === "in progress"
      };
    } else if (isWorker) {
      // Worker view
      communicationData = {
        ...communicationData,
        customerName: booking.customerId.name,
        customerEmail: booking.customerId.email,
        canRequestOTP: booking.status === "accepted",
        canVerifyOTP: booking.status === "accepted" && !booking.otpVerified,
        otpExpirationTime: booking.otpExpirationTime,
        isJobInProgress: booking.status === "in progress",
        // NOTE: OTP is never sent to frontend in response
      };
    }

    return res.json({
      success: true,
      communication: communicationData
    });
  } catch (err) {
    console.error("Error fetching communication details:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

// ============================================================================
// 6. COMPLETE JOB & RELEASE OTP VERIFICATION
// ============================================================================

/**
 * API Endpoint: PUT /api/bookings/:id/complete-job
 * Called when worker marks job as complete
 * Transitions status to "waiting for customer confirmation"
 */
exports.completeJob = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const workerId = req.user.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.assignedWorkerId.toString() !== workerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status !== "in progress") {
      return res.status(400).json({
        message: `Cannot complete job. Status must be 'in progress', not '${booking.status}'`
      });
    }

    // Update booking
    booking.status = "waiting for customer confirmation";
    booking.jobEndTime = new Date();
    await booking.save();

    return res.json({
      success: true,
      message: "Job marked as complete. Waiting for customer confirmation.",
      booking: {
        id: booking._id,
        status: booking.status,
        jobEndTime: booking.jobEndTime
      }
    });
  } catch (err) {
    console.error("Error completing job:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

// ============================================================================
// 7. REAL-TIME CALL REQUESTING SYSTEM (Customer -> Worker)
// ============================================================================

exports.requestCall = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("assignedWorkerId", "name phone");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.customerId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    if (!["accepted", "in progress"].includes(booking.status)) {
      return res.status(400).json({ message: "Booking must be accepted to request a call." });
    }

    booking.callStatus = "requesting";
    await booking.save();

    // Create Notification for the worker
    const { createNotification } = require("./notificationController");
    await createNotification(booking.assignedWorkerId._id, `Incoming Call Request from Customer. Check your dashboard to accept.`, "ALERT");

    res.json({ success: true, message: "Call request sent to worker." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.respondCall = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const booking = await Booking.findById(bookingId).populate("customerId", "name phone");
    
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.assignedWorkerId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    if (action === "accept") {
      booking.callStatus = "accepted";
      await booking.save();
      
      // Simulate connection delay
      setTimeout(async () => {
        const checkBooking = await Booking.findById(bookingId);
        if(checkBooking && checkBooking.callStatus === "accepted") {
            checkBooking.callStatus = "connected";
            await checkBooking.save();
        }
      }, 5000); 

      return res.json({ success: true, message: "Call accepted." });
    } else {
      booking.callStatus = "rejected";
      await booking.save();
      
      // Reset back to idle after a few seconds so customer can request again later
      setTimeout(async () => {
        const checkBooking = await Booking.findById(bookingId);
        if(checkBooking && checkBooking.callStatus === "rejected") {
            checkBooking.callStatus = "idle";
            await checkBooking.save();
        }
      }, 3000);

      return res.json({ success: true, message: "Call rejected." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.endCall = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    
    booking.callStatus = "ended";
    await booking.save();
    
    // Reset back to idle after a few seconds so it hides the ended UI
    setTimeout(async () => {
        const checkBooking = await Booking.findById(bookingId);
        if(checkBooking) {
            checkBooking.callStatus = "idle";
            await checkBooking.save();
        }
    }, 4000);
    
    return res.json({ success: true, message: "Call ended." });
  } catch (err) {
     res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
