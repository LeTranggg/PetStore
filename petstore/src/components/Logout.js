import React from 'react';

const Logout = ({ setAuth }) => {
  const handleLogout = () => {
    localStorage.removeItem('token'); // Xóa token khỏi localStorage
    setAuth(false); // Cập nhật trạng thái đăng xuất
  };

  return (
    <div>
      <button onClick={handleLogout}>Đăng xuất</button>
    </div>
  );
};

export default Logout;