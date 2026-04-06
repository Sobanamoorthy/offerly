const express = require("express");
const router = express.Router();
const communicationController = require("../controllers/communicationController");
const { protect } = require("../middleware/authMiddleware");

// ============================================================================
// COMMUNICATION & OTP ROUTES
// ============================================================================

/**
 * POST /api/communication/:bookingId/initiate-call
 * Customer initiates call to worker
 * Requires: Customer to be owner of booking
 * Returns: Call SID and platform phone number
 */
router.post(
  "/:bookingId/initiate-call",
  protect,
  communicationController.initiateCallToWorker
);

/**
 * POST /api/communication/:bookingId/initiate-call-to-customer
 * Worker initiates call to customer
 */
router.post(
  "/:bookingId/initiate-call-to-customer",
  protect,
  communicationController.initiateCallToCustomer
);

/**
 * POST /api/communication/:bookingId/verify-acceptance-otp
 * Worker verifies their own acceptance via OTP
 */
router.post(
  "/:bookingId/verify-acceptance-otp",
  protect,
  communicationController.verifyAcceptanceOTP
);

/**
 * POST /api/communication/:bookingId/request-otp
 * Worker requests Start Job OTP from customer
 * Requires: Worker to be assigned to booking
 * Returns: Notification message to send to customer
 */
router.post(
  "/:bookingId/request-otp",
  protect,
  communicationController.requestOTPToStartJob
);

/**
 * POST /api/communication/:bookingId/verify-otp
 * Worker enters and verifies Start Job OTP
 * Requires: Valid 4-digit OTP
 * Changes booking status to "in progress"
 */
router.post(
  "/:bookingId/verify-otp",
  protect,
  async (req, res) => {
    await communicationController.verifyStartJobOTP(req, res);
    const io = req.app.get("io");
    if (io) io.emit("communication-update", { bookingId: req.params.bookingId });
  }
);

/**
 * GET /api/communication/:bookingId
 * Get communication details for customer or worker
 * Returns filtered information based on user role
 */
router.get(
  "/:bookingId",
  protect,
  communicationController.getBookingCommunication
);

/**
 * PUT /api/communication/:bookingId/complete-job
 * Worker marks job as complete
 * Requires: Booking status to be "in progress"
 * Changes status to "waiting for customer confirmation"
 */
router.put(
  "/:bookingId/complete-job",
  protect,
  async (req, res) => {
    await communicationController.completeJob(req, res);
    const io = req.app.get("io");
    if (io) io.emit("communication-update", { bookingId: req.params.bookingId });
  }
);

// New Simulated Call Routes
router.post(
  "/:bookingId/request-call",
  protect,
  async (req, res) => {
    await communicationController.requestCall(req, res);
    const io = req.app.get("io");
    if (io) io.emit("communication-update", { bookingId: req.params.bookingId });
  }
);

router.post(
  "/:bookingId/respond-call",
  protect,
  async (req, res) => {
    await communicationController.respondCall(req, res);
    const io = req.app.get("io");
    if (io) io.emit("communication-update", { bookingId: req.params.bookingId });
  }
);

router.post(
  "/:bookingId/end-call",
  protect,
  async (req, res) => {
    await communicationController.endCall(req, res);
    const io = req.app.get("io");
    if (io) io.emit("communication-update", { bookingId: req.params.bookingId });
  }
);

module.exports = router;
