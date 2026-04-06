const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Admin Login (public — no auth required)
router.post("/login", authController.adminLogin);

// Admin Dashboard
router.get("/dashboard", protect, adminOnly, adminController.getDashboard);

// Customer Management Routing
router.get("/customers", protect, adminOnly, adminController.getAllCustomers);
router.post("/customers", protect, adminOnly, adminController.addCustomer);
router.put("/customers/:id", protect, adminOnly, adminController.updateCustomer);
router.delete("/customers/:id", protect, adminOnly, adminController.deleteCustomer);
router.put("/customers/:id/status", protect, adminOnly, adminController.toggleCustomerStatus);

// Worker Management Routing
router.get("/workers", protect, adminOnly, adminController.getAllWorkers);
router.post("/workers", protect, adminOnly, adminController.addWorker);
router.put("/workers/:id", protect, adminOnly, adminController.updateWorker);
router.delete("/workers/:id", protect, adminOnly, adminController.deleteWorker);
router.put("/workers/:id/verify", protect, adminOnly, adminController.toggleWorkerVerification);

// Notification Management Routing
router.get("/notifications", protect, adminOnly, adminController.getAdminNotifications);
router.post("/notifications", protect, adminOnly, adminController.createAdminNotification);
router.delete("/notifications/:id", protect, adminOnly, adminController.deleteAdminNotification);

// Booking Management Routing
router.get("/booking-history", protect, adminOnly, adminController.getAllBookings);
router.put("/bookings/:id", protect, adminOnly, adminController.updateBooking);

module.exports = router;
