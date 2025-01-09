import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CategoryIndex from "./components/CategoryManagement/Index";
import CreateClassification from "./components/ClassificationManagement/Create";
import ClassificationIndex from "./components/ClassificationManagement/Index";
import UpdateClassification from "./components/ClassificationManagement/Update";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Register from "./components/Register";
import Profile from "./components/Profile";
import ChangePass from "./components/ChangePass";
import ForgotPass from "./components/ForgotPass";
import ResetPass from "./components/ResetPass";
import CreateProduct from "./components/ProductManagement/Create";
import ProductIndex from "./components/ProductManagement/Index";
import UpdateProduct from "./components/ProductManagement/Update";
import ProductDetail from "./components/ProductDetail";
import RoleIndex from "./components/RoleManagement/Index";
import ShippingIndex from "./components/ShippingManagement/Index";
import CreateSuppiler from "./components/SupplierManagement/Create";
import SupplierIndex from "./components/SupplierManagement/Index";
import UpdateSupplier from "./components/SupplierManagement/Update";
import CreateUser from "./components/UserManagement/Create";
import UserIndex from "./components/UserManagement/Index";
import UpdateUser from "./components/UserManagement/Update";
import CartItem from "./components/CartManagement/CartItem";
import CartIndex from "./components/CartManagement/Index";
import UpdateCart from "./components/CartManagement/Update";
import OrderHistory from "./components/OrderManagement/OrderHistory";
import OrderCreate from "./components/OrderManagement/Create";
import OrderIndex from "./components/OrderManagement/Index";
import Admin from './screens/Admin';
import Customer from './screens/Customer';
import Guest from './screens/Guest';
import "./App.css";

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

    // Check for token expiration
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        setIsAuthenticated(false);
        setRole(null);
        setUser(null);
      }
    }, 10000); // check every 10 seconds

    return () => clearInterval(interval);

  }, []);

  const Home = () => {
    if (!isAuthenticated) {
      return <Navigate to="/guest" replace/>;
    }

    // Nếu đã đăng nhập, điều hướng theo role
    switch (user?.role) {
      case "Admin":
        return <Navigate to="/admin" replace/>;
      case "Customer":
        return <Navigate to="/customer" replace/>;
      default:
        return <Navigate to="/guest" replace/>;
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Trang chủ */}
          <Route path="/" element={<Home />} />
          <Route path="/guest" element={!isAuthenticated ? <Guest /> : <Navigate to="/" replace />} />

          {/* Trang dành cho user đã đăng nhập */}
          <Route path="/admin" element={
            isAuthenticated && role === "Admin" ?
            <div>
              <Admin user={user} />
              <div>
                <Link to={`/profile/${user?.id}`}>Profile</Link>
                <Logout setAuth={setIsAuthenticated} setRole={setRole} setUser={setUser} />
              </div>
            </div> :
            <Navigate to="/" replace/>
          } />
          <Route path="/customer" element={
            isAuthenticated && role === "Customer" ?
            <div>
              <Customer user={user} />
              <div>
                <Link to={`/profile/${user?.id}`}>Profile</Link>
                <Logout setAuth={setIsAuthenticated} setRole={setRole} setUser={setUser} />
              </div>
            </div> :
            <Navigate to="/" replace/>
          } />

          {/* Trang quản lý roles */}
          <Route
            path="/roles"
            element={isAuthenticated && role === "Admin" ? <RoleIndex /> : <Navigate to="/" replace/>}
          />

          {/* Trang quản lý users */}
          <Route
            path="/users"
            element={isAuthenticated && role === "Admin" ? <UserIndex /> : <Navigate to="/" replace/>}
          />
          <Route
            path="/users/create"
            element={isAuthenticated && role === "Admin" ? <CreateUser /> : <Navigate to="/users" replace/>}
          />
          <Route
            path="/users/update/:userId"
            element={isAuthenticated && role === "Admin" ? <UpdateUser /> : <Navigate to="/users" replace/>}
          />

          {/* Trang quản lý categories */}
          <Route
            path="/categories"
            element={isAuthenticated && role === "Admin" ? <CategoryIndex /> : <Navigate to="/" replace/>}
          />

          {/* Trang quản lý suppliers */}
          <Route
            path="/suppliers"
            element={isAuthenticated && role === "Admin" ? <SupplierIndex /> : <Navigate to="/" replace/>}
          />
          <Route
            path="/suppliers/create"
            element={isAuthenticated && role === "Admin" ? <CreateSuppiler /> : <Navigate to="/suppliers" replace/>}
          />
          <Route
            path="/suppliers/update/:supplierId"
            element={isAuthenticated && role === "Admin" ? <UpdateSupplier /> : <Navigate to="/suppliers" replace/>}
          />

          {/* Trang quản lý products */}
          <Route
            path="/products"
            element={isAuthenticated && role === "Admin" ? <ProductIndex /> : <Navigate to="/" replace/>}
          />
          <Route
            path="/products/create"
            element={isAuthenticated && role === "Admin" ? <CreateProduct /> : <Navigate to="/products" replace/>}
          />
          <Route
            path="/products/update/:productId"
            element={isAuthenticated && role === "Admin" ? <UpdateProduct /> : <Navigate to="/products" replace/>}
          />

          {/* Trang products chi tiết*/}
          <Route
            path="/products/product-detail/:productId"
            element={!isAuthenticated || role === "Customer" ? <ProductDetail /> : <Navigate to="/" replace/>}
          />

          {/* Trang quản lý classifications */}
          <Route
            path="/classifications"
            element={isAuthenticated && role === "Admin" ? <ClassificationIndex /> : <Navigate to="/" replace/>}
          />
          <Route
            path="/classifications/create"
            element={isAuthenticated && role === "Admin" ? <CreateClassification /> : <Navigate to="/classifications" replace/>}
          />
          <Route
            path="/classifications/update/:classificationId"
            element={isAuthenticated && role === "Admin" ? <UpdateClassification /> : <Navigate to="/classifications" replace/>}
          />

          {/* Trang quản lý shippings */}
          <Route
            path="/shippings"
            element={isAuthenticated && role === "Admin" && "Customer" ? <ShippingIndex /> : <Navigate to="/" replace/>}
          />

          {/* Trang quản lý cart */}
          <Route
            path="/cart"
            element={isAuthenticated && role === "Customer" ? <CartIndex /> : <Navigate to="/" replace/>}
          />
          <Route
            path="/cart/cart-item"
            element={isAuthenticated && role === "Customer" ? <CartItem /> : <Navigate to="/cart" replace/>}
          />
          <Route
            path="/cart/update/:cartItemId"
            element={isAuthenticated && role === "Customer" ? <UpdateCart /> : <Navigate to="/cart" replace/>}
          />

          <Route
            path="/orders"
            element={isAuthenticated && role === "Admin" ? <OrderIndex /> : <Navigate to="/" replace />}
          />
          <Route
            path="/orders/create"
            element={isAuthenticated && role === "Customer" ? <OrderCreate /> : <Navigate to="/" replace />}
          />
          <Route
            path="/orders/history"
            element={isAuthenticated && role === "Customer" ? <OrderHistory /> : <Navigate to="/" replace />}
          />

          {/* Trang profile */}
          <Route
            path="/profile/:userId"
            element={isAuthenticated ? <Profile user={user} /> : <Navigate to="/profile" replace/>}
          />
          <Route
            path="/profile/change-pass/:userId"
            element={isAuthenticated ? <ChangePass user={user} /> : <Navigate to="/profile" replace/>}
          />

          {/* Trang đăng nhập */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} setRole={setRole} setUser={setUser} /> : <Navigate to="/" replace/>}
          />

          {/* Trang đăng ký */}
          <Route
            path="/register"
            element={!isAuthenticated ? <Register setAuth={setIsAuthenticated} setRole={setRole} setUser={setUser} /> : <Navigate to="/" replace/>}
          />

          {/* Trang quên mật khẩu */}
          <Route
            path="/forgot-pass"
            element={!isAuthenticated ? <ForgotPass setAuth={setIsAuthenticated} setRole={setRole} setUser={setUser} /> : <Navigate to="/" replace/>}
          />
          <Route
            path="/reset-pass"
            element={!isAuthenticated ? <ResetPass setAuth={setIsAuthenticated} setRole={setRole} setUser={setUser} /> : <Navigate to="/" replace/>}
          />

          {/* Redirect tất cả các route khác về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
