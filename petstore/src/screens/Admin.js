import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/Axios';

function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items with icon classnames
  const navItems = [
    { name: 'Dashboard', icon: '🏠', path: '/admin/dashboard' },
    { name: 'Role', icon: '👥', path: '/admin/roles' },
    { name: 'User', icon: '👤', path: '/admin/users', relatedPaths: ['/admin/users', '/admin/create-user', '/admin/update-user'] },
    { name: 'Category', icon: '🏷️', path: '/admin/categories' },
    { name: 'Supplier', icon: '📦', path: '/admin/suppliers', relatedPaths: ['/admin/suppliers', '/admin/create-supplier', '/admin/update-supplier'] },
    { name: 'Product', icon: '🛒', path: '/admin/products', relatedPaths: ['/admin/products', '/admin/create-product', '/admin/update-product'] },
    { name: 'Feature', icon: '📌', path: '/admin/features' },
    { name: 'Value', icon: '📝', path: '/admin/values' },
    { name: 'Variant', icon: '📑', path: '/admin/variants', relatedPaths: ['/admin/variants', '/admin/create-variant', '/admin/update-variant'] },
    { name: 'Shipping', icon: '🚚', path: '/admin/shipping' },
    { name: 'Order', icon: '📋', path: '/admin/orders' },
    { name: 'Payment', icon: '💳', path: '/admin/payments' },
  ];

  const otherItems = [
    { name: 'Feedback', icon: '💬', path: '/feedback' },
    { name: 'Help', icon: '❓', path: '/help' },
    { name: 'Log out', icon: '🚪', path: '/logout' },
  ];

  // Determine which nav item should be active based on current path (dùng cho header-title)
  const getSelectedTab = (path) => {
    const routes = {
      '/admin/dashboard': 'Dashboard',
      '/admin/roles': 'Role',
      '/admin/users': 'User',
      '/admin/create-user': 'User',
      '/admin/update-user': 'User',
      '/admin/categories': 'Category',
      '/admin/suppliers': 'Supplier',
      '/admin/create-supplier': 'Supplier',
      '/admin/update-supplier': 'Supplier',
      '/admin/products': 'Product',
      '/admin/create-product': 'Product',
      '/admin/update-product': 'Product',
      '/admin/features': 'Feature',
      '/admin/values': 'Value',
      '/admin/variants': 'Variant',
      '/admin/create-variant': 'Variant',
      '/admin/update-variant': 'Variant',
      '/admin/shipping': 'Shipping',
      '/admin/orders': 'Order',
      '/admin/payments': 'Payment',
    };
    return routes[path] || 'Dashboard';
  };

  const [selectedTab, setSelectedTab] = useState(getSelectedTab(location.pathname));

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    const navItem = [...navItems, ...otherItems].find(item => item.path === path);
    if (navItem) {
      setSelectedTab(navItem.name);
    }
  };

  useEffect(() => {
    // Update selected tab for header-title when route changes
    setSelectedTab(getSelectedTab(location.pathname));

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        const response = await API.get(`/account/${userId}`);
        setUser(response.data);
      } catch (err) {
        setError('Failed to load profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [location.pathname]);

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <Link to="/profile" className="user-profile">
          <img
            src={user?.image || `${process.env.PUBLIC_URL}/default.png`}
            alt="Profile"
            className="user-avatar"
            onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/default.png`)}
          />
          <span className="user-name">{user?.name}</span>
        </Link>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${
                  isActive || (item.relatedPaths && item.relatedPaths.includes(location.pathname))
                    ? 'active'
                    : ''
                }`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}

          <div className="nav-section-title">
            <p>Other</p>
          </div>

          {otherItems.map((item) => (
            <div
              key={item.name}
              className={`nav-item ${selectedTab === item.name ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </div>
          ))}
        </nav>
      </div>

      <div className="admin-body">
        <header className="admin-header">
          <button
            onClick={toggleSidebar}
            className="toggle-button"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <span className="header-icon">📊</span>
          <div className="header-title">{selectedTab}</div>
        </header>

        {/* Page content will be inserted here */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Admin;