import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../utils/Axios';

function ConfirmEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmationStatus, setConfirmationStatus] = useState({
    loading: true,
    success: false,
    error: '',
  });

  useEffect(() => {
    const confirmUserEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const email = queryParams.get('email');
      const token = queryParams.get('token');

      if (!email || !token) {
        setConfirmationStatus({
          loading: false,
          success: false,
          error: 'Invalid confirmation link. Please check the link or contact support.',
        });
        return;
      }

      try {
        await API.get(`/account/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
        setConfirmationStatus({
          loading: false,
          success: true,
          error: '',
        });

        setTimeout(() => {
          navigate('/login', { state: { message: 'Email confirmed successfully! You can now login.' } });
        }, 3000);
      } catch (err) {
        setConfirmationStatus({
          loading: false,
          success: false,
          error: err.response?.data?.message || 'Failed to confirm email. Please try again or contact support.',
        });
      }
    };

    confirmUserEmail();
  }, [location, navigate]);

  return (
    <div className="email-confirmation-container">
      <h2>Confirm Email</h2>
      {confirmationStatus.loading && <p>Confirming your email...</p>}
      {confirmationStatus.success && (
        <div className="success-message">
          <p>Your email confirmed successfully!</p>
          <p>Redirecting to login page...</p>
        </div>
      )}
      {confirmationStatus.error && (
        <div className="error-message">
          <p>{confirmationStatus.error}</p>
          <p>
            <Link to="/login">Back To Login</Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default ConfirmEmail;