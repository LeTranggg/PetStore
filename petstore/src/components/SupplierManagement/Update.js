import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function Update() {
  const location = useLocation();
  const navigate = useNavigate();
  const supplier = location.state?.supplier;

  // State cho formData, roles, error và loading
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
    phoneNumber: supplier?.phoneNumber || '',
    address: supplier?.address || '',
    image: null,
  });
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplier) return;

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      setLoadingUpdate(true);
      const response = await API.put(`/supplier/${supplier.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate("/admin/suppliers", {
        state: { toast: { message: 'Supplier updated successfully!', type: 'success' } }
      });
    } catch (err) {
      console.error('Error updating supplier:', err.response);
      let errorMessage = 'Failed to update supplier.'; // Default fallback
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

  if (!supplier) {
    return (
      <div>
        No supplier selected for update. <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div>
      <div className="function">
        <h3>Update Supplier (ID: {supplier.id})</h3>
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
                <label className="label" htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="label" htmlFor="address">Address</label>
                <textarea className="form-group"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row" style={{ display: 'block' }}>
              <label className="label" htmlFor="image">Image</label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <div className="function-button">
              <button type="submit" className="button-save" disabled={loadingUpdate}>
                {loadingUpdate ? 'Updating...' : 'Update'}
              </button>
              <button onClick={() => navigate("/admin/suppliers")} className="button-cancel" disabled={loadingUpdate}>Cancel</button>
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