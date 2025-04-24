import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function ViewProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true
  });

// Check for toast message from Create.js or Update.js
  useEffect(() => {
    if (location.state?.toast) {
      setToast({
        show: true,
        message: location.state.toast.message,
        type: location.state.toast.type,
        autoHide: true,
      });
      // Clear the state to prevent re-showing the toast on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        const response = await API.get(`/account/${userId}`);
        setProfile(response.data);
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  }

  if (!profile) return <div>No profile found</div>;

  return (
    <div className="profile">
      <nav>
        <ul>
          <li><a href="/">⇚</a></li>
          <li><a href="/change-password">Change Password</a></li>
          <li><a href="/delete-account">Delete Account</a></li>
        </ul>
      </nav>

      <main>
        <div className="profile-body">
          <h2>My Profile</h2>
          <a href="/update-profile">Edit</a>
          <div className="profile-container">
            <div className="profile-image">
              <img
                src={profile.image || `${process.env.PUBLIC_URL}/default.png`}
                alt="Profile"
              />
            </div>

            <table className="profile-content">
              <tr>
                <th>Email:</th>
                <td>{profile.email}</td>
              </tr>
              <tr>
                <th>Name:</th>
                <td>{profile.name}</td>
              </tr>
              <tr>
                <th>Phone Number:</th>
                <td>{profile.phoneNumber}</td>
              </tr>
              <tr>
                <th>Date of Birth:</th>
                <td>{new Date(profile.dateOfBirth).toLocaleDateString()}</td>
              </tr>
              <tr>
                <th>Gender:</th>
                <td>{profile.gender}</td>
              </tr>
              <tr>
                <th>Address:</th>
                <td>{profile.address}</td>
              </tr>
              <tr>
                <th>Loyalty Coins:</th>
                <td>{profile.loyaltyCoins}</td>
              </tr>
            </table>
          </div>

        </div>

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

export default ViewProfile;