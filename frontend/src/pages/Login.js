import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { Zap, Star, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      console.error("Login attempt failed:", err);
    }
  };

  return (
    <>
      <div className="auth-header-actions">
        <LanguageSwitcher theme="light" />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .auth-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          min-height: 100vh;
          width: 100vw;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          background: #F7F5FF;
          padding: 40px 60px;
        }

        /* ── Left Panel (55%) ── */
        .auth-left {
          flex: 0 0 55%;
          background: transparent;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px;
          position: relative;
          color: #2D2B55;
          overflow: hidden;
          align-items: flex-start;
          align-self: center;
        }

        .left-logo-pill {
          display: flex;
          align-items: center;
          margin-bottom: 32px;
          z-index: 10;
          align-self: flex-start;
          margin-top: 0;
        }

        .left-logo-img {
          height: 52px;
          width: auto;
          display: block;
        }

        .left-content {
          position: relative;
          z-index: 10;
          max-width: 560px;
        }

        .left-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 42px;
          font-weight: 800;
          color: #2D2B55;
          line-height: 1.15;
          margin: 0 0 20px 0;
          letter-spacing: -1px;
        }

        .left-subtitle {
          font-size: 19px;
          color: #6B6B8A;
          line-height: 1.6;
          margin: 0 0 48px 0;
          font-weight: 400;
          opacity: 0.9;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .feature-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #FFFFFF;
          border: 1px solid #E8E4FF;
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 500;
          color: #2D2B55;
          width: fit-content;
          transition: all 0.3s ease;
        }
        .feature-pill:hover {
          transform: translateX(6px);
          border-color: #7C6FCD;
        }

        .auth-header-actions {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 100;
        }

        .auth-right {
          flex: 0 0 45%;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          position: relative;
          align-self: center;
        }

        .form-wrapper {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          padding: 40px;
          border-radius: 24px;
          border-left: 4px solid #7C6FCD;
          box-shadow: 0 10px 40px rgba(124,111,205,0.08);
        }
        
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .form-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #2D2B55;
          margin: 0 0 12px 0;
          line-height: 1.1;
          letter-spacing: -0.5px;
        }

        .form-subtitle {
          font-size: 16px;
          color: #6B6B8A;
          margin: 0 0 40px 0;
          line-height: 1.5;
          font-weight: 500;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .input-label {
          font-size: 13px;
          font-weight: 700;
          color: #7C6FCD;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon-left {
          position: absolute;
          left: 16px;
          color: #7C6FCD;
          width: 20px;
          height: 20px;
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          height: 56px;
          padding: 0 16px 0 48px;
          border-radius: 12px;
          border: 1px solid #E8E4FF;
          background: #F5F3FF;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: #2D2B55;
          transition: all 0.2s ease;
          outline: none;
          font-weight: 500;
        }

        .field-input:focus {
          border-color: #7C6FCD;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(124, 111, 205, 0.08);
        }

        .toggle-pwd {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          color: #6B6B8A;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: all 0.2s;
        }
        .toggle-pwd:hover { color: #7C6FCD; transform: scale(1.1); }

        .forgot-link {
          font-size: 14px;
          color: #6B6B8A;
          text-decoration: none;
          align-self: flex-end;
          margin-top: -8px;
          font-weight: 700;
        }
        .forgot-link:hover { color: #7C6FCD; text-decoration: underline; }

        .submit-btn {
          width: 100%;
          height: 56px;
          background: #7C6FCD;
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 700;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 12px 0 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(124, 111, 205, 0.2);
        }
        .submit-btn:hover {
          background: #6A5EC0;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 111, 205, 0.3);
        }
        .submit-btn:active { transform: translateY(0); }

        .auth-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 15px;
          color: #6B7280;
          font-weight: 500;
        }
        .auth-footer a {
          color: #7C6FCD;
          font-weight: 800;
          text-decoration: none;
          margin-left: 6px;
          border-bottom: 2px solid transparent;
          transition: border-color 0.2s;
        }
        .auth-footer a:hover { border-color: #7C6FCD; }

        .error-msg {
          background: #FEE2E2;
          border: 1px solid #FECACA;
          color: #EF4444;
          padding: 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 24px;
          font-weight: 700;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        @media (max-width: 900px) {
          .auth-left { flex: 0 0 40%; padding: 40px; }
          .left-title { font-size: 36px; }
        }

        @media (max-width: 768px) {
          .auth-container { flex-direction: column; overflow: auto; height: auto; }
          .auth-left { display: none; }
          .auth-right { width: 100%; padding: 32px; flex: 1; min-height: 100vh; justify-content: center; }
          .form-wrapper { max-width: 400px; margin: 0 auto; }
        }
      `}</style>
      
      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="left-logo-pill">
            <a href="/" className="logo">
              <img src="/offerly_logo.png" alt="Offerly — Where Skills Meet Opportunity" className="left-logo-img" />
            </a>
          </div>
          
          <div className="left-content">
            <h1 className="left-title">Premium Service, Guaranteed Skills & Exceptional Results — All in One Platform.</h1>
            <p className="left-subtitle">Connecting homeowners and businesses with certified, background-verified professionals for every domestic and commercial need, across Tamil Nadu.</p>
            
            <div className="feature-list">
              <div className="feature-pill">
                <CheckCircle2 size={20} color="#7C6FCD" strokeWidth={2.5} /> 100% Verified & Background Checked Professionals
              </div>
              <div className="feature-pill">
                <Zap size={20} color="#7C6FCD" strokeWidth={2.5} /> Real-Time Booking with Instant Confirmation
              </div>
              <div className="feature-pill">
                <Star size={20} color="#7C6FCD" strokeWidth={2.5} /> Trusted by 10,000+ Families Across Tamil Nadu
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <div className="form-wrapper">
            
            <h2 className="form-title">Welcome Back to Offerly</h2>
            <p className="form-subtitle">Your trusted platform for skilled professionals</p>

            {error && <div className="error-msg"><XCircle size={18} /> {error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon-left" size={20} />
                  <input
                    className="field-input"
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder="e.g. name@domain.com"
                    required
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="input-label">Security Password</label>
                  <Link to="/login" className="forgot-link">Forgot?</Link>
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon-left" size={20} />
                  <input
                    className="field-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    placeholder="••••••••"
                    required
                    onChange={handleChange}
                  />
                  <button type="button" className="toggle-pwd" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button className="submit-btn" type="submit">
                Access Dashboard <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-footer">
              New to the platform? <Link to="/register">Create Account</Link>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}

// Minimalist fallback helper
const XCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
