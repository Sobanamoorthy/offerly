import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

import { 
  LayoutDashboard, 
  Layers, 
  CalendarCheck, 
  Users, 
  UserSquare2, 
  LifeBuoy, 
  BellRing, 
  Settings,
  TrendingUp,
  HardHat,
  CreditCard,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Star,
  Activity,
  History,
  Send,
  MessageCircle,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const styles = {
    layout: { display: "flex", width: "100%", height: "100%", background: "#F7F5FF", color: "#2D2B55" },
    sidebar: { 
        width: "260px", 
        background: "#F0EEFF", 
        padding: "24px 16px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "8px", 
        overflowY: "auto", 
        flexShrink: 0,
        boxShadow: "4px 0 24px rgba(124, 111, 205, 0.1)"
    },
    main: { flex: 1, padding: "32px 40px", background: "#F7F5FF", overflowY: "auto" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" },
    chartsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "32px", marginBottom: "40px" },
    chartBox: { 
        background: "#FFFFFF", 
        padding: "32px", 
        borderRadius: "24px", 
        boxShadow: "0 4px 20px rgba(124, 111, 205, 0.03)",
        border: "1px solid #E8E4FF",
        transition: "transform 0.3s ease"
    },
    tableWrapper: { 
        background: "#FFFFFF", 
        borderRadius: "24px", 
        border: "1px solid #E8E4FF", 
        overflow: "hidden", 
        marginBottom: "32px",
        boxShadow: "0 4px 12px rgba(124, 111, 205, 0.02)"
    },
    workerTable: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
    tableHeaderRow: { background: "#EDE9FF", color: "#2D2B55", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "800" },
    tableBodyRow: { transition: "all 0.2s" },
    tableInput: { 
        background: "#F5F3FF", 
        border: "1.5px solid #E8E4FF", 
        borderRadius: "12px", 
        color: "#2D2B55", 
        padding: "12px 16px",
        fontSize: "14px",
        outline: "none",
        transition: "all 0.2s"
    },
    btnAction: {
        padding: "8px 16px",
        borderRadius: "999px",
        border: "none",
        fontSize: "12px",
        fontWeight: "800",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "6px"
    },
    navButton: (active) => ({
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        border: "none",
        background: active ? "#7C6FCD" : "transparent",
        color: active ? "#FFFFFF" : "#6B6B8A",
        fontWeight: active ? "700" : "500",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        transition: "all 0.2s",
        fontSize: "14px"
    }),
    statCard: (color) => ({
        background: "#FFFFFF",
        padding: "28px",
        borderRadius: "24px",
        boxShadow: "0 4px 12px rgba(124, 111, 205, 0.03)",
        border: "1px solid #E8E4FF",
        borderTop: `6px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "transform 0.2s ease"
    })
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [view, setView] = useState("overview");

    const [editWorker, setEditWorker] = useState(null);
    const [workerForm, setWorkerForm] = useState({ name: "", email: "", experience: "", category: "" });

    const [customers, setCustomers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [editBooking, setEditBooking] = useState(null);
    const [bookingForm, setBookingForm] = useState({ assignedWorkerId: "", startDateTime: "", endDateTime: "", status: "" });

    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [supportReply, setSupportReply] = useState("");

    const [adminNotifications, setAdminNotifications] = useState([]);
    const [notificationForm, setNotificationForm] = useState({
        title: "",
        message: "",
        type: "Info",
        targetAudience: "All Customers",
        targetUser: ""
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [revenueFilter, setRevenueFilter] = useState("Weekly");
    const [settingsTab, setSettingsTab] = useState("profile");
    const settingsForm = { name: "Admin", email: "admin@offerly.com", language: "English", timezone: "IST (UTC+5:30)", currency: "INR (₹)" };

    const categories = [
        { id: 1, name: "Plumber", description: "Water and pipe repair services", rate: "₹500/hr", status: "Active", workersCount: 45 },
        { id: 2, name: "Electrician", description: "Electrical wiring and repair", rate: "₹600/hr", status: "Active", workersCount: 60 },
        { id: 3, name: "Carpenter", description: "Woodwork and furniture repair", rate: "₹550/hr", status: "Active", workersCount: 30 }
    ];
    // (Category modal state removed to fix ESLint warnings)

    const token = localStorage.getItem("token");

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await axios.get("https://offerly-ijbn.onrender.com/api/admin/dashboard", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(data);
        } catch (err) { console.error(err); }
    }, [token]);

    const fetchWorkers = useCallback(async () => {
        try {
            const { data } = await axios.get("https://offerly-ijbn.onrender.com/api/admin/workers", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers(data);
        } catch (err) { console.error(err); }
    }, [token]);

    const fetchCustomers = useCallback(async () => {
        try {
            const { data } = await axios.get("https://offerly-ijbn.onrender.com/api/admin/customers", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(data);
        } catch (err) { console.error(err); }
    }, [token]);

    const fetchBookings = useCallback(async () => {
        try {
            const { data } = await axios.get("https://offerly-ijbn.onrender.com/api/admin/booking-history", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(data);
        } catch (err) { console.error(err); }
    }, [token]);

    const fetchTickets = useCallback(async () => {
        try {
            const { data } = await axios.get("https://offerly-ijbn.onrender.com/api/support/admin", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(data);
        } catch (err) { console.error(err); }
    }, [token]);

    const fetchAdminNotifications = useCallback(async () => {
        try {
            const { data } = await axios.get("https://offerly-ijbn.onrender.com/api/admin/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdminNotifications(data);
        } catch (err) { console.error(err); }
    }, [token]);

    useEffect(() => {
        fetchStats(); fetchWorkers(); fetchCustomers(); fetchBookings(); fetchTickets(); fetchAdminNotifications();
        const handleRefresh = () => {
            fetchStats(); fetchWorkers(); fetchCustomers(); fetchBookings(); fetchTickets(); fetchAdminNotifications();
        };
        window.addEventListener("refreshAdminData", handleRefresh);
        return () => window.removeEventListener("refreshAdminData", handleRefresh);
    }, [fetchStats, fetchWorkers, fetchCustomers, fetchBookings, fetchTickets, fetchAdminNotifications]);

    useEffect(() => {
        if (selectedBooking) {
            const updated = bookings.find(b => b._id === selectedBooking._id);
            if (updated) setSelectedBooking(updated);
        }
    }, [bookings, selectedBooking]);

    const handleVerify = async (id) => {
        try {
            await axios.put(`https://offerly-ijbn.onrender.com/api/admin/workers/${id}/verify`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchWorkers(); fetchStats();
        } catch (err) { console.error(err); }
    };

    const handleDeleteWorker = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`https://offerly-ijbn.onrender.com/api/admin/workers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchWorkers(); fetchStats();
        } catch (err) { console.error(err); }
    };

    const handleEditWorkerClick = (worker) => {
        setEditWorker(worker);
        setWorkerForm({
            name: worker.userId?.name || "",
            email: worker.userId?.email || "",
            experience: worker.experience || "",
            category: worker.jobCategory || (worker.skills && worker.skills[0]) || ""
        });
    };

    const handleUpdateWorker = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://offerly-ijbn.onrender.com/api/admin/workers/${editWorker._id}`, workerForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditWorker(null); fetchWorkers();
        } catch (err) { alert(err.response?.data?.message || "Failed"); }
    };

    const handleToggleCustomerStatus = async (id) => {
        try {
            await axios.put(`https://offerly-ijbn.onrender.com/api/admin/customers/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCustomers();
        } catch (err) { console.error(err); }
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm("Are you sure? This will delete all their bookings too.")) return;
        try {
            await axios.delete(`https://offerly-ijbn.onrender.com/api/admin/customers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCustomers(); fetchStats();
        } catch (err) { console.error(err); }
    };

    const handleEditBookingClick = (booking) => {
        setEditBooking(booking);
        setBookingForm({
            assignedWorkerId: booking.assignedWorkerId?._id || "",
            startDateTime: booking.startDateTime ? new Date(booking.startDateTime).toISOString().slice(0, 16) : "",
            endDateTime: booking.endDateTime ? new Date(booking.endDateTime).toISOString().slice(0, 16) : "",
            status: booking.status || ""
        });
    };

    const handleUpdateBooking = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://offerly-ijbn.onrender.com/api/admin/bookings/${editBooking._id}`, bookingForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditBooking(null); fetchBookings();
        } catch (err) { alert(err.response?.data?.message || "Failed"); }
    };

    const handleCreateNotification = async (e) => {
        e.preventDefault();
        try {
            await axios.post("https://offerly-ijbn.onrender.com/api/admin/notifications", notificationForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Sent!");
            setNotificationForm({ title: "", message: "", type: "Info", targetAudience: "All Customers", targetUser: "" });
            fetchAdminNotifications();
        } catch (err) { console.error(err); }
    };

    const handleDeleteNotification = async (id) => {
        if (!window.confirm("Delete?")) return;
        try {
            await axios.delete(`https://offerly-ijbn.onrender.com/api/admin/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAdminNotifications();
        } catch (err) { console.error(err); }
    };

    const handleReplySupport = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://offerly-ijbn.onrender.com/api/support/admin/${selectedTicket._id}/reply`, { message: supportReply }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSupportReply("");
            fetchTickets();
            const { data } = await axios.get("https://offerly-ijbn.onrender.com/api/support/admin", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = data.find(t => t._id === selectedTicket._id);
            if (updated) setSelectedTicket(updated);
        } catch (err) { console.error(err); }
    };

    const handleCloseTicket = async (id) => {
        if (!window.confirm("Close this ticket?")) return;
        try {
            await axios.put(`https://offerly-ijbn.onrender.com/api/support/admin/${id}/reply`, { message: "System: Ticket closed by admin." }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTickets();
            if (selectedTicket?._id === id) setSelectedTicket(null);
        } catch (err) { console.error(err); }
    };

    const getRevenueData = () => {
        let labels = []; let data = []; let label = "";
        const now = new Date();
        const bookings = stats?.completedBookings || [];

        if (revenueFilter === "Daily") {
            label = "Hourly Revenue (₹)";
            labels = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "11 PM"];
            data = [0, 0, 0, 0, 0, 0, 0];
            bookings.forEach(b => {
                const bDate = new Date(b.createdAt);
                if (bDate.toDateString() === now.toDateString()) {
                    const hour = bDate.getHours();
                    let index = Math.floor(hour / 4);
                    if (index >= 7) index = 6;
                    data[index] += b.salary || 0;
                }
            });
        } else if (revenueFilter === "Monthly") {
            label = "Weekly Revenue (₹)";
            labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
            data = [0, 0, 0, 0];
            const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            bookings.forEach(b => {
                const bDate = new Date(b.createdAt);
                if (bDate > oneMonthAgo) {
                    const diffDays = Math.ceil((now - bDate) / (1000 * 60 * 60 * 24));
                    const idx = 3 - Math.floor((diffDays - 1) / 7);
                    if (idx >= 0 && idx < 4) data[idx] += b.salary || 0;
                }
            });
        } else {
            label = "Daily Revenue (₹)";
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now); d.setDate(d.getDate() - i);
                labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
                data.push(0);
            }
            const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            bookings.forEach(b => {
                const bDate = new Date(b.createdAt);
                if (bDate > oneWeekAgo) {
                    const diffDays = Math.floor((now - bDate) / (1000 * 60 * 60 * 24));
                    const i = 6 - diffDays;
                    if (i >= 0 && i < 7) data[i] += b.salary || 0;
                }
            });
        }

        return {
            labels,
            datasets: [{
                label,
                data,
                borderColor: "#7C6FCD",
                backgroundColor: "rgba(0, 191, 165, 0.08)",
                pointBackgroundColor: "#2D2B55",
                pointBorderColor: "#FFFFFF",
                pointBorderWidth: 2,
                pointRadius: 5,
                tension: 0.4,
                fill: true
            }]
        };
    };

    const navItems = [
        { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { id: "categories", label: "Categories", icon: <Layers size={20} /> },
        { id: "bookings", label: "Bookings", icon: <CalendarCheck size={20} /> },
        { id: "workers", label: "Professionals", icon: <HardHat size={20} /> },
        { id: "customers", label: "Customers", icon: <Users size={20} /> },
        { id: "support", label: "Support", icon: <LifeBuoy size={20} /> },
        { id: "notifications", label: "Broadcast", icon: <BellRing size={20} /> },
        { id: "settings", label: "System Settings", icon: <Settings size={20} /> },
    ];

    const filteredWorkers = workers.filter(w => {
        const name = (w.userId?.name || "").toLowerCase();
        const email = (w.userId?.email || "").toLowerCase();
        const category = w.jobCategory || (w.skills && w.skills[0]) || "Other";
        const matchesSearch = searchTerm === "" || name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (!stats) return <div style={{ textAlign: "center", padding: "100px", color: "#7C6FCD", fontWeight: "700" }}>SYNCHRONIZING SYSTEM DATA...</div>;

    return (
        <div style={styles.layout}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={{ marginBottom: "32px", padding: "0 12px" }}>
                    <h1 style={{ color: "#7C6FCD", fontSize: "20px", fontWeight: "900", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <ShieldCheck color="#7C6FCD" /> ADMIN
                    </h1>
                    <p style={{ fontSize: "10px", color: "#6B6B8A", fontWeight: "800", marginLeft: "34px", letterSpacing: "0.5px" }}>SYSTEM ADMINISTRATOR</p>
                </div>
                {navItems.map(item => (
                    <button 
                        key={item.id} 
                        style={styles.navButton(view === item.id)} 
                        onClick={() => setView(item.id)}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                {view === "overview" && (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                            <div>
                                <p style={{ color: "#7C6FCD", margin: "0 0 4px 0", fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>Command Center</p>
                                <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "900", color: "#2D2B55", letterSpacing: "-1px" }}>Platform Health</h2>
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <div style={{ background: "#FFFFFF", padding: "10px 20px", borderRadius: "14px", border: "1px solid #E8E4FF", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "700" }}>
                                    <Activity size={16} color="#7C6FCD" /> System Online
                                </div>
                            </div>
                        </div>

                        {/* Summary Metrics */}
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard("#7C6FCD")}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#4A5568" }}>TOTAL REVENUE</span>
                                    <CreditCard size={18} color="#7C6FCD" />
                                </div>
                                <div style={{ fontSize: "28px", fontWeight: "900", color: "#2D2B55" }}>₹{stats.totalRevenue.toLocaleString()}</div>
                                <span style={{ fontSize: "12px", color: "#7C6FCD", fontWeight: "700" }}>+12.5% from last month</span>
                            </div>
                            <div style={styles.statCard("#2D2B55")}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#4A5568" }}>PROFESSIONALS</span>
                                    <HardHat size={18} color="#2D2B55" />
                                </div>
                                <div style={{ fontSize: "28px", fontWeight: "900", color: "#2D2B55" }}>{workers.length}</div>
                                <span style={{ fontSize: "12px", color: "#7C6FCD", fontWeight: "700" }}>{workers.filter(w=>!w.isVerified).length} pending approval</span>
                            </div>
                            <div style={styles.statCard("#7C6FCD")}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#4A5568" }}>ACTIVE USERS</span>
                                    <Users size={18} color="#7C6FCD" />
                                </div>
                                <div style={{ fontSize: "28px", fontWeight: "900", color: "#2D2B55" }}>{stats.totalUsers}</div>
                                <span style={{ fontSize: "12px", color: "#7C6FCD", fontWeight: "700" }}>Stable connection</span>
                            </div>
                            <div style={styles.statCard("#7C6FCD")}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#4A5568" }}>TOTAL BOOKINGS</span>
                                    <CalendarCheck size={18} color="#7C6FCD" />
                                </div>
                                <div style={{ fontSize: "28px", fontWeight: "900", color: "#2D2B55" }}>{stats.totalBookings}</div>
                                <span style={{ fontSize: "12px", color: "#7C6FCD", fontWeight: "700" }}>Peak hours: 10AM - 2PM</span>
                            </div>
                        </div>

                        {/* Revenue Chart */}
                        <div style={styles.chartBox}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <TrendingUp size={24} color="#7C6FCD" />
                                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>Financial Performance</h3>
                                </div>
                                <div style={{ display: "flex", gap: "4px", background: "#E0F7F4", padding: "4px", borderRadius: "999px" }}>
                                    {["Daily", "Weekly", "Monthly"].map(f => (
                                        <button 
                                            key={f} 
                                            onClick={() => setRevenueFilter(f)}
                                            style={{ 
                                                padding: "8px 20px", 
                                                borderRadius: "999px", 
                                                border: "none", 
                                                background: revenueFilter === f ? "#2D2B55" : "transparent",
                                                color: revenueFilter === f ? "#FFFFFF" : "#7C6FCD",
                                                fontSize: "12px",
                                                fontWeight: "800",
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ height: "350px" }}>
                                <Line 
                                    data={getRevenueData()} 
                                    options={{ 
                                        responsive: true, maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: { 
                                            x: { grid: { display: false }, ticks: { color: "#4A5568", font: { weight: 'bold' } } },
                                            y: { grid: { color: "#F0FDFB" }, ticks: { color: "#4A5568", font: { weight: 'bold' } } }
                                        }
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Bottom Sections */}
                        <div style={{ ...styles.chartsGrid, marginTop: "40px" }}>
                            {/* Top Workers */}
                            <div style={styles.chartBox}>
                                <h3 style={{ marginBottom: "24px", fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Star color="#7C6FCD" size={20} fill="#7C6FCD" /> Elite Professionals
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {stats.topWorkers.slice(0, 5).map((w, i) => (
                                        <div key={w._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "#F0FDFB", borderRadius: "16px", border: "1px solid #E8E4FF" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                                <div style={{ width: "40px", height: "40px", background: "#2D2B55", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: "800" }}>{i+1}</div>
                                                <div>
                                                    <div style={{ fontWeight: "800", color: "#2D2B55" }}>{w.userId?.name}</div>
                                                    <div style={{ fontSize: "12px", color: "#7C6FCD", fontWeight: "600" }}>{w.skills?.[0] || 'Professional'}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: "14px", fontWeight: "800", color: "#7C6FCD" }}>★ {w.averageRating.toFixed(1)}</div>
                                                <div style={{ fontSize: "11px", color: "#4A5568" }}>{w.totalReviews} services</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div style={styles.chartBox}>
                                <h3 style={{ marginBottom: "24px", fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <History color="#2D2B55" size={20} /> Service Stream
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    {stats.recentBookings.slice(0, 5).map(b => (
                                        <div key={b._id} style={{ display: "flex", gap: "16px" }}>
                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: b.status === 'completed' ? "#7C6FCD" : "#2D2B55", marginTop: "6px", boxShadow: `0 0 10px ${b.status === 'completed' ? "#7C6FCD" : "#2D2B55"}` }}></div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#2D2B55" }}>{b.workerType} Request</span>
                                                    <span style={{ fontSize: "11px", color: "#4A5568" }}>{new Date(b.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#4A5568" }}>
                                                    <strong style={{ color: "#7C6FCD" }}>{b.customerId?.name}</strong> commissioned service in {b.location}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Manage Workers View */}
                {view === "workers" && (
                    <>
                        <div style={{ marginBottom: "40px" }}>
                            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#2D2B55", marginBottom: "8px" }}>Professional Network</h2>
                            <p style={{ color: "#7C6FCD", fontWeight: "600" }}>Audit and manage all registered service providers.</p>
                        </div>

                        <div style={styles.tableWrapper}>
                            <div style={{ padding: "24px", display: "flex", gap: "20px", alignItems: "center", background: "#EDE9FF", borderBottom: "1px solid #E8E4FF" }}>
                                <div style={{ position: "relative", flex: 1 }}>
                                    <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search by name, email or ID..." 
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        style={{ ...styles.tableInput, width: "100%", paddingLeft: "48px", background: "#FFFFFF" }}
                                    />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#2D2B55" }}>Show</span>
                                    <select 
                                        style={{ ...styles.tableInput, width: "80px", background: "#FFFFFF", padding: "8px 12px" }}
                                        value={entriesPerPage}
                                        onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                    </select>
                                </div>
                                <select 
                                    style={{ ...styles.tableInput, width: "220px", background: "#FFFFFF" }}
                                    value={categoryFilter}
                                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="All">All Disciplines</option>
                                    {[...new Set(workers.map(w => w.jobCategory || (w.skills && w.skills[0]) || "Other"))].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <table style={styles.workerTable}>
                                <thead>
                                    <tr style={styles.tableHeaderRow}>
                                        <th style={{ padding: "16px 24px", textAlign: "left" }}>Professional Profile</th>
                                        <th style={{ padding: "16px 24px", textAlign: "left" }}>Discipline</th>
                                        <th style={{ padding: "16px 24px", textAlign: "center" }}>Experience</th>
                                        <th style={{ padding: "16px 24px", textAlign: "center" }}>Credentials</th>
                                        <th style={{ padding: "16px 24px", textAlign: "right" }}>Management</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWorkers.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map((w, idx) => (
                                        <tr key={w._id} style={{ ...styles.tableBodyRow, background: idx % 2 === 0 ? "#FFFFFF" : "#F5F3FF" }}>
                                            <td style={{ padding: "20px 24px" }}>
                                                <div style={{ fontWeight: "800", color: "#2D2B55" }}>{w.userId?.name}</div>
                                                <div style={{ fontSize: "12px", color: "#7C6FCD" }}>{w.userId?.email}</div>
                                            </td>
                                            <td style={{ padding: "20px 24px" }}>
                                                <span style={{ background: "#EDE9FF", color: "#2D2B55", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                                                    {w.skills?.[0] || 'General'}
                                                </span>
                                            </td>
                                            <td style={{ padding: "20px 24px", textAlign: "center", fontWeight: "700" }}>{w.experience} Years</td>
                                            <td style={{ padding: "20px 24px", textAlign: "center" }}>
                                                {w.isVerified ? 
                                                    <span style={{ color: "#43A047", background: "#DCFCE7", padding: "6px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: "900", border: "1px solid #BBF7D0" }}>VERIFIED</span> :
                                                    <span style={{ color: "#F59E0B", background: "#FFFBEB", padding: "6px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: "900", border: "1px solid #FDE68A" }}>PENDING</span>
                                                }
                                            </td>
                                            <td style={{ padding: "20px 24px", textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                    <button 
                                                        onClick={() => handleVerify(w._id)}
                                                        style={{ ...styles.btnAction, background: w.isVerified ? "#FEE2E2" : "#DCFCE7", color: w.isVerified ? "#EF4444" : "#43A047" }}
                                                    >
                                                        {w.isVerified ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                                        {w.isVerified ? "Revoke" : "Approve"}
                                                    </button>
                                                    <button onClick={() => handleEditWorkerClick(w)} style={{ ...styles.btnAction, background: "#EDE9FF", color: "#2D2B55" }}><Edit size={14} /> Edit</button>
                                                    <button onClick={() => handleDeleteWorker(w._id)} style={{ padding: "8px", borderRadius: "8px", border: "none", background: "transparent", color: "#EF4444", cursor: "pointer" }}><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* Pagination Controls */}
                            <div style={{ padding: "20px 24px", borderTop: "1px solid #E8E4FF", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF" }}>
                                <span style={{ fontSize: "13px", color: "#6B6B8A", fontWeight: "600" }}>
                                    Showing {Math.min((currentPage - 1) * entriesPerPage + 1, filteredWorkers.length)} to {Math.min(currentPage * entriesPerPage, filteredWorkers.length)} of {filteredWorkers.length} entries
                                </span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        style={{ ...styles.btnAction, background: currentPage === 1 ? "#F3F4F6" : "#EDE9FF", color: currentPage === 1 ? "#9CA3AF" : "#7C6FCD", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                                    >
                                        Previous
                                    </button>
                                    {[...Array(Math.ceil(filteredWorkers.length / entriesPerPage))].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            style={{ 
                                                width: "32px", height: "32px", borderRadius: "8px", border: "none",
                                                background: currentPage === i + 1 ? "#7C6FCD" : "transparent",
                                                color: currentPage === i + 1 ? "#FFFFFF" : "#6B6B8A",
                                                fontWeight: "800", fontSize: "13px", cursor: "pointer"
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button 
                                        disabled={currentPage >= Math.ceil(filteredWorkers.length / entriesPerPage)}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredWorkers.length / entriesPerPage)))}
                                        style={{ ...styles.btnAction, background: currentPage >= Math.ceil(filteredWorkers.length / entriesPerPage) ? "#F3F4F6" : "#EDE9FF", color: currentPage >= Math.ceil(filteredWorkers.length / entriesPerPage) ? "#9CA3AF" : "#7C6FCD", cursor: currentPage >= Math.ceil(filteredWorkers.length / entriesPerPage) ? "not-allowed" : "pointer" }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {/* Notifications View */}
                {view === "notifications" && (
                    <div style={{ maxWidth: "800px" }}>
                        <div style={{ marginBottom: "40px" }}>
                            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#2D2B55", marginBottom: "8px" }}>Platform Communications</h2>
                            <p style={{ color: "#7C6FCD", fontWeight: "600" }}>Broadcast system-wide alerts and updates.</p>
                        </div>

                        <div style={{ ...styles.chartBox, marginBottom: "32px" }}>
                            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <Send color="#7C6FCD" size={20} /> Create Global Broadcast
                            </h3>
                            <form onSubmit={handleCreateNotification} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    <div style={{ display: "grid", gap: "8px" }}>
                                        <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>ALERT TITLE</label>
                                        <input required className="modal-input" placeholder="System Maintenance" value={notificationForm.title} onChange={e => setNotificationForm({...notificationForm, title: e.target.value})} />
                                    </div>
                                    <div style={{ display: "grid", gap: "8px" }}>
                                        <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>TARGET AUDIENCE</label>
                                        <select className="modal-input" value={notificationForm.targetAudience} onChange={e => setNotificationForm({...notificationForm, targetAudience: e.target.value})}>
                                            <option>All Customers</option>
                                            <option>All Workers</option>
                                            <option>Global (All Users)</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gap: "8px" }}>
                                    <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>BROADCAST MESSAGE</label>
                                    <textarea required className="modal-input" rows="4" placeholder="Enter notification content..." value={notificationForm.message} onChange={e => setNotificationForm({...notificationForm, message: e.target.value})} style={{ resize: 'none' }} />
                                </div>
                                <button type="submit" style={{ ...styles.navButton(true), justifyContent: "center", height: "54px", width: "100%", fontSize: "16px" }}>
                                    <Send size={18} /> DISPATCH NOTIFICATION
                                </button>
                            </form>
                        </div>

                        <div style={styles.chartBox}>
                            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px" }}>Broadcast History</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {adminNotifications.map(n => (
                                    <div key={n._id} style={{ padding: "20px", background: "#F0FDFB", borderRadius: "16px", border: "1px solid #E8E4FF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontWeight: "800", color: "#2D2B55", marginBottom: "4px" }}>{n.title}</div>
                                            <p style={{ margin: 0, fontSize: "13px", color: "#4A5568" }}>{n.message}</p>
                                            <div style={{ marginTop: "8px", fontSize: "11px", color: "#7C6FCD", fontWeight: "700" }}>Sent to: {n.targetAudience} • {new Date(n.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <button onClick={() => handleDeleteNotification(n._id)} style={{ color: "#EF4444", background: "transparent", border: "none", cursor: "pointer" }}><Trash2 size={20} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Customers View */}
                {view === "customers" && (
                    <>
                        <div style={{ marginBottom: "40px" }}>
                            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#2D2B55", marginBottom: "8px" }}>Customer Directory</h2>
                            <p style={{ color: "#7C6FCD", fontWeight: "600" }}>Manage registered customers and their platform status.</p>
                        </div>

                        <div style={styles.tableWrapper}>
                            <table style={styles.workerTable}>
                                <thead>
                                    <tr style={styles.tableHeaderRow}>
                                        <th style={{ padding: "16px 24px", textAlign: "left" }}>Customer Info</th>
                                        <th style={{ padding: "16px 24px", textAlign: "left" }}>Contact & Location</th>
                                        <th style={{ padding: "16px 24px", textAlign: "center" }}>Platform Usage</th>
                                        <th style={{ padding: "16px 24px", textAlign: "center" }}>Status</th>
                                        <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((c, idx) => (
                                        <tr key={c._id} style={{ ...styles.tableBodyRow, background: idx % 2 === 0 ? "#FFFFFF" : "#F0FDFB" }}>
                                            <td style={{ padding: "20px 24px" }}>
                                                <div style={{ fontWeight: "800", color: "#2D2B55" }}>{c.name}</div>
                                                <div style={{ fontSize: "12px", color: "#7C6FCD" }}>{c.email}</div>
                                            </td>
                                            <td style={{ padding: "20px 24px" }}>
                                                <div style={{ fontSize: "13px", fontWeight: "700" }}>{c.mobile}</div>
                                                <div style={{ fontSize: "12px", color: "#4A5568" }}>{c.location}</div>
                                            </td>
                                            <td style={{ padding: "20px 24px", textAlign: "center" }}>
                                                <div style={{ fontSize: "14px", fontWeight: "800" }}>{c.bookingsCount} Bookings</div>
                                                <div style={{ fontSize: "11px", color: "#7C6FCD", fontWeight: "700" }}>₹{c.totalSpending.toLocaleString()} spent</div>
                                            </td>
                                            <td style={{ padding: "20px 24px", textAlign: "center" }}>
                                                {c.isActive ? 
                                                    <span style={{ color: "#16A34A", background: "#ECFDF5", padding: "6px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: "900", border: "1px solid #A7F3D0" }}>ACTIVE</span> :
                                                    <span style={{ color: "#EF4444", background: "#FEE2E2", padding: "6px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: "900", border: "1px solid #FECACA" }}>SUSPENDED</span>
                                                }
                                            </td>
                                            <td style={{ padding: "20px 24px", textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                    <button 
                                                        onClick={() => handleToggleCustomerStatus(c._id)}
                                                        style={{ ...styles.btnAction, background: c.isActive ? "#FEE2E2" : "#ECFDF5", color: c.isActive ? "#EF4444" : "#16A34A" }}
                                                    >
                                                        {c.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                                        {c.isActive ? "Suspend" : "Activate"}
                                                    </button>
                                                    <button onClick={() => handleDeleteCustomer(c._id)} style={{ padding: "8px", borderRadius: "8px", border: "none", background: "transparent", color: "#EF4444", cursor: "pointer" }}><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Bookings View */}
                {view === "bookings" && (
                    <>
                        <div style={{ marginBottom: "40px" }}>
                            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#2D2B55", marginBottom: "8px" }}>Platform Operations</h2>
                            <p style={{ color: "#7C6FCD", fontWeight: "600" }}>Monitor and orchestrate all service bookings.</p>
                        </div>

                        <div style={styles.tableWrapper}>
                            <table style={styles.workerTable}>
                                <thead>
                                    <tr style={styles.tableHeaderRow}>
                                        <th style={{ padding: "16px 24px", textAlign: "left" }}>Service & ID</th>
                                        <th style={{ padding: "16px 24px", textAlign: "left" }}>Participants</th>
                                        <th style={{ padding: "16px 24px", textAlign: "center" }}>Schedule</th>
                                        <th style={{ padding: "16px 24px", textAlign: "center" }}>Status & Value</th>
                                        <th style={{ padding: "16px 24px", textAlign: "right" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b, idx) => (
                                        <tr key={b._id} style={{ ...styles.tableBodyRow, background: idx % 2 === 0 ? "#FFFFFF" : "#F0FDFB" }}>
                                            <td style={{ padding: "20px 24px" }}>
                                                <div style={{ fontWeight: "800", color: "#2D2D2D" }}>{b.workerType}</div>
                                                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>ID: {b._id.slice(-8).toUpperCase()}</div>
                                            </td>
                                            <td style={{ padding: "20px 24px" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                    <div style={{ fontSize: "13px", fontWeight: "700" }}><span style={{ color: "#7C6FCD" }}>C:</span> {b.customerId?.name}</div>
                                                    <div style={{ fontSize: "13px", fontWeight: "700" }}><span style={{ color: "#2D2B55" }}>P:</span> {b.assignedWorkerId?.name || "Unassigned"}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "20px 24px", textAlign: "center" }}>
                                                <div style={{ fontSize: "13px", fontWeight: "700" }}>{new Date(b.startDateTime).toLocaleDateString()}</div>
                                                <div style={{ fontSize: "11px", color: "#6B7280" }}>{new Date(b.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td style={{ padding: "20px 24px", textAlign: "center" }}>
                                                <div style={{ marginBottom: "6px" }}>
                                                    <span style={{ 
                                                        fontSize: "10px", fontWeight: "900", padding: "4px 10px", borderRadius: "999px",
                                                        background: b.status === "completed" ? "#DCFCE7" : (b.status === "pending" ? "#FEF3C7" : "#F3F4F6"),
                                                        color: b.status === "completed" ? "#16A34A" : (b.status === "pending" ? "#F59E0B" : "#4B5563")
                                                    }}>
                                                        {b.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: "13px", fontWeight: "800", color: "#2D2D2D" }}>₹{b.salary.toLocaleString()}</div>
                                            </td>
                                            <td style={{ padding: "20px 24px", textAlign: "right" }}>
                                                <button onClick={() => handleEditBookingClick(b)} style={{ ...styles.btnAction, background: "#E0F7F4", color: "#2D2B55", marginLeft: "auto" }}>
                                                    <Edit size={14} /> Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Categories View */}
                {view === "categories" && (
                    <>
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                            <div>
                                <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#2D2B55", marginBottom: "8px" }}>Service Taxonomies</h2>
                                <p style={{ color: "#7C6FCD", fontWeight: "600" }}>Manage available services and market rates.</p>
                            </div>
                            <button className="btn-new" onClick={() => alert("Category management coming soon.")}>
                                <Plus size={18} strokeWidth={3} /> Define New Category
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                            {categories.map(cat => (
                                <div key={cat.id} style={{ ...styles.chartBox, padding: "24px" }}>
                                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                                        <div style={{ width: "48px", height: "48px", background: "#E0F7F4", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Layers size={24} color="#7C6FCD" />
                                        </div>
                                        <span style={{ ...styles.navButton(false), padding: "4px 12px", width: "auto", fontSize: "11px", color: "#7C6FCD", background: "#F0FDFB", border: "1px solid #E8E4FF" }}>{cat.status}</span>
                                   </div>
                                   <h4 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "900" }}>{cat.name}</h4>
                                   <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#6B7280", lineHeight: "1.5" }}>{cat.description}</p>
                                   <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", background: "#F0FDFB", borderRadius: "12px", border: "1px solid #E8E4FF" }}>
                                        <div>
                                            <div style={{ fontSize: "11px", color: "#2D2B55", fontWeight: "800" }}>MARKET RATE</div>
                                            <div style={{ fontSize: "16px", fontWeight: "900", color: "#7C6FCD" }}>{cat.rate}</div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "11px", color: "#7C6FCD", fontWeight: "800" }}>PROFESSIONALS</div>
                                            <div style={{ fontSize: "16px", fontWeight: "900", color: "#2D2B55" }}>{cat.workersCount}</div>
                                        </div>
                                   </div>
                                   <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                        <button style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "white", fontWeight: "700", cursor: "pointer" }}>Edit Config</button>
                                        <button style={{ padding: "10px", borderRadius: "8px", border: "1px solid #FEE2E2", background: "white", color: "#EF4444", cursor: "pointer" }}><Trash2 size={18} /></button>
                                   </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Settings View */}
                {view === "settings" && (
                     <div style={{ maxWidth: "900px" }}>
                        <div style={{ marginBottom: "40px" }}>
                            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#2D2B55", marginBottom: "8px" }}>Global Orchestration</h2>
                            <p style={{ color: "#7C6FCD", fontWeight: "600" }}>Configure system behaviors and security policies.</p>
                        </div>

                        <div style={{ display: "flex", gap: "32px" }}>
                            <div style={{ width: "240px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                {["profile"].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setSettingsTab(t)}
                                        style={{ 
                                            padding: "16px 20px", borderRadius: "14px", border: "none", 
                                            background: settingsTab === t ? "#7C6FCD" : "transparent",
                                            color: settingsTab === t ? "#FFFFFF" : "#2D2B55",
                                            fontWeight: "800", textAlign: "left", cursor: "pointer",
                                            fontSize: "14px", transition: "all 0.2s",
                                            boxShadow: settingsTab === t ? "0 4px 12px rgba(124, 111, 205, 0.1)" : "none",
                                            display: "flex", alignItems: "center", gap: "12px"
                                        }}
                                    >
                                        {t === "profile" && <UserSquare2 size={18} />}
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div style={{ flex: 1, background: "#FFFFFF", padding: "40px", borderRadius: "24px", border: "1px solid #E8E4FF", boxShadow: "0 4px 20px rgba(0, 191, 165, 0.02)" }}>
                                {settingsTab === "profile" && (
                                    <div>
                                        <h3 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "32px" }}>Administrator Profile</h3>
                                        <div style={{ display: "grid", gap: "24px" }}>
                                            <div style={{ display: "grid", gap: "8px" }}>
                                                <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>DISPLAY NAME</label>
                                                <input className="modal-input" value={settingsForm.name} readOnly />
                                            </div>
                                            <div style={{ display: "grid", gap: "8px" }}>
                                                <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>EMAIL ADDRESS</label>
                                                <input className="modal-input" value={settingsForm.email} readOnly />
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                                <div style={{ display: "grid", gap: "8px" }}>
                                                    <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>SYSTEM LANGUAGE</label>
                                                    <select className="modal-input"><option>English (Global)</option><option>Hindi</option><option>Tamil</option></select>
                                                </div>
                                                <div style={{ display: "grid", gap: "8px" }}>
                                                    <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>CURRENCY</label>
                                                    <select className="modal-input"><option>INR (₹)</option><option>USD ($)</option></select>
                                                </div>
                                            </div>
                                            <button style={{ ...styles.navButton(true), marginTop: "20px", height: "54px", justifyContent: "center" }}>UPDATE PROFILE</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Support View */}
                {view === "support" && (
                    <>
                        <div style={{ marginBottom: "40px" }}>
                            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#2D2B55", marginBottom: "8px" }}>Systems Support</h2>
                            <p style={{ color: "#7C6FCD", fontWeight: "600" }}>Manage and resolve technical queries from professionals.</p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "32px", height: "calc(100vh - 250px)" }}>
                            {/* Ticket List */}
                            <div style={{ ...styles.chartBox, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                                <div style={{ padding: "20px", borderBottom: "1px solid #E8E4FF", background: "#E0F7F4" }}>
                                    <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0, color: "#2D2B55" }}>Active Inquiries ({tickets.length})</h3>
                                </div>
                                <div style={{ flex: 1, overflowY: "auto" }}>
                                    {tickets.length === 0 ? (
                                        <div style={{ padding: "40px", textAlign: "center", color: "#4A5568" }}>No pending tickets.</div>
                                    ) : (
                                        tickets.map(t => (
                                            <div 
                                                key={t._id} 
                                                onClick={() => setSelectedTicket(t)}
                                                style={{ 
                                                    padding: "20px", borderBottom: "1px solid #F0FDFB", cursor: "pointer",
                                                    background: selectedTicket?._id === t._id ? "#F0FDFB" : "transparent",
                                                    borderLeft: selectedTicket?._id === t._id ? "4px solid #7C6FCD" : "none",
                                                    transition: "all 0.2s"
                                                }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#2D2B55" }}>{t.workerId?.name || "System User"}</span>
                                                    <span style={{ 
                                                        fontSize: "10px", fontWeight: "900", padding: "2px 8px", borderRadius: "4px",
                                                        background: t.status === "Pending" ? "#FEF3C7" : (t.status === "Answered" ? "#DCFCE7" : "#F3F4F6"),
                                                        color: t.status === "Pending" ? "#F59E0B" : (t.status === "Answered" ? "#16A34A" : "#4B5563")
                                                    }}>{t.status.toUpperCase()}</span>
                                                </div>
                                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#2D2B55", marginBottom: "4px" }}>{t.subject}</div>
                                                <div style={{ fontSize: "12px", color: "#4A5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Ticket Detail & Conversation */}
                            <div style={{ ...styles.chartBox, padding: 0, display: "flex", flexDirection: "column" }}>
                                {selectedTicket ? (
                                    <>
                                        <div style={{ padding: "24px", borderBottom: "1px solid #E8E4FF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>{selectedTicket.subject}</h3>
                                                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#4A5568" }}>Thread ID: {selectedTicket._id.slice(-12).toUpperCase()}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleCloseTicket(selectedTicket._id)}
                                                style={{ ...styles.btnAction, background: "#FF5252", color: "#FFFFFF" }}
                                            >
                                                <XCircle size={14} /> Close Ticket
                                            </button>
                                        </div>
                                        
                                        <div style={{ flex: 1, padding: "32px", overflowY: "auto", background: "#F0FDFB", display: "flex", flexDirection: "column", gap: "20px" }}>
                                            {/* Initial Description */}
                                            <div style={{ alignSelf: "flex-start", maxWidth: "85%", background: "#FFFFFF", padding: "16px 20px", borderRadius: "16px 16px 16px 4px", border: "1px solid #E8E4FF", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                                                <div style={{ fontWeight: "800", fontSize: "12px", color: "#7C6FCD", marginBottom: "8px" }}>{selectedTicket.workerId?.name} (Origin)</div>
                                                <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#2D2B55" }}>{selectedTicket.description}</div>
                                                <div style={{ fontSize: "10px", color: "#4A5568", marginTop: "8px" }}>{new Date(selectedTicket.createdAt).toLocaleString()}</div>
                                            </div>

                                            {/* Replies */}
                                            {selectedTicket.replies?.map((reply, idx) => (
                                                <div 
                                                    key={idx} 
                                                    style={{ 
                                                        alignSelf: reply.sender === "admin" ? "flex-end" : "flex-start",
                                                        maxWidth: "85%",
                                                        background: reply.sender === "admin" ? "#7C6FCD" : "#FFFFFF",
                                                        color: reply.sender === "admin" ? "#FFFFFF" : "#2D2B55",
                                                        padding: "16px 20px",
                                                        borderRadius: reply.sender === "admin" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                                        border: reply.sender === "admin" ? "none" : "1px solid #E8E4FF",
                                                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                                                    }}
                                                >
                                                    <div style={{ fontWeight: "800", fontSize: "11px", marginBottom: "6px", opacity: 0.8 }}>
                                                        {reply.sender === "admin" ? "ADMINISTRATOR" : selectedTicket.workerId?.name}
                                                    </div>
                                                    <div style={{ fontSize: "14px", lineHeight: "1.6" }}>{reply.message}</div>
                                                    <div style={{ fontSize: "10px", marginTop: "8px", opacity: 0.7 }}>
                                                        {new Date(reply.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <form onSubmit={handleReplySupport} style={{ padding: "24px", borderTop: "1px solid #E8E4FF", background: "#FFFFFF", borderRadius: "0 0 24px 24px" }}>
                                            <div style={{ position: "relative" }}>
                                                <textarea 
                                                    required
                                                    rows="3"
                                                    placeholder="Type your response here..."
                                                    value={supportReply}
                                                    onChange={(e) => setSupportReply(e.target.value)}
                                                    style={{ 
                                                        width: "100%", padding: "16px", borderRadius: "16px", border: "1.5px solid #E8E4FF",
                                                        fontSize: "14px", resize: "none", outline: "none", color: "#2D2B55",
                                                        background: "#F0FDFB"
                                                    }}
                                                />
                                                <button 
                                                    type="submit"
                                                    style={{ 
                                                        position: "absolute", right: "12px", bottom: "12px", 
                                                        background: "#7C6FCD", color: "#FFFFFF", border: "none",
                                                        padding: "8px 16px", borderRadius: "10px", fontWeight: "800",
                                                        display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"
                                                    }}
                                                >
                                                    <Send size={16} /> SEND REPLY
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#4A5568", gap: "16px", padding: "40px" }}>
                                        <MessageCircle size={48} color="#E8E4FF" />
                                        <div style={{ fontWeight: "800", fontSize: "18px" }}>Interface Selection Required</div>
                                        <div style={{ textAlign: "center" }}>Select a support ticket from the side panel to view full conversation history and respond.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Modals */}
            {editWorker && (
                 <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(26, 26, 46, 0.4)", zIndex: 3000, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(8px)" }}>
                    <div style={{ background: "#FFFFFF", padding: "40px", borderRadius: "28px", width: "100%", maxWidth: "500px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: "1px solid #E8E4FF" }}>
                        <h2 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "32px", color: "#2D2B55" }}>Modify Professional Record</h2>
                        <form onSubmit={handleUpdateWorker} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                             <div style={{ display: "grid", gap: "8px" }}>
                                <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>FULL NAME</label>
                                <input required className="modal-input" value={workerForm.name} onChange={e => setWorkerForm({...workerForm, name: e.target.value})} />
                            </div>
                            <div style={{ display: "grid", gap: "8px" }}>
                                <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>EMAIL ADDRESS</label>
                                <input required type="email" className="modal-input" value={workerForm.email} onChange={e => setWorkerForm({...workerForm, email: e.target.value})} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div style={{ display: "grid", gap: "8px" }}>
                                    <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>CATEGORY</label>
                                    <input required className="modal-input" value={workerForm.category} onChange={e => setWorkerForm({...workerForm, category: e.target.value})} />
                                </div>
                                <div style={{ display: "grid", gap: "8px" }}>
                                    <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>EXPERIENCE</label>
                                    <input required type="number" className="modal-input" value={workerForm.experience} onChange={e => setWorkerForm({...workerForm, experience: e.target.value})} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                                <button type="button" onClick={() => setEditWorker(null)} style={{ flex: 1, padding: "14px", borderRadius: "999px", border: "1.5px solid #E5E7EB", background: "white", fontWeight: "800" }}>Discard</button>
                                <button type="submit" style={{ ...styles.navButton(true), flex: 1, justifyContent: "center", height: "48px" }}>COMMIT CHANGES</button>
                            </div>
                        </form>
                    </div>
                 </div>
            )}

            {editBooking && (
                 <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(124, 111, 205, 0.4)", zIndex: 3000, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(8px)" }}>
                    <div style={{ background: "#FFFFFF", padding: "40px", borderRadius: "28px", width: "100%", maxWidth: "550px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: "1px solid #E8E4FF" }}>
                        <h2 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "32px", color: "#2D2B55" }}>Update Service Booking</h2>
                        <form onSubmit={handleUpdateBooking} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                             <div style={{ display: "grid", gap: "8px" }}>
                                <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>ASSIGNED PROFESSIONAL</label>
                                <select 
                                    className="modal-input" 
                                    value={bookingForm.assignedWorkerId} 
                                    onChange={e => setBookingForm({...bookingForm, assignedWorkerId: e.target.value})}
                                >
                                    <option value="">Select Professional</option>
                                    {workers.filter(w => w.jobCategory === editBooking.workerType || w.skills?.includes(editBooking.workerType)).map(w => (
                                        <option key={w.userId?._id} value={w.userId?._id}>{w.userId?.name} ({w.experience} yrs)</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div style={{ display: "grid", gap: "8px" }}>
                                    <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>START TIME</label>
                                    <input type="datetime-local" className="modal-input" value={bookingForm.startDateTime} onChange={e => setBookingForm({...bookingForm, startDateTime: e.target.value})} />
                                </div>
                                <div style={{ display: "grid", gap: "8px" }}>
                                    <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>END TIME</label>
                                    <input type="datetime-local" className="modal-input" value={bookingForm.endDateTime} onChange={e => setBookingForm({...bookingForm, endDateTime: e.target.value})} />
                                </div>
                            </div>
                            <div style={{ display: "grid", gap: "8px" }}>
                                <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>BOOKING STATUS</label>
                                <select className="modal-input" value={bookingForm.status} onChange={e => setBookingForm({...bookingForm, status: e.target.value})}>
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                <button type="submit" style={{ ...styles.navButton(true), flex: 1, justifyContent: "center" }}>SAVE CHANGES</button>
                                <button type="button" onClick={() => setEditBooking(null)} style={{ ...styles.navButton(false), flex: 1, justifyContent: "center", background: "#F3F4F6", color: "#4B5563" }}>CANCEL</button>
                            </div>
                        </form>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default AdminDashboard;
