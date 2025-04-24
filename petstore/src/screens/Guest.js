import React, { useState } from 'react';
import { Link, useLocation, useNavigate, NavLink, Outlet } from 'react-router-dom';

function Guest() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState(''); // Thêm state để lưu từ khóa tìm kiếm

  const navItems = [
    { name: 'Home', path: '/welcome' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/contact' },
  ];

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedKeyword = searchKeyword.trim();
    if (trimmedKeyword) {
      navigate(`/products?search=${encodeURIComponent(trimmedKeyword)}`);
    } else {
      navigate('/products'); // Điều hướng không có query parameter khi từ khóa trống
    }
  };

  return (
    <div className="customer">
      <header>
        <img
          src={`${process.env.PUBLIC_URL}/LogoWhite.jpeg`}
          alt="logo"
          width="100px"
          height="50px"
          href="#home"
        />
        <div className="search-container" style={{marginLeft: '55px'}}>
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
          <button type="button" onClick={handleRegisterClick}>Register</button>
          <button type="button" onClick={handleLoginClick}>Login</button>
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

      <footer>
        <img
          src={`${process.env.PUBLIC_URL}/Logo.jpeg`}
          alt="logo"
          width="100px"
          height="50px"
        />
        <div className="map">
          <ul>
            <li><Link to="/welcome">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/contact">About Us</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default Guest;