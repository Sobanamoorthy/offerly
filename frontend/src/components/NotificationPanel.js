import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Bell, Check, Clock, Info } from 'lucide-react';

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await axios.get("http://localhost:5000/api/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                return;
            }
            console.error("Notification Fetch Error:", err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <>
            <style>{`
                .notif-wrapper {
                    position: relative;
                    display: inline-block;
                    z-index: 100;
                }
                .notif-bell {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    border: 1px solid #E8E4FF;
                    background: #FFFFFF;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    transition: all 0.2s ease;
                    color: #7C6FCD;
                    box-shadow: 0 2px 4px rgba(124, 111, 205, 0.05);
                }
                .notif-bell:hover {
                    background: #EDE9FF;
                    border-color: #C4BFEF;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(124, 111, 205, 0.08);
                }
                .notif-badge {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: #EF4444;
                    color: white;
                    border-radius: 10px;
                    min-width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    font-weight: 800;
                    border: 2px solid #FFFFFF;
                    z-index: 101;
                    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
                }
                .notif-backdrop {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: transparent;
                    z-index: 199;
                }
                .notif-panel {
                    position: absolute;
                    right: 0;
                    top: calc(100% + 16px);
                    width: 380px;
                    background: #FFFFFF;
                    border: 1px solid #E5E7EB;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
                    z-index: 200;
                    border-radius: 20px;
                    max-height: 480px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    animation: notifSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .notif-panel-header {
                    margin: 0;
                    padding: 20px 24px;
                    background: #EDE9FF;
                    border-bottom: 1px solid #C4BFEF;
                    font-weight: 800;
                    color: #2D2B55;
                    font-size: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .notif-scroll {
                    overflow-y: auto;
                    flex: 1;
                }
                .notif-empty {
                    padding: 60px 40px;
                    text-align: center;
                    color: #9CA3AF;
                    font-size: 14px;
                }
                .notif-list { list-style: none; padding: 0; margin: 0; }
                .notif-item {
                    padding: 18px 24px;
                    border-bottom: 1px solid #F3F4F6;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }
                .notif-item.unread {
                    background: #F7F5FF;
                }
                .notif-item.unread::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: #7C6FCD;
                }
                .notif-item:hover { background: #F9FAFB; }
                .notif-msg {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    color: #2D2D2D;
                    line-height: 1.5;
                    font-weight: 500;
                }
                .notif-meta {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #7C6FCD;
                }
                .notif-time {
                    font-size: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .notif-panel::-webkit-scrollbar { width: 5px; }
                .notif-panel::-webkit-scrollbar-track { background: transparent; }
                .notif-panel::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 5px; }

                @keyframes notifSlideIn {
                    from { opacity: 0; transform: translateY(-12px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            <div className="notif-wrapper">
                <button className="notif-bell" onClick={() => setIsOpen(!isOpen)}>
                    <Bell size={20} strokeWidth={2} />
                    {unreadCount > 0 && (
                        <span className="notif-badge">{unreadCount}</span>
                    )}
                </button>

                {isOpen && (
                    <>
                        <div className="notif-backdrop" onClick={() => setIsOpen(false)} />
                        <div className="notif-panel">
                            <h5 className="notif-panel-header">
                                Alerts & Updates
                                {unreadCount > 0 && <span style={{ fontSize: '11px', background: '#EDE9FF', color: '#7C6FCD', padding: '4px 8px', borderRadius: '6px' }}>{unreadCount} NEW</span>}
                            </h5>
                            <div className="notif-scroll">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">
                                        <Info size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                        <p>You're all caught up!</p>
                                    </div>
                                ) : (
                                    <ul className="notif-list">
                                        {notifications.slice().reverse().map(n => (
                                            <li
                                                key={n._id}
                                                className={`notif-item ${n.isRead ? '' : 'unread'}`}
                                                onClick={() => markAsRead(n._id)}
                                            >
                                                <p className="notif-msg">{n.message}</p>
                                                <div className="notif-meta">
                                                    <span className="notif-time">
                                                        <Clock size={12} />
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {n.isRead && <span style={{ fontSize: '11px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '700' }}><Check size={10} /> Seen</span>}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default NotificationPanel;
