import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Bell, AlertCircle, User as UserIcon, Mail, Phone, Calendar, Hourglass, MapPin, IndianRupee, Briefcase, Activity, CheckCircle, Clock } from 'lucide-react';

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },
  header: { fontSize: "28px", color: "#2D2B55", marginBottom: "32px", fontWeight: "800", letterSpacing: "-0.02em" },
  grid: { display: "grid", gap: "32px", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))" },
  section: {
    background: "#ffffff",
    padding: "32px",
    borderRadius: "24px",
    boxShadow: "0 4px 20px rgba(124, 111, 205, 0.04)",
    border: "1px solid #E8E4FF"
  },
  sectionTitle: { display: "flex", alignItems: "center", gap: "12px", fontSize: "18px", fontWeight: "800", marginBottom: "24px" },
  card: {
    background: "#FFFFFF",
    padding: "24px",
    borderRadius: "20px",
    marginBottom: "20px",
    border: "1px solid #E8E4FF",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden"
  },
  badge: (status) => {
    const colors = {
      pending: { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
      booked: { bg: '#EDE9FF', text: '#7C6FCD', border: '#C4BFEF' },
      accepted: { bg: '#EDE9FF', text: '#7C6FCD', border: '#C4BFEF' },
      'in progress': { bg: '#EDE9FF', text: '#7C6FCD', border: '#C4BFEF' },
      'waiting for customer confirmation': { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
      completed: { bg: '#ECFDF5', text: '#16A34A', border: '#A7F3D0' }
    };
    const theme = colors[status] || { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
    return {
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: "800",
      textTransform: "uppercase",
      background: theme.bg,
      color: theme.text,
      border: `1px solid ${theme.border}`,
      letterSpacing: "0.02em"
    };
  },
  button: (type) => ({
    padding: "12px 24px",
    borderRadius: "999px",
    border: "none",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s ease",
    background: type === "accept" ? "#7C6FCD" : type === "reject" ? "#FEE2E2" : "#6A5EC0",
    color: type === "reject" ? "#EF4444" : "white",
    boxShadow: type === "reject" ? "none" : "0 4px 12px rgba(124, 111, 205, 0.2)"
  }),
  earningsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "40px"
  },
  earningCard: (color) => ({
    background: "white",
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    border: "1px solid #E5E7EB",
    borderLeft: `6px solid ${color}`,
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  }),
  earningLabel: { fontSize: "13px", color: "#6B7280", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" },
  earningValue: { fontSize: "28px", color: "#2D2D2D", fontWeight: "800", letterSpacing: "-0.01em" },
  emergencyCard: {
    background: "#FFFBFB",
    border: "1.5px solid #FEE2E2",
    boxShadow: "0 10px 30px rgba(239, 68, 68, 0.05)"
  },
  emergencyLabel: {
    background: "#EF4444",
    color: "white",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "12px"
  }
};

export default function JobList() {
  const [bookings, setBookings] = useState([]);
  const [startOTP, setStartOTP] = useState({});
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get("https://offerly-ijbn.onrender.com/api/bookings/worker", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  }, [token]);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user, fetchBookings]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const payload = { status };
      if (status === "in progress") {
        payload.otp = startOTP[id];
      }

      await axios.put(`https://offerly-ijbn.onrender.com/api/bookings/${id}/status`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (status === "in progress") {
        setStartOTP(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }

      fetchBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const pendingJobs = bookings.filter(j => j.status === 'pending');
  const activeJobs = bookings.filter(j => ['accepted', 'in progress', 'waiting for customer confirmation'].includes(j.status));
  const completedJobs = bookings.filter(j => j.status === 'completed');

  const calculateEarnings = () => {
    const earningsResult = { today: 0, week: 0, month: 0 };
    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    completedJobs.forEach(job => {
      const compDate = new Date(job.updatedAt);
      const amount = job.salary * (job.urgencyType === "Standard" ? (job.totalDays || 1) : 1);

      if (compDate >= startOfToday) earningsResult.today += amount;
      if (compDate >= startOfWeek) earningsResult.week += amount;
      if (compDate >= startOfMonth) earningsResult.month += amount;
    });

    return earningsResult;
  };

  const earnings = calculateEarnings();

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Service Management</h2>

      <div style={styles.earningsContainer}>
        <div style={styles.earningCard("#7C6FCD")}>
          <span style={styles.earningLabel}>Today's Revenue</span>
          <span style={styles.earningValue}>₹{earnings.today.toLocaleString()}</span>
        </div>
        <div style={styles.earningCard("#6A5EC0")}>
          <span style={styles.earningLabel}>Weekly Performance</span>
          <span style={styles.earningValue}>₹{earnings.week.toLocaleString()}</span>
        </div>
        <div style={styles.earningCard("#2D2B55")}>
          <span style={styles.earningLabel}>Monthly Projection</span>
          <span style={styles.earningValue}>₹{earnings.month.toLocaleString()}</span>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Pending Requests Column */}
        <div style={styles.section}>
          <h3 style={{ ...styles.sectionTitle, color: "#7C6FCD" }}>
            <Bell size={22} /> Incoming Requests ({pendingJobs.length})
          </h3>
          {pendingJobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
              <div style={{ marginBottom: "16px", opacity: 0.3 }}><Briefcase size={48} strokeWidth={1} /></div>
              <p style={{ fontWeight: "500", fontSize: "14px" }}>No new service requests available.</p>
            </div>
          ) : (
            pendingJobs.map(job => (
              <div key={job._id} style={{ ...styles.card, ...(job.urgencyType === "Emergency" ? styles.emergencyCard : {}) }}>
                {job.urgencyType === "Emergency" && (
                  <div style={styles.emergencyLabel}>
                    <AlertCircle size={14} /> Immediate Response Required
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <span style={{ fontWeight: "800", fontSize: "18px", color: "#2D2D2D" }}>{job.workerType}</span>
                  <span style={styles.badge(job.status)}>{job.status}</span>
                </div>
                
                <div style={{ display: "grid", gap: "10px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#4B5563", fontSize: "14px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#F5F2E9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UserIcon size={14} color="#8B6F47" />
                    </div>
                    <strong style={{ color: "#2D2D2D" }}>{job.customerId?.name}</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6B6B8A", fontSize: "13px" }}>
                   <Clock size={14} color="#7C6FCD" />
                   {new Date(job.startDateTime).toLocaleDateString()} • {new Date(job.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6B6B8A", fontSize: "13px" }}>
                    <MapPin size={14} color="#7C6FCD" /> {job.location}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#2D2B55", fontSize: "15px", fontWeight: "800", marginTop: "4px" }}>
                    <IndianRupee size={16} /> ₹{job.salary} {job.urgencyType === "Standard" ? "/ day" : "(Emergency Fee)"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => handleStatusUpdate(job._id, "accepted")} style={{ ...styles.button("accept"), flex: 1 }}>Accept Job</button>
                  <button onClick={() => handleStatusUpdate(job._id, "rejected")} style={{ ...styles.button("reject"), flex: 1 }}>Decline</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Active Jobs Column */}
        <div style={styles.section}>
          <h3 style={{ ...styles.sectionTitle, color: "#2D2B55" }}>
            <Activity size={22} /> Active Assignments ({activeJobs.length})
          </h3>
          {activeJobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
              <div style={{ marginBottom: "16px", opacity: 0.3 }}><Calendar size={48} strokeWidth={1} /></div>
              <p style={{ fontWeight: "500", fontSize: "14px" }}>No jobs currently in progress.</p>
            </div>
          ) : (
            activeJobs.map(job => (
              <div key={job._id} style={{ ...styles.card, borderLeft: "5px solid #7C6FCD", background: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <span style={{ fontWeight: "800", fontSize: "18px", color: "#2D2D2D" }}>{job.workerType}</span>
                  <span style={styles.badge(job.status)}>{job.status}</span>
                </div>

                <div style={{ display: "grid", gap: "10px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                    <strong style={{ color: "#2D2B55" }}>{job.customerId?.name}</strong>
                    <a href={`tel:${job.customerId?.mobile}`} style={{ background: "#EDE9FF", color: "#7C6FCD", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", textDecoration: "none", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={12} /> Call
                    </a>
                  </div>
                  <div style={{ color: "#6B7280", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={14} /> {job.location}
                  </div>
                </div>

                <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "16px", border: "1px solid #E8E4FF" }}>
                  {job.status === "accepted" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <input
                        type="text"
                        placeholder="VERIFICATION OTP"
                        value={startOTP[job._id] || ""}
                        onChange={(e) => setStartOTP({ ...startOTP, [job._id]: e.target.value })}
                        style={{ padding: "14px", borderRadius: "12px", border: "1px solid #E8E4FF", textAlign: "center", fontSize: "16px", fontWeight: "800", letterSpacing: "4px", outline: "none", background: "#EDE9FF", color: "#7C6FCD" }}
                      />
                      <button onClick={() => handleStatusUpdate(job._id, "in progress")} style={{ ...styles.button(), width: "100%", height: "48px" }}>
                        Start Work Now
                      </button>
                    </div>
                  )}
                  {job.status === "in progress" && (
                    <button onClick={() => handleStatusUpdate(job._id, "waiting for customer confirmation")} style={{ ...styles.button("accept"), width: "100%", height: "48px" }}>
                      <CheckCircle size={18} /> Signal Completion
                    </button>
                  )}
                  {job.status === "waiting for customer confirmation" && (
                    <div style={{ textAlign: "center", padding: "12px", background: "#EDE9FF", color: "#7C6FCD", borderRadius: "12px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Hourglass size={16} /> Awaiting Customer Balance Payment
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
