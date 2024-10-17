import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Logout from "./components/Logout";
import RoleIndex from "./components/RoleManagement/Index";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Use useEffect to keep the role in sync with localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, [isAuthenticated]); // Re-run this effect when the user is authenticated

  console.log("User role:", role);

  const Home = () => (
    <div>
      <h2>Welcome!</h2>
      <Logout setAuth={setIsAuthenticated} />
      {role === "Admin" ? (
        <div>
          <p>Hello, Admin!</p>
          <Link to="/roles">Go to Role Management</Link>
        </div>
      ) : (
        <p>Welcome, {role ? role : "User"}!</p>
      )}
    </div>
  );

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Trang chủ */}
          <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />

          {/* Trang quản lý roles */}
          <Route path="/roles" element={isAuthenticated && role === "Admin" ? <RoleIndex /> : <Navigate to="/" />} />

          {/* Trang đăng nhập */}
          <Route path="/login" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} setRole={setRole} /> : <Navigate to="/" />} />

          {/* Redirect tất cả các route khác về trang chủ */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
