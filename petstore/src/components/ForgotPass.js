import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../utils/Axios";

const ForgotPass = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.get(`/account/forgot-password?email=${email}`);
      alert("Link đặt lại mật khẩu đã được gửi vào email của bạn!");
    } catch (error) {
      alert("Có lỗi xảy ra! Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body-login">
      <div className="login-container">
      <h2>Quên mật khẩu</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {status.message}

          <div>
            <button className="login-button"
              type="submit"
              disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </button>
          </div>
          <div>
            <button className="login-button"
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}>
              Quay lại đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPass;