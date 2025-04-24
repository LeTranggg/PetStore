import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
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

    const token = localStorage.getItem('token');
    console.log('Token before request:', token); // Log token

    try {
      await API.post('/account/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      navigate("/profile", {
        state: { toast: { message: 'Password changed successfully!', type: 'success' } }
      });
    } catch (err) {
      console.error('Change password error:', err.response?.data);
      setToast({
        show: true,
        message: err.response?.data || 'Failed to change password',
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
    <div className="account-setting">
      <nav>
        <ul>
          <li><a href="/change-password">Change Password</a></li>
          <li><a href="/delete-account">Delete Account</a></li>
        </ul>
      </nav>

      <main className="account-setting-body">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Old password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
          />
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
            placeholder="Confirm new password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button className="button-save" type="submit" disabled={loading}>
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
          <button className="button-cancel" type="button" onClick={() => navigate('/profile')} disabled={loading}>
            Cancel
          </button>
        </form>
      </main>

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

export default ChangePassword;