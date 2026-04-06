import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, Star, X, Briefcase, Award, Globe, IndianRupee, Clock } from 'lucide-react';

// Generate a deterministic color from a name string for the new theme
const getAvatarTheme = (name) => {
    const themes = [
        { bg: '#7C6FCD', text: '#FFFFFF' },
        { bg: '#6A5EC0', text: '#FFFFFF' },
        { bg: '#5A4FA0', text: '#FFFFFF' },
        { bg: '#EDE9FF', text: '#7C6FCD' },
        { bg: '#C4BFEF', text: '#2D2B55' }
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return themes[Math.abs(hash) % themes.length];
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

const styles = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(45, 43, 85, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200, backdropFilter: "blur(8px)" },
    modal: { background: "#ffffff", padding: "0", borderRadius: "24px", width: "90%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 60px rgba(124, 111, 205, 0.25)", border: "1px solid #E8E4FF" },
    closeBtn: { position: "absolute", right: "20px", top: "20px", border: "none", background: "#FFFFFF", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", color: "#7C6FCD", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.2s" },
    header: { padding: "48px 32px 32px", position: "relative", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", background: "#EDE9FF", borderBottom: "1px solid #C4BFEF", display: "flex", gap: "24px", alignItems: "center" },
    avatar: { width: "110px", height: "110px", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "36px", fontWeight: "800", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" },
    body: { padding: "32px" },
    name: { fontSize: "28px", fontWeight: "800", margin: "0 0 6px 0", color: "#2D2B55", letterSpacing: "-0.02em" },
    jobTitle: { fontSize: "16px", fontWeight: "700", color: "#7C6FCD", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" },
    ratingBadge: { background: "#FFFFFF", color: "#F59E0B", padding: "8px 16px", borderRadius: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", border: "1px solid #E8E4FF" },
    sectionTitle: { fontSize: "14px", fontWeight: "800", color: "#2D2B55", marginBottom: "20px", marginTop: "32px", display: "flex", alignItems: "center", gap: "10px", textTransform: "uppercase", letterSpacing: "0.1em" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
    infoBox: { background: "#FFFFFF", padding: "20px", borderRadius: "16px", border: "1px solid #E8E4FF", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" },
    infoLabel: { fontSize: "11px", color: "#6B6B8A", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" },
    infoValue: { fontSize: "16px", color: "#2D2B55", fontWeight: "800" },
    skillBadge: { background: "#EDE9FF", color: "#7C6FCD", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", display: "inline-block", margin: "4px", border: "1px solid #C4BFEF" }
};

const WorkerProfileModal = ({ worker, onClose }) => {
    const [profile, setProfile] = useState(null);

    const name = worker?.userId?.name || "Professional";
    const theme = getAvatarTheme(name);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const workerUserId = worker.userId?._id || worker.userId;
                const token = localStorage.getItem("token");
                const res = await axios.get(`https://offerly-ijbn.onrender.com/api/workers/profile?userId=${workerUserId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setProfile(res.data);
            } catch (err) {
                console.error("Error fetching full profile:", err);
                setProfile(worker);
            }
        };
        fetchProfile();
    }, [worker]);

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button 
                  style={styles.closeBtn} 
                  onClick={onClose}
                  onMouseOver={(e) => { e.currentTarget.style.transform = "rotate(90deg)"; e.currentTarget.style.color = "#EF4444"; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "rotate(0deg)"; e.currentTarget.style.color = "#7C6FCD"; }}
                >
                    <X size={22} strokeWidth={2.5} />
                </button>

                <div style={styles.header}>
                    <div style={{ ...styles.avatar, background: theme.bg, color: theme.text }}>
                        {getInitials(name)}
                    </div>
                    <div>
                        <div style={styles.jobTitle}>{profile?.jobCategory || worker.jobCategory || "Service Expert"}</div>
                        <h2 style={styles.name}>{name}</h2>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <div style={{ color: "#6B6B8A", display: "flex", gap: "6px", alignItems: "center", fontWeight: "600", fontSize: "14px" }}>
                                <MapPin size={16} strokeWidth={2} color="#7C6FCD" /> {profile?.location || worker.location || "Available Regionally"}
                            </div>
                            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#E8E4FF" }}></div>
                            <div style={{ color: profile?.availability ? "#16A34A" : "#EF4444", fontWeight: "700", fontSize: "13px", display: "flex", gap: "6px", alignItems: "center" }}>
                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: profile?.availability ? "#16A34A" : "#EF4444", display: "inline-block" }}></span>
                                {profile?.availability ? "Available Now" : "Currently Offline"}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.body}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                        <div style={styles.ratingBadge}>
                            <Star size={18} fill="#F59E0B" color="#F59E0B" /> 
                            <span style={{ fontSize: "18px" }}>{profile?.averageRating?.toFixed(1) || worker.averageRating?.toFixed(1) || "New"}</span>
                            {profile?.totalReviews > 0 && <span style={{ color: "#6B7280", fontWeight: "500" }}>({profile.totalReviews})</span>}
                        </div>
                    </div>

                    <h4 style={styles.sectionTitle}><Briefcase size={16} /> Professional Overview</h4>
                    <div style={styles.grid}>
                        <div style={styles.infoBox}>
                            <div style={styles.infoLabel}><Clock size={14} /> Total Experience</div>
                            <div style={styles.infoValue}>{profile?.experience || worker.experience || 0} Years</div>
                        </div>
                        <div style={styles.infoBox}>
                            <div style={styles.infoLabel}><IndianRupee size={14} /> Service Rate</div>
                            <div style={styles.infoValue}>₹{profile?.salary || worker.salary || 0}</div>
                        </div>
                        <div style={styles.infoBox}>
                            <div style={styles.infoLabel}><Award size={14} /> Verified Status</div>
                            <div style={{ ...styles.infoValue, color: "#43A047" }}>Trust Verified</div>
                        </div>
                        <div style={styles.infoBox}>
                            <div style={styles.infoLabel}><MapPin size={14} /> Mobile Coverage</div>
                            <div style={styles.infoValue}>{profile?.willingToTravel ? "Travels to site" : "Local Only"}</div>
                        </div>
                    </div>

                    <h4 style={styles.sectionTitle}><Award size={16} /> Core Specializations</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {profile?.skills?.map((skill, i) => <span key={`s-${i}`} style={{ ...styles.skillBadge, background: "#7C6FCD", color: "#FFFFFF", border: "none" }}>{skill}</span>)}
                        {profile?.subSkills?.map((skill, i) => <span key={`sub-${i}`} style={styles.skillBadge}>{skill}</span>)}
                        {!profile?.skills?.length && !profile?.subSkills?.length && <p style={{ color: "#9CA3AF", fontSize: "14px", fontStyle: "italic" }}>No specific skills listed.</p>}
                    </div>

                    {(profile?.languages?.length > 0) && (
                        <>
                            <h4 style={styles.sectionTitle}><Globe size={16} /> Communication</h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {profile.languages.map((lang, i) => <span key={i} style={{ ...styles.skillBadge, background: "#EDE9FF", color: "#7C6FCD" }}>{lang}</span>)}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkerProfileModal;
