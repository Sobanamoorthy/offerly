import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Star, Quote, Calendar, User } from 'lucide-react';

const styles = {
    container: { maxWidth: "1000px", margin: "0 auto", padding: "16px 0" },
    title: { fontSize: "28px", color: "#2D2B55", marginBottom: "32px", fontWeight: "800", display: "flex", alignItems: "center", gap: "12px" },
    summaryCard: { 
        background: "#F5F3FF", 
        padding: "32px", 
        borderRadius: "24px", 
        border: "1px solid #E8E4FF", 
        marginBottom: "40px", 
        display: "flex", 
        alignItems: "center", 
        gap: "32px",
        boxShadow: "0 4px 12px rgba(124, 111, 205, 0.03)"
    },
    averageValue: { fontSize: "48px", fontWeight: "900", color: "#7C6FCD", lineHeight: 1 },
    reviewCard: { 
        background: "#FFFFFF", 
        padding: "24px", 
        borderRadius: "20px", 
        border: "1px solid #E8E4FF",
        transition: "transform 0.2s ease"
    },
    stars: { color: "#F59E0B", display: "flex", gap: "2px" },
    comment: { color: "#6B6B8A", fontSize: "15px", lineHeight: "1.6", fontStyle: "italic", margin: "16px 0" }
};

export default function WorkerReviews() {
    const [reviews, setReviews] = useState([]);
    const [average, setAverage] = useState("0.0");
    const { user } = useAuth();
    const token = localStorage.getItem("token");

    const fetchReviews = useCallback(async () => {
        try {
            if (!user) return;
            const profRes = await axios.get(`https://offerly-ijbn.onrender.com/api/workers/profile?userId=${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
            setAverage(profRes.data?.averageRating?.toFixed(1) || "0.0");

            const res = await axios.get(`https://offerly-ijbn.onrender.com/api/reviews/${user.id}`);
            setReviews(res.data);
        } catch (err) { console.error("Failed to fetch reviews:", err); }
    }, [user, token]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}><Star size={32} color="#F59E0B" fill="#F59E0B" /> Reputation & Feedback</h2>

            <div style={styles.summaryCard}>
                <div style={styles.averageValue}>{average}</div>
                <div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#2D2B55", marginBottom: "4px" }}>Average Satisfaction</div>
                    <div style={{ color: "#6B6B8A", fontWeight: "600", fontSize: "14px" }}>Computed from {reviews.length} total assessments.</div>
                </div>
            </div>

            <div style={{ display: "grid", gap: "24px" }}>
                {reviews.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px", background: "#F5F3FF", borderRadius: "24px", border: "1px dashed #E8E4FF", color: "#6B6B8A" }}>
                        <p style={{ margin: 0, fontWeight: "600" }}>No customer feedback documented yet.</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review._id} style={styles.reviewCard}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "800", color: "#2D2B55" }}>
                                    <div style={{ width: "32px", height: "32px", background: "#EDE9FF", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <User size={16} color="#7C6FCD" />
                                    </div>
                                    {review.reviewerId?.name || "Customer Account"}
                                </div>
                                <div style={styles.stars}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} fill={i < review.rating ? "#F59E0B" : "transparent"} strokeWidth={i < review.rating ? 0 : 2} color="#F59E0B" />
                                    ))}
                                </div>
                            </div>
                            <div style={styles.comment}>
                                <Quote size={16} color="#E5E7EB" style={{ marginBottom: "8px", display: "block" }} />
                                {review.comment}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9CA3AF", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                <Calendar size={12} /> {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
