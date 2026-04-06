const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

// Create (Customer)
router.post("/create", protect, bookingController.createBooking);

// Get (Worker/Customer)
router.get("/worker", protect, bookingController.getWorkerBookings);
router.get("/customer", protect, bookingController.getCustomerBookings);

// Update Status (Accept/Reject/Cancel/Start/Finish)
router.put("/:id/status", protect, bookingController.updateBookingStatus);

// Process Payment (Customer)
router.post("/:id/payment", protect, bookingController.processPayment);

// Verify OTP (Initial Request Verification)
router.post("/:id/verify-request-otp", protect, bookingController.verifyRequestOTP);

// Confirm Completion (Customer)
router.post("/:id/confirm-completion", protect, bookingController.confirmCompletion);

// Remove the old completion OTP route as we have the payment flow now
// router.post("/:id/verify-otp", protect, bookingController.verifyOTP);

module.exports = router;
