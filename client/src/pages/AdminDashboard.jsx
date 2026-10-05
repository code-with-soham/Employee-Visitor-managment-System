import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    isActive: true,
  });

  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      showMessage("error", "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      return showMessage("error", "Name and Email are required");
    }
    if (!formData.id && !formData.password.trim()) {
      return showMessage("error", "Password is required for new employees");
    }

    try {
      if (formData.id) {
        // Update
        const payload = { 
          name: formData.name, 
          email: formData.email, 
          isActive: formData.isActive 
        };
        // Only send password if user typed something new
        if (formData.password) payload.password = formData.password;
        
        await api.put(`/employees/${formData.id}`, payload);
        showMessage("success", "Employee updated successfully");
      } else {
        // Create
        await api.post("/employees", formData);
        showMessage("success", "Employee added successfully");
      }
      
      // Reset form and refresh list
      setFormData({ id: null, name: "", email: "", password: "", isActive: true });
      fetchEmployees();
    } catch (err) {
      const errText = err.response?.data?.message || "Server error";
      showMessage("error", errText);
    }
  };

  const handleEdit = (emp) => {
    setFormData({
      id: emp._id,
      name: emp.name,
      email: emp.email,
      password: "", // Keep password blank initially for edits
      isActive: emp.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this employee?")) return;
    
    try {
      await api.delete(`/employees/${id}`);
      showMessage("success", "Employee deactivated");
      fetchEmployees();
    } catch (err) {
      const errText = err.response?.data?.message || "Failed to deactivate";
      showMessage("error", errText);
    }
  };

  const cancelEdit = () => {
    setFormData({ id: null, name: "", email: "", password: "", isActive: true });
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2>Admin Dashboard</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/visitors")} className="submit-btn" style={{ background: "#10b981" }}>
            Register Visitor
          </button>
          <button onClick={() => navigate("/visitors")} className="submit-btn" style={{ background: "#3b82f6" }}>
            Manage Visitors
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Add / Edit Form */}
      <section className="admin-section">
        <h3>{formData.id ? "Edit Employee" : "Add New Employee"}</h3>
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label>Name *</label>
            <input 
              type="text" name="name" 
              value={formData.name} onChange={handleChange} 
              placeholder="John Doe" 
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" name="email" 
              value={formData.email} onChange={handleChange} 
              placeholder="john@example.com" 
            />
          </div>
          <div className="form-group">
            <label>{formData.id ? "New Password (Optional)" : "Password *"}</label>
            <input 
              type="password" name="password" 
              value={formData.password} onChange={handleChange} 
              placeholder="••••••••" 
            />
          </div>
          
          {formData.id && (
            <div className="form-group checkbox">
              <input 
                type="checkbox" name="isActive" id="isActive"
                checked={formData.isActive} onChange={handleChange} 
              />
              <label htmlFor="isActive">Account Active</label>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" className="submit-btn">
              {formData.id ? "Update Employee" : "Add Employee"}
            </button>
            {formData.id && (
              <button type="button" onClick={cancelEdit} className="delete-btn" style={{ background: "#6b7280" }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Employee List */}
      <section className="admin-section">
        <h3>Manage Employees</h3>
        
        {loading ? (
          <p>Loading employees...</p>
        ) : (
          <div className="table-container">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>No employees found.</td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>
                        <span className={`status-badge ${emp.isActive ? 'active' : 'inactive'}`}>
                          {emp.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(emp)} className="edit-btn">Edit</button>
                          {emp.isActive && (
                            <button onClick={() => handleDeactivate(emp._id)} className="delete-btn">
                              Deactivate
                            </button>
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

export default AdminDashboard;
