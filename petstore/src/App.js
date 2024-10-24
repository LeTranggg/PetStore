import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Register from "./components/Register";
import RoleIndex from "./components/RoleManagement/Index";
import CreateRole from "./components/RoleManagement/Create";
import UpdateRole from "./components/RoleManagement/Update";
import CreateUser from "./components/UserManagement/Create";
import UserIndex from "./components/UserManagement/Index";
import UpdateUser from "./components/UserManagement/Update";
import CategoryIndex from "./components/CategoryManagement/Index";
import CreateCategory from "./components/CategoryManagement/Create";
import UpdateCategory from "./components/CategoryManagement/Update";
import SupplierIndex from "./components/SupplierManagement/Index";
import CreateSuppiler from "./components/SupplierManagement/Create";
import UpdateSupplier from "./components/SupplierManagement/Update";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Ban đầu chưa authenticated
  const [role, setRole] = useState(null); // Ban đầu chưa có role
  const [user, setUser] = useState(null); // Ban đầu chưa có user

  // Khi ứng dụng khởi chạy, lấy thông tin từ localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");
    if (token) {
      setIsAuthenticated(true); // Thiết lập authenticated nếu có token
    } else {
      setIsAuthenticated(false); // Nếu không có token thì không authenticated
    }
    if (storedRole) {
      setRole(storedRole);
    }
    if (storedUser) {
      setUser(storedUser);
    }
  }, []); // Chạy một lần khi component được mount

  console.log("User role:", role);
  console.log("User:", user);

  const Home = () => (
    <div>
      <h2>Welcome!</h2>
      <Logout setAuth={setIsAuthenticated} />
      {role === "Admin" ? (
        <div>
          <p>Hello, Admin!</p>
          <Link to="/roles">Go to Role Management</Link>
          <Link to="/users">Go to User Management</Link>
          <Link to="/categories">Go to Category Management</Link>
          <Link to="/suppliers">Go to Supplier Management</Link>
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
          <Route
            path="/roles"
            element={isAuthenticated && role === "Admin" ? <RoleIndex /> : <Navigate to="/" />}
          />
          <Route
            path="/roles/create"
            element={isAuthenticated && role === "Admin" ? <CreateRole /> : <Navigate to="/roles" />}
          />
          <Route
            path="/roles/update/:roleId"
            element={isAuthenticated && role === "Admin" ? <UpdateRole /> : <Navigate to="/roles" />}
          />

          {/* Trang quản lý users */}
          <Route
            path="/users"
            element={isAuthenticated && role === "Admin" ? <UserIndex /> : <Navigate to="/" />}
          />
          <Route
            path="/users/create"
            element={isAuthenticated && role === "Admin" ? <CreateUser /> : <Navigate to="/users" />}
          />
          <Route
            path="/users/update/:userId"
            element={isAuthenticated && role === "Admin" ? <UpdateUser /> : <Navigate to="/users" />}
          />

          {/* Trang quản lý categories */}
          <Route
            path="/categories"
            element={isAuthenticated && role === "Admin" ? <CategoryIndex /> : <Navigate to="/" />}
          />
          <Route
            path="/categories/create"
            element={isAuthenticated && role === "Admin" ? <CreateCategory /> : <Navigate to="/categories" />}
          />
          <Route
            path="/categories/update/:categoryId"
            element={isAuthenticated && role === "Admin" ? <UpdateCategory /> : <Navigate to="/categories" />}
          />

          {/* Trang quản lý suppliers */}
          <Route
            path="/suppliers"
            element={isAuthenticated && role === "Admin" ? <SupplierIndex /> : <Navigate to="/" />}
          />
          <Route
            path="/suppliers/create"
            element={isAuthenticated && role === "Admin" ? <CreateSuppiler /> : <Navigate to="/suppliers" />}
          />
          <Route
            path="/suppliers/update/:supplierId"
            element={isAuthenticated && role === "Admin" ? <UpdateSupplier /> : <Navigate to="/suppliers" />}
          />

          {/* Trang đăng nhập */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} setRole={setRole} /> : <Navigate to="/" />}
          />

          {/* Trang đăng ký */}
          <Route
            path="/register"
            element={!isAuthenticated ? <Register setAuth={setIsAuthenticated} setRole={setRole} /> : <Navigate to="/" />}
          />

          {/* Redirect tất cả các route khác về trang chủ */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
