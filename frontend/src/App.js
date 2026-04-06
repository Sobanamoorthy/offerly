// src/App.js
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={user ? (user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Dashboard />) : <Navigate to="/" />} />
      <Route path="/booking-history" element={user && user.role !== 'admin' ? <BookingHistoryPage /> : <Navigate to="/" />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<Navigate to="/admin/login" />} />
      <Route path="/admin-login" element={<Navigate to="/admin/login" />} />
      <Route path="/admin/login" element={user && user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />
      <Route path="/admin/dashboard" element={user && user.role === 'admin' ? <AdminDashboardPage /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
