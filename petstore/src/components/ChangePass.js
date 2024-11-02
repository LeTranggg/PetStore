import React, { useState } from 'react';
import axios from "../utils/Axios";
import { useNavigate, useParams } from 'react-router-dom'; // Thêm useParams

const ChangePass = ({ user }) => { // Nhận prop user giống Profile component
  const navigate = useNavigate();
  const { userId } = useParams(); // Lấy userId từ URL params thay vì localStorage
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return false;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Mật khẩu mới không khớp');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return false;
    }
    // Kiểm tra ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError('Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      navigate('/login');
      return;
    }

    // Verify if user is accessing their own password change
    if (user && user.id !== parseInt(userId)) {
      navigate('/');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.put(`/account/change-password/${userId}`, formData);
      navigate(`/profile/${userId}`, {state: { message: 'Thay đổi mật khẩu thành công!', type: 'success' }});
    } catch (err) {
      if (error.response && error.response.data) {
        const errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
        setError(`Failed to update user: ${errorMessage}`);
      } else {
        navigate(`/profile/${userId}`, { state: { message: "Không thể thay đổi mật khẩu! Vui lòng thử lại.", type: 'danger' }});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Thay đổi mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mật khẩu hiện tại</label>
          <input
            id="currentPassword"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Mật khẩu mới</label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Xác nhận mật khẩu mới</label>
          <input
            type="password"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && (<div>{error}</div>)}

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ChangePass;