import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Login.css"; // Reuse existing login styles

const VisitorLogin = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [visitorCode, setVisitorCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!mobileNumber.trim() || !visitorCode.trim()) {
      return setError("Mobile number and visitor code are required");
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/visitor/login", { mobileNumber, visitorCode });
      
      const { token, role } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      navigate("/visitor/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Visitor Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="text"
              id="mobileNumber"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your 10-digit mobile number"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="visitorCode">Visitor Code</label>
            <input
              type="text"
              id="visitorCode"
              value={visitorCode}
              onChange={(e) => setVisitorCode(e.target.value.toUpperCase())}
              placeholder="e.g. WFOCJG"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/login" style={{ fontSize: "0.9rem", color: "#3b82f6", textDecoration: "none" }}>
            Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VisitorLogin;
