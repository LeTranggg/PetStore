import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../../misc/ToastNotification';

function Create({ onUserCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: 'Male',
    phoneNumber: '',
    address: '',
    roleId: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);

  const validateDateOfBirth = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Điều chỉnh tuổi nếu sinh nhật chưa đến trong năm nay
    const adjustedAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;

    if (adjustedAge < 15) {
      return 'User must be at least 15 years old.';
    }
    if (adjustedAge > 90) {
      return 'Age cannot exceed 90 years.';
    }
    return '';
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roleResponse = await API.get('/role');
        setRoles(roleResponse.data);

        if (roleResponse.data.length > 0) {
          const customerRole = roleResponse.data.find(role => role.name === 'Customer');
          setFormData(prev => ({ ...prev, roleId: customerRole ? customerRole.id : roleResponse.data[0].id }));
        }
      } catch (err) {
        setError('Failed to load roles.');
        console.error('Error fetching roles:', err.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
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

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      setLoadingCreate(true);
      const response = await API.post('/user', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Chỉ gọi onUserCreated nếu nó là một hàm
      if (typeof onUserCreated === 'function') {
        onUserCreated(response.data);
      }
      setFormData({
        name: '',
        email: '',
        dateOfBirth: '',
        gender: 'Male',
        phoneNumber: '',
        address: '',
        roleId: Array.isArray(roles) && roles.length > 0
          ? (roles.find(role => role.name === 'Customer')?.id || roles[0]?.id || '')
          : '',
        image: null
      });
      navigate("/admin/users", {
        state: { toast: { message: 'User created successfully!', type: 'success' } }
      });
    } catch (err) {
      console.error('Error creating user:', err.response);
      let errorMessage = 'Failed to create user.'; // Default fallback
      if (err.response && err.response.data) {
        const { data } = err.response;
        errorMessage = data;
      } else if (err.message) {
        // Fallback to err.message if no response data is available
        errorMessage = err.message;
      }
      setToast({
        show: true,
        message: errorMessage,
        type: 'error',
        autoHide: false,
      });
      console.error('Error creating user:', err.message || err);
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return (
    <div>
      <div className="function">
        <h3>Create New User</h3>
        <form onSubmit={handleSubmit}>
          <div className="function-container">
            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="label" htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label className="label" htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="label" htmlFor="dateOfBirth">Date Of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label className="label" htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="label" htmlFor="gender">Gender</label>
                <select
                  className="form-select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group col-md-6">
                <label className="label" htmlFor="role">Role</label>
                <select
                  className="form-select"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="label" htmlFor="address">Address</label>
                <textarea className="form-group"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label className="label" htmlFor="image">Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <div className="function-button">
              <button type="submit" className="button-save" disabled={loadingCreate}>
                {loadingCreate ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => navigate("/admin/users")} className="button-cancel" disabled={loadingCreate}>Cancel</button>
            </div>
          </div>
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

export default Create;