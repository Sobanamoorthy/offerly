import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Search, ChevronLeft, ChevronRight, User, Users, Mail, Phone, MapPin, History, CreditCard, Trash2, Edit, ShieldCheck, ShieldX } from 'lucide-react';

const styles = {
    container: { marginTop: "32px", padding: "32px", background: "#FFFFFF", borderRadius: "24px", border: "1px solid #E8E4FF", boxShadow: "0 4px 12px rgba(124, 111, 205, 0.02)" },
    title: { fontSize: "20px", fontWeight: "800", color: "#2D2B55", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" },
    searchContainer: { position: "relative", marginBottom: "24px", maxWidth: "400px" },
    searchInput: { width: "100%", padding: "12px 16px 12px 48px", borderRadius: "12px", border: "1.5px solid #E8E4FF", background: "#FFFFFF", fontSize: "14px", outline: "none", transition: "all 0.2s" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
    th: { padding: "16px", background: "#EDE9FF", borderBottom: "1.5px solid #C4BFEF", color: "#7C6FCD", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", textAlign: "left" },
    td: { padding: "16px", borderBottom: "1px solid #E8E4FF", fontSize: "14px", color: "#2D2B55" },
    badge: (active) => ({
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "800",
        background: active ? "#ECFDF5" : "#FEF2F2",
        color: active ? "#16A34A" : "#EF4444",
        border: `1px solid ${active ? '#A7F3D0' : '#FEE2E2'}`
    }),
    actionBtn: (type) => ({
        padding: "8px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        background: "transparent",
        color: type === "delete" ? "#EF4444" : type === "edit" ? "#6B6B8A" : "#7C6FCD"
    }),
    paginationBtn: (disabled) => ({
        padding: "8px 16px",
        borderRadius: "8px",
        border: "1.5px solid #E8E4FF",
        background: disabled ? "#F9FAFB" : "#FFFFFF",
        color: disabled ? "#9CA3AF" : "#7C6FCD",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "13px",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s"
    })
};

const CustomerTable = () => {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const [customerPage, setCustomerPage] = useState(1);
    const [customersPerPage, setCustomersPerPage] = useState(25);

    const [editCustomer, setEditCustomer] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", mobile: "", location: "" });

    const token = localStorage.getItem("token");

    const fetchCustomers = useCallback(async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/admin/customers", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(res.data);
        } catch (err) { console.error(err); }
    }, [token]);

    useEffect(() => {
        fetchCustomers();
        const handleRefresh = () => fetchCustomers();
        window.addEventListener("refreshAdminData", handleRefresh);
        return () => window.removeEventListener("refreshAdminData", handleRefresh);
    }, [fetchCustomers]);

    const handleToggleStatus = async (id, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
        try {
            await axios.put(`http://localhost:5000/api/admin/customers/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCustomers();
        } catch (err) { alert("Failed"); }
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm("Delete?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/customers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCustomers();
        } catch (err) { alert("Failed"); }
    };

    const handleEditClick = (customer) => {
        setEditCustomer(customer);
        setEditForm({
            name: customer.name || "",
            email: customer.email || "",
            mobile: customer.mobile !== "N/A" ? customer.mobile : "",
            location: customer.location !== "N/A" ? customer.location : ""
        });
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/admin/customers/${editCustomer._id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditCustomer(null); fetchCustomers();
        } catch (err) { alert("Failed"); }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const sortedCustomers = [...customers].sort((a, b) => {
        if (!sortConfig.key) return 0;
        let aV = a[sortConfig.key]; let bV = b[sortConfig.key];
        if (typeof aV === 'string') { aV = aV.toLowerCase(); bV = bV.toLowerCase(); }
        if (aV < bV) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aV > bV) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    const filteredCustomers = sortedCustomers.filter(c =>
        (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.location || "").toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLast = customerPage * customersPerPage;
    const indexOfFirst = indexOfLast - customersPerPage;
    const currentItems = filteredCustomers.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

    return (
        <div style={styles.container}>
            <h3 style={styles.title}><Users size={22} color="#7C6FCD" /> Customer Register</h3>

            <div style={styles.searchContainer}>
                <Search size={18} style={{ position: "absolute", left: "16px", top: "52%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input
                    placeholder="Search by name, email, or city..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCustomerPage(1); }}
                    style={styles.searchInput}
                />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: "600" }}>Show:</span>
                    <select
                        value={customersPerPage}
                        onChange={(e) => { setCustomersPerPage(Number(e.target.value)); setCustomerPage(1); }}
                        style={{ padding: "6px 12px", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "#FFFFFF", fontSize: "13px", fontWeight: "700", outline: "none" }}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: "700" }}>
                        {filteredCustomers.length === 0 ? 0 : indexOfFirst + 1}–{Math.min(indexOfLast, filteredCustomers.length)} of {filteredCustomers.length}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setCustomerPage(p => Math.max(1, p - 1))} disabled={customerPage === 1} style={styles.paginationBtn(customerPage === 1)}><ChevronLeft size={16} /></button>
                        <button onClick={() => setCustomerPage(p => Math.min(totalPages, p + 1))} disabled={customerPage === totalPages || totalPages === 0} style={styles.paginationBtn(customerPage === totalPages || totalPages === 0)}><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeaderRow}>
                            <th style={styles.th}>Customer Identity</th>
                            <th style={styles.th}>Contact Info</th>
                            <th style={{ ...styles.th, cursor: "pointer" }} onClick={() => handleSort('location')}>Location ↕</th>
                            <th style={{ ...styles.th, cursor: "pointer", textAlign: "center" }} onClick={() => handleSort('bookingsCount')}>Service History ↕</th>
                            <th style={{ ...styles.th, cursor: "pointer" }} onClick={() => handleSort('totalSpending')}>Billing (₹) ↕</th>
                            <th style={styles.th}>Status</th>
                            <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr><td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>No customer records found matching your criteria.</td></tr>
                        ) : (
                            currentItems.map((c, i) => (
                                <tr key={c._id} style={{ ...styles.tableBodyRow, background: i % 2 !== 0 ? "#F7F5FF" : "transparent" }}>
                                    <td style={styles.td}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EDE9FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <User size={16} color="#7C6FCD" />
                                            </div>
                                            <span style={{ fontWeight: "700" }}>{c.name}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6B7280" }}><Mail size={12} /> {c.email}</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6B7280" }}><Phone size={12} /> {c.mobile}</div>
                                        </div>
                                    </td>
                                    <td style={styles.td}><div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={14} color="#7C6FCD" /> {c.location}</div></td>
                                    <td style={{ ...styles.td, textAlign: "center" }}>
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#F3F4F6", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", color: "#4B5563" }}>
                                            <History size={12} /> {c.bookingsCount} Jobs
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "800", color: "#2D2B55" }}>
                                            <CreditCard size={14} /> ₹{c.totalSpending.toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.badge(c.isActive)}>{c.isActive ? "ACTIVE" : "DISABLED"}</span>
                                    </td>
                                    <td style={{ ...styles.td, textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                            <button onClick={() => handleToggleStatus(c._id, c.isActive)} style={styles.actionBtn()} title={c.isActive ? "Deactivate" : "Activate"}>
                                                {c.isActive ? <ShieldX size={18} color="#EF4444" /> : <ShieldCheck size={18} color="#16A34A" />}
                                            </button>
                                            <button onClick={() => handleEditClick(c)} style={styles.actionBtn("edit")} title="Edit Profile"><Edit size={18} /></button>
                                            <button onClick={() => handleDeleteCustomer(c._id)} style={styles.actionBtn("delete")} title="Delete Record"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editCustomer && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(45, 43, 85, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)" }}>
                    <div style={{ background: "white", padding: "40px", borderRadius: "28px", width: "440px", boxShadow: "0 25px 50px -12px rgba(124, 111, 205, 0.25)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                            <div style={{ width: "48px", height: "48px", background: "#EDE9FF", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Edit size={24} color="#7C6FCD" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#2D2B55" }}>Edit Profile</h3>
                        </div>
                        <form onSubmit={handleUpdateCustomer} style={{ display: "grid", gap: "20px" }}>
                            <div style={{ display: "grid", gap: "8px" }}>
                                <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>FULL NAME</label>
                                <input className="modal-input" value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} style={{ padding: "12px", borderRadius: "12px", border: "1.5px solid #E8E4FF", background: "#FFFFFF" }} required />
                            </div>
                            <div style={{ display: "grid", gap: "8px" }}>
                                <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>EMAIL ADDRESS</label>
                                <input type="email" className="modal-input" value={editForm.email} onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} style={{ padding: "12px", borderRadius: "12px", border: "1.5px solid #E8E4FF", background: "#FFFFFF" }} required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div style={{ display: "grid", gap: "8px" }}>
                                    <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>MOBILE</label>
                                    <input className="modal-input" value={editForm.mobile} onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))} style={{ padding: "12px", borderRadius: "12px", border: "1.5px solid #E8E4FF", background: "#FFFFFF" }} />
                                </div>
                                <div style={{ display: "grid", gap: "8px" }}>
                                    <label style={{ fontSize: "11px", fontWeight: "900", color: "#7C6FCD", letterSpacing: "1px" }}>CITY</label>
                                    <input className="modal-input" value={editForm.location} onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))} style={{ padding: "12px", borderRadius: "12px", border: "1.5px solid #E8E4FF", background: "#FFFFFF" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                                <button type="button" onClick={() => setEditCustomer(null)} style={{ flex: 1, padding: "14px", borderRadius: "999px", border: "1.5px solid #E8E4FF", background: "white", fontWeight: "800", color: "#6B6B8A" }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: "14px", borderRadius: "999px", border: "none", background: "#7C6FCD", color: "white", fontWeight: "800", boxShadow: "0 10px 20px rgba(124, 111, 205, 0.2)" }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerTable;
