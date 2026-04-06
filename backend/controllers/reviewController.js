const Review = require("../models/Review");
const WorkerProfile = require("../models/WorkerProfile");
const Booking = require("../models/Booking");
const notificationController = require("./notificationController");

// Add a Review
exports.addReview = async (req, res) => {
    try {
        const { revieweeId, rating, comment, jobId } = req.body;
        const reviewerId = req.user.id; // From auth middleware

        let targetUserId = revieweeId;

        // Verify if revieweeId is a User or a Profile ID
        const workerCheck = await WorkerProfile.findById(revieweeId);
        if (workerCheck) {
            targetUserId = workerCheck.userId;
        }

        if (jobId) {
            const existingReview = await Review.findOne({ jobId });
            if (existingReview) {
                return res.status(400).json({ message: "Review already submitted for this job." });
            }
        }

        const review = new Review({
            reviewerId,
            revieweeId: targetUserId,
            jobId,
            rating,
            comment
        });

        await review.save();

        if (jobId) {
            const booking = await Booking.findById(jobId);
            if (booking && booking.status === "waiting for customer confirmation") {
                booking.status = "completed";
                await booking.save();
            }
        }

        // Recalculate Average Rating for Worker
        const reviews = await Review.find({ revieweeId: targetUserId });
        const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const avg = reviews.length > 0 ? total / reviews.length : 0;

        await WorkerProfile.findOneAndUpdate(
            { userId: targetUserId },
            { averageRating: avg.toFixed(1), totalReviews: reviews.length }
        );

        // Trigger Notification
        await notificationController.createNotification(
            revieweeId,
            `You received a new ${rating}-star review: "${comment.substring(0, 20)}..."`,
            "SUCCESS"
        );

        res.status(201).json({ message: "Review added", review });
    } catch (err) {
        console.error("Review Controller Error (addReview):", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get Reviews for a User (Worker)
exports.getReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ revieweeId: userId }).populate("reviewerId", "name");
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Review for a specific Job
exports.getJobReview = async (req, res) => {
    try {
        const review = await Review.findOne({ jobId: req.params.jobId });
        res.json(review);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
