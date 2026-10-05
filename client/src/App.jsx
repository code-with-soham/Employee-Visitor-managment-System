import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import VisitorManagement from "./pages/VisitorManagement";
import VisitorLogin from "./pages/VisitorLogin";
import VisitorDashboard from "./pages/VisitorDashboard";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={
          <div style={{textAlign:"center", marginTop:"2rem"}}>
            <h2>Welcome to EVMS</h2>
            <div style={{display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem"}}>
              <Link to="/login" style={{padding: "0.5rem 1rem", background: "#3b82f6", color: "white", textDecoration: "none", borderRadius: "6px"}}>Staff Login</Link>
              <Link to="/visitor/login" style={{padding: "0.5rem 1rem", background: "#10b981", color: "white", textDecoration: "none", borderRadius: "6px"}}>Visitor Login</Link>
            </div>
          </div>
        } />
        
        <Route path="/login" element={<Login />} />
        <Route path="/visitor/login" element={<VisitorLogin />} />
        
        {/* Protected Visitor Route */}
        <Route 
          path="/visitor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["visitor"]}>
              <VisitorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Admin Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Employee Dashboard Placeholder */}
        <Route 
          path="/employee" 
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <div style={{padding: "2rem", textAlign: "center"}}>
                <h2>Employee Dashboard</h2>
                <div style={{display: "flex", gap: "1rem", justifyContent: "center", margin: "1rem"}}>
                  <a href="/visitors" style={{padding: "0.5rem 1rem", background: "#10b981", color: "white", borderRadius: "6px", textDecoration: "none"}}>Register Visitor</a>
                  <a href="/visitors" style={{padding: "0.5rem 1rem", background: "#3b82f6", color: "white", borderRadius: "6px", textDecoration: "none"}}>Manage Visitors</a>
                </div>
                <br/>
                <button onClick={() => { localStorage.clear(); window.location.href="/login"; }}>Logout</button>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Visitor Management Route - Shared between admin & employee */}
        <Route 
          path="/visitors" 
          element={
            <ProtectedRoute allowedRoles={["admin", "employee"]}>
              <VisitorManagement />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
