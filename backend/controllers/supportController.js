const SupportTicket = require("../models/SupportTicket");

// --- WORKER ENDPOINTS ---

// Create a new support ticket
exports.createTicket = async (req, res) => {
    try {
        const { subject, description } = req.body;
        if (!subject || !description) {
            return res.status(400).json({ message: "Subject and description are required" });
        }

        const ticket = new SupportTicket({
            workerId: req.user.id,
            subject,
            description
        });
        await ticket.save();

        res.status(201).json({ message: "Support ticket submitted successfully", ticket });
    } catch (error) {
        console.error("Error creating support ticket:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get all tickets for logged-in worker
exports.getWorkerTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ workerId: req.user.id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching worker tickets:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Worker replies to a ticket
exports.workerReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) return res.status(400).json({ message: "Message is required" });

        const ticket = await SupportTicket.findById(id);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });
        if (ticket.workerId.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

        ticket.replies.push({ sender: "worker", message });
        ticket.status = "Worker Replied";
        await ticket.save();

        res.json({ message: "Reply sent successfully", ticket });
    } catch (error) {
        console.error("Error sending reply:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Worker closes ticket
exports.closeTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await SupportTicket.findById(id);

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });
        if (ticket.workerId.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

        ticket.status = "Closed";
        await ticket.save();

        res.json({ message: "Ticket closed successfully", ticket });
    } catch (error) {
        console.error("Error closing ticket:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- ADMIN ENDPOINTS ---

// Get all support tickets
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find().populate("workerId", "name email").sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching admin tickets:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Admin replies to a ticket
exports.replyToTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminResponse } = req.body; // Can be used for backward compatibility with `replyToTicket` route
        const message = req.body.message || adminResponse;

        if (!message) {
            return res.status(400).json({ message: "Admin response is required" });
        }

        const ticket = await SupportTicket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Keep adminResponse up to date for backward compatibility
        ticket.adminResponse = message;

        // Add to replies thread
        ticket.replies.push({ sender: "admin", message });
        ticket.status = "Answered";
        await ticket.save();

        res.json({ message: "Ticket answered successfully", ticket });
    } catch (error) {
        console.error("Error replying to ticket:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
