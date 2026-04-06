const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");
const { protect, adminOnly, workerOnly } = require("../middleware/authMiddleware");

// Worker endpoints
router.post("/", protect, workerOnly, supportController.createTicket);
router.get("/", protect, workerOnly, supportController.getWorkerTickets);
router.post("/:id/reply", protect, workerOnly, supportController.workerReply);
router.put("/:id/close", protect, workerOnly, supportController.closeTicket);

// Admin endpoints
router.get("/admin", protect, adminOnly, supportController.getAllTickets);
router.put("/admin/:id/reply", protect, adminOnly, supportController.replyToTicket);

module.exports = router;
