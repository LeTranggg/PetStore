import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function Delete() {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setToast({
        show: true,
        message: 'Please type DELETE to confirm',
        type: 'error',
        autoHide: false,
      });
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('token');
    console.log('Token before request:', token); // Log token

    try {
      await API.delete('/account/delete-account');
      localStorage.removeItem('token');
      setToast({
        show: true,
        message: 'Account deletion request submitted.',
        type: 'success',
        autoHide: true,
      });
      setTimeout(() => {
        navigate('/logout');
      }, 3000);
    } catch (err) {
      console.error('Delete account error:', err.response?.data);
      setToast({
        show: true,
        message: err.response?.data || 'Failed to delete account',
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
        <h2>Delete Account</h2>
        <table className="profile-content">
          <tr>
            <td>
              <p>Warning: This action will mark your account for deletion. Your account will be locked immediately and permanently deleted after 10 days.</p>
              <p>All your data will be lost. This action cannot be undone.</p>
            </td>
          </tr>
          <tr>
            <td>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
              />
              <button
                onClick={handleDelete}
                disabled={loading || confirmText !== 'DELETE'}
                className="button-danger"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button type="button" onClick={() => navigate('/profile')} className="button-cancel" disabled={loading}>
                Cancel
              </button>
            </td>
          </tr>
        </table>
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

export default Delete;