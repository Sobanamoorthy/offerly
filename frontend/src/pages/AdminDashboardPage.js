import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/AdminDashboard";
import { Search, Plus, Bell, LogOut, ChevronDown, UserPlus, HardHat } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addModal, setAddModal] = useState(null); // 'worker' or 'customer'
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = addModal === "worker"
        ? "http://localhost:5000/api/admin/workers"
        : "http://localhost:5000/api/admin/customers";

      await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`${addModal === "worker" ? "Worker" : "Customer"} added successfully`);
      setAddModal(null);
      setFormData({});
      window.dispatchEvent(new Event("refreshAdminData"));
    } catch (err) {
      alert(err.response?.data?.message || "Error adding record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --bg-primary: #F7F5FF;
          --bg-secondary: #EDE9FF;
          --bg-card: #FFFFFF;
          --bg-input: #FFFFFF;
          --border-color: #E8E4FF;
          --text-primary: #2D2B55;
          --text-muted: #6B6B8A;
          --text-label: #7C6FCD;
          --accent-purple: #7C6FCD;
          --accent-green: #43A047;
          --accent-red: #EF4444;
          --accent-amber: #F59E0B;
        }

        body {
          background: var(--bg-primary);
          color: var(--text-primary);
          margin: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .admin-root {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 72px;
          padding: 0 32px;
          background: #FFFFFF;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-logo {
          height: 52px;
          width: auto;
          display: block;
        }

        .header-divider {
          width: 1px;
          height: 24px;
          background: var(--border-color);
        }

        .admin-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--accent-gold);
          text-transform: uppercase;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .header-search {
          display: flex;
          align-items: center;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 999px;
          padding: 8px 20px;
          color: var(--text-muted);
          width: 320px;
          transition: all 0.2s;
        }
        .header-search:focus-within {
          border-color: var(--accent-purple);
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(124, 111, 205, 0.05);
        }

        .header-search input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          margin-left: 10px;
          width: 100%;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .btn-new {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--accent-purple);
          color: white;
          border: none;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(124, 111, 205, 0.2);
        }

        .btn-new:hover {
          transform: translateY(-2px);
          background: #4A3329;
          box-shadow: 0 8px 20px rgba(92, 64, 51, 0.3);
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: transparent;
          color: var(--accent-red);
          border: 1.5px solid #FEE2E2;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-logout:hover {
          background: #FEF2F2;
          border-color: var(--accent-red);
        }

        .header-icon-btn {
          position: relative;
          cursor: pointer;
          color: var(--text-muted);
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon-btn:hover {
          color: var(--accent-purple);
        }

        .icon-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--accent-red);
          color: white;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFFFFF;
        }

        .header-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 12px;
          transition: background 0.2s;
        }
        .header-profile:hover { background: var(--bg-secondary); }

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: var(--accent-purple);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .admin-content {
          display: flex;
          flex: 1;
          height: calc(100vh - 72px);
          overflow: hidden;
        }

        .add-dropdown {
          position: absolute;
          top: 60px;
          right: 220px;
          background: #FFFFFF;
          padding: 8px;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 1px solid var(--border-color);
          zIndex: 1100;
          minWidth: 200px;
          animation: dropIn 0.2s ease-out;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          background: none;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.2s;
          font-size: 14px;
        }
        .dropdown-item:hover {
          background: var(--bg-secondary);
          color: var(--accent-purple);
        }

        /* Forms */
        .modal-input {
          padding: 14px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--border-color);
          background: var(--bg-input);
          font-size: 15px;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
        }
        .modal-input:focus {
          border-color: var(--accent-purple);
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(124, 111, 205, 0.05);
        }

        /* Scrollbars */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-primary); }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
      `}</style>

      <div className="admin-root">
        <header className="admin-header">
          <div className="header-left">
            <a href="/admin/dashboard" className="logo">
              <img src="/offerly_logo.png" alt="Offerly — Where Skills Meet Opportunity" className="header-logo" />
            </a>
            <div className="header-divider"></div>
            <div className="admin-title">System Administrator</div>
          </div>
          
          <div className="header-right">
            <div className="header-search">
              <Search size={18} />
              <input type="text" placeholder="Search commands or data..." />
            </div>
            
            <div className="header-actions">
              <div style={{ position: 'relative' }}>
                <button
                  className="btn-new"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                >
                  <Plus size={18} strokeWidth={3} /> Quick Add
                </button>
                {showAddMenu && (
                  <div className="add-dropdown">
                    <button className="dropdown-item" onClick={() => { setAddModal("worker"); setShowAddMenu(false); }}>
                      <HardHat size={18} /> Add New Professional
                    </button>
                    <button className="dropdown-item" onClick={() => { setAddModal("customer"); setShowAddMenu(false); }}>
                      <UserPlus size={18} /> Add New Customer
                    </button>
                  </div>
                )}
              </div>

              <div className="header-icon-btn">
                <Bell size={22} />
                <div className="icon-badge">5</div>
              </div>

              <div className="header-profile">
                <div className="avatar-circle">SA</div>
                <ChevronDown size={14} color="#7C6FCD" />
              </div>

              <button className="btn-logout" onClick={handleLogout}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <AdminDashboard />
        </main>

        {/* Modal Overlay Form */}
        {addModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(45, 43, 85, 0.4)", zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(8px)" }}>
            <div style={{ background: "#FFFFFF", padding: "40px", borderRadius: "28px", width: "100%", maxWidth: "520px", boxShadow: "0 25px 50px -12px rgba(124, 111, 205, 0.25)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                <div style={{ width: "48px", height: "48px", background: "#EDE9FF", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {addModal === "worker" ? <HardHat size={24} color="#7C6FCD" /> : <UserPlus size={24} color="#7C6FCD" />}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#2D2B55" }}>Register {addModal === "worker" ? "Professional" : "Customer"}</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: "#6B6B8A" }}>Add a new user manually to the system.</p>
                </div>
              </div>

              <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gap: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: "#7C6FCD", textTransform: "uppercase" }}>Full Legal Name</label>
                  <input required name="name" placeholder="e.g. Robert Wilson" onChange={handleFormChange} className="modal-input" />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                   <label style={{ fontSize: "12px", fontWeight: "800", color: "#7C6FCD", textTransform: "uppercase" }}>Email Address</label>
                  <input required type="email" name="email" placeholder="robert@example.com" onChange={handleFormChange} className="modal-input" />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                   <label style={{ fontSize: "12px", fontWeight: "800", color: "#7C6FCD", textTransform: "uppercase" }}>Temporary Password</label>
                  <input type="password" name="password" placeholder="••••••••" onChange={handleFormChange} className="modal-input" />
                </div>

                {addModal === "worker" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "800", color: "#7C6FCD", textTransform: "uppercase" }}>Job Category</label>
                      <input required name="category" placeholder="Electrical" onChange={handleFormChange} className="modal-input" />
                    </div>
                    <div style={{ display: "grid", gap: "8px" }}>
                       <label style={{ fontSize: "12px", fontWeight: "800", color: "#7C6FCD", textTransform: "uppercase" }}>Experience (Years)</label>
                      <input required type="number" name="experience" placeholder="5" onChange={handleFormChange} className="modal-input" />
                    </div>
                  </div>
                )}

                {addModal === "customer" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "800", color: "#7C6FCD", textTransform: "uppercase" }}>Contact Number</label>
                      <input name="mobile" placeholder="9876543210" onChange={handleFormChange} className="modal-input" />
                    </div>
                    <div style={{ display: "grid", gap: "8px" }}>
                       <label style={{ fontSize: "12px", fontWeight: "800", color: "#7C6FCD", textTransform: "uppercase" }}>City / Base</label>
                      <input name="location" placeholder="Coimbatore" onChange={handleFormChange} className="modal-input" />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                  <button type="button" onClick={() => { setAddModal(null); setFormData({}); }} style={{ flex: 1, padding: "16px", borderRadius: "999px", border: "1.5px solid #E5E7EB", background: "transparent", color: "#6B6B8A", cursor: "pointer", fontWeight: "800", fontSize: "15px" }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "16px", borderRadius: "999px", border: "none", background: "#7C6FCD", color: "white", cursor: "pointer", fontWeight: "800", fontSize: "15px", boxShadow: "0 10px 20px rgba(124, 111, 205, 0.2)" }}>
                    {isSubmitting ? "Processing..." : `Register ${addModal === "worker" ? "Worker" : "Customer"}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
