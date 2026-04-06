import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WorkerDashboardMain from "../components/WorkerDashboardMain";
import NotificationPanel from "../components/NotificationPanel";
import CustomerDashboardMain from "../components/CustomerDashboardMain";
import BrandLayout from "../components/BrandLayout";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { 
  Search, 
  User, 
  ClipboardList, 
  Clock, 
  FileText, 
  LayoutDashboard, 
  Briefcase, 
  Star, 
  BadgeDollarSign, 
  Calendar, 
  MessageCircle 
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    user?.role === "worker" ? "overview" : "professionals"
  );
  
  // Sidebar state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);   // Close on mobile
      } else {
        setIsSidebarOpen(true);    // Open on desktop
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, isSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebarMobile = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formattedName = user?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "User";

  if (!user) return <p>Please login</p>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&display=swap');

        .layout-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', 'Poppins', system-ui, sans-serif;
          background: var(--bg);
          overflow: hidden;
        }

        /* ── Sidebar ── */
        .dash-sidebar {
          width: 240px;
          min-width: 240px;
          background: #F0EEFF;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 200;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.3s ease;
          border-right: 1px solid #E8E4FF;
        }

        /* Sidebar Toggle State (Desktop push) */
        .dash-sidebar.closed-desktop {
          margin-left: -240px;
        }

        .sidebar-logo-area {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 64px;
          box-sizing: border-box;
          background: #FFFFFF;
          border-bottom: 1px solid #E8E4FF;
        }
        .sidebar-logo-area img {
          /* No filter needed for purple logo on white */
        }
        .sidebar-logo-area span {
          color: #7C6FCD;
          font-weight: 800;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 48px;
          padding: 0 16px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #6B6B8A;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          text-align: left;
        }
        
        .sidebar-nav-item:hover {
          background: #EDE9FF;
          color: #7C6FCD;
          transform: translateX(4px);
        }
        
        .sidebar-nav-item.active {
          background: #EDE9FF;
          color: #7C6FCD;
          font-weight: 600;
          border-left: 3px solid #7C6FCD;
          border-radius: 8px;
        }
        
        .sidebar-nav-item.active::before {
          content: none;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          color: inherit;
          transition: color 0.2s ease;
        }

        .sidebar-nav-item:hover .nav-icon {
          color: #7C6FCD;
        }
        
        .sidebar-nav-item.active .nav-icon {
          color: #7C6FCD;
        }

        .sidebar-footer {
          padding: 16px;
          margin-top: auto;
        }
        
        /* ── Main Panel ── */
        .dash-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0; /* Important for flex children truncating */
          transition: width 0.3s ease;
          height: 100vh;
        }

        /* ── Top Header ── */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 72px;
          padding: 0 32px;
          background: #FFFFFF;
          border-bottom: 1px solid #E8E4FF;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
          flex-shrink: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background: #FFFFFF;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .hamburger-btn:hover {
          background: #F8FAFC;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .hamburger-btn svg {
          color: #1A1A2E;
        }

        .greeting-text {
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #1A1A2E;
          white-space: nowrap;
          display: flex;
          align-items: center;
          height: 100%;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logout-btn {
          padding: 8px 18px;
          cursor: pointer;
          background: transparent;
          color: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s ease;
        }
        .logout-btn:hover {
          background: rgba(255, 82, 82, 0.08);
          border-color: rgba(255, 82, 82, 0.5);
        }

        /* ── Page Content ── */
        .dash-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          box-sizing: border-box;
        }

        /* ── Mobile Overlay ── */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 150;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .sidebar-overlay.visible {
          opacity: 1;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .dash-header { padding: 0 24px; }
          .dash-content { padding: 24px; }
        }

        @media (max-width: 768px) {
          .dash-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
            margin-left: 0 !important;
          }
          .dash-sidebar.open-mobile {
            transform: translateX(0);
          }
          .sidebar-overlay {
            display: block;
            pointer-events: none;
          }
          .sidebar-overlay.visible {
            pointer-events: auto;
          }
          
          .dash-header { padding: 0 16px; height: 64px; }
          .dash-content { padding: 20px 16px; }
          .greeting-text { font-size: 16px; }
          .header-right { gap: 12px; }
        }
      `}</style>

      <div className="layout-root">
        
        {/* Mobile Overlay */}
        <div 
          className={`sidebar-overlay ${isMobile && isSidebarOpen ? 'visible' : ''}`} 
          onClick={closeSidebarMobile}
        />

        {/* ── Sidebar ── */}
        <aside className={`dash-sidebar ${!isMobile && !isSidebarOpen ? 'closed-desktop' : ''} ${isMobile && isSidebarOpen ? 'open-mobile' : ''}`}>
          <div className="sidebar-logo-area">
            <BrandLayout />
          </div>

          <nav className="sidebar-nav">
            {(user.role === "worker" ? [
              { id: "overview", icon: <LayoutDashboard size={20} strokeWidth={2} />, label: "Dashboard" },
              { id: "profile", icon: <User size={20} strokeWidth={2} />, label: "Worker Profile" },
              { id: "jobs", icon: <Briefcase size={20} strokeWidth={2} />, label: "Job Board" },
              { id: "reviews", icon: <Star size={20} strokeWidth={2} />, label: "Reviews" },
              { id: "history", icon: <Clock size={20} strokeWidth={2} />, label: "Job History" },
              { id: "earnings", icon: <BadgeDollarSign size={20} strokeWidth={2} />, label: "Revenue" },
              { id: "calendar", icon: <Calendar size={20} strokeWidth={2} />, label: "Calendar" },
              { id: "support", icon: <MessageCircle size={20} strokeWidth={2} />, label: "Support / Help" }
            ] : [
              { id: "professionals", icon: <Search size={20} strokeWidth={2} />, label: "Find Professionals" },
              { id: "profile", icon: <User size={20} strokeWidth={2} />, label: "Customer Profile" },
              { id: "requests", icon: <ClipboardList size={20} strokeWidth={2} />, label: "My Requests" },
              { id: "history", icon: <Clock size={20} strokeWidth={2} />, label: "Booking History" },
              { id: "details", icon: <FileText size={20} strokeWidth={2} />, label: "Booking Details" }
            ]).map(item => (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  closeSidebarMobile();
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Remove sidebar-footer sign out */}
        </aside>

        {/* ── Main Split ── */}
        <div className="dash-main">
          
          {/* Header */}
          <header className="dash-header">
            <div className="header-left">
              <button className="hamburger-btn" onClick={toggleSidebar}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <span className="greeting-text">{getGreeting()}, {formattedName} 👋</span>
            </div>
            
            <div className="header-right">
              <LanguageSwitcher />
              <NotificationPanel />
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="dash-content">
            {user.role === "worker" && <WorkerDashboardMain activeTab={activeTab} onNavigate={setActiveTab} />}
            {user.role === "customer" && <CustomerDashboardMain activeTab={activeTab} onNavigate={setActiveTab} />}
          </main>

        </div>

      </div>
    </>
  );
}
