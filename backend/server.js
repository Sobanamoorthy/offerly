const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
    const SILENT_PATHS = ['/api/communication', '/api/notifications'];
    if (!SILENT_PATHS.some(p => req.path.startsWith(p))) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/workers", require("./routes/workerRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/communication", require("./routes/communicationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));

// Socket.io Signaling Logic
const userSockets = new Map(); // userId -> socketId

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("start-call", ({ bookingId, workerId, customerName, customerId }) => {
        const workerSocketId = userSockets.get(workerId);
        if (workerSocketId) {
            io.to(workerSocketId).emit("incoming-call", {
                bookingId,
                customerName,
                customerId
            });
        }
    });

    socket.on("reject-call", ({ customerId }) => {
        const customerSocketId = userSockets.get(customerId);
        if (customerSocketId) {
            io.to(customerSocketId).emit("call-rejected");
        }
    });

    socket.on("accept-call", ({ customerId }) => {
        const customerSocketId = userSockets.get(customerId);
        if (customerSocketId) {
            io.to(customerSocketId).emit("incoming-call-accepted");
        }
    });

    socket.on("disconnect", () => {
        for (let [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");

connectDB();

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
