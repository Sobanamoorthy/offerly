import React, { useState, useEffect } from "react";
import { 
    Calendar, 
    ClipboardList, 
    MapPin, 
    CheckCircle, 
    Phone, 
    PhoneOff, 
    ArrowLeft 
} from 'lucide-react';
import CommunicationPanel from "../components/CommunicationPanel";
import JitsiCall from "../components/JitsiCall";
import ReviewForm from "../components/ReviewForm";
import socket from "../utils/socket";
import { useAuth } from "../context/AuthContext";

const BookingDetails = ({ booking, onBack, fetchBookings }) => {
    const { user } = useAuth();
    const [isCalling, setIsCalling] = useState(false);
    const [showJitsi, setShowJitsi] = useState(false);
    const [callRejected, setCallRejected] = useState(false);

    useEffect(() => {
        if (user?._id && socket) {
            if (!socket.connected) {
                socket.connect();
            }
            socket.emit("register", user._id);
        }

        socket.on("call-rejected", () => {
            setIsCalling(false);
            setCallRejected(true);
            setTimeout(() => setCallRejected(false), 5000);
        });

        socket.on("incoming-call", () => {
            // If the customer somehow receives an incoming call? 
            // In our flow, only workers receive.
        });

        // Listen for call accepted - we can use "start-call" logic 
        // to move to Jitsi if the worker emits something, 
        // but simple way: Worker joins room, Customer joins room.
        // The prompt says: "Worker clicks Accept → Both join Jitsi room"
        // This implies the server should notify the Customer too.
        
        socket.on("incoming-call-accepted", () => {
            setIsCalling(false);
            setShowJitsi(true);
        });

        return () => {
            socket.off("call-rejected");
            socket.off("incoming-call-accepted");
        };
    }, [user._id]);

    if (!booking) return null;

    const handleStartCall = () => {
        setIsCalling(true);
        setCallRejected(false);
        socket.emit("start-call", {
            bookingId: booking._id,
            workerId: booking.assignedWorkerId?._id,
            customerName: user.name,
            customerId: user._id
        });
    };

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

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", fontFamily: "'Inter', 'Poppins', sans-serif" }}>
            <button 
              onClick={onBack} 
              style={{ marginBottom: "24px", background: "transparent", border: "none", color: "#7C6FCD", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
              onMouseOver={(e) => { e.currentTarget.style.color = "#2D2B55"; e.currentTarget.style.transform = "translateX(-4px)"; }}
              onMouseOut={(e) => { e.currentTarget.style.color = "#7C6FCD"; e.currentTarget.style.transform = "translateX(0)"; }}
            >
                <ArrowLeft size={20} strokeWidth={2.5} />
                Back to Bookings
            </button>
            
            <div style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 10px 40px rgba(124, 111, 205, 0.08)", border: "1px solid #E8E4FF", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "32px", borderBottom: "1px solid #E8E4FF", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "24px", alignItems: "flex-start" }}>
                    <div>
                        <h2 style={{ margin: "0 0 12px 0", color: "#2D2B55", fontSize: "32px", fontWeight: "800", letterSpacing: "-0.02em" }}>
                          {booking.workerType}
                        </h2>
                        <div style={{ color: "#6B6B8A", display: "flex", gap: "16px", fontSize: "14px", fontWeight: "600", alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Calendar size={16} strokeWidth={2} color="#7C6FCD" />
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <ClipboardList size={16} strokeWidth={2} color="#7C6FCD" />
                              {booking.urgencyType || "Standard"} Request
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", background: "#EDE9FF", padding: "4px 12px", borderRadius: "8px", fontSize: "12px", color: "#7C6FCD", fontWeight: "700" }}>
                              ID: {booking._id.slice(-6).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-end" }}>
                        {statusBadge(booking.status)}
                        
                        {/* Call Worker Button */}
                        {booking.status === "accepted" && booking.assignedWorkerId && (
                            <div style={{ position: "relative" }}>
                                <button 
                                    onClick={handleStartCall}
                                    disabled={isCalling}
                                    style={{
                                        padding: "12px 24px",
                                        borderRadius: "999px",
                                        background: isCalling ? "#6B6B8A" : "#7C6FCD",
                                        color: "white",
                                        border: "none",
                                        fontWeight: "800",
                                        cursor: isCalling ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        boxShadow: "0 4px 12px rgba(124, 111, 205, 0.2)",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => { if(!isCalling) { e.currentTarget.style.background = "#6A5EC0"; e.currentTarget.style.transform = "scale(1.05)"; } }}
                                    onMouseOut={(e) => { if(!isCalling) { e.currentTarget.style.background = "#7C6FCD"; e.currentTarget.style.transform = "scale(1)"; } }}
                                >
                                    {isCalling ? (
                                        <>Calling Professional...</>
                                    ) : (
                                        <><Phone size={18} strokeWidth={2.5} /> Call Worker</>
                                    )}
                                </button>
                                
                                {callRejected && (
                                    <div style={{ 
                                        position: "absolute", 
                                        top: "100%", 
                                        right: 0, 
                                        marginTop: "8px", 
                                        background: "#FEE2E2", 
                                        color: "#EF4444", 
                                        padding: "8px 16px", 
                                        borderRadius: "12px", 
                                        fontSize: "12px", 
                                        fontWeight: "700",
                                        border: "1px solid #FECACA",
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}>
                                        <PhoneOff size={14} /> Professional is currently busy.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* OTP Banner */}
                {booking.status === "accepted" && (
                    <div style={{ padding: "32px", background: "#F5F3FF", borderBottom: "1px solid #E8E4FF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
                        <div style={{ flex: "1 1 300px" }}>
                            <h3 style={{ margin: "0 0 8px 0", color: "#2D2B55", fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
                              <CheckCircle size={22} color="#7C6FCD" /> Professional is ready!
                            </h3>
                            <p style={{ margin: 0, color: "#6B6B8A", fontSize: "14px", fontWeight: "600" }}>Share this Service OTP with the professional when they arrive to officially start the job.</p>
                        </div>
                        <div style={{ display: "inline-flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                            <div style={{ background: "#ffffff", padding: "16px 40px", borderRadius: "20px", border: "2px dashed #7C6FCD", boxShadow: "0 8px 16px rgba(124, 111, 205, 0.1)" }}>
                              <span style={{ fontSize: "36px", color: "#2D2B55", fontWeight: "900", letterSpacing: "12px", marginLeft: "12px", fontFamily: "monospace" }}>{booking.startJobOTP || "----"}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Communication Panel Container */}
                <div style={{ padding: "32px", borderBottom: "1px solid #E8E4FF", background: "#F5F3FF" }}>
                    <CommunicationPanel booking={booking} userRole="customer" />
                </div>

                <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px" }}>
                    {/* Job Timings & Location */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        <section style={{ background: "#F5F3FF", padding: "24px", borderRadius: "20px", border: "1px solid #E8E4FF" }}>
                            <h3 style={{ fontSize: "16px", color: "#2D2B55", fontWeight: "800", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                              <MapPin size={20} strokeWidth={2} color="#7C6FCD" />
                              Job Details
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: "#2D2B55", fontSize: "15px" }}>
                                <div><div style={{ fontSize: "11px", color: "#7C6FCD", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Timeline</div> <div style={{ fontWeight: "700", color: "#2D2B55" }}>{new Date(booking.startDateTime).toLocaleString()} - {new Date(booking.endDateTime).toLocaleString()}</div></div>
                                <div><div style={{ fontSize: "11px", color: "#7C6FCD", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Service Address</div> <div style={{ fontWeight: "700", color: "#2D2B55", lineHeight: "1.6" }}>{booking.location}</div></div>
                            </div>
                        </section>

                        <section style={{ padding: "0 24px" }}>
                            <h3 style={{ fontSize: "16px", color: "#2D2B55", fontWeight: "800", margin: "0 0 16px 0" }}>Problem Description</h3>
                            <div style={{ color: "#6B6B8A", fontStyle: booking.description ? "normal" : "italic", lineHeight: "1.7", fontSize: "15px" }}>
                                {booking.description || "No specific details provided."}
                            </div>
                        </section>
                    </div>

                    {/* Cost Breakdown */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        <section style={{ background: "#FFFFFF", padding: "28px", borderRadius: "20px", border: "1.5px solid #E8E4FF" }}>
                            <h3 style={{ fontSize: "16px", color: "#2D2B55", fontWeight: "800", margin: "0 0 24px 0" }}>Cost Summary</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "15px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#6B6B8A" }}>
                                    <span>Professional Fee</span>
                                    <span style={{ fontWeight: "800", color: "#2D2B55" }}>₹{(booking.salary * (booking.totalDays || 1))}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#6B6B8A" }}>
                                    <span>Platform Fee</span>
                                    <span style={{ fontWeight: "800", color: "#2D2B55" }}>₹{Math.round((booking.salary * (booking.totalDays || 1)) * 0.05)}</span>
                                </div>
                                <div style={{ height: "1px", background: "#E8E4FF", margin: "8px 0" }}></div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "900", color: "#2D2B55" }}>
                                    <span>Total Payable</span>
                                    <span>₹{(booking.salary * (booking.totalDays || 1)) + Math.round((booking.salary * (booking.totalDays || 1)) * 0.05)}</span>
                                </div>
                            </div>
                        </section>

                        {(booking.status === "completed" || booking.status === "waiting for customer confirmation") && (
                            <section>
                                <ReviewForm job={booking} onSuccess={fetchBookings} />
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* Jitsi Call Component */}
            {showJitsi && (
                <JitsiCall 
                    roomName={`offerly-${booking._id}`}
                    userName={user.name}
                    onCallEnd={() => setShowJitsi(false)}
                />
            )}
        </div>
    );
};

export default BookingDetails;
