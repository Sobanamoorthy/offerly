import React, { useState, useEffect } from "react";
import axios from "axios";
import { Phone, ShieldCheck, Info, CheckCircle, XCircle, Loader2, PhoneOff } from 'lucide-react';
import socket from "../utils/socket";
import { useAuth } from "../context/AuthContext";

export default function CommunicationPanel({ booking, userRole }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commData, setCommData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const token = localStorage.getItem("token");

  const [animationText, setAnimationText] = useState("");
  const [startJobOTP, setStartJobOTP] = useState("");

  const fetchCommData = React.useCallback(async () => {
    try {
      const res = await axios.get(
        `https://offerly-ijbn.onrender.com/api/communication/${booking._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommData(res.data.communication);
      setNotFound(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      }
    }
  }, [booking._id, token]);

  useEffect(() => {
    if (notFound) return;
    
    // Initial fetch
    fetchCommData();

    // 1. Socket Listener for real-time updates
    socket.on("communication-update", (data) => {
      // Fetch fresh data when server signals an update
      fetchCommData();
    });

    // 2. 30s Fallback poll (as a safety net)
    const interval = setInterval(fetchCommData, 30000);

    // 3. Socket Reconnect Handler
    const handleReconnect = () => {
      fetchCommData();
      if (user?._id) {
        socket.emit("register", user._id);
      }
    };
    socket.on("reconnect", handleReconnect);

    return () => {
      socket.off("communication-update");
      socket.off("reconnect", handleReconnect);
      clearInterval(interval);
    };
  }, [fetchCommData, notFound, user?._id]);

  useEffect(() => {
    if (!commData) return;

    if (commData.callStatus === "requesting") {
      setAnimationText("Establishing connection...");
    } else if (commData.callStatus === "accepted") {
      setAnimationText("Connecting via secure server...");
      setTimeout(() => setAnimationText("Ringing..."), 2000);
    } else if (commData.callStatus === "connected") {
      setAnimationText("Secure Line Connected");
    }
  }, [commData, commData?.callStatus]);

  const handleRequestCall = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(
        `https://offerly-ijbn.onrender.com/api/communication/${booking._id}/request-call`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCommData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate call request.");
    } finally {
      setLoading(false);
    }
  };

  const handleRespondCall = async (action) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(
        `https://offerly-ijbn.onrender.com/api/communication/${booking._id}/respond-call`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCommData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} call...`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStartOTP = async (e) => {
    e.preventDefault();
    if (!startJobOTP || startJobOTP.trim().length < 4) {
      setError("Please enter a valid 4-digit OTP.");
      return;
    }
    try {
       setLoading(true);
       setError(null);
       await axios.post(
         `https://offerly-ijbn.onrender.com/api/communication/${booking._id}/verify-otp`,
         { otp: startJobOTP.trim() },
         { headers: { Authorization: `Bearer ${token}` } }
       );
       alert("OTP Verified! Professional session started successfully.");
       window.location.reload();
    } catch (err) {
       setError(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
       setLoading(false);
    }
  };

  const maskIdentity = (role) => {
    const hash = booking._id.charCodeAt(booking._id.length - 1) % 100;
    const formattedHash = hash.toString().padStart(2, '0');
    return `${role} #***${formattedHash}`;
  };

  const handleEndCall = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(
        `https://offerly-ijbn.onrender.com/api/communication/${booking._id}/end-call`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCommData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to disconnect call.");
    } finally {
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <div style={{ background: "#EDE9FF", padding: "28px", borderRadius: "20px", border: "1px solid #C4BFEF", marginBottom: "0", fontFamily: "'Inter', sans-serif" }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#2D2B55", fontSize: "16px", fontWeight: "800", borderBottom: "1px solid #C4BFEF", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <ShieldCheck size={20} color="#7C6FCD" /> Secure Communication
        </h3>
        <p style={{ color: "#6B7280", fontSize: "14px", textAlign: "center", marginBottom: "24px", fontWeight: "500" }}>
          Encrypted messaging and calls are available once a request is initiated.
        </p>
        {userRole === "customer" && (
          <button
            onClick={handleRequestCall}
            disabled={loading}
            style={{ width: "100%", padding: "16px", background: "#7C6FCD", color: "#fff", border: "none", borderRadius: "999px", fontWeight: "700", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.2s", boxShadow: "0 4px 12px rgba(124, 111, 205, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
            onMouseOver={(e) => { if(!loading) e.target.style.background = "#6A5EC0"; }}
            onMouseOut={(e) => { if(!loading) e.target.style.background = "#7C6FCD"; }}
          >
            <Phone size={18} /> Request Secure Call
          </button>
        )}
        {userRole === "worker" && (
          <div style={{ textAlign: "center", background: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E8E4FF" }}>
            <p style={{ color: "#7C6FCD", fontWeight: "600", fontSize: "14px", margin: 0 }}>Waiting for customer contact request.</p>
          </div>
        )}
        {error && <div style={{ marginTop: "16px", padding: "12px", background: "#FEE2E2", color: "#EF4444", borderRadius: "10px", fontSize: "13px", fontWeight: "700", textAlign: "center", border: "1px solid #FECACA" }}>{error}</div>}
        <p style={{ margin: "16px 0 0", fontSize: "12px", color: "#7C6FCD", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontWeight: "500" }}>
          <Info size={14} /> Real phone numbers are hidden for your privacy.
        </p>
      </div>
    );
  }

  if (!commData) return <div style={{ padding: "20px", color: "#8B6F47", fontWeight: "600", textAlign: "center" }}>Initiating secure layer...</div>;

  const isActiveCallScreen = ["requesting", "accepted", "connected"].includes(commData.callStatus);

  const renderCallScreen = () => (
    <div style={{
      background: commData.callStatus === "connected" ? "#DCFCE7" : "#FDFBF7",
      border: `1px solid ${commData.callStatus === "connected" ? "#7C6FCD" : "#8B6F47"}`,
      borderRadius: "20px",
      padding: "32px",
      textAlign: "center",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
    }}>
      {userRole === "worker" && commData.callStatus === "requesting" ? (
        <div>
          <div style={{ width: "64px", height: "64px", background: "#7C6FCD", color: "white", borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.5s infinite" }}>
             <Phone size={32} />
          </div>
          <style>{`@keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124, 111, 205, 0.7); } 70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(124, 111, 205, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124, 111, 205, 0); } }`}</style>
          <h4 style={{ color: "#2D2B55", fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>Incoming Secure Call</h4>
          <p style={{ color: "#6B6B8A", marginBottom: "28px", fontWeight: "500" }}>{maskIdentity("Customer")} is calling...</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button onClick={() => handleRespondCall("accept")} style={{ background: "#7C6FCD", color: "white", padding: "14px 32px", borderRadius: "999px", border: "none", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 10px rgba(124, 111, 205, 0.2)" }}>
              <CheckCircle size={18} /> Accept
            </button>
            <button onClick={() => handleRespondCall("reject")} style={{ background: "#EF4444", color: "white", padding: "14px 32px", borderRadius: "999px", border: "none", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <XCircle size={18} /> Decline
            </button>
          </div>
        </div>
      ) : (
         <div>
           <div style={{ width: "64px", height: "64px", background: commData.callStatus === "connected" ? "#7C6FCD" : "#8B6F47", color: "white", borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
             {commData.callStatus === "connected" ? <ShieldCheck size={32} /> : <Loader2 size={32} style={{ animation: "spin 2s linear infinite" }} />}
           </div>
           <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
           <h4 style={{ color: "#2D2B55", fontSize: "18px", fontWeight: "800", marginBottom: "4px" }}>{userRole === "customer" ? maskIdentity("Verified Worker") : maskIdentity("Verified Customer")}</h4>
           <p style={{ color: "#7C6FCD", fontWeight: "700", marginTop: "8px", marginBottom: "24px", fontSize: "15px" }}>{animationText}</p>
           <button onClick={handleEndCall} style={{ padding: "12px 32px", background: "#EF4444", color: "white", border: "none", borderRadius: "999px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.transform = "scale(1.05)"} onMouseOut={(e) => e.target.style.transform = "scale(1)"}>
             <PhoneOff size={18} /> Disconnect Call
           </button>
         </div>
      )}
    </div>
  );

  return (
    <div style={{ background: "#ffffff", padding: "32px", borderRadius: "20px", border: "1px solid #E8E4FF", boxShadow: "0 4px 20px rgba(124, 111, 205, 0.03)", marginBottom: "0", fontFamily: "'Inter', sans-serif" }}>
      <h3 style={{ margin: "0 0 24px 0", color: "#2D2B55", fontSize: "16px", fontWeight: "800", borderBottom: "1px solid #E8E4FF", paddingBottom: "16px", display: "flex", alignItems: "center", gap: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <ShieldCheck size={20} color="#7C6FCD" /> Privacy-First Channel
      </h3>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", background: "#EDE9FF", padding: "12px 20px", borderRadius: "12px", border: "1px solid #C4BFEF" }}>
        <span style={{ color: "#7C6FCD", fontWeight: "700", fontSize: "13px" }}>Security ID:</span>
        <span style={{ color: "#2D2B55", fontFamily: "monospace", fontWeight: "800", fontSize: "14px", letterSpacing: "1px" }}>#{commData.communicationID || "PROX-00"}</span>
      </div>

      {error && <div style={{ padding: "16px", background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "12px", color: "#EF4444", marginBottom: "24px", fontSize: "14px", fontWeight: "700", textAlign: "center" }}>{error}</div>}
      
      {commData.callStatus === "rejected" && <div style={{ padding: "16px", background: "#FDFBF7", color: "#EF4444", borderRadius: "12px", textAlign: "center", marginBottom: "24px", fontWeight: "700", border: "1px solid #FEE2E2" }}>Contact request was declined.</div>}
      {commData.callStatus === "ended" && <div style={{ padding: "16px", background: "#FDFBF7", color: "#6B7280", borderRadius: "12px", textAlign: "center", marginBottom: "24px", fontWeight: "700", border: "1px solid #F5F2E9" }}>Secure session concluded.</div>}

      {isActiveCallScreen ? renderCallScreen() : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {userRole === "customer" && commData.canCallWorker && (
             <button onClick={handleRequestCall} disabled={loading} style={{ width: "100%", padding: "18px", background: "#7C6FCD", color: "#fff", border: "none", borderRadius: "999px", fontWeight: "800", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: loading ? 0.7 : 1, boxShadow: "0 6px 16px rgba(124, 111, 205, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }} onMouseOver={(e) => { if(!loading) { e.target.style.background = "#6A5EC0"; e.target.style.transform = "translateY(-2px)"; } }}>
               <Phone size={20} /> Request Secure Voice Call
             </button>
          )}

          {userRole === "worker" && !commData.isJobInProgress && (
             <form onSubmit={handleVerifyStartOTP} style={{ background: "#EDE9FF", padding: "28px", borderRadius: "20px", border: "1px solid #C4BFEF" }}>
                 <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#2D2B55", fontWeight: "800", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>Start Job Verification</p>
                 <div style={{ display: "flex", gap: "16px", flexDirection: "column" }}>
                     <input 
                         type="text" 
                         placeholder="Enter OTP" 
                         value={startJobOTP} 
                         onChange={(e) => setStartJobOTP(e.target.value)}
                         disabled={loading}
                         autoComplete="off"
                         maxLength="4"
                         style={{ width: "100%", padding: "18px", borderRadius: "16px", border: `2px solid ${error ? '#EF4444' : '#E8E4FF'}`, textAlign: "center", fontWeight: "900", fontSize: "28px", letterSpacing: "12px", outline: "none", transition: "all 0.2s", background: "#FFFFFF", color: "#7C6FCD" }}
                     />
                     <button type="submit" disabled={loading || !startJobOTP} style={{ width: "100%", padding: "18px", background: "#7C6FCD", color: "#fff", border: "none", borderRadius: "999px", fontWeight: "800", fontSize: "16px", cursor: (loading || !startJobOTP) ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: (loading || !startJobOTP) ? 0.6 : 1, boxShadow: "0 4px 12px rgba(124, 111, 205, 0.2)" }}>
                        Verify & Begin Service
                     </button>
                 </div>
             </form>
          )}

          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#7C6FCD", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
             <ShieldCheck size={16} /> Data is ephemeral. Session ends upon job completion.
          </p>
        </div>
      )}
    </div>
  );
}
