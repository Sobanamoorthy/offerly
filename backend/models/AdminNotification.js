const mongoose = require("mongoose");

const adminNotificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["Holiday Offers", "New Service Launch", "System Maintenance", "Info"], default: "Info" },
    targetAudience: { type: String, enum: ["All Workers", "All Customers", "Specific User"], required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Only set if Specific User
    status: { type: String, default: "Sent" }
}, { timestamps: true });

module.exports = mongoose.model("AdminNotification", adminNotificationSchema);
