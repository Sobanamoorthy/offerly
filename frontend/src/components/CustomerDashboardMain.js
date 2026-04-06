import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import WorkerList from "./WorkerList";
import CustomerProfile from "./CustomerProfile";
import BookingDetails from "../pages/BookingDetails";
import { User, Calendar, MapPin, ClipboardList } from 'lucide-react';

export default function CustomerDashboardMain({ activeTab: propTab, onNavigate: propNavigate }) {
    const [localTab, setLocalTab] = useState("professionals");
    const activeTab = propTab !== undefined ? propTab : localTab;
    const setActiveTab = propNavigate || setLocalTab;
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    const fetchBookings = useCallback(async () => {
        if (!token) {
            setError("Please log in to view your bookings.");
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("https://offerly-ijbn.onrender.com/api/bookings/customer", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data);
        } catch (err) {
            console.error(err);
            if (err.response) {
                if (err.response.status === 401) {
                    setError("Your session has expired. Please log in again.");
                } else if (err.response.status === 403) {
                    setError("You don't have permission to view these bookings.");
                } else {
                    setError("Failed to load bookings. Please try again later.");
                }
            } else if (err.request) {
                setError("Network error. Please check your connection and try again.");
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (activeTab === "requests" || activeTab === "history" || activeTab === "details") {
            fetchBookings();
        }
    }, [activeTab, fetchBookings]);

    // Sync selectedBooking with updated data from the list
    useEffect(() => {
        if (selectedBooking) {
            const updated = bookings.find(b => b._id === selectedBooking._id);
            if (updated) setSelectedBooking(updated);
        }
    }, [bookings, selectedBooking]);

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setActiveTab("details");
    };

    const activeBookings = bookings.filter(b => ['pending', 'accepted', 'in progress', 'waiting for customer confirmation'].includes(b.status));
    const pastBookings = bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status));

    const statusBadge = (status) => {
        const colors = {
            pending: { bg: '#FDF2F8', text: '#DB2777' },
            accepted: { bg: '#EDE9FF', text: '#7C6FCD' },
            'in progress': { bg: '#EDE9FF', text: '#7C6FCD' },
            'waiting for customer confirmation': { bg: '#EDE9FF', text: '#7C6FCD' },
            rejected: { bg: '#FEE2E2', text: '#FF6B6B' },
            cancelled: { bg: '#FEE2E2', text: '#FF6B6B' },
            completed: { bg: '#ECFDF5', text: '#16A34A' }
        };
        const theme = colors[status] || { bg: '#EDE9FF', text: '#7C6FCD' };
        return (
            <span style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", background: theme.bg, color: theme.text, letterSpacing: "0.05em" }}>
                {status}
            </span>
        );
    };

    const renderRequests = () => (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <h2 style={{ fontSize: "26px", color: "#2D2B55", marginBottom: "24px", fontWeight: "700", letterSpacing: "-0.02em" }}>My Requests (Active)</h2>
            {loading && <p style={{ color: "#64748B", padding: "20px", textAlign: "center" }}>Loading bookings...</p>}
            {error && (
                <div style={{ color: "#DC2626", padding: "20px", textAlign: "center", background: "#FEF2F2", borderRadius: "8px", border: "1px solid #FECACA" }}>
                    <p>{error}</p>
                    <button 
                        onClick={fetchBookings} 
                        style={{ marginTop: "10px", padding: "8px 16px", borderRadius: "6px", background: "#DC2626", color: "white", border: "none", fontWeight: "600", cursor: "pointer" }}
                    >
                        Try Again
                    </button>
                </div>
            )}
            {!loading && !error && activeBookings.length === 0 ? (
                <p style={{ color: "#64748B", padding: "40px", textAlign: "center", background: "#FFFFFF", borderRadius: "16px", border: "1px dashed rgba(0,0,0,0.1)" }}>No active requests or problems at the moment.</p>
            ) : (
                <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                    {activeBookings.map(b => (
                        <div 
                            key={b._id} 
                            style={{ 
                                padding: "24px", 
                                background: "#ffffff", 
                                borderRadius: "16px", 
                                border: "1px solid #E8E4FF", 
                                borderLeft: "3px solid transparent",
                                boxShadow: "0 4px 12px rgba(124,111,205,0.08)", 
                                transition: 'all 0.2s ease', 
                                cursor: 'pointer' 
                            }} 
                            onClick={() => handleViewDetails(b)}
                            onMouseOver={(e) => { 
                                e.currentTarget.style.transform = "translateY(-4px)"; 
                                e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,111,205,0.12)"; 
                                e.currentTarget.style.borderLeft = "3px solid #7C6FCD";
                            }}
                            onMouseOut={(e) => { 
                                e.currentTarget.style.transform = "translateY(0)"; 
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,111,205,0.08)"; 
                                e.currentTarget.style.borderLeft = "3px solid transparent";
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                <div>
                                    <h4 style={{ margin: "0 0 4px 0", color: "#2D2B55", fontSize: "18px", fontWeight: "700" }}>{b.workerType}</h4>
                                    <div style={{ fontSize: "14px", color: "#6B6B8A", display: "flex", gap: "6px", alignItems: "flex-start", marginTop: "8px" }}><ClipboardList size={16} strokeWidth={1.5} color="#7C6FCD" style={{ flexShrink: 0, marginTop: "2px" }} /> {b.description || "No description provided"}</div>
                                </div>
                                {statusBadge(b.status)}
                            </div>
                             <div style={{ fontSize: "14px", color: "#2D2B55", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={16} strokeWidth={1.5} color="#7C6FCD" /> <span style={{ fontWeight: "600", color: "#2D2B55" }}>Date:</span> {new Date(b.startDateTime).toLocaleDateString()}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><MapPin size={16} strokeWidth={1.5} color="#7C6FCD" /> <span style={{ fontWeight: "600", color: "#2D2B55" }}>Location:</span> {b.location}</div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleViewDetails(b); }}
                                 style={{ width: "100%", padding: "12px", borderRadius: "999px", background: "#EDE9FF", border: "1px solid #E8E4FF", color: "#7C6FCD", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                                onMouseOver={(e) => { e.target.style.background = "#7C6FCD"; e.target.style.color = "#FFFFFF"; e.target.style.transform = "scale(1.02)"; }}
                                onMouseOut={(e) => { e.target.style.background = "#EDE9FF"; e.target.style.color = "#7C6FCD"; e.target.style.transform = "scale(1)"; }}
                                onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderHistory = () => (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <h2 style={{ fontSize: "26px", color: "#1A1A2E", marginBottom: "24px", fontWeight: "700", letterSpacing: "-0.02em" }}>Booking History</h2>
            {loading && <p style={{ color: "#64748B", padding: "20px", textAlign: "center" }}>Loading history...</p>}
            {error && (
                <div style={{ color: "#DC2626", padding: "20px", textAlign: "center", background: "#FEF2F2", borderRadius: "8px", border: "1px solid #FECACA" }}>
                    <p>{error}</p>
                    <button 
                        onClick={fetchBookings} 
                        style={{ marginTop: "10px", padding: "8px 16px", borderRadius: "6px", background: "#DC2626", color: "white", border: "none", fontWeight: "600", cursor: "pointer" }}
                    >
                        Try Again
                    </button>
                </div>
            )}
            {!loading && !error && pastBookings.length === 0 ? (
                <p style={{ color: "#64748B", padding: "40px", textAlign: "center", background: "#FFFFFF", borderRadius: "16px", border: "1px dashed rgba(0,0,0,0.1)" }}>You have no past booking history.</p>
            ) : (
                <div style={{ display: "grid", gap: "20px" }}>
                    {pastBookings.map(b => (
                        <div key={b._id} style={{ 
                            display: "flex", 
                            flexWrap: "wrap", 
                            gap: "24px", 
                            padding: "24px", 
                            background: "#ffffff", 
                            borderRadius: "16px", 
                            border: "1px solid #B2DFDB", 
                            alignItems: "center", 
                            boxShadow: "0 4px 12px rgba(0,191,165,0.08)",
                            transition: "all 0.2s ease"
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            <div style={{ flex: "1 1 auto", minWidth: "200px" }}>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                                    <span style={{ fontSize: "18px", fontWeight: "700", color: "#1A1A2E" }}>{b.workerType}</span>
                                    {statusBadge(b.status)}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "#4A5568", fontSize: "14px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><User size={16} strokeWidth={1.5} color="#00BFA5" /> <strong style={{ color: "#1A1A2E" }}>Professional:</strong> {b.assignedWorkerId?.name || "N/A"}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={16} strokeWidth={1.5} color="#00BFA5" /> <strong style={{ color: "#1A1A2E" }}>Date:</strong> {new Date(b.startDateTime).toLocaleDateString()}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><MapPin size={16} strokeWidth={1.5} color="#00BFA5" /> <strong style={{ color: "#1A1A2E" }}>Location:</strong> {b.location}</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <button 
                                    onClick={() => handleViewDetails(b)} 
                                    style={{ padding: "12px 28px", borderRadius: "999px", background: "#E0F7F4", border: "1px solid #B2DFDB", color: "#00BFA5", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                                    onMouseOver={(e) => { e.target.style.background = "#00BFA5"; e.target.style.color = "#FFFFFF"; e.target.style.transform = "scale(1.05)"; }}
                                    onMouseOut={(e) => { e.target.style.background = "#E0F7F4"; e.target.style.color = "#00BFA5"; e.target.style.transform = "scale(1)"; }}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ width: "100%", height: "100%" }}>
            {activeTab === "professionals" && <WorkerList />}
            {activeTab === "profile" && <CustomerProfile />}
            {activeTab === "requests" && renderRequests()}
            {activeTab === "history" && renderHistory()}
            {activeTab === "details" && (
                <BookingDetails 
                    booking={selectedBooking} 
                    onBack={() => setActiveTab(pastBookings.includes(selectedBooking) ? "history" : "requests")}
                    fetchBookings={fetchBookings}
                />
            )}
        </div>
    );
}
