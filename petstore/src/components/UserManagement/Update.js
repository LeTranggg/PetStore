import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function Update() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  // State cho formData, roles, error và loading
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || 'Male',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    roleId: '', // Sẽ được gán sau khi fetch roles
    image: null,
  });
  const [roles, setRoles] = useState([]); // State để lưu danh sách roles
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });

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

  // Fetch roles từ API khi component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roleResponse = await API.get('/role');
        setRoles(roleResponse.data);

        // Gán roleId dựa trên user.role
        if (user?.role && roleResponse.data.length > 0) {
          const userRole = roleResponse.data.find(role => role.name === user.role);
          if (userRole) {
            setFormData(prev => ({ ...prev, roleId: userRole.id }));
          } else {
            // Nếu không tìm thấy role, gán role đầu tiên trong danh sách
            setFormData(prev => ({ ...prev, roleId: roleResponse.data[0].id }));
          }
        }
      } catch (err) {
        setError('Failed to load roles.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]); // Dependency là user để đảm bảo fetch roles khi user thay đổi

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

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
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      setLoadingUpdate(true);
      const response = await API.put(`/user/${user.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate("/admin/users", {
        state: { toast: { message: 'User updated successfully!', type: 'success' } }
      });
    } catch (err) {
      console.error('Error updating user:', err.response);
      let errorMessage = 'Failed to update user.'; // Default fallback
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
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (!user) {
    return (
      <div>
        No user selected for update. <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div>
      <div className="function">
        <h3>Update User (ID: {user.id})</h3>
        <form onSubmit={handleSubmit}>
          <div className="function-container">
            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="label" htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group col-md-6">
                <label className="label" htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                />
              </div>

              <div className="form-group col-md-6">
                <label className="label" htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
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
                <label className="label" htmlFor="roleId">Role</label>
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
              <button type="submit" className="button-save" disabled={loadingUpdate}>
                {loadingUpdate ? 'Updating...' : 'Update'}
              </button>
              <button onClick={() => navigate("/admin/users")} className="button-cancel" disabled={loadingUpdate}>Cancel</button>
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

export default Update;