import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, BookOpen, Ban } from 'lucide-react';

const styles = {
    container: { maxWidth: "1000px", margin: "0 auto", padding: "32px 0" },
    header: { fontSize: "28px", color: "#2D2B55", marginBottom: "32px", fontWeight: "800", display: "flex", alignItems: "center", gap: "12px" },
    legend: { display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "32px", padding: "20px", background: "#FFFFFF", borderRadius: "16px", border: "1px solid #E8E4FF" },
    legendItem: { display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "700", color: "#6B6B8A" },
    legendBox: (color) => ({ width: "16px", height: "16px", background: color, borderRadius: "4px" }),
    calendarBox: { background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1px solid #E8E4FF", boxShadow: "0 4px 12px rgba(124, 111, 205, 0.03)" },
    navBtn: { padding: "10px", borderRadius: "12px", border: "1.5px solid #E8E4FF", background: "#EDE9FF", color: "#7C6FCD", cursor: "pointer", transition: "all 0.2s" },
    dayLabel: { textAlign: "center", color: "#7C6FCD", fontWeight: "800", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", paddingBottom: "12px" },
    dayCell: (bg, color, isToday) => ({
        background: bg,
        color: color,
        padding: "24px 10px",
        borderRadius: "16px",
        textAlign: "center",
        fontWeight: "800",
        fontSize: "15px",
        cursor: "pointer",
        border: isToday ? "2px solid #7C6FCD" : "1.5px solid rgba(124, 111, 205, 0.05)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px"
    })
};

export default function WorkerCalendar() {
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [bookedDates, setBookedDates] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/bookings/worker", { headers: { Authorization: `Bearer ${token}` } });
                const active = res.data.filter(b => ["accepted", "in progress"].includes(b.status));
                const dates = [];
                active.forEach(job => {
                    let start = new Date(job.startDateTime);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(job.endDateTime);
                    end.setHours(0, 0, 0, 0);
                    while (start <= end) {
                        dates.push(start.toISOString().split('T')[0]);
                        start.setDate(start.getDate() + 1);
                    }
                });
                setBookedDates(dates);
            } catch (err) { console.error(err); }
        };
        fetchBookings();
    }, [token]);

    const handleDateClick = (dateStr) => {
        if (bookedDates.includes(dateStr)) return;
        setUnavailableDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
    };

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const days = [];
        const todayStr = new Date().toISOString().split('T')[0];

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`}></div>);
        }

        for (let i = 1; i <= totalDays; i++) {
            const dateObj = new Date(year, month, i, 12);
            const dateStr = dateObj.toISOString().split('T')[0];
            const isBooked = bookedDates.includes(dateStr);
            const isUnavailable = unavailableDates.includes(dateStr);
            const isToday = dateStr === todayStr;

            let bg = "#FFFFFF";
            let color = "#2D2B55";
            if (isBooked) { bg = "#EDE9FF"; color = "#7C6FCD"; }
            else if (isUnavailable) { bg = "#FEE2E2"; color = "#EF4444"; }

            days.push(
                <div key={i} onClick={() => handleDateClick(dateStr)} style={styles.dayCell(bg, color, isToday)}>
                    {i}
                    {isBooked && <BookOpen size={12} />}
                    {isUnavailable && <Ban size={12} />}
                </div>
            );
        }
        return days;
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}><CalendarIcon size={32} /> Availability Schedule</h2>

            <div style={styles.legend}>
                <div style={styles.legendItem}><div style={styles.legendBox("#FFFFFF")}></div> Available</div>
                <div style={styles.legendItem}><div style={styles.legendBox("#EDE9FF")}></div> Booked Assignment</div>
                <div style={styles.legendItem}><div style={styles.legendBox("#FEE2E2")}></div> Blocked Date</div>
                <div style={{ ...styles.legendItem, marginLeft: "auto", color: "#7C6FCD" }}><Info size={16} /> Tap dates to block/unblock</div>
            </div>

            <div style={styles.calendarBox}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} style={styles.navBtn}><ChevronLeft size={20} /></button>
                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#2D2B55" }}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} style={styles.navBtn}><ChevronRight size={20} /></button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "12px", marginBottom: "12px" }}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={styles.dayLabel}>{d}</div>)}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "12px" }}>
                    {renderCalendar()}
                </div>
            </div>
        </div>
    );
}
