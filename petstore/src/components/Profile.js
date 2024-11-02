import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Toast, ToastContainer } from "react-bootstrap";
import axios from "../utils/Axios";

function Profile({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const [profile, setProfile] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: ''
  });
  const [message, setMessage] = useState(location.state?.message || null);

  const handleChangePassClick = () => {
    navigate(`/profile/changePass/${userId || user?.id}`); // Sử dụng userId từ URL params hoặc từ prop user
  };

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    // Verify if user is accessing their own profile
    if (user && user.id !== parseInt(userId)) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/account/profile/${userId}`);
        const userData = response.data;
        setProfile({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          dateOfBirth: userData.dateOfBirth?.split("T")[0]
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navigate('/');
      }
    };

    fetchProfile();
  }, [userId, user, navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({
    ...profile,
    [name]: value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/account/profile/${userId}`, profile);
      // Update local storage with new profile data
      const updatedUser = { ...user, ...profile };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert("Cập nhật profile thành công!");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div>
      <h2>Update User</h2>
      <form onSubmit={handleProfileSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleProfileChange}
            required
          />
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleProfileChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleProfileChange}
            required
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            name="phoneNumber"
            value={profile.phoneNumber}
            onChange={handleProfileChange}
            required
          />
        </div>
        <div>
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={profile.address}
            onChange={handleProfileChange}
            required
          />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={profile.dateOfBirth}
            onChange={handleProfileChange}
            required
          />
        </div>
        <button type="submit">Update</button>
      </form>
      <button type="button" onClick={handleChangePassClick}>Change Password</button>

      <ToastContainer position="top-end" className="p-3">
        {message && (
          <Toast
            bg={location.state?.type === 'success' ? 'success' : 'danger'}
            onClose={() => setMessage(null)}
            show={!!message}
            delay={3000}
            autohide>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </div>
  );
}

export default Profile;
