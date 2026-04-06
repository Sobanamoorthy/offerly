import React from 'react';
import { useNavigate } from 'react-router-dom';
import MyBookings from '../components/MyBookings';
import { useAuth } from '../context/AuthContext';
import BrandLayout from '../components/BrandLayout';
import NotificationPanel from '../components/NotificationPanel';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ChevronLeft, LogOut } from 'lucide-react';

export default function BookingHistoryPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <>
            <style>{`
                .b-root {
                    min-height: 100vh;
                    background: #F7F5FF;
                    color: #2D2B55;
                    font-family: 'Inter', sans-serif;
                }
                .b-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 40px;
                    height: 72px;
                    border-bottom: 1px solid #E8E4FF;
                    background: #FFFFFF;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                .b-header-left, .b-header-right {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .b-back {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border-radius: 999px;
                    border: 1.5px solid #E8E4FF;
                    background: #F5F3FF;
                    color: #7C6FCD;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .b-back:hover {
                    background: #FFFFFF;
                    border-color: #7C6FCD;
                    transform: translateX(-4px);
                }
                .b-logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: transparent;
                    color: #EF4444;
                    border: 1.5px solid #FEE2E2;
                    border-radius: 999px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .b-logout-btn:hover {
                    background: #FEF2F2;
                    border-color: #EF4444;
                }
                .b-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px;
                }
                @media (max-width: 768px) {
                    .b-header {
                        padding: 0 16px;
                        height: auto;
                        min-height: 72px;
                        flex-direction: column;
                        justify-content: center;
                        gap: 12px;
                        padding-top: 12px;
                        padding-bottom: 12px;
                    }
                    .b-content {
                        padding: 24px 16px;
                    }
                }
            `}</style>
            <div className="b-root">
                <header className="b-header">
                    <div className="b-header-left">
                        <BrandLayout />
                        <div style={{ width: '1px', height: '24px', background: '#E8E4FF', margin: '0 8px' }}></div>
                        <button className="b-back" onClick={() => navigate('/dashboard')}>
                            <ChevronLeft size={18} />
                            Dashboard
                        </button>
                    </div>

                    <div className="b-header-right">
                        <LanguageSwitcher />
                        <NotificationPanel />
                        <button onClick={handleLogout} className="b-logout-btn">
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </header>
                <main className="b-content">
                    <MyBookings />
                </main>
            </div>
        </>
    );
}
