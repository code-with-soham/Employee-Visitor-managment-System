import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./VisitorDashboard.css";

const VisitorDashboard = () => {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/visitor/dashboard");
        setVisitor(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/visitor/login");
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString();
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: "3rem" }}>Loading dashboard...</div>;
  if (error) return <div style={{ textAlign: "center", marginTop: "3rem", color: "red" }}>{error}</div>;
  if (!visitor) return null;

  return (
    <div className="visitor-portal-container">
      <div className="visitor-portal-card">
        <header className="visitor-portal-header">
          <h2>Welcome, {visitor.visitorName}</h2>
          <button onClick={handleLogout} className="visitor-logout-btn">Logout</button>
        </header>
        
        <div className="visitor-details-grid">
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className={`visitor-status-badge ${visitor.status}`}>
              {visitor.status === "checked-in" ? "Checked In" : "Checked Out"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Mobile Number</span>
            <span className="detail-value">{visitor.mobileNumber}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{visitor.email || "N/A"}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Organization</span>
            <span className="detail-value">{visitor.organization || "N/A"}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Person to Meet</span>
            <span className="detail-value">{visitor.personToMeet}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Purpose</span>
            <span className="detail-value">{visitor.purpose}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Scheduled Visit Time</span>
            <span className="detail-value">{formatDate(visitor.visitDateTime)}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Check-in Time</span>
            <span className="detail-value">{formatDate(visitor.checkInTime)}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Check-out Time</span>
            <span className="detail-value">{formatDate(visitor.checkOutTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard;
