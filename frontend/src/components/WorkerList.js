import { useEffect, useState, useCallback } from "react";
import API from "../api";
import BookingModal from "./BookingModal";
import FeedbackModal from "./FeedbackModal";
import WorkerProfileModal from "./WorkerProfileModal";
import { MapPin, Star, Heart, Search, Navigation, ChevronLeft, ChevronRight, Filter } from "lucide-react";

// Helper for profession colors in the new Brown & Beige theme
const getProfessionStyle = (category) => {
  return { border: "#7C6FCD", bg: "#EDE9FF", text: "#7C6FCD" };
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

export default function WorkerList() {
  const [workers, setWorkers] = useState([]);
  const [favorites, setFavorites] = useState({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(12); // Reduced for better grid appearance

  // Two-Level Dynamic Filtering System
  const [filterType, setFilterType] = useState("All Categories");
  const [filterValue, setFilterValue] = useState("");

  const filterTypeOptions = [
    "All Categories", "Rating", "Experience", "Location", "Price", "Distance"
  ];

  const getOptionsForType = (type) => {
    switch (type) {
      case "All Categories":
        return ["Electrician", "Plumber", "Carpenter", "Painter", "AC Technician", "Mechanic", "Welder", "Driver", "Mason", "House Cleaner", "CCTV Installer"];
      case "Rating":
        return ["4+ Stars", "3+ Stars", "2+ Stars"];
      case "Experience":
        return ["0–1 Years", "1–3 Years", "3–5 Years", "5–10 Years", "10+ Years"];
      case "Price":
        return ["₹300–₹500", "₹500–₹700", "₹700–₹1000", "₹1000+"];
      case "Distance":
        return ["Within 5 km", "10 km", "20 km", "50 km"];
      default:
        return [];
    }
  };

  useEffect(() => {
    setFilterValue("");
  }, [filterType]);

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [feedbackWorker, setFeedbackWorker] = useState(null);
  const [profileWorker, setProfileWorker] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let params = [];

      if (filterValue) {
        if (filterType === "All Categories") {
          params.push(`category=${encodeURIComponent(filterValue)}`);
        } else if (filterType === "Location") {
          params.push(`location=${encodeURIComponent(filterValue)}`);
        } else if (filterType === "Rating") {
          const ratingVal = filterValue.split('+')[0];
          params.push(`rating=${ratingVal}`);
        } else if (filterType === "Experience") {
          const expMap = { "0–1 Years": "0-1", "1–3 Years": "1-3", "3–5 Years": "3-5", "5–10 Years": "5-10", "10+ Years": "10+" };
          params.push(`experience=${encodeURIComponent(expMap[filterValue] || "1-3")}`);
        } else if (filterType === "Price") {
          let priceParam = filterValue.replace(/[₹ ]/g, '').replace('–', '-');
          params.push(`priceRange=${encodeURIComponent(priceParam)}`);
        }
      }

      if (filterType === "Distance" && filterValue) {
        if (navigator.geolocation) {
          return navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              params.push(`lat=${latitude}`);
              params.push(`lng=${longitude}`);

              const distMatch = filterValue.match(/\d+/);
              const distVal = distMatch ? distMatch[0] : "50";
              params.push(`distance=${distVal}`);

              const queryString = params.length > 0 ? `?${params.join("&")}` : "";
              const { data } = await API.get(`/workers${queryString}`);
              setWorkers(data);
              setLoading(false);
            },
            (err) => {
              setError("Location access denied: " + err.message);
              setLoading(false);
            }
          );
        } else {
          setError("Geolocation is not supported by your browser");
          setLoading(false);
          return;
        }
      }

      const queryString = params.length > 0 ? `?${params.join("&")}` : "";
      const { data } = await API.get(`/workers${queryString}`);
      setWorkers(data);
      setCurrentPage(1);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch workers");
      setWorkers([]);
      setCurrentPage(1);
      setLoading(false);
    }
  }, [filterType, filterValue]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const toggleFav = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <style>{`
        .wl-wrapper { 
          margin-top: -10px;
          margin-bottom: 40px; 
          font-family: 'Inter', sans-serif;
        }

        .wl-header-section {
          margin-bottom: 32px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 20px;
        }
        .wl-title {
          font-size: 32px;
          color: #1A1A2E;
          font-weight: 800;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }
        .wl-subtitle {
          font-size: 15px;
          color: #6B7280;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EDE9FF;
          color: #7C6FCD;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid #C4BFEF;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background-color: #16A34A;
          border-radius: 50%;
          animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        /* Filter Bar */
        .wl-filter-card {
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(124, 111, 205, 0.06);
          padding: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: flex-end;
          margin-bottom: 40px;
          border: 1px solid #C4BFEF;
        }

        .wl-filter-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1 1 220px;
        }

        .wl-filter-label {
          font-size: 12px;
          color: #7C6FCD;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
        }

        .wl-dropdown {
          width: 100%;
          padding: 0 16px;
          height: 48px;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          background: #FFFFFF;
          font-size: 15px;
          color: #2D2D2D;
          outline: none;
          transition: all 0.2s;
          cursor: pointer;
          font-weight: 500;
        }
        .wl-dropdown:focus {
          border-color: #7C6FCD;
          box-shadow: 0 0 0 4px rgba(124, 111, 205, 0.05);
        }

        .wl-actions-block {
          display: flex;
          gap: 12px;
          flex: 1 1 auto;
          justify-content: flex-end;
        }

        .wl-btn-search {
          height: 48px;
          padding: 0 32px;
          background: #00BFA5;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 191, 165, 0.2);
        }
        .wl-btn-search:hover { 
          background: #007C6E; 
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 191, 165, 0.25);
        }
        .wl-btn-search:active { transform: translateY(0); }

        .wl-btn-gps {
          height: 48px;
          width: 48px;
          padding: 0;
          background: #EDE9FF;
          color: #7C6FCD;
          border: 1px solid #C4BFEF;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wl-btn-gps:hover { 
          background: #C4BFEF; 
          transform: scale(1.05);
        }

        /* Professional Cards Grid */
        .wl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .wl-card {
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(124, 111, 205, 0.08);
          padding: 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.2s ease;
          border: 1px solid #E8E4FF;
        }
        .wl-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(124, 111, 205, 0.15);
          background: #FFFFFF;
          border-color: #7C6FCD;
        }

        .wl-fav-icon {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #EDE9FF;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          color: #7C6FCD;
          transition: all 0.2s;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wl-fav-icon.active { background: #7C6FCD; color: #FFFFFF; }
        .wl-fav-icon:hover { transform: scale(1.1); }

        .wl-card-top {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          cursor: pointer;
        }
        
        .wl-avatar {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          background-color: #D4CEEF !important;
          color: #5A4FA0;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(124, 111, 205, 0.1);
        }

        .wl-name {
          font-size: 19px;
          font-weight: 700;
          color: #2D2B55;
          margin: 4px 0 6px 0;
          padding-right: 30px;
          letter-spacing: -0.01em;
        }

        .wl-loc {
          font-size: 14px;
          color: #6B6B8A;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .wl-badge {
          display: inline-flex;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 24px;
          align-self: flex-start;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #EDE9FF;
          color: #7C6FCD;
        }

        .wl-stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
          padding-top: 20px;
          border-top: 1px solid #E8E4FF;
        }
        .wl-stat-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .wl-stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #7C6FCD;
          font-weight: 700;
        }
        .wl-stat-val { font-size: 16px; font-weight: 800; color: #2D2B55; }
        .wl-stat-val.rate { color: #7C6FCD; }

        .wl-rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 24px;
          background: #F5F3FF;
          padding: 8px 12px;
          border-radius: 8px;
          width: fit-content;
        }
        .wl-rating-val { font-size: 15px; font-weight: 800; color: #7C6FCD; }
        .wl-rating-empty { font-size: 13px; color: #9CA3AF; font-weight: 500; }

        .wl-card-actions {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .wl-book-btn {
          width: 100%;
          padding: 14px;
          background: #7C6FCD;
          border-radius: 999px;
          color: #FFFFFF;
          border: none;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(124, 111, 205, 0.2);
        }
        .wl-book-btn:hover {
          background: #6A5EC0;
          transform: scale(1.02);
          box-shadow: 0 6px 14px rgba(124, 111, 205, 0.25);
        }

        .wl-reviews-link {
          background: transparent;
          border: none;
          color: #7C6FCD;
          font-size: 14px;
          font-weight: 600;
          padding: 8px;
          cursor: pointer;
          text-align: center;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .wl-reviews-link:hover {
          color: #6A5EC0;
          text-decoration: underline;
        }

        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #E5E7EB;
          padding-top: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .pagination-info {
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
        }
        .pagination-btns {
          display: flex;
          gap: 10px;
        }
        .page-btn {
          height: 40px;
          padding: 0 20px;
          border: 1px solid #C4BFEF;
          border-radius: 10px;
          background: #FFFFFF;
          color: #1A1A2E;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) {
          border-color: #7C6FCD;
          background: #EDE9FF;
        }
        .page-btn:disabled {
          color: #9CA3AF;
          cursor: not-allowed;
          background: #F9FAFB;
        }

        @media (max-width: 640px) {
          .wl-actions-block { width: 100%; }
          .wl-btn-search { flex: 1; justify-content: center; }
          .wl-header-section { align-items: flex-start; flex-direction: column; }
        }
      `}</style>

      <div className="wl-wrapper">
        
        {/* Page Header */}
        <div className="wl-header-section">
          <div>
            <h1 className="wl-title">Find Top Professionals</h1>
            <div className="wl-subtitle">
              Choose from {workers.length} verified experts near you
            </div>
          </div>
          <div className="live-badge">
            <span className="live-dot"></span> Live Updates
          </div>
        </div>

        {/* Filter Bar */}
        <div className="wl-filter-card">
          <div className="wl-filter-block">
            <label className="wl-filter-label">Filter By</label>
            <select
              className="wl-dropdown"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {filterTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="wl-filter-block" style={{ flex: '1 1 280px' }}>
            <label className="wl-filter-label">Select Category</label>
            {filterType === "Location" ? (
              <div style={{ position: 'relative' }}>
                <input
                  className="wl-dropdown"
                  placeholder="Enter your area..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <MapPin size={18} color="#7C6FCD" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            ) : (
              <select
                className="wl-dropdown"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option value="">{filterType === "All Categories" ? "Choose Profession" : `Show All ${filterType}`}</option>
                {getOptionsForType(filterType).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
          </div>

          <div className="wl-actions-block">
            <button onClick={fetchWorkers} className="wl-btn-search" style={{ background: "#7C6FCD" }}>
              <Search size={20} strokeWidth={2.5} />
              Search
            </button>
            <button
              onClick={() => {
                setFilterType("Distance");
                setFilterValue("Within 50 km");
                setTimeout(fetchWorkers, 50);
              }}
              className="wl-btn-gps"
              title="Locate Me"
            >
              <Navigation size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        {error && <div style={{ color: "#FF6B6B", padding: "16px", background: "#FEF2F2", borderRadius: "12px", marginBottom: "24px", border: "1px solid #FFCDCD", fontSize: "14px", fontWeight: "500" }}>{error}</div>}
        {loading && <div style={{ textAlign: "center", padding: "60px 0", color: "#7C6FCD", fontWeight: "600" }}>Finding best matches...</div>}

        {/* Grid Area */}
        {!loading && workers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#FFFFFF", borderRadius: "20px", border: "2px dashed #E5E7EB" }}>
            <Filter size={48} color="#D4CEEF" style={{ marginBottom: "16px" }} />
            <p style={{ color: "#6B6B8A", fontSize: "16px", fontWeight: "500" }}>No professionals match your current filters.</p>
            <button onClick={() => { setFilterType("All Categories"); setFilterValue(""); }} style={{ marginTop: "16px", background: "transparent", border: "none", color: "#7C6FCD", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>Clear All Filters</button>
          </div>
        ) : (
          <>
            <div className="wl-grid">
              {workers.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage).map(w => {
                const name = w.userId?.name || "Professional";
                const category = w.category?.[0] || w.skills?.[0] || "General";
                const style = getProfessionStyle(category);
                const isFav = favorites[w._id];
                const rating = w.averageRating || 0;

                return (
                  <div key={w._id} className="wl-card">
                    <button className={`wl-fav-icon ${isFav ? 'active' : ''}`} onClick={(e) => toggleFav(w._id, e)}>
                      <Heart size={18} fill={isFav ? "currentColor" : "none"} strokeWidth={2.5} />
                    </button>
                    
                    <div className="wl-card-top" onClick={() => setProfileWorker(w)}>
                      <div className="wl-avatar" style={{ background: style.border }}>
                        {getInitials(name)}
                      </div>
                      <div>
                        <h4 className="wl-name">{name}</h4>
                        <div className="wl-loc">
                          <MapPin size={14} strokeWidth={2.5} color="#7C6FCD" /> {w.location || "Available Regionally"}
                        </div>
                      </div>
                    </div>

                    <div className="wl-badge" style={{ background: style.bg, color: style.text }}>
                      {category}
                    </div>

                    <div className="wl-stats-row">
                      <div className="wl-stat-col">
                        <span className="wl-stat-label">EXP</span>
                        <span className="wl-stat-val">{w.experience}+ Yrs</span>
                      </div>
                      <div className="wl-stat-col" style={{ textAlign: "right" }}>
                        <span className="wl-stat-label">RATE</span>
                        <span className="wl-stat-val rate">₹{w.salary}</span>
                      </div>
                    </div>

                    <div className="wl-rating-row">
                      {rating > 0 ? (
                        <>
                          <Star size={16} fill="#F59E0B" color="#F59E0B" />
                          <span className="wl-rating-val">{rating.toFixed(1)}</span>
                          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>({w.reviews?.length || 0})</span>
                        </>
                      ) : (
                        <span className="wl-rating-empty">New Member</span>
                      )}
                    </div>

                    <div className="wl-card-actions">
                      <button className="wl-book-btn" onClick={() => setSelectedWorker(w)}>
                        Book Service
                      </button>
                      <button className="wl-reviews-link" onClick={() => setFeedbackWorker(w)}>
                        View Reviews <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {workers.length > resultsPerPage && (
              <div className="pagination-container">
                <span className="pagination-info">
                  Showing <b>{Math.min((currentPage - 1) * resultsPerPage + 1, workers.length)}</b> - <b>{Math.min(currentPage * resultsPerPage, workers.length)}</b> of {workers.length} professionals
                </span>
                
                <div className="pagination-btns">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} /> Prev
                  </button>
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(workers.length / resultsPerPage)))}
                    disabled={currentPage >= Math.ceil(workers.length / resultsPerPage)}
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {feedbackWorker && <FeedbackModal userId={feedbackWorker.userId?._id || feedbackWorker.userId || feedbackWorker._id} workerName={feedbackWorker.userId?.name || "Professional"} onClose={() => setFeedbackWorker(null)} />}
        {profileWorker && <WorkerProfileModal worker={profileWorker} onClose={() => setProfileWorker(null)} />}
        {selectedWorker && <BookingModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} onSuccess={() => setSelectedWorker(null)} />}
      </div>
    </>
  );
}
