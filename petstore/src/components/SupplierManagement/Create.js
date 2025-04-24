import React, { useState } from 'react';
import API from '../../utils/Axios';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../../misc/ToastNotification';

function Create({ onSupplierCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    image: null,
  });
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      setLoadingCreate(true);
      const response = await API.post('/supplier', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Chỉ gọi onSupplierCreated nếu nó là một hàm
      if (typeof onSupplierCreated === 'function') {
        onSupplierCreated(response.data);
      }
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        image: null
      });
      navigate("/admin/suppliers", {
        state: { toast: { message: 'Supplier created successfully!', type: 'success' } }
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to create supplier.',
        type: 'error',
        autoHide: false,
      });
      console.error('Error creating supplier:', err.message || err);
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
        <h3>Create New Supplier</h3>
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
                <label className="label" htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
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
              <button type="submit" className="button-save" disabled={loadingCreate}>
                {loadingCreate ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => navigate("/admin/suppliers")} className="button-cancel" disabled={loadingCreate}>Cancel</button>
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