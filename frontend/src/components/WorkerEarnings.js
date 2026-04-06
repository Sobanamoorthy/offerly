import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { CircleDollarSign, Calendar, BarChart2 } from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WorkerEarnings() {
    const [completedJobs, setCompletedJobs] = useState([]);
    const [filter, setFilter] = useState("all");
    const token = localStorage.getItem("token");

    const fetchBookings = useCallback(async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/bookings/worker", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const completed = res.data.filter(b => b.status === "completed");
            setCompletedJobs(completed);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    }, [token]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Earnings calculations
    const calculateEarnings = (jobs) => {
        return jobs.reduce((total, job) => total + (job.salary || 0), 0);
    };

    const getFilteredJobs = () => {
        const now = new Date();
        return completedJobs.filter(job => {
            const jobDate = new Date(job.updatedAt || job.createdAt);
            if (filter === "today") {
                return jobDate.toDateString() === now.toDateString();
            }
            if (filter === "week") {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                return jobDate >= startOfWeek;
            }
            if (filter === "month") {
                return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
            }
            return true; // "all"
        });
    };

    const filteredJobs = getFilteredJobs();

    // High-level summary stats (always based on 'all' to show specific segments)

    const now = new Date();
    const todayJobs = completedJobs.filter(j => new Date(j.updatedAt || j.createdAt).toDateString() === now.toDateString());
    const dailyEarnings = calculateEarnings(todayJobs);

    const monthJobs = completedJobs.filter(j => new Date(j.updatedAt || j.createdAt).getMonth() === now.getMonth() && new Date(j.updatedAt || j.createdAt).getFullYear() === now.getFullYear());
    const monthlyEarnings = calculateEarnings(monthJobs);

    // Chart Data format (Group by Day for the current month)
    const generateChartData = () => {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const categories = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);
        const dataPoints = new Array(daysInMonth).fill(0);

        monthJobs.forEach(job => {
            const day = new Date(job.updatedAt || job.createdAt).getDate();
            dataPoints[day - 1] += (job.salary || 0);
        });

        return {
            labels: categories,
            datasets: [
                {
                    label: 'Earnings (₹)',
                    data: dataPoints,
                    backgroundColor: '#7C6FCD',
                    borderRadius: 6,
                    hoverBackgroundColor: '#6A5EC0',
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#2D2B55',
                titleFont: { family: 'Poppins' },
                bodyFont: { family: 'Inter' }
            }
        },
        scales: {
            y: {
                grid: { color: '#F1F2F6' },
                ticks: { color: '#6B7280', font: { family: 'Inter' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#6B7280', font: { family: 'Inter' }, maxTicksLimit: 15 }
            }
        }
    };

    const cardStyle = {
        background: "#FFFFFF",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "transform 0.2s ease"
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h2 style={{ fontSize: "28px", color: "#2D2B55", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>Revenue & Earnings</h2>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ background: "#EDE9FF", border: "1px solid #E8E4FF", color: "#7C6FCD", padding: "10px 16px", borderRadius: "8px", outline: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                <div style={{ ...cardStyle }}>
                    <span style={{ fontSize: "14px", color: "#6B6B8A", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><CircleDollarSign size={20} color="#7C6FCD" strokeWidth={1.5} /> Total Earnings</span>
                    <span style={{ fontSize: "32px", color: "#2D2B55", fontWeight: "700" }}>₹{calculateEarnings(filteredJobs)}</span>
                    <div style={{ fontSize: "12px", color: "#7C6FCD", fontWeight: "600", background: "#EDE9FF", display: "inline-block", padding: "4px 8px", borderRadius: "4px", alignSelf: "flex-start" }}>{filter === "all" ? "All jobs completed" : `Filtered: ${filter}`}</div>
                </div>
                <div style={{ ...cardStyle }}>
                    <span style={{ fontSize: "14px", color: "#6B6B8A", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={20} color="#7C6FCD" strokeWidth={1.5} /> Daily Earnings (Today)</span>
                    <span style={{ fontSize: "32px", color: "#2D2B55", fontWeight: "700" }}>₹{dailyEarnings}</span>
                </div>
                <div style={{ ...cardStyle }}>
                    <span style={{ fontSize: "14px", color: "#6B6B8A", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><BarChart2 size={20} color="#7C6FCD" strokeWidth={1.5} /> Monthly Earnings</span>
                    <span style={{ fontSize: "32px", color: "#2D2B55", fontWeight: "700" }}>₹{monthlyEarnings}</span>
                </div>
            </div>

            {/* Chart Section */}
            <div style={{ ...cardStyle, marginBottom: "32px", height: "400px" }}>
                <h3 style={{ fontSize: "16px", color: "#2D2B55", fontWeight: "700", marginBottom: "24px", marginTop: 0 }}>
                    Earnings This Month ({now.toLocaleString('default', { month: 'long', year: 'numeric' })})
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <Bar data={generateChartData()} options={chartOptions} />
                </div>
            </div>

            {/* Earnings Details Table */}
            <div style={{ ...cardStyle }}>
                <h3 style={{ fontSize: "16px", color: "#2D2B55", fontWeight: "700", marginBottom: "20px", marginTop: 0 }}>
                    Earnings Breakdown ({filteredJobs.length} Jobs)
                </h3>
                {filteredJobs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
                        <CircleDollarSign size={40} strokeWidth={1} style={{ marginBottom: "12px", opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>No data available</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #E5E7EB", color: "#6B7280" }}>
                                    <th style={{ padding: "12px 10px", fontWeight: "600", fontSize: "0.85rem" }}>Job Type</th>
                                    <th style={{ padding: "12px 10px", fontWeight: "600", fontSize: "0.85rem" }}>Customer</th>
                                    <th style={{ padding: "12px 10px", fontWeight: "600", fontSize: "0.85rem" }}>Location</th>
                                    <th style={{ padding: "12px 10px", fontWeight: "600", fontSize: "0.85rem" }}>Date</th>
                                    <th style={{ padding: "12px 10px", fontWeight: "600", fontSize: "0.85rem", textAlign: "right" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.slice().reverse().map(job => (
                                    <tr key={job._id} style={{ borderBottom: "1px solid #EDE9FF", color: "#2D2B55", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#EDE9FF"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "16px 10px", fontWeight: "600" }}>{job.workerType}</td>
                                        <td style={{ padding: "16px 10px" }}>{job.customerId?.name || "Customer"}</td>
                                        <td style={{ padding: "16px 10px", color: "#6B6B8A", fontSize: "0.85rem" }}>{job.location}</td>
                                        <td style={{ padding: "16px 10px", color: "#6B6B8A", fontSize: "0.85rem" }}>{new Date(job.updatedAt || job.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: "16px 10px", fontWeight: "700", color: "#43A047", textAlign: "right" }}>₹{job.salary}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
