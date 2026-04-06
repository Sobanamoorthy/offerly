import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import CommunicationPanel from "./CommunicationPanel";
import { Calendar, MapPin, User, IndianRupee, FileText, Briefcase, Zap, Clock, Activity, CheckCircle } from 'lucide-react';

const styles = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },
    header: { fontSize: "32px", color: "#2D2B55", marginBottom: "40px", fontWeight: "800", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: "16px" },
    sectionTitle: { fontSize: "20px", color: "#2D2B55", marginBottom: "24px", fontWeight: "800", display: "flex", alignItems: "center", gap: "12px", borderLeft: "4px solid #7C6FCD", paddingLeft: "16px" },
    card: (status) => ({
        background: "#ffffff",
        padding: "32px",
        borderRadius: "24px",
        border: "1.5px solid #E8E4FF",
        boxShadow: "0 4px 12px rgba(124, 111, 205, 0.03)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    }),
    badge: (status) => {
        const colors = {
            pending: { bg: '#FFF8E1', text: '#F59E0B', border: '#FEF3C7' },
            accepted: { bg: '#EDE9FF', text: '#7C6FCD', border: '#E8E4FF' },
            'in progress': { bg: '#EDE9FF', text: '#7C6FCD', border: '#E8E4FF' },
            'waiting for customer confirmation': { bg: '#EDE9FF', text: '#7C6FCD', border: '#E8E4FF' },
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
    actionButton: (type) => ({
        padding: "12px 28px",
        borderRadius: "999px",
        border: "none",
        fontSize: "14px",
        fontWeight: "800",
        cursor: "pointer",
        background: type === "accept" ? "#7C6FCD" : type === "reject" ? "#FEE2E2" : "#7C6FCD",
        color: type === "reject" ? "#FF6B6B" : "#FFFFFF",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        boxShadow: type === "reject" ? "none" : "0 4px 12px rgba(124, 111, 205, 0.1)"
    }),
    infoRow: { display: "flex", alignItems: "center", gap: "10px", color: "#6B6B8A", fontSize: "14px", fontWeight: "500" },
    infoIcon: { color: "#7C6FCD", width: "18px", height: "18px" }
};

const maskPhone = (phone) => {
    if (!phone) return "Not Provided";
    const str = String(phone);
    if (str.length < 5) return str;
    return "XXXXX-XX" + str.slice(-3);
};

export default function WorkerJobBoard() {
    const [bookings, setBookings] = useState([]);
    const { user } = useAuth();
    const token = localStorage.getItem("token");

    const fetchBookings = useCallback(async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/bookings/worker", { headers: { Authorization: `Bearer ${token}` } });
            setBookings(res.data);
        } catch (err) { console.error("Failed to fetch jobs:", err); }
    }, [token]);

    useEffect(() => {
        if (user) fetchBookings();
    }, [user, fetchBookings]);

    const handleStatusUpdate = async (id, status) => {
        try {
            const payload = { status };
            await axios.put(`http://localhost:5000/api/bookings/${id}/status`, payload, { headers: { Authorization: `Bearer ${token}` } });
            fetchBookings();
        } catch (err) { alert(err.response?.data?.message || "Failed to update status"); }
    };

    const newJobs = bookings.filter(j => j.status === 'pending');
    const activeJobs = bookings.filter(j => ['accepted', 'in progress', 'waiting for customer confirmation'].includes(j.status));
    const upcomingJobs = bookings.filter(j => j.status === 'accepted' && new Date(j.startDateTime) > new Date(new Date().setHours(23, 59, 59, 999)));

    const activeJobsFiltered = activeJobs.filter(j => !upcomingJobs.some(u => u._id === j._id));

    const renderJobsList = (list, emptyMsg) => {
        if (list.length === 0) return (
            <div style={{ padding: "40px", background: "#F5F3FF", borderRadius: "20px", border: "1px dashed #E8E4FF", textAlign: "center", color: "#6B6B8A" }}>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: "500" }}>{emptyMsg}</p>
            </div>
        );
        return (
            <div style={{ display: "grid", gap: "32px" }}>
                {list.map(job => (
                    <div key={job._id} style={styles.card(job.status)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
                            <div style={{ flex: 1, minWidth: "280px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <h4 style={{ margin: 0, color: "#2D2B55", fontWeight: "900", fontSize: "22px", letterSpacing: "-0.01em" }}>{job.workerType}</h4>
                                    <div style={styles.badge(job.status)}>{job.status}</div>
                                </div>
                                
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                                    <div style={styles.infoRow}><User style={styles.infoIcon} /><strong style={{ color: "#2D2B55" }}>{job.customerId?.name}</strong> <span style={{ fontSize: "12px", color: "#9CA3AF" }}>({maskPhone(job.customerId?.mobile)})</span></div>
                                    <div style={styles.infoRow}><Calendar style={styles.infoIcon} /><span>{new Date(job.startDateTime).toLocaleDateString()} - {new Date(job.endDateTime).toLocaleDateString()}</span></div>
                                    <div style={styles.infoRow}><MapPin style={styles.infoIcon} /><span>{job.location}</span></div>
                                    <div style={{ ...styles.infoRow, color: "#7C6FCD", fontWeight: "800" }}><IndianRupee style={styles.infoIcon} /><span>₹{job.salary} / day</span></div>
                                </div>

                                {job.description && (
                                    <div style={{ marginTop: "20px", padding: "16px", background: "#F5F3FF", borderRadius: "16px", border: "1px solid #E8E4FF", fontSize: "14px", color: "#6B6B8A", lineHeight: "1.6", fontStyle: "italic" }}>
                                        <FileText size={16} color="#7C6FCD" style={{ marginBottom: "8px", display: "block" }} />
                                        "{job.description}"
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {job.status === "pending" && (
                                    <>
                                        <button onClick={() => handleStatusUpdate(job._id, "accepted")} style={styles.actionButton("accept")}>Accept Assignment</button>
                                        <button onClick={() => handleStatusUpdate(job._id, "rejected")} style={styles.actionButton("reject")}>Decline</button>
                                    </>
                                )}
                                {job.status === "in progress" && (
                                    <button onClick={() => handleStatusUpdate(job._id, "waiting for customer confirmation")} style={styles.actionButton("primary")}>
                                        <CheckCircle size={18} /> Complete Job
                                    </button>
                                )}
                                {job.status === "waiting for customer confirmation" && (
                                    <div style={{ padding: "12px 20px", background: "#EDE9FF", color: "#7C6FCD", borderRadius: "999px", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #E8E4FF" }}>
                                        <Clock size={14} /> AWAITING CUSTOMER
                                    </div>
                                )}
                            </div>
                        </div>

                        {['accepted', 'in progress'].includes(job.status) && (
                            <div style={{ borderTop: "1.5px solid #E8E4FF", paddingTop: "24px", marginTop: "8px" }}>
                                <CommunicationPanel booking={job} userRole="worker" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>
                <Briefcase size={36} color="#00BFA5" />
                Service Board
            </h2>

            <div style={{ marginBottom: "56px" }}>
                <h3 style={styles.sectionTitle}><Activity size={20} color="#00BFA5" /> Active Assignments</h3>
                {renderJobsList(activeJobsFiltered, "You have no active assignments at the moment.")}
            </div>

            <div style={{ marginBottom: "56px" }}>
                <h3 style={styles.sectionTitle}><Zap size={20} color="#00BFA5" /> New Job Requests</h3>
                {renderJobsList(newJobs, "No new job requests found.")}
            </div>

            <div style={{ marginBottom: "56px" }}>
                <h3 style={styles.sectionTitle}><Calendar size={20} color="#1A1A2E" /> Upcoming Schedule</h3>
                {renderJobsList(upcomingJobs, "Your schedule is clear for the coming days.")}
            </div>
        </div>
    );
}
