import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ReviewForm from "./ReviewForm";
import { Calendar, User, MapPin, Zap, Clock, ShieldCheck, CheckCircle, Award, Copy, Activity } from 'lucide-react';

const styles = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },
    title: { fontSize: "28px", fontWeight: "800", color: "#2D2B55", marginBottom: "32px", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "16px" },
    grid: { display: "grid", gap: "32px", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" },
    card: (isHovered) => ({
        padding: "28px",
        borderRadius: "24px",
        border: isHovered ? "1.5px solid #7C6FCD" : "1.5px solid #E8E4FF",
        background: "#ffffff",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: isHovered ? "0 20px 40px rgba(124, 111, 205, 0.12)" : "0 4px 12px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden"
    }),
    statusBadge: (status) => {
        const colors = {
            pending: { bg: '#FFF8E1', text: '#F59E0B', border: '#FEF3C7' },
            accepted: { bg: '#EDE9FF', text: '#7C6FCD', border: '#E8E4FF' },
            'in progress': { bg: '#EDE9FF', text: '#7C6FCD', border: '#E8E4FF' },
            'waiting for customer confirmation': { bg: '#EDE9FF', text: '#7C6FCD', border: '#E8E4FF' },
            rejected: { bg: '#FEE2E2', text: '#FF6B6B', border: '#FECACA' },
            cancelled: { bg: '#FEE2E2', text: '#FF6B6B', border: '#FECACA' },
            completed: { bg: '#DCFCE7', text: '#43A047', border: '#BBF7D0' }
        };
        const theme = colors[status] || { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
        return {
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: "800",
            textTransform: "uppercase",
            background: theme.bg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            letterSpacing: "0.03em"
        };
    },
    primaryButton: {
        width: "100%",
        padding: "16px",
        borderRadius: "999px",
        border: "none",
        background: "#7C6FCD",
        color: "white",
        fontWeight: "800",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        boxShadow: "0 10px 20px rgba(124, 111, 205, 0.2)",
        transition: "all 0.2s ease",
        fontSize: "15px"
    },
    otpPill: {
        background: "#F5F3FF",
        border: "2px dashed #7C6FCD",
        borderRadius: "16px",
        padding: "16px 20px",
        textAlign: "center",
        margin: "12px 0"
    }
};

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedReviewJob, setSelectedReviewJob] = useState(null);
    const token = localStorage.getItem("token");

    const fetchBookings = useCallback(async () => {
        try {
            const res = await axios.get("https://offerly-ijbn.onrender.com/api/bookings/customer", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const [hoveredIdx, setHoveredIdx] = useState(-1);

    const formatDate = (dateStr) => {
        if (!dateStr) return "TBD";
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "TBD" : date.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>
                <div style={{ width: "6px", height: "32px", background: "#7C6FCD", borderRadius: "3px" }}></div>
                Service Booking History
            </h3>
            
            {bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 40px", color: "#9CA3AF", background: "#FFFFFF", borderRadius: "24px", border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                    <div style={{ marginBottom: "20px", opacity: 0.25 }}><Calendar size={64} strokeWidth={1} /></div>
                    <p style={{ fontWeight: "600", fontSize: "16px", color: "#6B7280" }}>Your service history is currently empty.</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {bookings.slice().reverse().map((b, idx) => (
                        <div
                            key={b._id}
                            style={styles.card(hoveredIdx === idx)}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(-1)}
                        >
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: "18px", color: "#2D2B55", fontWeight: "800" }}>{b.workerType}</h4>
                                        <div style={{ margin: "6px 0 0 0", color: "#7C6FCD", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Calendar size={12} /> {new Date(b.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span style={styles.statusBadge(b.status)}>{b.status}</span>
                                </div>

                                <div style={{ padding: "20px 0", borderTop: "1px solid #F3F4F6", display: "grid", gap: "14px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ color: "#6B6B8A", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><Zap size={14} color="#7C6FCD" /> Priority Level</span>
                                        <span style={{ fontWeight: "800", fontSize: "13px", background: b.urgencyType === "Emergency" ? "#FEE2E2" : "#EDE9FF", color: b.urgencyType === "Emergency" ? "#FF6B6B" : "#7C6FCD", padding: "2px 8px", borderRadius: "6px" }}>{b.urgencyType}</span>
                                    </div>
                                    
                                    <div style={{ background: "#F5F3FF", padding: "16px", borderRadius: "16px", border: "1px solid #E8E4FF" }}>
                                        <div style={{ color: "#7C6FCD", fontSize: "11px", fontWeight: "800", marginBottom: "8px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}><Clock size={12} /> Service Timeline</div>
                                        <div style={{ fontSize: "13px", color: "#2D2B55", fontWeight: "700", lineHeight: "1.6" }}>
                                            {formatDate(b.startDateTime)}
                                            <div style={{ width: "20px", height: "1px", background: "#E8E4FF", margin: "2px 0" }}></div>
                                            {formatDate(b.endDateTime)}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ color: "#6B6B8A", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><User size={14} color="#7C6FCD" /> Assigned Professional</span>
                                        <span style={{ color: "#2D2B55", fontWeight: "800", fontSize: "13px" }}>{b.assignedWorkerId?.name || "Assigning..."}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ color: "#6B6B8A", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><MapPin size={14} color="#7C6FCD" /> Service Location</span>
                                        <span style={{ color: "#2D2B55", fontWeight: "700", fontSize: "13px", textAlign: "right" }}>{b.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px dashed #E5E7EB" }}>
                                {b.status === "waiting for customer confirmation" && (
                                    <button
                                        onClick={() => setSelectedReviewJob(b)}
                                        style={styles.primaryButton}
                                        onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.background = "#6A5EC0"; }}
                                        onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#7C6FCD"; }}
                                    >
                                        <CheckCircle size={20} /> Verify & Submit Review
                                    </button>
                                )}

                                {b.status === "completed" && (
                                    <div style={{ textAlign: "center", padding: "14px", background: "#DCFCE7", borderRadius: "16px", border: "1px solid #BBF7D0", fontSize: "13px", color: "#43A047", fontWeight: "800", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                                        <Award size={18} /> Service Finalized & Rated
                                    </div>
                                )}

                                {b.status === "accepted" && (
                                    <div style={{ background: "#F5F3FF", padding: "20px", borderRadius: "20px", border: "1.5px solid #E8E4FF" }}>
                                        <div style={{ fontSize: "13px", color: "#7C6FCD", marginBottom: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <ShieldCheck size={18} /> Secure Start Code
                                        </div>
                                        <div style={styles.otpPill}>
                                            <span style={{ fontSize: "32px", color: "#2D2B55", fontWeight: "900", letterSpacing: "8px", fontFamily: "monospace" }}>{b.startJobOTP || "----"}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    navigator.clipboard.writeText(b.startJobOTP); 
                                                    alert("OTP copied!"); 
                                                }}
                                                style={{ flex: 1, padding: "10px", background: "#FFFFFF", color: "#7C6FCD", border: "1.5px solid #7C6FCD", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "800", fontSize: "12px", transition: "all 0.2s" }}
                                            >
                                                <Copy size={14} /> Copy Code
                                            </button>
                                        </div>
                                        <p style={{ margin: "14px 0 0 0", fontSize: "11px", color: "#6B6B8A", fontWeight: "600", lineHeight: "1.5", textAlign: "center" }}>Verify this with the professional when they arrive at your location.</p>
                                    </div>
                                )}
                                
                                {b.status === "in progress" && (
                                    <div style={{ textAlign: "center", padding: "14px", background: "#F5F3FF", borderRadius: "16px", border: "1px solid #E8E4FF", fontSize: "13px", color: "#7C6FCD", fontWeight: "800", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                                        <Activity size={18} className="animate-pulse" /> Service is Underway
                                    </div>
                                )}
                                
                                {b.status === "pending" && (
                                    <div style={{ textAlign: "center", padding: "14px", background: "#F5F3FF", borderRadius: "16px", border: "1px solid #E8E4FF", fontSize: "13px", color: "#7C6FCD", fontWeight: "700", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                                        <Clock size={18} /> Assigning Professional...
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedReviewJob && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(92, 64, 51, 0.4)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
                    <div style={{ background: "white", padding: "8px", borderRadius: "28px", width: "100%", maxWidth: "440px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
                        <ReviewForm
                            job={selectedReviewJob}
                            onClose={() => setSelectedReviewJob(null)}
                            onSuccess={() => {
                                setSelectedReviewJob(null);
                                fetchBookings();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
