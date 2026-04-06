import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { User, Mail, Phone, Calendar, MapPin, Save, Camera } from 'lucide-react';

const CustomerProfile = () => {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        mobile: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        profilePhoto: ""
    });

    const [initialMobile, setInitialMobile] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    const fetchProfile = useCallback(async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/customers/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) {
                const formattedProfile = { ...res.data };
                if (formattedProfile.dateOfBirth) {
                    formattedProfile.dateOfBirth = new Date(formattedProfile.dateOfBirth).toISOString().split('T')[0];
                }
                setProfile(formattedProfile);
                setInitialMobile(formattedProfile.mobile || "");
            }
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://localhost:5000/api/customers/profile", profile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("✅ Profile updated successfully!");
            setTimeout(() => setMessage(""), 3000);
            fetchProfile();
        } catch (err) {
            console.error(err);
            setMessage("❌ Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, profilePhoto: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const labelStyle = {
        display: "block",
        marginBottom: "10px",
        fontSize: "12px",
        fontWeight: "700",
        color: "#7C6FCD",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
    };

    const inputStyle = {
        width: "100%",
        padding: "14px 16px",
        borderRadius: "12px",
        border: "1px solid #E8E4FF",
        background: "#F5F3FF",
        color: "#2D2B55",
        fontSize: "15px",
        outline: "none",
        fontFamily: "inherit",
        boxSizing: "border-box",
        fontWeight: "500",
        transition: "all 0.2s"
    };

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "24px",
        marginBottom: "24px"
    };

    return (
        <div style={{ background: "#ffffff", padding: "40px", borderRadius: "20px", border: "1px solid #E8E4FF", boxShadow: "0 10px 30px rgba(124,111,205,0.05)", maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", paddingBottom: "24px", borderBottom: "1px solid #E8E4FF" }}>
                <h2 style={{ fontSize: "28px", color: "#2D2B55", fontWeight: "800", display: "flex", alignItems: "center", gap: "12px", margin: 0, letterSpacing: "-0.02em" }}>
                    <div style={{ width: "48px", height: "48px", background: "#EDE9FF", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={24} color="#7C6FCD" strokeWidth={2} />
                    </div>
                    Account Settings
                </h2>
                <div style={{ color: "#6B6B8A", fontSize: "14px", fontWeight: "500" }}>Manage your personal details and location</div>
            </div>

            {message && (
                <div style={{ padding: "16px", borderRadius: "12px", marginBottom: "32px", background: message.includes("✅") ? "#DCFCE7" : "#FEE2E2", color: message.includes("✅") ? "#16A34A" : "#EF4444", fontWeight: "700", textAlign: "center", border: message.includes("✅") ? "1px solid #BBF7D0" : "1px solid #FECACA" }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>

                {/* Photo Upload Section */}
                <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "48px", background: "#F5F3FF", padding: "24px", borderRadius: "20px", border: "1px solid #E8E4FF" }}>
                    <div style={{ position: "relative" }}>
                        <div style={{ width: "110px", height: "110px", borderRadius: "24px", background: "#FFFFFF", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", border: "2px solid #7C6FCD", boxShadow: "0 4px 12px rgba(124,111,205,0.1)" }}>
                            {profile.profilePhoto ? (
                                <img src={profile.profilePhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <User size={48} color="#D4CEEF" strokeWidth={1.5} />
                            )}
                        </div>
                        <label style={{ position: "absolute", bottom: "-8px", right: "-8px", width: "36px", height: "36px", background: "#7C6FCD", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "3px solid #FFFFFF", boxShadow: "0 2px 8px rgba(124,111,205,0.2)" }}>
                            <Camera size={18} color="#FFFFFF" strokeWidth={2} />
                            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                        </label>
                    </div>
                    <div>
                        <h4 style={{ margin: "0 0 4px 0", color: "#2D2B55", fontSize: "18px", fontWeight: "700" }}>Profile Picture</h4>
                        <p style={{ margin: 0, fontSize: "14px", color: "#6B6B8A", fontWeight: "500", maxWidth: "240px", lineHeight: "1.5" }}>Upload a clear photo for your profile identification.</p>
                    </div>
                </div>

                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>Full Name *</label>
                        <div style={{ position: "relative" }}>
                            <User size={18} color="#00BFA5" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                            <input type="text" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={{ ...inputStyle, paddingLeft: "42px" }} required placeholder="Enter full name" />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Email Address *</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} color="#00BFA5" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                            <input type="email" value={profile.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })} style={{ ...inputStyle, paddingLeft: "42px" }} required placeholder="Enter email address" />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Mobile Number</label>
                        <div style={{ position: "relative" }}>
                            <Phone size={18} color="#00BFA5" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                            <input 
                                type="text" 
                                value={profile.mobile || ""} 
                                onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} 
                                readOnly={!!initialMobile} 
                                style={{ 
                                    ...inputStyle, 
                                    paddingLeft: "42px",
                                    background: initialMobile ? "#F0FDFB" : "#FFFFFF", 
                                    color: initialMobile ? "#4A5568" : "#1A1A2E",
                                    cursor: initialMobile ? "not-allowed" : "text" 
                                }} 
                                placeholder="Enter mobile number" 
                            />
                        </div>
                    </div>
                </div>

                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>Date of Birth</label>
                        <div style={{ position: "relative" }}>
                            <Calendar size={18} color="#00BFA5" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                            <input type="date" value={profile.dateOfBirth || ""} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} style={{ ...inputStyle, paddingLeft: "42px" }} />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Gender</label>
                        <select value={profile.gender || ""} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} style={{ ...inputStyle, appearance: "auto" }}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                    <div />
                </div>

                <div style={{ margin: "24px 0", padding: "32px", background: "#F0FDFB", borderRadius: "16px", border: "1px solid #B2DFDB" }}>
                    <h3 style={{ fontSize: "16px", margin: "0 0 24px 0", color: "#1A1A2E", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                        <MapPin size={20} color="#00BFA5" /> Location Information
                    </h3>

                    <div style={{ marginBottom: "24px" }}>
                        <label style={labelStyle}>Street Address</label>
                        <textarea value={profile.address || ""} onChange={(e) => setProfile({ ...profile, address: e.target.value })} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="Building, Street, Area details..." />
                    </div>

                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>City / Town</label>
                            <input type="text" value={profile.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} style={inputStyle} placeholder="e.g. Tirchy" />
                        </div>
                        <div>
                            <label style={labelStyle}>District</label>
                            <input type="text" value={profile.district || ""} onChange={(e) => setProfile({ ...profile, district: e.target.value })} style={inputStyle} placeholder="e.g. Tiruchirappalli" />
                        </div>
                        <div>
                            <label style={labelStyle}>Pincode</label>
                            <input type="text" value={profile.pincode || ""} onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} style={inputStyle} placeholder="6-digit PIN" />
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            marginTop: "40px", 
                            padding: "16px 32px", 
                            borderRadius: "14px", 
                            background: "#7C6FCD", 
                            color: "white", 
                            border: "none", 
                            fontSize: "16px", 
                            fontWeight: "700", 
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 12px rgba(124,111,205,0.2)",
                            opacity: loading ? 0.7 : 1,
                            alignSelf: "flex-end"
                        }}
                        onMouseOver={(e) => !loading && (e.target.style.background = "#6A5EC0", e.target.style.transform = "translateY(-2px)")}
                        onMouseOut={(e) => !loading && (e.target.style.background = "#7C6FCD", e.target.style.transform = "translateY(0)")}
                    >
                        <Save size={20} />
                        {loading ? "Saving Changes..." : "Save Profile Information"}
                    </button>
                    <button 
                        type="button" 
                        onClick={fetchProfile} 
                        style={{ 
                            padding: "16px 40px", 
                            background: "#FFFFFF", 
                            color: "#6B7280", 
                            border: "1px solid #E5E7EB", 
                            borderRadius: "999px", 
                            fontWeight: "700", 
                            cursor: "pointer", 
                            transition: "all 0.2s" 
                        }}
                        onMouseOver={(e) => { e.target.style.background = "#F9FAFB"; e.target.style.color = "#2D2D2D"; }} 
                        onMouseOut={(e) => { e.target.style.background = "#FFFFFF"; e.target.style.color = "#6B7280"; }}
                    >
                        Discard Changes
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CustomerProfile;
