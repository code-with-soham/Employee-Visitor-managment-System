import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./VisitorManagement.css";

const VisitorManagement = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const role = localStorage.getItem("role"); // "admin" or "employee"

  const [formData, setFormData] = useState({
    id: null,
    visitorName: "",
    mobileNumber: "",
    email: "",
    organization: "",
    personToMeet: "",
    purpose: "",
    visitDateTime: "",
    status: "checked-in", // Only used during edit
  });

  const fetchVisitors = async (search = "") => {
    setLoading(true);
    try {
      const url = search.trim() ? `/visitors?search=${encodeURIComponent(search)}` : "/visitors";
      const res = await api.get(url);
      setVisitors(res.data);
    } catch (err) {
      showMessage("error", "Failed to fetch visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Debounce search (simple version)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVisitors(searchTerm);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.visitorName || !formData.mobileNumber || !formData.personToMeet || !formData.purpose || !formData.visitDateTime) {
      return showMessage("error", "Required fields are missing");
    }

    try {
      if (formData.id) {
        // Update
        const payload = { ...formData };
        delete payload.id; // Backend doesn't expect id in body
        await api.put(`/visitors/${formData.id}`, payload);
        showMessage("success", "Visitor updated successfully");
      } else {
        // Create
        const res = await api.post("/visitors", formData);
        const code = res.data.visitorCode;
        showMessage("success", `Visitor registered successfully. Visitor Code: ${code} (Give this to the visitor for login)`);
      }
      
      resetForm();
      fetchVisitors(searchTerm);
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Server error");
    }
  };

  const handleEdit = (v) => {
    setFormData({
      id: v._id,
      visitorName: v.visitorName,
      mobileNumber: v.mobileNumber,
      email: v.email || "",
      organization: v.organization || "",
      personToMeet: v.personToMeet,
      purpose: v.purpose,
      visitDateTime: new Date(v.visitDateTime).toISOString().slice(0, 16), // format for datetime-local
      status: v.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this visitor?")) return;
    
    try {
      await api.delete(`/visitors/${id}`);
      showMessage("success", "Visitor deleted");
      fetchVisitors(searchTerm);
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Failed to delete");
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      visitorName: "",
      mobileNumber: "",
      email: "",
      organization: "",
      personToMeet: "",
      purpose: "",
      visitDateTime: "",
      status: "checked-in",
    });
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="visitor-container">
      <header className="visitor-header">
        <h2>Visitor Management</h2>
        <div className="nav-buttons">
          <Link to={role === "admin" ? "/admin" : "/employee"} className="back-btn">
            Back to Dashboard
          </Link>
        </div>
      </header>

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      {/* Form Section */}
      <section className="visitor-section">
        <h3>{formData.id ? "Edit Visitor" : "Register New Visitor"}</h3>
        <form onSubmit={handleSubmit} className="visitor-form">
          <div className="form-group">
            <label>Name *</label>
            <input type="text" name="visitorName" value={formData.visitorName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Mobile (10 digits) *</label>
            <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Organization</label>
            <input type="text" name="organization" value={formData.organization} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Person to Meet *</label>
            <input type="text" name="personToMeet" value={formData.personToMeet} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Purpose *</label>
            <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Visit Date & Time *</label>
            <input type="datetime-local" name="visitDateTime" value={formData.visitDateTime} onChange={handleChange} />
          </div>

          {formData.id && (
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <button type="submit" className="submit-btn">
              {formData.id ? "Update Visitor" : "Register Visitor"}
            </button>
            {formData.id && (
              <button type="button" onClick={resetForm} className="back-btn">Cancel</button>
            )}
          </div>
        </form>
      </section>

      {/* List Section */}
      <section className="visitor-section">
        <div className="visitor-section-header">
          <h3>Visitor List</h3>
          <input 
            type="text" 
            placeholder="Search name or mobile..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-box"
          />
        </div>

        {loading ? (
          <p>Loading visitors...</p>
        ) : (
          <div className="visitor-table-container">
            <table className="visitor-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>To Meet</th>
                  <th>Status</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visitors.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: "center" }}>No visitors found.</td></tr>
                ) : (
                  visitors.map(v => (
                    <tr key={v._id}>
                      <td>{v.visitorCode}</td>
                      <td>{v.visitorName}</td>
                      <td>{v.mobileNumber}</td>
                      <td>{v.personToMeet}</td>
                      <td>
                        <span className={`status-badge ${v.status}`}>
                          {v.status === "checked-in" ? "In" : "Out"}
                        </span>
                      </td>
                      <td>{formatDateTime(v.checkInTime)}</td>
                      <td>{formatDateTime(v.checkOutTime)}</td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(v)} className="edit-btn">Edit</button>
                          {/* ONLY ADMIN SEES THIS BUTTON */}
                          {role === "admin" && (
                            <button onClick={() => handleDelete(v._id)} className="delete-btn">Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default VisitorManagement;
