import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, MessageSquare, X, Calendar } from "lucide-react";

const styles = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(45, 45, 45, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200, backdropFilter: "blur(8px)" },
    modal: { background: "#FFFFFF", padding: "36px", borderRadius: "24px", width: "90%", maxWidth: "550px", maxHeight: "85vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 60px rgba(0,0,0,0.3)", border: "1px solid #E5E7EB" },
    closeBtn: { position: "absolute", right: "20px", top: "20px", border: "none", background: "#EDE9FF", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", color: "#7C6FCD", transition: "all 0.2s" },
    title: { fontSize: "24px", fontWeight: "800", color: "#7C6FCD", marginBottom: "8px", letterSpacing: "-0.02em" },
    subtitle: { fontSize: "14px", color: "#6B6B8A", fontWeight: "500", marginBottom: "32px", borderBottom: "1px solid #EDE9FF", paddingBottom: "20px" },
    reviewCard: { padding: "24px", background: "#FFFFFF", borderRadius: "16px", marginBottom: "16px", border: "1px solid #EDE9FF", transition: "all 0.2s" },
    reviewHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
    reviewerInfo: { display: "flex", alignItems: "center", gap: "10px" },
    reviewerAvatar: { width: "32px", height: "32px", borderRadius: "50%", background: "#7C6FCD", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" },
    reviewerName: { fontWeight: "700", fontSize: "15px", color: "#2D2B55" },
    rating: { background: "#FFFFFF", color: "#F59E0B", padding: "4px 10px", borderRadius: "8px", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", border: "1px solid #E8E4FF" },
    comment: { color: "#4B5563", fontSize: "15px", lineHeight: "1.6", fontStyle: "italic", margin: "0" },
    date: { fontSize: "12px", color: "#7C6FCD", marginTop: "12px", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }
};

const FeedbackModal = ({ userId, workerName, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/reviews/${userId}`);
                setReviews(res.data);
            } catch (err) {
                console.error("Error fetching reviews:", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchReviews();
    }, [userId]);

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button 
                  style={styles.closeBtn} 
                  onClick={onClose}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#D4CEEF"; e.currentTarget.style.transform = "rotate(90deg)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "#EDE9FF"; e.currentTarget.style.transform = "rotate(0deg)"; }}
                >
                    <X size={20} strokeWidth={2.5} />
                </button>
                
                <h3 style={styles.title}>Client Feedback</h3>
                <div style={styles.subtitle}>Verified service reviews for <b>{workerName}</b></div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#8B6F47", fontWeight: "600" }}>
                        <div style={{ marginBottom: "12px" }}>Loading feedback records...</div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", background: "#FDFBF7", borderRadius: "16px", border: "2px dashed #E5E7EB" }}>
                        <MessageSquare size={40} color="#CBD5E1" style={{ marginBottom: "16px" }} />
                        <p style={{ color: "#6B7280", fontSize: "16px", fontWeight: "500", margin: 0 }}>No reviews shared for this professional yet.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {reviews.slice().reverse().map((r) => (
                            <div key={r._id} style={styles.reviewCard}>
                                <div style={styles.reviewHeader}>
                                    <div style={styles.reviewerInfo}>
                                        <div style={styles.reviewerAvatar}>
                                            {r.reviewerId?.name ? r.reviewerId.name[0].toUpperCase() : 'C'}
                                        </div>
                                        <span style={styles.reviewerName}>{r.reviewerId?.name || "Verified Customer"}</span>
                                    </div>
                                    <div style={styles.rating}>
                                        <Star size={14} fill="#F59E0B" /> {r.rating}.0
                                    </div>
                                </div>
                                <p style={styles.comment}>"{r.comment}"</p>
                                <div style={styles.date}>
                                    <Calendar size={12} />
                                    {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
