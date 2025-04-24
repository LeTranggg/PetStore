import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import useAutoLogout from './misc/useAutoLogout';

// Account Management
import ChangePassword from './components/AccountManagement/ChangePassword';
import Delete from './components/AccountManagement/Delete';
import ForgotPassword from './components/AccountManagement/ForgotPassword';
import Login from './components/AccountManagement/Login';
import Logout from './components/AccountManagement/Logout';
import Register from './components/AccountManagement/Register';
import ResetPassword from './components/AccountManagement/ResetPassword';
import UpdateProfile from './components/AccountManagement/UpdateProfile';
import ViewProfile from './components/AccountManagement/ViewProfile';
import ConfirmEmail from './components/AccountManagement/ConfirmEmail';

// Role Management
import ViewRoles from './components/RoleManagement/View';

// User Management
import CreateUser from './components/UserManagement/Create';
import UpdateUser from './components/UserManagement/Update';
import ViewUsers from './components/UserManagement/View';

// Category Management
import ViewCategories from './components/CategoryManagement/View';

// Supplier Management
import ViewSuppliers from './components/SupplierManagement/View';
import CreateSupplier from './components/SupplierManagement/Create';
import UpdateSupplier from './components/SupplierManagement/Update';

// Product Management
import ViewProducts from './components/ProductManagement/View';
import CreateProduct from './components/ProductManagement/Create';
import UpdateProduct from './components/ProductManagement/Update';
import GuestProducts from './components/ProductManagement/GuestProducts';
import CustomerProducts from './components/ProductManagement/CustomerProducts';
import ProductDetail from './components/ProductManagement/ProductDetail';

// Feature Management
import ViewFeatures from './components/FeatureManagement/View';

// Value Management
import ViewValues from './components/ValueManagement/View';

// Variant Management
import ViewVariants from './components/VariantManagement/View';
import CreateVariant from './components/VariantManagement/Create';
import UpdateVariant from './components/VariantManagement/Update';

// Cart Management
import ViewCart from './components/CartManagement/View';

// Shipping Management
import ViewShipping from './components/ShippingManagement/View';

// Order Management
import Checkout from './components/OrderManagement/Checkout';
import ViewOrders from './components/OrderManagement/View';
import CustomerOrders from './components/OrderManagement/Orders';

// Payment Management
import ViewPayments from './components/PaymentManagement/View';

// Screen Components
import Admin from './screens/Admin';
import Dashboard from './screens/Dashboard';
import Customer from './screens/Customer';
import Home from './screens/Home';
import Guest from './screens/Guest';
import Welcome from './screens/Welcome';
import Contact from './screens/Contact';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Google OAuth client ID
  const clientId = '561388206826-upvque1t8hdmg1450kt5k0l10a1bbieu.apps.googleusercontent.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token to get user role
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        setUserRole(role);
        setAuthenticated(true);
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
        setAuthenticated(false);
        setUserRole(null);
      }
    }
  }, []);

  // Protected route component
  const ProtectedRoute = ({ element, requiredRole }) => {
    useAutoLogout();

    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/login" />;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (requiredRole && role !== requiredRole) {
        switch (role) {
          case 'Admin':
            return <Navigate to="/admin" />;
          case 'Customer':
            return <Navigate to="/customer" />;
          default:
            return <Navigate to="/login" />;
        }
      }
      return element;
    } catch (error) {
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <div className="App">
          <Routes>
            {/* -----Account Management----- */}
            {/* Public Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/logout" element={<Logout />} />

            {/* Protected routes */}
            <Route path="/profile" element={<ProtectedRoute element={<ViewProfile />} />} />
            <Route path="/update-profile" element={<ProtectedRoute element={<UpdateProfile />} />} />
            <Route path="/change-password" element={<ProtectedRoute element={<ChangePassword />} />} />
            <Route path="/delete-account" element={<ProtectedRoute element={<Delete />} />} />

            {/* -----Guest Routes----- */}
            <Route path="/" element={<Guest />} >
              <Route index element={<Navigate to="/welcome" replace />} />
              <Route path="welcome" element={<Welcome />} />
              <Route path="contact" element={<Contact />} />
              <Route path="products" element={<GuestProducts />} />
            </Route>

            {/* -----Customer Routes----- */}
            <Route path="/customer" element={<ProtectedRoute element={<Customer />} requiredRole="Customer" />}>
              <Route index element={<Navigate to="/customer/home" replace />} />
              <Route path="home" element={<ProtectedRoute element={<Home />} />} />
              <Route path="contact" element={<ProtectedRoute element={<Contact />} requiredRole="Customer" />} />

              {/* Product Management */}
              <Route path="customer-products" element={<ProtectedRoute element={<CustomerProducts />} />} />
              <Route path="product/:id" element={<ProductDetail />} />

              {/* Cart Management */}
              <Route path="cart" element={<ProtectedRoute element={<ViewCart />} />} />

              {/* Order Management */}
              <Route path="customer-orders" element={<ProtectedRoute element={<CustomerOrders />} />} />
              <Route path="checkout" element={<ProtectedRoute element={<Checkout />}  />} />
            </Route>

            {/* -----Admin Routes----- */}
            <Route path="/admin" element={<ProtectedRoute element={<Admin />} requiredRole="Admin"
            />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<ProtectedRoute element={<Dashboard />} />} />

              {/* Role Management */}
              <Route path="roles" element={<ProtectedRoute element={<ViewRoles />} />} />

              {/* User Management */}
              <Route path="users" element={<ProtectedRoute element={<ViewUsers />} />} />
              <Route path="create-user" element={<ProtectedRoute element={<CreateUser />} />} />
              <Route path="update-user" element={<ProtectedRoute element={<UpdateUser />} />} />

              {/* Category Management */}
              <Route path="categories" element={<ProtectedRoute element={<ViewCategories />} />} />

              {/* Supplier Management */}
              <Route path="suppliers" element={<ProtectedRoute element={<ViewSuppliers />} />} />
              <Route path="create-supplier" element={<ProtectedRoute element={<CreateSupplier />} />} />
              <Route path="update-supplier" element={<ProtectedRoute element={<UpdateSupplier />} />} />

              {/* Product Management */}
              <Route path="products" element={<ProtectedRoute element={<ViewProducts />} />} />
              <Route path="create-product" element={<ProtectedRoute element={<CreateProduct />} />} />
              <Route path="update-product" element={<ProtectedRoute element={<UpdateProduct />} />} />

              {/* Feature Management */}
              <Route path="features" element={<ProtectedRoute element={<ViewFeatures />} />} />

              {/* Value Management */}
              <Route path="values" element={<ProtectedRoute element={<ViewValues />} />} />

              {/* Variant Management */}
              <Route path="variants" element={<ProtectedRoute element={<ViewVariants />} />} />
              <Route path="create-variant" element={<ProtectedRoute element={<CreateVariant />} />} />
              <Route path="update-variant" element={<ProtectedRoute element={<UpdateVariant />} />} />

              {/* Shipping Management */}
              <Route path="shipping" element={<ProtectedRoute element={<ViewShipping />} />} />

              {/* Order Management */}
              <Route path="orders" element={<ProtectedRoute element={<ViewOrders />} />} />

              {/* Payment Management */}
              <Route path="payments" element={<ProtectedRoute element={<ViewPayments />} />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;