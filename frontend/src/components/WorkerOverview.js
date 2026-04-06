import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Star, Calendar, Bell, MapPin, User, Briefcase, Activity } from 'lucide-react';

export default function WorkerOverview({ onNavigate }) {
    const [data, setData] = useState({
        completed: 0,
        activeCount: 0,
        upcomingCount: 0,
        rating: "0.0",
        pendingJobs: [],
        activeJobs: [],
        upcomingJobs: []
    });
    const { user } = useAuth();
    const token = localStorage.getItem("token");

    const fetchOverview = useCallback(async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/bookings/worker", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const bookings = res.data;

            const completed = bookings.filter(b => b.status === "completed").length;

            const pendingJobs = bookings.filter(j => j.status === 'pending');
            const activeJobsFull = bookings.filter(j => ['accepted', 'in progress', 'waiting for customer confirmation'].includes(j.status));
            const upcomingJobs = bookings.filter(j => j.status === 'accepted' && new Date(j.startDateTime) > new Date(new Date().setHours(23, 59, 59, 999)));
            const activeJobs = activeJobsFull.filter(j => !upcomingJobs.includes(j));

            const activeCount = activeJobs.length;
            const upcomingCount = upcomingJobs.length;

            let rating = "0.0";
            try {
                if (user?.id) {
                    const profRes = await axios.get(`http://localhost:5000/api/workers/profile?userId=${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    rating = profRes.data?.averageRating?.toFixed(1) || "0.0";
                }
            } catch (profileErr) {
                console.warn("Failed to fetch profile rating:", profileErr);
            }

            setData({ completed, activeCount, upcomingCount, rating, pendingJobs, activeJobs, upcomingJobs });
        } catch (err) {
            console.error(err);
        }
    }, [token, user]);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    const cardStyle = {
        background: "#FFFFFF",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid #E8E4FF",
        boxShadow: "0 4px 12px rgba(124, 111, 205, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "20px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        borderTop: "4px solid #7C6FCD"
    };

    const statusBadge = (status) => {
        let bg = "#F5F3FF";
        let color = "#7C6FCD";
        if (status === "pending") { bg = "#FFF8E1"; color = "#F59E0B"; } 
        else if (["accepted", "in progress", "waiting for customer confirmation"].includes(status)) { bg = "#EDE9FF"; color = "#7C6FCD"; } 
        else if (status === "upcoming") { bg = "#F5F3FF"; color = "#7C6FCD"; } 
        else if (status === "rejected") { bg = "#FEE2E2"; color = "#FF6B6B"; } 

        return {
            padding: "6px 12px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            background: bg,
            color: color,
            letterSpacing: "0.5px"
        };
    };

    const renderJobMiniCard = (job, statusType) => (
        <div key={job._id} style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "20px", 
            background: "#FFFFFF", 
            borderRadius: "16px", 
            border: "1px solid #E8E4FF", 
            boxShadow: "0 2px 8px rgba(124, 111, 205, 0.04)",
            marginBottom: "16px",
            transition: "all 0.2s ease"
        }}
        onMouseOver={(e) => { 
            e.currentTarget.style.transform = "translateY(-2px)"; 
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)"; 
        }}
        onMouseOut={(e) => { 
            e.currentTarget.style.transform = "translateY(0)"; 
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; 
        }}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ color: "#2D2B55", fontWeight: "700", fontSize: "16px" }}>{job.workerType}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6B6B8A", fontSize: "14px" }}>
                    <User size={16} strokeWidth={1.5} color="#7C6FCD" />
                    <span>{job.customerId?.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6B6B8A", fontSize: "14px" }}>
                    <Calendar size={16} strokeWidth={1.5} color="#7C6FCD" />
                    <span>{new Date(job.startDateTime).toLocaleDateString()}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6B6B8A", fontSize: "14px" }}>
                    <MapPin size={16} strokeWidth={1.5} color="#7C6FCD" />
                    <span>{job.location}</span>
                </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                <div style={statusBadge(statusType === "upcoming" ? "upcoming" : job.status)}>
                    {statusType === "upcoming" ? "Upcoming" : job.status}
                </div>
                {statusType === "pending" && (
                    <button 
                        onClick={() => onNavigate("jobs")} 
                        style={{ padding: "10px 20px", borderRadius: "999px", border: "none", background: "#7C6FCD", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 10px rgba(124, 111, 205, 0.15)" }} 
                        onMouseOver={(e) => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 6px 14px rgba(124, 111, 205, 0.25)"; }} 
                        onMouseOut={(e) => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 4px 10px rgba(124, 111, 205, 0.15)"; }}
                        onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
                        onMouseUp={(e) => e.target.style.transform = "scale(1.05)"}
                    >
                        Review Request
                    </button>
                )}
                {statusType === "active" && (
                    <button 
                        onClick={() => onNavigate("jobs")} 
                        style={{ padding: "10px 20px", borderRadius: "999px", background: "#EDE9FF", color: "#7C6FCD", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s ease", border: "1px solid #E8E4FF" }} 
                        onMouseOver={(e) => e.target.style.transform = "scale(1.05)"} 
                        onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                    >
                        Update Job
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', 'Poppins', sans-serif" }}>
            <h2 style={{ fontSize: "28px", color: "#2D2B55", marginBottom: "32px", fontWeight: "700", letterSpacing: "-0.02em" }}>Dashboard Overview</h2>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "40px" }}>
                <div style={{...cardStyle, marginBottom: 0}} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                    <span style={{ fontSize: "14px", color: "#6B6B8A", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><Star size={20} color="#7C6FCD" strokeWidth={1.5} /> Average Rating</span>
                    <span style={{ fontSize: "32px", color: "#2D2B55", fontWeight: "700" }}>{data.rating}</span>
                </div>
                <div style={{...cardStyle, marginBottom: 0}} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                    <span style={{ fontSize: "14px", color: "#6B6B8A", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><Briefcase size={20} color="#7C6FCD" strokeWidth={1.5} /> Jobs Completed</span>
                    <span style={{ fontSize: "32px", color: "#2D2B55", fontWeight: "700" }}>{data.completed}</span>
                </div>
                <div style={{...cardStyle, marginBottom: 0}} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                    <span style={{ fontSize: "14px", color: "#6B6B8A", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><Activity size={20} color="#7C6FCD" strokeWidth={1.5} /> Active Jobs</span>
                    <span style={{ fontSize: "32px", color: "#2D2B55", fontWeight: "700" }}>{data.activeCount}</span>
                </div>
                <div style={{...cardStyle, marginBottom: 0}} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                    <span style={{ fontSize: "14px", color: "#6B6B8A", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={20} color="#7C6FCD" strokeWidth={1.5} /> Upcoming</span>
                    <span style={{ fontSize: "32px", color: "#2D2B55", fontWeight: "700" }}>{data.upcomingCount}</span>
                </div>
            </div>

            {/* Three Pillar Job View */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>

                {/* Pending Requests Column */}
                <div style={{ ...cardStyle, maxHeight: "600px", overflowY: "auto", background: "#F5F3FF", border: "1px solid #E8E4FF", borderTop: "4px solid #7C6FCD" }}>
                    <h3 style={{ fontSize: "16px", color: "#2D2B55", marginBottom: "20px", fontWeight: "700", position: "sticky", top: "-20px", background: "#F5F3FF", paddingBottom: "16px", margin: "-20px -20px 20px", paddingTop: "20px", paddingLeft: "20px", zIndex: 10, borderBottom: "1px solid #E8E4FF", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Bell size={20} color="#7C6FCD" strokeWidth={1.5} /> Pending ({data.pendingJobs.length})
                    </h3>
                    {data.pendingJobs.length === 0 ? <p style={{ color: "#6B6B8A", fontSize: "14px", textAlign: "center", padding: "20px" }}>No data available</p> : data.pendingJobs.map(job => renderJobMiniCard(job, "pending"))}
                </div>

                {/* Active Jobs Column */}
                <div style={{ ...cardStyle, maxHeight: "600px", overflowY: "auto", background: "#F5F3FF", border: "1px solid #E8E4FF", borderTop: "4px solid #7C6FCD" }}>
                    <h3 style={{ fontSize: "16px", color: "#2D2B55", marginBottom: "20px", fontWeight: "700", position: "sticky", top: "-20px", background: "#F5F3FF", paddingBottom: "16px", margin: "-20px -20px 20px", paddingTop: "20px", paddingLeft: "20px", zIndex: 10, borderBottom: "1px solid #E8E4FF", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Activity size={20} color="#7C6FCD" strokeWidth={1.5} /> Active ({data.activeJobs.length})
                    </h3>
                    {data.activeJobs.length === 0 ? <p style={{ color: "#6B6B8A", fontSize: "14px", textAlign: "center", padding: "20px" }}>No data available</p> : data.activeJobs.map(job => renderJobMiniCard(job, "active"))}
                </div>

                {/* Upcoming Jobs Column */}
                <div style={{ ...cardStyle, maxHeight: "600px", overflowY: "auto", background: "#F5F3FF", border: "1px solid #E8E4FF", borderTop: "4px solid #7C6FCD" }}>
                    <h3 style={{ fontSize: "16px", color: "#2D2B55", marginBottom: "20px", fontWeight: "700", position: "sticky", top: "-20px", background: "#F5F3FF", paddingBottom: "16px", margin: "-20px -20px 20px", paddingTop: "20px", paddingLeft: "20px", zIndex: 10, borderBottom: "1px solid #E8E4FF", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={20} color="#7C6FCD" strokeWidth={1.5} /> Upcoming ({data.upcomingJobs.length})
                    </h3>
                    {data.upcomingJobs.length === 0 ? <p style={{ color: "#6B6B8A", fontSize: "14px", textAlign: "center", padding: "20px" }}>No data available</p> : data.upcomingJobs.map(job => renderJobMiniCard(job, "upcoming"))}
                </div>

            </div>
        </div>
    );
}
