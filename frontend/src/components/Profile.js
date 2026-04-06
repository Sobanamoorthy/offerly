import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { JOB_CATEGORIES } from "../constants/jobData";
import { User, Edit3, X, Award, Star, IndianRupee, MapPin, Save } from 'lucide-react';

const TN_DISTRICTS = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode",
    "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet",
    "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
];

const styles = {
    container: { maxWidth: "850px", margin: "40px auto", padding: "40px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", paddingBottom: "24px", borderBottom: "1px solid #F5F2E9" },
    title: { fontSize: "28px", fontWeight: "800", color: "#6B63CC", margin: 0, letterSpacing: "-0.02em" },
    editBtn: (isEditing) => ({
        padding: "10px 24px",
        borderRadius: "999px",
        border: isEditing ? "1px solid #E5E7EB" : "none",
        fontWeight: "700",
        cursor: "pointer",
        background: isEditing ? "#FFFFFF" : "#6B63CC",
        color: isEditing ? "#6B6B8A" : "#FFFFFF",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        boxShadow: isEditing ? "none" : "0 4px 10px rgba(107, 99, 204, 0.2)"
    }),
    formGroup: { marginBottom: "24px" },
    label: { display: "block", fontSize: "12px", fontWeight: "700", color: "#6B63CC", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" },
    input: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: "16px", outline: "none", boxSizing: "border-box", color: "#2D2D2D", fontWeight: "500", transition: "all 0.2s" },
    submitBtn: { width: "100%", padding: "16px", borderRadius: "999px", border: "none", background: "#6B63CC", color: "white", fontWeight: "700", fontSize: "16px", cursor: "pointer", marginTop: "20px", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(107, 99, 204, 0.2)" },
    viewRow: { display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #FDFBF7", alignItems: "center" },
    viewLabel: { color: "#6B7280", fontWeight: "600", fontSize: "14px" },
    viewValue: { color: "#2D2D2D", fontWeight: "700", fontSize: "15px" }
};

const Profile = () => {
    const [profile, setProfile] = useState({
        mobile: "",
        experience: 0,
        location: "",
        salary: 0,
        skills: [],
        subSkills: [],
        availability: true,
        latitude: null,
        longitude: null,
        mainJob: "",
        customMainJob: "",
        subSkillsArray: [],
        customSkills: "",
        averageRating: 0,
        totalReviews: 0,
        dob: "",
        willingToTravel: false,
        willingDistricts: []
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchProfile = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/workers/profile?userId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) {
                const mainJobFromDB = res.data.jobCategory || res.data.skills?.[0] || "";
                const isPredefined = Object.keys(JOB_CATEGORIES).includes(mainJobFromDB);

                setProfile({
                    ...res.data,
                    mainJob: isPredefined ? mainJobFromDB : (mainJobFromDB ? "Other" : ""),
                    customMainJob: isPredefined ? "" : mainJobFromDB,
                    subSkillsArray: res.data.subSkills || [],
                    customSkills: res.data.languages ? res.data.languages.join(", ") : "",
                    dob: res.data.dob ? new Date(res.data.dob).toISOString().split('T')[0] : "",
                    willingToTravel: res.data.willingToTravel || false,
                    willingDistricts: res.data.willingDistricts || []
                });
                setIsEditing(false);
            } else {
                setIsEditing(true);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            setIsEditing(true);
        }
    }, [token, user.id]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleJobCategoryChange = (e) => {
        const value = e.target.value;
        setProfile(prev => ({
            ...prev,
            mainJob: value,
            subSkillsArray: [], // Reset sub-skills when category changes
        }));
    };

    const handleSubSkillToggle = (skill) => {
        setProfile(prev => {
            const current = [...prev.subSkillsArray];
            if (current.includes(skill)) {
                return { ...prev, subSkillsArray: current.filter(s => s !== skill) };
            } else {
                return { ...prev, subSkillsArray: [...current, skill] };
            }
        });
    };

    const handleDistrictToggle = (district) => {
        setProfile(prev => {
            const current = [...prev.willingDistricts];
            if (current.includes(district)) return { ...prev, willingDistricts: current.filter(d => d !== district) };
            return { ...prev, willingDistricts: [...current, district] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const finalMainJob = profile.mainJob === "Other" ? profile.customMainJob : profile.mainJob;
            const updatedProfile = {
                ...profile,
                userId: user.id,
                jobCategory: finalMainJob,
                skills: [finalMainJob],
                subSkills: profile.subSkillsArray,
                languages: profile.customSkills.split(",").map((s) => s.trim()).filter(s => s !== ""),
                salary: Number(profile.salary),
                experience: Number(profile.experience)
            };

            await axios.post("http://localhost:5000/api/workers/profile", updatedProfile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("✅ Profile updated successfully!");
            setIsEditing(false);
            fetchProfile();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error(err);
            setMessage("❌ Failed to update profile.");
        }
    };

    if (loading) return <div style={{ textAlign: "center", padding: "80px", color: "#7C6FCD", fontWeight: "600" }}>Loading profile details...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", background: "#EDE9FC", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={24} color="#6B63CC" strokeWidth={2} />
                    </div>
                    <h2 style={styles.title}>Professional Profile</h2>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} style={styles.editBtn(isEditing)}>
                    {isEditing ? <><X size={18} /> Cancel</> : <><Edit3 size={18} /> Edit Details</>}
                </button>
            </div>

            {message && <div style={{ padding: "16px", borderRadius: "12px", background: message.includes("✅") ? "#DCFCE7" : "#FEE2E2", color: message.includes("✅") ? "#16A34A" : "#EF4444", marginBottom: "32px", textAlign: "center", fontWeight: "700", border: message.includes("✅") ? "1px solid #BBF7D0" : "1px solid #FECACA" }}>{message}</div>}

            {!isEditing ? (
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "40px" }}>
                        <div>
                            <div style={styles.viewRow}><span style={styles.viewLabel}>Main Profession</span><span style={styles.viewValue}>{profile.mainJob === "Other" ? profile.customMainJob : profile.mainJob || "Not set"}</span></div>
                            <div style={styles.viewRow}><span style={styles.viewLabel}>Mobile Number</span><span style={styles.viewValue}>{profile.mobile || "Not set"}</span></div>
                            <div style={styles.viewRow}><span style={styles.viewLabel}>Experience</span><span style={styles.viewValue}>{profile.experience} Years</span></div>
                            <div style={styles.viewRow}><span style={styles.viewLabel}>Daily Rate</span><span style={{ ...styles.viewValue, color: "#7C6FCD", fontSize: "18px" }}>₹{profile.salary}</span></div>
                        </div>
                        <div>
                            <div style={styles.viewRow}><span style={styles.viewLabel}>Location</span><span style={styles.viewValue}>{profile.location || "Not set"}</span></div>
                            <div style={styles.viewRow}><span style={styles.viewLabel}>Willing to Travel</span><span style={styles.viewValue}>{profile.willingToTravel ? "Yes, Available" : "Local only"}</span></div>
                            <div style={styles.viewRow}><span style={styles.viewLabel}>Date of Birth</span><span style={styles.viewValue}>{profile.dob ? new Date(profile.dob).toLocaleDateString() : "Not set"}</span></div>
                            <div style={styles.viewRow}>
                                <span style={styles.viewLabel}>Status</span>
                                <span style={{ padding: "4px 12px", borderRadius: "999px", background: profile.availability ? "#DCFCE7" : "#FEE2E2", color: profile.availability ? "#43A047" : "#EF4444", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" }}>
                                    {profile.availability ? "Active" : "Offline"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: "#FFFFFF", padding: "32px", borderRadius: "16px", border: "1px solid #E8E4FF" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#6B63CC", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Award size={20} color="#6B63CC" /> Expertise & Skills
                        </h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {profile.subSkillsArray && profile.subSkillsArray.length > 0 ?
                                profile.subSkillsArray.map((s, i) => <span key={i} style={{ padding: "8px 16px", background: "#FFFFFF", borderRadius: "8px", fontSize: "14px", color: "#6B63CC", fontWeight: "600", border: "1px solid #C4BFEF" }}>{s}</span>)
                                : <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>No specific skills listed.</span>}
                        </div>
                    </div>

                    <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid #F5F2E9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ background: "#EDE9FF", padding: "8px 16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Star size={18} fill="#F59E0B" color="#F59E0B" />
                                <span style={{ fontSize: "20px", fontWeight: "800", color: "#6B63CC" }}>{profile.averageRating?.toFixed(1) || "0.0"}</span>
                            </div>
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#2D2D2D" }}>Professional Rating</div>
                                <div style={{ fontSize: "12px", color: "#6B7280" }}>Based on {profile.totalReviews || 0} customer reviews</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mobile Number</label>
                            <input type="text" name="mobile" value={profile.mobile} onChange={handleChange} required style={{ ...styles.input, ":focus": { borderColor: "#6B63CC" } }} placeholder="+91 12345 67890" />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Date of Birth</label>
                            <input type="date" name="dob" value={profile.dob} onChange={handleChange} required style={styles.input} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Experience (Years)</label>
                            <input type="number" name="experience" value={profile.experience} onChange={handleChange} required style={styles.input} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Daily Service Rate (₹)</label>
                            <div style={{ position: "relative" }}>
                                <IndianRupee size={18} color="#6B7280" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                                <input type="number" name="salary" value={profile.salary} onChange={handleChange} required style={{ ...styles.input, paddingLeft: "42px" }} />
                            </div>
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Primary Work Location</label>
                        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                            <input type="text" name="location" value={profile.location} onChange={handleChange} required style={styles.input} placeholder="Area, City Name" />
                            <button type="button" onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => {
                                            setProfile({ ...profile, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                                            alert("Location set to current coordinates!");
                                        },
                                        (e) => alert(e.message)
                                    );
                                }
                            }} style={{ ...styles.editBtn(false), padding: "0 20px", borderRadius: "12px", background: "#EDE9FC", color: "#6B63CC", whiteSpace: "nowrap" }}><MapPin size={18} /> Use GPS</button>
                        </div>

                        <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "16px", background: profile.willingToTravel ? "#FDFBF7" : "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", transition: "all 0.2s" }}>
                            <input type="checkbox" name="willingToTravel" checked={profile.willingToTravel} onChange={handleChange} style={{ width: "20px", height: "20px", accentColor: "#6B63CC" }} />
                            <span style={{ fontWeight: "700", color: "#6B63CC", fontSize: "14px" }}>Willing to travel to other districts for work</span>
                        </label>

                        {profile.willingToTravel && (
                            <div style={{ marginTop: "16px", padding: "20px", background: "#FDFBF7", borderRadius: "12px", border: "1px solid #E5E7EB", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px", maxHeight: "200px", overflowY: "auto" }}>
                                {TN_DISTRICTS.map(dist => (
                                    <label key={dist} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: profile.willingDistricts.includes(dist) ? "#6B63CC" : "#6B6B8A", fontWeight: profile.willingDistricts.includes(dist) ? "700" : "500" }}>
                                        <input type="checkbox" checked={profile.willingDistricts.includes(dist)} onChange={() => handleDistrictToggle(dist)} style={{ accentColor: "#6B63CC" }} />
                                        {dist}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Primary Profession</label>
                            <select name="mainJob" value={profile.mainJob} onChange={handleJobCategoryChange} style={styles.input} required>
                                <option value="">Select Category</option>
                                {Object.keys(JOB_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        {profile.mainJob === "Other" ? (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Custom Job Title</label>
                                <input name="customMainJob" value={profile.customMainJob} onChange={handleChange} style={styles.input} placeholder="e.g. Solar Engineer" required />
                            </div>
                        ) : <div />}
                    </div>

                    {profile.mainJob && profile.mainJob !== "Other" && (
                        <div style={{ ...styles.formGroup, background: "#FDFBF7", padding: "24px", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                            <label style={styles.label}>Select Specializations</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {JOB_CATEGORIES[profile.mainJob].map(skill => (
                                    <label key={skill} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", color: profile.subSkillsArray.includes(skill) ? "#6B63CC" : "#4B5563", fontWeight: profile.subSkillsArray.includes(skill) ? "700" : "500" }}>
                                        <input type="checkbox" checked={profile.subSkillsArray.includes(skill)} onChange={() => handleSubSkillToggle(skill)} style={{ accentColor: "#6B63CC" }} />
                                        {skill}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Availability for Hiring</label>
                        <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "16px", background: profile.availability ? "#DCFCE7" : "#FEE2E2", borderRadius: "12px", border: "1px solid transparent", transition: "all 0.2s" }}>
                            <input type="checkbox" name="availability" checked={profile.availability} onChange={handleChange} style={{ width: "20px", height: "20px", accentColor: profile.availability ? "#43A047" : "#EF4444" }} />
                            <span style={{ fontWeight: "800", color: profile.availability ? "#43A047" : "#B91C1C", fontSize: "14px", textTransform: "uppercase" }}>{profile.availability ? "Available Online" : "Set to Offline"}</span>
                        </label>
                    </div>

                    <button type="submit" style={styles.submitBtn} onMouseOver={(e) => { e.target.style.background = "#6A5EC0"; e.target.style.transform = "translateY(-2px)"; }} onMouseOut={(e) => { e.target.style.background = "#7C6FCD"; e.target.style.transform = "translateY(0)"; }}>
                        <Save size={18} style={{ marginRight: "8px" }} /> Update Profile Info
                    </button>
                </form>
            )}
        </div>
    );
};

export default Profile;
