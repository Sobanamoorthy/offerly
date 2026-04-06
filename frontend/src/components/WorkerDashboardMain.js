import React, { useState, useEffect } from "react";
import WorkerOverview from "./WorkerOverview";
import Profile from "./Profile";
import WorkerJobBoard from "./WorkerJobBoard";
import WorkerJobHistory from "./WorkerJobHistory";
import WorkerReviews from "./WorkerReviews";
import WorkerCalendar from "./WorkerCalendar";
import WorkerEarnings from "./WorkerEarnings";
import WorkerSupport from "./WorkerSupport";
import JitsiCall from "./JitsiCall";
import socket from "../utils/socket";
import { useAuth } from "../context/AuthContext";
import { PhoneCall, PhoneOff, User } from "lucide-react";

export default function WorkerDashboardMain({ activeTab: propTab, onNavigate: propNavigate }) {
    const { user } = useAuth();
    const [localTab, setLocalTab] = useState("overview");
    const activeTab = propTab !== undefined ? propTab : localTab;
    const setActiveTab = propNavigate || setLocalTab;

    // Call States
    const [incomingCall, setIncomingCall] = useState(null);
    const [showJitsi, setShowJitsi] = useState(false);
    const [activeCallBookingId, setActiveCallBookingId] = useState(null);

    useEffect(() => {
        if (user?._id && socket) {
            if (!socket.connected) {
                socket.connect();
            }
            socket.emit("register", user._id);
        }

        socket.on("incoming-call", (data) => {
            setIncomingCall(data);
            // Play sound? (Optional)
        });

        // If the customer cancels before we accept, we should handle that too
        // socket.on("call-cancelled", () => setIncomingCall(null));

        return () => {
            socket.off("incoming-call");
        };
    }, [user._id]);

    const handleAcceptCall = () => {
        const bookingId = incomingCall.bookingId;
        const customerId = incomingCall.customerId;
        
        // Notify the customer that we accepted
        socket.emit("accept-call", { customerId });
        
        setActiveCallBookingId(bookingId);
        setIncomingCall(null);
        setShowJitsi(true);
    };

    const handleRejectCall = () => {
        const customerId = incomingCall.customerId;
        socket.emit("reject-call", { customerId });
        setIncomingCall(null);
    };

    return (
        <div style={{ width: "100%", height: "100%", boxSizing: "border-box", position: "relative" }}>
            {activeTab === "overview" && <WorkerOverview onNavigate={setActiveTab} />}
            {activeTab === "profile" && <Profile />}
            {activeTab === "jobs" && <WorkerJobBoard />}
            {activeTab === "reviews" && <WorkerReviews />}
            {activeTab === "history" && <WorkerJobHistory />}
            {activeTab === "earnings" && <WorkerEarnings />}
            {activeTab === "calendar" && <WorkerCalendar />}
            {activeTab === "support" && <WorkerSupport />}

            {/* Incoming Call Popup */}
            {incomingCall && (
                <div style={{
                    position: "fixed",
                    bottom: "32px",
                    right: "32px",
                    width: "360px",
                    background: "#ffffff",
                    borderRadius: "24px",
                    padding: "24px",
                    boxShadow: "0 20px 60px rgba(124, 111, 205, 0.25)",
                    border: "1px solid #E8E4FF",
                    zIndex: 10000,
                    animation: "slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    fontFamily: "'Inter', sans-serif"
                }}>
                    <style>{`
                        @keyframes slideIn {
                            from { transform: translateY(100px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                    `}</style>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
                        <div style={{ 
                            width: "56px", 
                            height: "56px", 
                            background: "#EDE9FF", 
                            borderRadius: "16px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            color: "#7C6FCD"
                        }}>
                            <User size={28} strokeWidth={2} />
                        </div>
                        <div>
                            <div style={{ fontSize: "12px", color: "#7C6FCD", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Incoming Job Call</div>
                            <div style={{ fontSize: "18px", color: "#2D2B55", fontWeight: "800" }}>{incomingCall.customerName}</div>
                        </div>
                    </div>
                    
                    <div style={{ fontSize: "14px", color: "#6B6B8A", marginBottom: "24px", lineHeight: "1.5" }}>
                        The customer has initiated a call regarding Booking <strong>#{incomingCall.bookingId.slice(-6).toUpperCase()}</strong>.
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        <button 
                            onClick={handleRejectCall}
                            style={{
                                flex: 1,
                                height: "48px",
                                background: "#FEE2E2",
                                color: "#FF6B6B",
                                border: "none",
                                borderRadius: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "#FECACA"}
                            onMouseOut={(e) => e.currentTarget.style.background = "#FEE2E2"}
                        >
                            <PhoneOff size={18} /> Reject
                        </button>
                        <button 
                            onClick={handleAcceptCall}
                            style={{
                                flex: 1.5,
                                height: "48px",
                                background: "#7C6FCD",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                boxShadow: "0 8px 20px rgba(124, 111, 205, 0.2)",
                                transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "#6A5EC0"}
                            onMouseOut={(e) => e.currentTarget.style.background = "#7C6FCD"}
                        >
                            <PhoneCall size={18} /> Accept Call
                        </button>
                    </div>
                </div>
            )}

            {/* Jitsi Call Modal */}
            {showJitsi && (
                <JitsiCall 
                    roomName={`offerly-${activeCallBookingId}`}
                    userName={user.name}
                    onCallEnd={() => setShowJitsi(false)}
                />
            )}
        </div>
    );
}
