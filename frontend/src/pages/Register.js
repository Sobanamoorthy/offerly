import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { Zap, Star, User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer", // default role
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const setRole = (roleStr) => {
    setForm({ ...form, role: roleStr });
  };

  const getStrengthPercent = () => {
    let strength = 0;
    if (form.password.length > 5) strength += 25;
    if (form.password.match(/[a-z]/)) strength += 25;
    if (form.password.match(/[A-Z]/)) strength += 25;
    if (form.password.match(/[0-9]/) || form.password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return strength;
  };

  const strengthPercent = getStrengthPercent();
  let strengthLabel = "Weak";
  let strengthColor = "#EF4444";
  
  if (strengthPercent === 50) { strengthLabel = "Fair"; strengthColor = "#F59E0B"; }
  else if (strengthPercent === 75) { strengthLabel = "Good"; strengthColor = "#7C6FCD"; }
  else if (strengthPercent === 100) { strengthLabel = "Strong"; strengthColor = "#43A047"; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const { ...submitData } = form;
      await API.post("/auth/register", submitData);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
          font-family: 'Inter', system-ui, sans-serif;
          background: #F7F5FF;
          padding: 40px 60px;
        }

        /* ── Left Panel (50%) ── */
        .auth-left {
          flex: 0 0 50%;
          background: transparent;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px;
          position: relative;
          color: #2D2B55;
          overflow: hidden;
          z-index: 10;
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
          font-size: 17px;
          color: #6B6B8A;
          line-height: 1.6;
          margin: 0 0 48px 0;
          max-width: 90%;
          opacity: 0.9;
          text-align: left;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-pill {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          background: #FFFFFF;
          border: 1px solid #E8E4FF;
          border-radius: 12px;
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 600;
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

        /* ── Right Panel (50%) ── */
        .auth-right {
          flex: 0 0 50%;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 60px 60px 60px;
          position: relative;
          align-self: center;
        }

        .form-wrapper {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          padding: 40px;
          border-radius: 24px;
          border-left: 4px solid #7C6FCD;
          box-shadow: 0 10px 40px rgba(124,111,205,0.08);
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
          font-weight: 500;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
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
          height: 52px;
          padding: 0 16px 0 48px;
          border-radius: 12px;
          border: 1px solid #E8E4FF;
          background: #F5F3FF;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
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
        }

        .submit-btn {
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
          margin-top: 12px;
          box-shadow: 0 4px 12px rgba(124, 111, 205, 0.2);
        }
        .submit-btn:hover {
          background: #6A5EC0;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 111, 205, 0.3);
        }

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
        }
        .auth-footer a:hover { color: #6A5EC0; text-decoration: underline; }

        .role-row {
          display: flex;
          gap: 16px;
          margin-bottom: 4px;
        }
        .role-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 80px;
          border: 1.5px solid #E8E4FF;
          border-radius: 16px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .role-btn .role-icon {
          font-size: 20px;
          margin-bottom: 6px;
        }
        .role-btn .role-title {
          font-weight: 700;
          font-size: 14px;
          color: #2D2D2D;
        }
        .role-btn.active {
          background: #7C6FCD;
          border-color: #7C6FCD;
          box-shadow: 0 4px 12px rgba(124, 111, 205, 0.25);
        }
        .role-btn.active .role-title {
          color: #FFFFFF;
        }
        .role-btn.active .role-icon {
          color: #FFFFFF;
        }
        
        .strength-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        .strength-blocks {
          display: flex;
          gap: 6px;
          flex: 1;
          margin-right: 12px;
        }
        .strength-segment {
          flex: 1;
          height: 4px;
          background: #E5E7EB;
          border-radius: 2px;
          transition: background 0.3s ease;
        }
        .strength-label {
          font-size: 11px;
          font-weight: 800;
          width: 50px;
          text-align: right;
          text-transform: uppercase;
        }

        .status-msg {
          padding: 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 32px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .error-msg { background: #FEE2E2; border: 1px solid #FECACA; color: #EF4444; }
        .success-msg { background: #DCFCE7; border: 1px solid #BBF7D0; color: #16A34A; }

        @media (max-width: 900px) {
          .auth-left { display: none; }
          .auth-right { width: 100%; margin-left: 0; padding: 40px; }
          .form-wrapper { max-width: 440px; margin: 0 auto; }
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
            
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Join thousands of users hiring elite professionals.</p>

            {error && <div className="status-msg error-msg"><AlertCircle size={18} /> {error}</div>}
            {success && <div className="status-msg success-msg"><CheckCircle2 size={18} /> {success}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              
              <div className="input-group">
                <label className="input-label">Select Account Type</label>
                <div className="role-row">
                  <button type="button" className={`role-btn ${form.role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>
                    <span className="role-icon">🏠</span>
                    <span className="role-title">Customer</span>
                  </button>
                  <button type="button" className={`role-btn ${form.role === 'worker' ? 'active' : ''}`} onClick={() => setRole('worker')}>
                    <span className="role-icon">🔧</span>
                    <span className="role-title">Worker</span>
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon-left" size={20} />
                  <input className="field-input" type="text" name="name" value={form.name} placeholder="e.g. John Doe" required onChange={handleChange} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon-left" size={20} />
                  <input className="field-input" type="email" name="email" value={form.email} placeholder="name@domain.com" required onChange={handleChange} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Mobile Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon-left" size={20} />
                  <input className="field-input" type="tel" name="phone" value={form.phone} placeholder="+91 00000 00000" required onChange={handleChange} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon-left" size={20} />
                  <input className="field-input" type={showPassword ? "text" : "password"} name="password" value={form.password} placeholder="Minimum 6 characters" required onChange={handleChange} />
                  <button type="button" className="toggle-pwd" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.password && (
                  <div className="strength-container">
                    <div className="strength-blocks">
                      <div className="strength-segment" style={{ background: strengthPercent >= 25 ? strengthColor : '#E5E7EB' }}></div>
                      <div className="strength-segment" style={{ background: strengthPercent >= 50 ? strengthColor : '#E5E7EB' }}></div>
                      <div className="strength-segment" style={{ background: strengthPercent >= 75 ? strengthColor : '#E5E7EB' }}></div>
                      <div className="strength-segment" style={{ background: strengthPercent >= 100 ? strengthColor : '#E5E7EB' }}></div>
                    </div>
                    <div className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</div>
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon-left" size={20} />
                  <input className="field-input" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} placeholder="••••••••" required onChange={handleChange} />
                  <button type="button" className="toggle-pwd" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex="-1">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button className="submit-btn" type="submit">Create Account</button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Sign In Instead</Link>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
