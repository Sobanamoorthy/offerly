import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { X, Calendar, MapPin, ClipboardList, IndianRupee, Clock, AlertCircle } from 'lucide-react';

const BookingModal = ({ worker, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        workerType: worker.skills ? worker.skills[0] : "General",
        urgencyType: "Standard",
        salary: worker.salary || "",
        location: worker.location || "",
        description: "",
        startDateTime: "",
        endDateTime: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!user?.mobile) {
            alert("Please provide your mobile number in your profile before booking.");
            onClose();
            navigate("/dashboard?tab=profile");
            return;
        }

        if (new Date(formData.startDateTime) >= new Date(formData.endDateTime)) {
            setError("End time must be after start time.");
            setLoading(false);
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/bookings/create", {
                workerId: worker.userId._id,
                ...formData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Booking request sent! The professional has been notified.");
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to send booking request.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box",
        color: "#2D2D2D",
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
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(45, 45, 45, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, backdropFilter: "blur(8px)"
        }}>
            <div style={{
                background: "#FFFFFF",
                padding: "36px",
                borderRadius: "24px",
                width: "500px",
                maxWidth: "95%",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
                border: "1px solid #E5E7EB",
                position: "relative"
            }}>
                <button 
                    onClick={onClose} 
                    style={{ position: "absolute", right: "20px", top: "20px", background: "#EDE9FF", border: "none", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", color: "#7C6FCD", transition: "all 0.2s" }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "#D4CEEF"; e.currentTarget.style.transform = "rotate(90deg)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "#EDE9FF"; e.currentTarget.style.transform = "rotate(0deg)"; }}
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                <div style={{ marginBottom: "32px", borderBottom: "1px solid #EDE9FF", paddingBottom: "20px" }}>
                    <h3 style={{ margin: "0 0 8px 0", color: "#7C6FCD", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.02em" }}>Schedule Service</h3>
                    <p style={{ margin: 0, color: "#6B6B8A", fontSize: "14px", fontWeight: "500" }}>Booking request for <b>{worker.userId?.name}</b></p>
                </div>

                {error && (
                    <div style={{
                        background: "#FEE2E2",
                        color: "#EF4444",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        marginBottom: "24px",
                        fontSize: "14px",
                        fontWeight: "600",
                        border: "1px solid #FECACA",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={labelStyle}>Job Category</label>
                            <div style={{ position: "relative" }}>
                                <ClipboardList size={18} color="#7C6FCD" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                                <input
                                    name="workerType"
                                    value={formData.workerType}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, paddingLeft: "42px" }}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Priority Level</label>
                            <select
                                name="urgencyType"
                                value={formData.urgencyType}
                                onChange={handleChange}
                                style={{ ...inputStyle, appearance: "auto" }}
                            >
                                <option value="Standard">Standard (Low Priority)</option>
                                <option value="Emergency">Urgent (Emergency)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={labelStyle}>Scheduled Start</label>
                            <div style={{ position: "relative" }}>
                                <Clock size={18} color="#7C6FCD" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                                <input
                                    type="datetime-local"
                                    name="startDateTime"
                                    value={formData.startDateTime}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, paddingLeft: "42px" }}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Expected End</label>
                            <div style={{ position: "relative" }}>
                                <Calendar size={18} color="#7C6FCD" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                                <input
                                    type="datetime-local"
                                    name="endDateTime"
                                    value={formData.endDateTime}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, paddingLeft: "42px" }}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={labelStyle}>Daily Pay Rate (₹)</label>
                            <div style={{ position: "relative" }}>
                                <IndianRupee size={18} color="#7C6FCD" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                                <input
                                    type="number"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, paddingLeft: "42px" }}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Service Location</label>
                            <div style={{ position: "relative" }}>
                                <MapPin size={18} color="#7C6FCD" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, paddingLeft: "42px" }}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Work Description & Notes</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={{ ...inputStyle, minHeight: "80px", resize: "none" }}
                            placeholder="Briefly describe the task or any specific requirements..."
                        />
                    </div>

                    <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: "16px", background: "#FFFFFF", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "999px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseOver={(e) => e.currentTarget.style.background = "#F9FAFB"}
                            onMouseOut={(e) => e.currentTarget.style.background = "#FFFFFF"}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 2,
                                padding: "16px",
                                background: "#7C6FCD",
                                color: "white",
                                border: "none",
                                borderRadius: "999px",
                                fontWeight: "700",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                                boxShadow: "0 4px 12px rgba(124, 111, 205, 0.2)"
                            }}
                            onMouseOver={(e) => { if(!loading) { e.currentTarget.style.background = "#6A5EC0"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                            onMouseOut={(e) => { if(!loading) { e.currentTarget.style.background = "#7C6FCD"; e.currentTarget.style.transform = "translateY(0)"; } }}
                        >
                            {loading ? "Processing..." : "Confirm Booking Offer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
