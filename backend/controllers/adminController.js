const User = require("../models/User");
const CustomerProfile = require("../models/CustomerProfile");
const WorkerProfile = require("../models/WorkerProfile");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const AdminNotification = require("../models/AdminNotification");
const notificationController = require("./notificationController");
const bcrypt = require("bcryptjs");

// Admin Dashboard Stats
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Aggregation for Demand by Skill
    const demandBySkill = await Booking.aggregate([
      { $group: { _id: "$workerType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Aggregation for Demand by City (Location)
    const demandByCity = await Booking.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const completedBookings = await Booking.find({ status: "completed" }).select("salary createdAt");
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.salary || 0), 0);

    // Fetch 5 Top Rated Workers
    const topWorkers = await WorkerProfile.find()
      .populate("userId", "name email")
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(5);

    // Count Unverified Workers
    const unverifiedWorkers = await WorkerProfile.countDocuments({ isVerified: false });

    // Fetch 5 most recent bookings
    const recentBookings = await Booking.find()
      .populate("customerId", "name")
      .populate("assignedWorkerId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalBookings,
      totalReviews,
      totalRevenue,
      demandBySkill,
      demandByCity,
      topWorkers,
      unverifiedWorkers,
      recentBookings,
      completedBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Customers with Aggregated Stats
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");

    const customerData = await Promise.all(customers.map(async (user) => {
      const profile = await CustomerProfile.findOne({ userId: user._id });
      const bookingsCount = await Booking.countDocuments({ customerId: user._id });
      const bookings = await Booking.find({ customerId: user._id, status: "completed" });
      const totalSpending = bookings.reduce((sum, b) => sum + (b.salary || 0), 0);
      const reviewsGiven = await Review.countDocuments({ reviewerId: user._id });

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: profile ? profile.mobile : "N/A",
        location: profile ? profile.location : "N/A",
        isActive: user.isActive,
        bookingsCount,
        totalSpending,
        reviewsGiven
      };
    }));

    res.json(customerData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle Customer Status (Activate/Deactivate)
exports.toggleCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle Worker Verification
exports.toggleWorkerVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await WorkerProfile.findById(id);
    if (!worker) return res.status(404).json({ message: "Worker profile not found" });

    worker.isVerified = !worker.isVerified;
    await worker.save();

    res.json({ message: `Worker ${worker.isVerified ? 'verified' : 'unverified'}`, isVerified: worker.isVerified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Workers for Management
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await WorkerProfile.find().populate("userId", "name email isActive");
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add Customer from Admin Dashboard
exports.addCustomer = async (req, res) => {
  try {
    const { name, email, mobile, location, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password || 'Customer@123', 10);
    const user = new User({ name, email: email.toLowerCase().trim(), password: hashedPassword, role: "customer" });
    await user.save();

    const profile = new CustomerProfile({ userId: user._id, mobile: mobile || "N/A", location: location || "N/A" });
    await profile.save();

    res.status(201).json({ message: "Customer added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add Worker from Admin Dashboard
exports.addWorker = async (req, res) => {
  try {
    const { name, email, category, experience, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password || 'Worker@123', 10);
    const user = new User({ name, email: email.toLowerCase().trim(), password: hashedPassword, role: "worker" });
    await user.save();

    const profile = new WorkerProfile({
      userId: user._id,
      skills: category ? [category] : [],
      experience: experience || "0",
      jobCategory: category || "General",
      isVerified: true // Auto-verify added by admin
    });
    await profile.save();

    res.status(201).json({ message: "Worker added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, location } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Customer not found" });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    await user.save();

    let profile = await CustomerProfile.findOne({ userId: id });
    if (!profile && (mobile || location)) {
      profile = new CustomerProfile({ userId: id });
    }
    if (profile) {
      if (mobile) profile.mobile = mobile;
      if (location) profile.location = location;
      await profile.save();
    }

    res.json({ message: "Customer updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    await CustomerProfile.findOneAndDelete({ userId: id });
    await Booking.deleteMany({ customerId: id });
    await Review.deleteMany({ reviewerId: id });
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Worker
exports.updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, experience, category } = req.body;

    const workerProfile = await WorkerProfile.findById(id).populate("userId");
    if (!workerProfile) return res.status(404).json({ message: "Worker not found" });

    const user = await User.findById(workerProfile.userId._id);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase().trim();
      await user.save();
    }

    if (experience) workerProfile.experience = experience;
    if (category) {
      workerProfile.jobCategory = category;
      workerProfile.skills = [category];
    }
    await workerProfile.save();

    res.json({ message: "Worker updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Worker
exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const workerProfile = await WorkerProfile.findById(id);
    if (!workerProfile) return res.status(404).json({ message: "Worker not found" });

    await User.findByIdAndDelete(workerProfile.userId);
    await WorkerProfile.findByIdAndDelete(id);
    await Booking.deleteMany({ assignedWorkerId: workerProfile.userId });
    await Review.deleteMany({ workerId: workerProfile.userId });
    res.json({ message: "Worker deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Notifications Management ---

// Get all Admin Notifications
exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find()
      .populate("targetUser", "name email")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new Admin Notification (Broadcast or Direct)
exports.createAdminNotification = async (req, res) => {
  try {
    const { title, message, type, targetAudience, targetUser } = req.body;

    const newAdminNotif = new AdminNotification({
      title,
      message,
      type,
      targetAudience,
      targetUser: targetAudience === "Specific User" ? targetUser : undefined
    });

    await newAdminNotif.save();

    // Determine target users
    let targetUsers = [];
    if (targetAudience === "All Workers") {
      targetUsers = await User.find({ role: "worker", isActive: true });
    } else if (targetAudience === "All Customers") {
      targetUsers = await User.find({ role: "customer", isActive: true });
    } else if (targetAudience === "Specific User") {
      const user = await User.findById(targetUser);
      if (user) targetUsers.push(user);
    }

    // Send in-app notification to each matched user
    const typeMapping = {
      "Holiday Offers": "SUCCESS",
      "New Service Launch": "INFO",
      "System Maintenance": "ALERT",
      "Info": "INFO"
    };

    const notificationType = typeMapping[type] || "INFO";

    // Broadcast concurrently using Promis.all based on existing controller method
    await Promise.all(targetUsers.map(user =>
      notificationController.createNotification(user._id, `[${title}] ${message}`, notificationType)
    ));

    res.status(201).json({ message: "Notification sent successfully", notification: newAdminNotif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an Admin Notification history record
exports.deleteAdminNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await AdminNotification.findByIdAndDelete(id);
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET All Bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "name email")
      .populate("assignedWorkerId", "name email")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE Booking (Admin: Reassign/Reschedule)
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedWorkerId, startDateTime, endDateTime, status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (assignedWorkerId) booking.assignedWorkerId = assignedWorkerId;
    if (startDateTime) booking.startDateTime = new Date(startDateTime);
    if (endDateTime) booking.endDateTime = new Date(endDateTime);
    if (status) booking.status = status;

    await booking.save();
    
    // Notify customer and worker of changes
    const msg = `Attention: Your booking for ${booking.workerType} has been updated by the Admin. Please check your dashboard.`;
    await notificationController.createNotification(booking.customerId, msg, "ALERT");
    if (booking.assignedWorkerId) {
        await notificationController.createNotification(booking.assignedWorkerId, msg, "ALERT");
    }

    res.json({ message: "Booking updated successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
