import React, { useState, useEffect } from "react";
import axios from "axios";
import { LifeBuoy, Send, MessageSquare, CheckCircle, Clock, AlertCircle, Phone, Mail, HelpCircle } from 'lucide-react';

export default function WorkerSupport() {
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [tickets, setTickets] = useState([]);
    const [replyTexts, setReplyTexts] = useState({});

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/support", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        if (!subject || !description) {
            setMessage("❌ Please fill in all fields.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5000/api/support", {
                subject,
                description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage("✅ Support request sent successfully!");
            setSubject("");
            setDescription("");
            fetchTickets();
        } catch (error) {
            console.error("Error sending support request:", error);
            setMessage("❌ Failed to send request.");
        }
    };

    const handleReply = async (ticketId) => {
        const text = replyTexts[ticketId];
        if (!text || !text.trim()) return;

        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost:5000/api/support/${ticketId}/reply`, { message: text }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReplyTexts(prev => ({ ...prev, [ticketId]: "" }));
            fetchTickets();
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    };

    const handleClose = async (ticketId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/support/${ticketId}/close`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTickets();
        } catch (error) {
            console.error("Error closing ticket:", error);
        }
    };

    const faqList = [
        { q: "How do I update my bank details?", a: "Bank details can be updated securely in your Profile settings under the 'Payment Methods' section." },
        { q: "What should I do if a customer cancels?,", a: "If a customer cancels, the job will appear in your 'Job History' under 'Cancelled'. Any eligible cancellation fees will be automatically processed." },
        { q: "How are my earnings calculated?", a: "Your earnings are directly based on your daily rate and the duration of the job, minus a standard 5% platform service fee." }
    ];

    const inputStyle = {
        width: "100%",
        padding: "14px 16px",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        background: "#FDFBF7",
        color: "#2D2D2D",
        fontSize: "15px",
        outline: "none",
        fontFamily: "inherit",
        boxSizing: "border-box",
        fontWeight: "500",
        transition: "all 0.2s"
    };

    const labelStyle = {
        display: "block",
        fontSize: "12px",
        fontWeight: "700",
        color: "#7C6FCD",
        marginBottom: "8px",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", background: "#FFFFFF", padding: "24px 32px", borderRadius: "20px", border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                <div>
                    <h2 style={{ fontSize: "24px", color: "#2D2B55", margin: "0 0 4px 0", fontWeight: "800", letterSpacing: "-0.02em" }}>Help & Support Center</h2>
                    <p style={{ margin: 0, color: "#6B6B8A", fontSize: "14px", fontWeight: "500" }}>We're here to ensure your professional journey is smooth.</p>
                </div>
                <div style={{ width: "56px", height: "56px", background: "#EDE9FF", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LifeBuoy size={28} color="#7C6FCD" />
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
                {/* Support Form & Tickets */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1px solid #E5E7EB", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#2D2B55", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <Send size={20} color="#7C6FCD" /> Open a New Ticket
                        </h3>
                        {message && (
                            <div style={{ padding: "14px 18px", background: message.includes("✅") ? "#DCFCE7" : "#FEE2E2", color: message.includes("✅") ? "#16A34A" : "#EF4444", borderRadius: "12px", marginBottom: "24px", fontWeight: "700", fontSize: "14px", border: message.includes("✅") ? "1px solid #BBF7D0" : "1px solid #FECACA", display: "flex", alignItems: "center", gap: "10px" }}>
                                {message.includes("✅") ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {message}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={labelStyle}>Ticket Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Compensation Inquiry, Layout Bug"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Detailed Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please provide as much context as possible..."
                                    rows={5}
                                    style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
                                ></textarea>
                            </div>
                            <button type="submit" style={{ padding: "16px", borderRadius: "999px", background: "#7C6FCD", color: "#fff", fontWeight: "700", border: "none", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(124, 111, 205, 0.2)", fontSize: "16px" }} onMouseOver={(e) => e.target.style.background = "#6A5EC0"} onMouseOut={(e) => e.target.style.background = "#7C6FCD"}>Send Support Request</button>
                        </form>
                    </div>

                    {/* Past Tickets */}
                    {tickets.length > 0 && (
                        <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1px solid #E5E7EB", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#2D2B55", marginBottom: "24px" }}>Ticket History</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {tickets.slice().reverse().map((ticket) => (
                                    <div key={ticket._id} style={{ padding: "24px", borderRadius: "20px", background: "#FFFFFF", border: "1px solid #EDE9FF" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                            <div>
                                                <span style={{ fontWeight: "800", color: "#2D2D2D", fontSize: "16px", display: "block", marginBottom: "4px" }}>{ticket.subject}</span>
                                                <span style={{ fontSize: "12px", color: "#7C6FCD", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <span style={{
                                                fontSize: "11px",
                                                padding: "6px 12px",
                                                borderRadius: "999px",
                                                background: ticket.status === "Answered" ? "#DCFCE7" : ticket.status === "Closed" ? "#F3F4F6" : "#FEF3C7",
                                                color: ticket.status === "Answered" ? "#16A34A" : ticket.status === "Closed" ? "#6B7280" : "#D97706",
                                                fontWeight: "800",
                                                textTransform: "uppercase",
                                                border: "1px solid rgba(0,0,0,0.05)"
                                            }}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#4B5563", lineHeight: "1.6", background: "#FFFFFF", padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>{ticket.description}</p>

                                        {ticket.replies && ticket.replies.length > 0 && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px", borderTop: "1px solid #E8E4FF", paddingTop: "20px" }}>
                                                {ticket.replies.map((reply, idx) => (
                                                    <div key={idx} style={{
                                                        padding: "16px",
                                                        borderRadius: "14px",
                                                        background: reply.sender === "admin" ? "#EDE9FF" : "#FFFFFF",
                                                        border: `1px solid ${reply.sender === "admin" ? "#C4BFEF" : "#E8E4FF"}`,
                                                        marginLeft: reply.sender === "admin" ? "0" : "20px",
                                                        marginRight: reply.sender === "admin" ? "20px" : "0"
                                                    }}>
                                                        <div style={{ fontSize: "11px", fontWeight: "800", color: reply.sender === "admin" ? "#7C6FCD" : "#2D2B55", marginBottom: "6px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                                                            {reply.sender === "admin" ? <MessageSquare size={12} /> : <User size={12} />}
                                                            {reply.sender === "admin" ? "Support Desk" : "Your Message"}
                                                        </div>
                                                        <div style={{ fontSize: "14px", color: "#2D2B55", fontWeight: "500", lineHeight: "1.5" }}>{reply.message}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {ticket.status !== "Closed" && (
                                            <div style={{ marginTop: "24px", background: "#FFFFFF", padding: "16px", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                                                <textarea
                                                    value={replyTexts[ticket._id] || ""}
                                                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [ticket._id]: e.target.value }))}
                                                    placeholder="Add a follow-up message..."
                                                    rows={2}
                                                    style={{ ...inputStyle, background: "#FFFFFF", marginBottom: "16px" }}
                                                />
                                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                                                    <button onClick={() => handleClose(ticket._id)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid #E8E4FF", borderRadius: "999px", color: "#6B6B8A", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.background = "#EDE9FF"}>Close Ticket</button>
                                                    <button onClick={() => handleReply(ticket._id)} style={{ padding: "10px 24px", background: "#7C6FCD", border: "none", borderRadius: "999px", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}>Reply</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* FAQs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1px solid #E5E7EB", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#2D2B55", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <HelpCircle size={22} color="#7C6FCD" /> Essential Knowledge
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {faqList.map((faq, idx) => (
                                <div key={idx} style={{ paddingBottom: idx < faqList.length - 1 ? "24px" : "0", borderBottom: idx < faqList.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                                    <h4 style={{ color: "#2D2B55", fontWeight: "800", margin: "0 0 10px 0", fontSize: "15px", lineHeight: "1.4" }}>{faq.q}</h4>
                                    <p style={{ margin: 0, color: "#6B7280", fontSize: "14px", lineHeight: "1.6", fontWeight: "500" }}>{faq.a}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: "40px", padding: "24px", background: "#EDE9FF", borderRadius: "20px", border: "1px solid #C4BFEF", textAlign: "center" }}>
                            <div style={{ color: "#2D2B55", fontWeight: "800", marginBottom: "16px", fontSize: "15px" }}>Direct Human Support</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "#7C6FCD", fontWeight: "600", fontSize: "14px" }}>
                                    <Phone size={16} /> +91 91595 19047
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "#7C6FCD", fontWeight: "600", fontSize: "14px" }}>
                                    <Mail size={16} /> support@offerly.pro
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const User = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
