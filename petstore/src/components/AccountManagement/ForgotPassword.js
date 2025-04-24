import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ ...toast, show: false });

    try {
      await API.post('/account/forgot-password', { email });
      setToast({
        show: true,
        message: 'If your email is registered, a password reset link has been sent to your email.',
        type: 'success',
        autoHide: true,
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to process your request. Please try again later.',
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
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="button-save" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <button className="button-cancel" type="button" onClick={() => navigate('/login')} disabled={loading}>
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

export default ForgotPassword;