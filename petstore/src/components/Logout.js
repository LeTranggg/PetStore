import React from 'react';

const Logout = ({ setAuth, setRole, setUser }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');

    // Reset tất cả states về null hoặc giá trị mặc định
    setAuth(false);
    setRole(null);
    setUser(null);
  };

  return (
    <div>
      <button onClick={handleLogout}>Đăng xuất</button>
    </div>
  );
};

export default Logout;