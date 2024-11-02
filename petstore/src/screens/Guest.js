import React from "react";
import { Link } from 'react-router-dom';

function Guest() {
  return (
    <div>
      <h2>Welcome, Guest!</h2>
      <div>
        <Link to="/login">Đăng nhập</Link>
      </div>
      <div>
        <Link to="/register">Đăng ký</Link>
      </div>
    </div>
  );
}

export default Guest;