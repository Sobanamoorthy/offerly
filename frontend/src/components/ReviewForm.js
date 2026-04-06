import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, X, Send, Award } from 'lucide-react';

const ReviewForm = ({ revieweeId, onReviewSubmit, job, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [existingReview, setExistingReview] = useState(null);
    const [fetching, setFetching] = useState(false);

    const token = localStorage.getItem("token");

    // Unified worker ID extraction
    const targetUserId = revieweeId || job?.assignedWorkerId?._id || job?.assignedWorkerId;

    useEffect(() => {
        if (job?._id) {
            const fetchExistingReview = async () => {
                setFetching(true);
                try {
                    const res = await axios.get(`https://offerly-ijbn.onrender.com/api/reviews/job/${job._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data) {
                        setExistingReview(res.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch existing review", err);
                } finally {
                    setFetching(false);
                }
            };
            fetchExistingReview();
        }
    }, [job?._id, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!targetUserId) {
            alert("Error: Worker ID is missing. Please refresh and try again.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(
                "https://offerly-ijbn.onrender.com/api/reviews",
                {
                    revieweeId: targetUserId,
                    rating,
                    comment,
                    jobId: job?._id
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage("✅ Your review has been successfully submitted.");
            setExistingReview(res.data.review || { rating, comment, createdAt: new Date() });

            if (onReviewSubmit) onReviewSubmit();
            if (onSuccess) onSuccess();

            if (onClose) setTimeout(onClose, 2000);
        } catch (err) {
            console.error(err);
            setMessage("❌ " + (err.response?.data?.message || "Failed to submit review."));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div style={{ padding: "20px", color: "#8B6F47", fontWeight: "600", textAlign: "center" }}>Checking review status...</div>;

    if (existingReview) {
        return (
            <div style={{ marginTop: "16px", padding: "24px", borderRadius: "16px", background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", position: "relative" }}>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{ position: "absolute", right: "12px", top: "12px", border: "none", background: "#EDE9FF", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", color: "#7C6FCD", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <X size={18} />
                    </button>
                )}
                {message && <div style={{ marginBottom: "16px", padding: "12px", borderRadius: "10px", background: "#DCFCE7", color: "#16A34A", fontSize: "14px", fontWeight: "700", textAlign: "center", border: "1px solid #BBF7D0" }}>{message}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h5 style={{ margin: 0, color: "#2D2B55", fontSize: "16px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Award size={20} color="#7C6FCD" /> Feedback Received
                    </h5>
                    <div style={{ background: "#EDE9FF", color: "#F59E0B", padding: "6px 14px", borderRadius: "999px", fontWeight: "800", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", border: "1px solid #C4BFEF" }}>
                        <Star size={16} fill="#F59E0B" /> {existingReview.rating} / 5
                    </div>
                </div>
                <div style={{ color: "#2D2D2D", fontSize: "15px", lineHeight: "1.6", fontStyle: "italic", background: "#EDE9FF", padding: "16px", borderRadius: "12px", border: "1px solid #C4BFEF", fontWeight: "500" }}>
                    "{existingReview.comment}"
                </div>
                {existingReview.createdAt && (
                    <div style={{ fontSize: "12px", color: "#7C6FCD", marginTop: "12px", textAlign: "right", fontWeight: "600" }}>
                        Reviewed on {new Date(existingReview.createdAt).toLocaleDateString()}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ marginTop: "16px", padding: "28px", borderRadius: "20px", background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", position: "relative" }}>
            {onClose && (
                <button
                    onClick={onClose}
                    style={{ position: "absolute", right: "16px", top: "16px", border: "none", background: "#EDE9FF", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", color: "#7C6FCD", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <X size={20} />
                </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <div style={{ width: "32px", height: "32px", background: "#EDE9FF", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Star size={18} color="#7C6FCD" fill="#7C6FCD" />
                </div>
                <h5 style={{ margin: 0, color: "#2D2B55", fontSize: "18px", fontWeight: "800", letterSpacing: "-0.01em" }}>Rate Your Experience</h5>
            </div>

            {message && <p style={{ padding: "12px", borderRadius: "10px", background: message.includes("❌") ? "#FEE2E2" : "#DCFCE7", color: message.includes("❌") ? "#EF4444" : "#16A34A", fontSize: "14px", fontWeight: "700", marginBottom: "20px", textAlign: "center", border: message.includes("❌") ? "1px solid #FECACA" : "1px solid #BBF7D0" }}>{message}</p>}
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", color: "#7C6FCD", fontWeight: "700", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Overall Satisfaction</label>
                    <div style={{ position: "relative" }}>
                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #E5E7EB", outline: "none", color: "#2D2D2D", cursor: "pointer", fontSize: "15px", fontWeight: "600", appearance: "none", background: "#FFFFFF" }}
                        >
                            <option value="5">Exceptional Quality ★★★★★</option>
                            <option value="4">Highly Professional ★★★★</option>
                            <option value="3">Average Service ★★★</option>
                            <option value="2">Below Expectations ★★</option>
                            <option value="1">Unsatisfactory ★</option>
                        </select>
                        <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#7C6FCD" }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                    </div>
                </div>
                <div style={{ marginBottom: "28px" }}>
                    <label style={{ display: "block", fontSize: "12px", color: "#7C6FCD", fontWeight: "700", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Detailed Feedback</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did the professional do well? Anything we could improve?"
                        required
                        style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", minHeight: "100px", outline: "none", fontFamily: "'Inter', sans-serif", fontSize: "15px", resize: "vertical", color: "#2D2D2D" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    onMouseOver={(e) => { if(!loading) { e.target.style.background = "#6A5EC0"; e.target.style.transform = "translateY(-2px)"; } }}
                    onMouseOut={(e) => { if(!loading) { e.target.style.background = "#7C6FCD"; e.target.style.transform = "translateY(0)"; } }}
                    style={{
                        width: "100%",
                        padding: "16px",
                        background: loading ? "#C4BFEF" : "#7C6FCD",
                        color: "white",
                        border: "none",
                        borderRadius: "999px",
                        fontWeight: "700",
                        fontSize: "16px",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        boxShadow: loading ? "none" : "0 4px 12px rgba(124, 111, 205, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px"
                    }}
                >
                    {loading ? "Submitting..." : <><Send size={18} /> Publish Review</>}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
