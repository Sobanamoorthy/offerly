import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Calendar, MapPin, IndianRupee } from 'lucide-react';

export default function WorkerJobHistory() {
    const [activeTab, setActiveTab] = useState("completed");
    const [bookings, setBookings] = useState([]);
    const [sortOrder, setSortOrder] = useState("newest");
    const { user } = useAuth();
    const token = localStorage.getItem("token");

    const fetchBookings = useCallback(async () => {
        try {
            const res = await axios.get("https://offerly-ijbn.onrender.com/api/bookings/worker", { headers: { Authorization: `Bearer ${token}` } });
            setBookings(res.data);
        } catch (err) { console.error("Failed to fetch jobs:", err); }
    }, [token]);

    useEffect(() => {
        if (user) fetchBookings();
    }, [user, fetchBookings]);

    const completedJobs = bookings.filter(j => j.status === 'completed');
    const cancelledJobs = bookings.filter(j => ['rejected', 'cancelled'].includes(j.status));

    const sortedJobs = (tab) => {
        const list = tab === "completed" ? completedJobs : cancelledJobs;
        return list.sort((a, b) => {
            if (sortOrder === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortOrder === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            return 0;
        });
    };

    const renderJobsList = (list) => {
        if (list.length === 0) return (
            <div style={{ textAlign: "center", padding: "48px", background: "#FFFFFF", borderRadius: "16px", border: "1px solid #E5E7EB", color: "#6B7280" }}>
                <Calendar size={48} strokeWidth={1} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: "16px" }}>No data available</p>
            </div>
        );
        return (
            <div style={{ display: "grid", gap: "24px" }}>
                {list.map(job => (
                    <div key={job._id} style={{
                        background: "#ffffff", padding: "24px", borderRadius: "16px",
                        border: "1px solid #E5E7EB", position: "relative",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transition: "all 0.2s ease"
                    }} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }} onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}>
                        <div style={{
                            position: "absolute", top: "20px", right: "20px", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase",
                            background: job.status === "completed" ? "#DCFCE7" : "#FEE2E2", color: job.status === "completed" ? "#16A34A" : "#EF4444", letterSpacing: "0.5px"
                        }}>
                            {job.status}
                        </div>
                        <div style={{ color: "#7C6FCD", fontWeight: "700", fontSize: "20px", marginBottom: "16px" }}>{job.workerType}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "#6B6B8A", fontSize: "14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <User size={16} strokeWidth={1.5} style={{ color: "#7C6FCD" }} />
                                <strong style={{ color: "#2D2B55" }}>{job.customerId?.name}</strong>
                                <span style={{ margin: "0 8px", color: "#E8E4FF" }}>•</span>
                                <Mail size={16} strokeWidth={1.5} style={{ color: "#7C6FCD" }} />
                                <span>{job.customerId?.email}</span>
                            </div>
                             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Calendar size={16} strokeWidth={1.5} style={{ color: "#7C6FCD" }} />
                                <span>{new Date(job.startDateTime).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <MapPin size={16} strokeWidth={1.5} style={{ color: "#7C6FCD" }} />
                                <span>{job.location}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "16px", color: "#2D2B55" }}>
                                <IndianRupee size={18} strokeWidth={1.5} style={{ color: "#7C6FCD" }} />
                                <strong style={{ fontWeight: "700" }}>₹{job.salary}</strong>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
            <h2 style={{ fontSize: "28px", color: "#2D2B55", marginBottom: "32px", fontWeight: "700", letterSpacing: "-0.02em" }}>Job History</h2>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ display: "flex", gap: "8px", background: "#FFFFFF", padding: "6px", borderRadius: "14px", border: "1px solid #E8E4FF" }}>
                    <button onClick={() => setActiveTab("completed")} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", background: activeTab === "completed" ? "#7C6FCD" : "transparent", color: activeTab === "completed" ? "#ffffff" : "#6B6B8A", transition: "all 0.2s ease" }}>Completed Jobs</button>
                    <button onClick={() => setActiveTab("cancelled")} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", background: activeTab === "cancelled" ? "#7C6FCD" : "transparent", color: activeTab === "cancelled" ? "#ffffff" : "#6B6B8A", transition: "all 0.2s ease" }}>Cancelled Jobs</button>
                </div>

                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ background: "#EDE9FF", border: "1px solid #E8E4FF", color: "#7C6FCD", padding: "10px 16px", borderRadius: "8px", outline: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>

            <div>
                {renderJobsList(sortedJobs(activeTab))}
            </div>
        </div>
    );
}
