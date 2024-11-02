import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CreateCategory from "./components/CategoryManagement/Create";
import CategoryIndex from "./components/CategoryManagement/Index";
import UpdateCategory from "./components/CategoryManagement/Update";
import CreateClassification from "./components/ClassificationManagement/Create";
import ClassificationIndex from "./components/ClassificationManagement/Index";
import UpdateClassification from "./components/ClassificationManagement/Update";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Register from "./components/Register";
import Profile from "./components/Profile";
import ChangePass from "./components/ChangePass";
import CreateProduct from "./components/ProductManagement/Create";
import ProductIndex from "./components/ProductManagement/Index";
import UpdateProduct from "./components/ProductManagement/Update";
import CreateRole from "./components/RoleManagement/Create";
import RoleIndex from "./components/RoleManagement/Index";
import UpdateRole from "./components/RoleManagement/Update";
import CreateShipping from "./components/ShippingManagement/Create";
import ShippingIndex from "./components/ShippingManagement/Index";
import UpdateShipping from "./components/ShippingManagement/Update";
import CreateSuppiler from "./components/SupplierManagement/Create";
import SupplierIndex from "./components/SupplierManagement/Index";
import UpdateSupplier from "./components/SupplierManagement/Update";
import CreateUser from "./components/UserManagement/Create";
import UserIndex from "./components/UserManagement/Index";
import UpdateUser from "./components/UserManagement/Update";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Ban đầu chưa authenticated
  const [role, setRole] = useState(null); // Ban đầu chưa có role
  const [user, setUser] = useState(null); // Ban đầu chưa có user

  // Khi ứng dụng khởi chạy, lấy thông tin từ localStorage
  useEffect(() => {
    try {
      // Lấy và kiểm tra token
      const token = localStorage.getItem("token");
      //console.log('Stored token:', token);

      // Lấy thông tin user
      const userDataString = localStorage.getItem("user");
      //console.log('Stored user string:', userDataString);

      if (token) {
        setIsAuthenticated(true);

        if (userDataString) {
          const userData = JSON.parse(userDataString);
          //console.log('Parsed user:', userData);

          if (userData && Object.keys(userData).length > 0) {
            // Set user data
            setUser(userData);

            // Set role từ user data
            if (userData.role) {
              setRole(userData.role);
              //console.log('Set role to:', userData.role);
            }
          }
        }
      } else {
        setIsAuthenticated(false);
        setRole(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error processing stored data:', error);
      setIsAuthenticated(false);
      setRole(null);
      setUser(null);

      // Clear localStorage in case of corruption
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  }, []);

  const Home = () => (
    <div>
      <h2>Welcome!</h2>
      <Logout setAuth={setIsAuthenticated} setRole={setRole} setUser={setUser} />
      {user && (
        <>
          <div>User ID: {user.id}</div>
          <div>User Role: {user.role}</div>
          <Link to={`/profile/${user.id}`}>Go to Your Profile</Link>
        </>
      )}
      {user && user.role === "Admin" ? (
        <div>
          <p>Hello, Admin!</p>
          <div>
            <Link to="/roles">Go to Role Management</Link>
          </div>
          <div>
            <Link to="/users">Go to User Management</Link>
          </div>
          <div>
            <Link to="/categories">Go to Category Management</Link>
          </div>
          <div>
            <Link to="/suppliers">Go to Supplier Management</Link>
          </div>
          <div>
            <Link to="/products">Go to Product Management</Link>
          </div>
          <div>
            <Link to="/classifications">Go to Classification Management</Link>
          </div>
          <div>
            <Link to="/shippings">Go to Shipping Management</Link>
          </div>
        </div>
      ) : (
        <p>Welcome, {user ? user.role : "Guest"}!</p>
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

          {/* Trang quản lý products */}
          <Route
            path="/products"
            element={isAuthenticated && role === "Admin" ? <ProductIndex /> : <Navigate to="/" />}
          />
          <Route
            path="/products/create"
            element={isAuthenticated && role === "Admin" ? <CreateProduct /> : <Navigate to="/products" />}
          />
          <Route
            path="/products/update/:productId"
            element={isAuthenticated && role === "Admin" ? <UpdateProduct /> : <Navigate to="/products" />}
          />

          {/* Trang quản lý classifications */}
          <Route
            path="/classifications"
            element={isAuthenticated && role === "Admin" ? <ClassificationIndex /> : <Navigate to="/" />}
          />
          <Route
            path="/classifications/create"
            element={isAuthenticated && role === "Admin" ? <CreateClassification /> : <Navigate to="/classifications" />}
          />
          <Route
            path="/classifications/update/:classificationId"
            element={isAuthenticated && role === "Admin" ? <UpdateClassification /> : <Navigate to="/classifications" />}
          />

          {/* Trang quản lý classifications */}
          <Route
            path="/shippings"
            element={isAuthenticated && role === "Admin" ? <ShippingIndex /> : <Navigate to="/" />}
          />
          <Route
            path="/shippings/create"
            element={isAuthenticated && role === "Admin" ? <CreateShipping /> : <Navigate to="/shippings" />}
          />
          <Route
            path="/shippings/update/:shippingId"
            element={isAuthenticated && role === "Admin" ? <UpdateShipping /> : <Navigate to="/shippings" />}
          />

          {/* Trang profile */}
          <Route
            path="/profile/:userId"
            element={isAuthenticated ? <Profile user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/changePass/:userId"
            element={isAuthenticated ? <ChangePass user={user} /> : <Navigate to="/profile" />}
          />

          {/* Trang đăng nhập */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} setRole={setRole} setUser={setUser} /> : <Navigate to="/" />}
          />

          {/* Trang đăng ký */}
          <Route
            path="/register"
            element={!isAuthenticated ? <Register setAuth={setIsAuthenticated} setRole={setRole} setUser={setUser} /> : <Navigate to="/" />}
          />

          {/* Redirect tất cả các route khác về trang chủ */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
