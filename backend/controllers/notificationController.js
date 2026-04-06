const Notification = require("../models/Notification");
const User = require("../models/User");
const smsService = require("../services/smsService");

// Get User Notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Mark as Read
exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ message: "Marked as read" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Create Notification (Internal Use mainly)
exports.createNotification = async (userId, message, type = "INFO") => {
    try {
        // Save to DB - this creates in-app website notification
        const notification = new Notification({ userId, message, type });
        await notification.save();
        
        // Duplicate to Admin for important events
        const NOTIFY_ADMIN_TYPES = ['booking_request', 'payment', 'dispute', 'new_user'];
        if (NOTIFY_ADMIN_TYPES.includes(type)) {
            const adminUser = await User.findOne({ role: 'admin' });
            if (adminUser && adminUser._id.toString() !== userId.toString()) {
                const adminNotify = new Notification({ 
                    userId: adminUser._id, 
                    message: `[ADMIN COPY] for User ${userId}: ${message}`, 
                    type 
                });
                await adminNotify.save();
                console.log(`[ADMIN NOTIFIED] Type: ${type}, Admin: ${adminUser._id}`);
            }
        }

        // Notification is now available on the website/frontend
        // Users will see it in NotificationPanel component
        console.log(`[NOTIFICATION SAVED] User: ${userId}, Message: ${message}, Type: ${type}`);
        
        return notification;
    } catch (err) {
        console.error("Notification Error:", err);
    }
};
