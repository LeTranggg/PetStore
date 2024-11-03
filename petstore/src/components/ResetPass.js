import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "../utils/Axios";

const ResetPass = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy token và email từ URL params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      console.log('Missing token or email'); // Debug log
      navigate('/login', { state: { message: 'Missing token or email', type: 'danger' }});
    } else {
      console.log('Token and email present:', { token, email }); // Debug log
    }
  }, [token, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      setStatus({
        type: 'error',
        message: 'Mật khẩu không khớp!'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/account/reset-password', {
        email,
        token,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      });
      navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công!', type: 'success' }});
    } catch (error) {
      navigate('/login', { state: { message: 'Không thể đặt lại mật khẩu! Vui lòng thử lại.', type: 'danger' }});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Đặt lại mật khẩu</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={formData.newPassword}
              onChange={(e) => setFormData({
                ...formData,
                newPassword: e.target.value
              })}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={formData.confirmNewPassword}
              onChange={(e) => setFormData({
                ...formData,
                confirmNewPassword: e.target.value
              })}
              required
            />
          </div>

          {status.message}

          <button
            type="submit"
            disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
    </div>
  );
}

export default ResetPass;
