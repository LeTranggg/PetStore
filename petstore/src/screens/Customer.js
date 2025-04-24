import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation, NavLink } from 'react-router-dom';
import API from '../utils/Axios';

function Customer() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [user, setUser] = useState(null); // Thêm state để lưu thông tin user
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navItems = [
    { name: 'Home', path: '/customer/home' },
    { name: 'Products', path: '/customer/customer-products' },
    { name: 'Orders', path: '/customer/customer-orders' },
    { name: 'About Us', path: '/customer/contact' },
  ];

  const handleLogoutClick = () => {
    navigate('/logout');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleCartClick = () => {
    navigate('/customer/cart');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  // Thêm useEffect để tải dữ liệu ban đầu (ví dụ: thông tin user)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        const userResponse = await API.get(`/account/${userId}`);
        setUser(userResponse.data);
        console.log('User fetched successfully:', userResponse.data);
      } catch (err) {
        console.error('Fetch user error:', err);
        setError('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="customer">
      <header>
        <img
          src={`${process.env.PUBLIC_URL}/LogoWhite.jpeg`}
          alt="logo"
          width="100px"
          height="50px"
        />
        <div className="search-container" style={{marginLeft: '72px'}}>
          <form onSubmit={handleSearch}>
            <div className="search-wrapper">
              <input
                className="search-input"
                type="text"
                placeholder="Search for products..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className="search-button">
                <img
                  src={`${process.env.PUBLIC_URL}/search.png.jpg`}
                  alt="search icon"
                  className="search-icon"
                />
              </button>
            </div>
          </form>
        </div>
        <div className="header-actions">
          <button type="button" onClick={handleCartClick}>👜</button>
          <button type="button" onClick={handleProfileClick}>👩</button>
          <button type="button" onClick={handleLogoutClick}>Logout</button>
        </div>
      </header>

      <nav>
        <ul>
          {navItems.map((item) => (
            <li>
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
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="customer-content">
        <Outlet />
      </div>

      <footer className="footer">
        <img
          src={`${process.env.PUBLIC_URL}/Logo.jpeg`}
          alt="logo"
          width="100px"
          height="50px"
        />
        <div className="map">
          <ul>
            <li><Link to="/customer/home">Home</Link></li>
            <li><Link to="/customer/customer-products">Products</Link></li>
            <li><Link to="/customer/customer-orders">Orders</Link></li>
            <li><Link to="/customer/contact">About Us</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default Customer;