const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Answered", "Worker Replied", "Closed"],
        default: "Pending"
    },
    adminResponse: {
        type: String,
        default: ""
    },
    replies: [
        {
            sender: { type: String, enum: ["worker", "admin"], required: true },
            message: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
