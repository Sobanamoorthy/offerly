import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, Lock, Mail, ArrowLeft, Key } from 'lucide-react';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect to admin dashboard
  if (user && user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/admin/login", form);
      if (res.data.user.role !== "admin") {
        setError("Access restricted to administrators only.");
        return;
      }
      login(res.data.user, res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed. Please verify your credentials.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        
        .admin-login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F7F5FF;
          font-family: 'Inter', sans-serif;
          padding: 24px;
        }

        .admin-login-box {
          background: #FFFFFF;
          width: 100%;
          max-width: 440px;
          padding: 48px;
          border-radius: 28px;
          border-left: 4px solid #7C6FCD;
          box-shadow: 0 25px 50px -12px rgba(124, 111, 205, 0.1);
          position: relative;
          overflow: hidden;
        }

        .admin-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .admin-icon-ring {
          width: 64px;
          height: 64px;
          background: #EDE9FF;
          border: 1px solid #E8E4FF;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: #7C6FCD;
        }

        .admin-login-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #2D2B55;
          letter-spacing: -0.5px;
          margin: 0 0 8px;
        }

        .admin-login-sub {
          color: #6B6B8A;
          font-size: 14px;
          font-weight: 500;
        }

        .admin-error {
          background: #FEE2E2;
          color: #EF4444;
          padding: 14px 16px;
          border-radius: 12px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 24px;
          border: 1px solid #FECACA;
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
        }

        .admin-label {
          display: block;
          color: #7C6FCD;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .input-container {
          position: relative;
          margin-bottom: 24px;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #7C6FCD;
          width: 18px;
          height: 18px;
        }

        .admin-input {
          width: 100%;
          padding: 14px 14px 14px 48px;
          background: #F5F3FF;
          border: 1.5px solid #E8E4FF;
          border-radius: 14px;
          color: #2D2B55;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .admin-input:focus {
          border-color: #7C6FCD;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(124, 111, 205, 0.08);
        }

        .admin-submit-btn {
          width: 100%;
          padding: 16px;
          background: #7C6FCD;
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 20px -5px rgba(124, 111, 205, 0.2);
        }

        .admin-submit-btn:hover {
          background: #6A5EC0;
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -10px rgba(124, 111, 205, 0.3);
        }

        .admin-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          margin-top: 32px;
          background: none;
          border: none;
          color: #7C6FCD;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
        }

        .admin-back-btn:hover {
          color: #2D2B55;
        }
      `}</style>
      <div className="admin-login-root">
        <div className="admin-login-box">
          <div className="admin-header">
            <div className="admin-icon-ring">
              <ShieldAlert size={32} />
            </div>
            <h2 className="admin-login-title">Admin Console</h2>
            <p className="admin-login-sub">Secure Gateway for Offerly Control Panel</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="admin-error"><Lock size={16} /> {error}</div>}

            <label className="admin-label">Access Email</label>
            <div className="input-container">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                className="admin-input"
                placeholder="system-admin@offerly.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <label className="admin-label">Master Password</label>
            <div className="input-container">
              <Key className="input-icon" />
              <input
                type="password"
                name="password"
                className="admin-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="admin-submit-btn">
              Authorize Login
            </button>
          </form>

          <button className="admin-back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={16} /> Return to Home Site
          </button>
        </div>
      </div>
    </>
  );
}
