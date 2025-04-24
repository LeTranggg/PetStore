import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function UpdateProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    image: null,
  });
  const [currentImage, setCurrentImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        // Extract user ID from JWT token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        const response = await API.get(`/account/${userId}`);
        const profile = response.data;
        setFormData({
          name: profile.name,
          email: profile.email,
          dateOfBirth: profile.dateOfBirth.split('T')[0],
          gender: profile.gender,
          phoneNumber: profile.phoneNumber,
          address: profile.address,
          image: null,
        });
        setCurrentImage(profile.image);
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const validateDateOfBirth = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Điều chỉnh tuổi nếu sinh nhật chưa đến trong năm nay
    const adjustedAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;

    if (adjustedAge < 15) {
      return 'You must be at least 15 years old.';
    }
    if (adjustedAge > 90) {
      return 'Age cannot exceed 90 years.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dobError = validateDateOfBirth(formData.dateOfBirth);
    if (dobError) {
      setToast({
        show: true,
        message: dobError,
        type: 'error',
        autoHide: false,
      });
      return;
    }

    setLoadingUpdate(true);
    setToast({ ...toast, show: false });

    const token = localStorage.getItem('token');
    console.log('Token before request:', token); // Log token

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) data.append(key, formData[key]);
      });
      const response = await API.put('/account/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Kiểm tra nếu email thay đổi (so sánh với email ban đầu)
      const initialEmail = JSON.parse(atob(token.split('.')[1])).email;
      if (formData.email !== initialEmail) {
        setToast({
        show: true,
        message: 'Profile updated successfully! Please confirm your new email. Logging out...',
        type: 'success',
        autoHide: true,
        });
        setTimeout(() => {
          localStorage.removeItem('token'); // Đăng xuất
          navigate('/login', { state: { message: 'Please confirm your new email to log in.' } });
        }, 3000);
      } else {
        navigate("/profile", {
        state: { toast: { message: 'Profile updated successfully!', type: 'success' } }
      });
      }
    } catch (err) {
      console.error('Update profile error:', err.response?.data);
      setToast({
        show: true,
        message: err.response?.data || 'Failed to update profile',
        type: 'error',
        autoHide: false,
        });
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  }

  return (
    <div className="profile">
      <nav>
        <ul>
          <li><a href="/change-password">Change Password</a></li>
          <li><a href="/delete-account">Delete Account</a></li>
        </ul>
      </nav>

      <main>
        <div className="profile-body">
          <h2>My Profile</h2>
          <div className="profile-container">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="profile-image">
                {currentImage && (
                  <div>
                    <img src={currentImage || `${process.env.PUBLIC_URL}/default.png`} alt="Current Profile" width="100" height="100"/>
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <table className="profile-content">
                <tr>
                  <td>Email:</td>
                  <td colSpan="2" className="td-update-profile">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Name:</td>
                  <td colSpan="2" className="td-update-profile">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Phone Number:</td>
                  <td colSpan="2" className="td-update-profile">
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Date of Birth:</td>
                  <td colSpan="2" className="td-update-profile">
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Gender:</td>
                  <td colSpan="2" className="td-update-profile">
                    <select className="td-select"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Address:</td>
                  <td colSpan="2" className="td-update-profile">
                    <textarea className="td-textarea"
                      style={{ paddingLefft: '10px' }}
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td className="td-update-profile">
                    <button className="button-save" type="submit" disabled={loadingUpdate} style={{ maxWidth: '130px' }}>
                      {loadingUpdate ? 'Updating...' : 'Update Profile'}
                    </button>
                  </td>
                  <td className="td-update-profile">
                    <button type="button" onClick={() => navigate('/profile')} className="button-cancel" style={{ maxWidth: '80px' }} disabled={loadingUpdate}>
                  Cancel
                </button>
                  </td>
                </tr>
              </table>

            </form>
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

export default UpdateProfile;