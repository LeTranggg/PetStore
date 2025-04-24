import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');
    const token = queryParams.get('token');
    if (email && token) {
      setFormData(prev => ({ ...prev, email, token }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setToast({
        show: true,
        message: 'Passwords do not match',
        type: 'error',
        autoHide: false,
      });
      return;
    }

    setLoading(true);
    setToast({ ...toast, show: false });

    try {
      await API.post('/account/reset-password', {
        email: formData.email,
        token: formData.token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      setToast({
        show: true,
        message: 'Password reset successfully!',
        type: 'success',
        autoHide: true,
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to reset password',
        type: 'error',
        autoHide: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  }

  return (
    <div className="password-recovery">

      <div className="password-recovery-body">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <p>
            Enter the new password for {formData.email}
          </p>
          <input
            type="password"
            placeholder="New password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Confirm newpassword"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button className="button-save" type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <button type="button" onClick={() => navigate('/login')} className="button-cancel" disabled={loading}>
            Back to Login
          </button>
        </form>
      </div>

      <ToastNotification
        show={toast.show}
        onClose={handleToastClose}
        message={toast.message}
        type={toast.type}
        autoHide={toast.autoHide}
        delay={30000}
      />
    </div>
  );
}

export default ResetPassword;