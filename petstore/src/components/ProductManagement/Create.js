import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../../misc/ToastNotification';

function Create({ onProductCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    supplierId: '',
    description: '',
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
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await API.get('/category');
        setCategories(categoryResponse.data);

        if (categoryResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: categoryResponse.data[0].id }));
        }
      } catch (err) {
        setError('Failed to load categories.');
        console.error('Error fetching categories:', err.message || err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSuppliers = async () => {
      try {
        const supplierResponse = await API.get('/supplier');
        setSuppliers(supplierResponse.data);

        if (supplierResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, supplierId: supplierResponse.data[0].id }));
        }
      } catch (err) {
        setError('Failed to load suppliers.');
        console.error('Error fetching categories:', err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchSuppliers();
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
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      setLoadingCreate(true);
      const response = await API.post('/product', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Chỉ gọi onProductCreated nếu nó là một hàm
      if (typeof onProductCreated === 'function') {
        onProductCreated(response.data);
      }
      setFormData({
        name: '',
        price: '',
        description: '',
        categoryId: Array.isArray(categories) && categories.length > 0
        ? (categories[0]?.id || '')
          : '',
        supplierId: Array.isArray(suppliers) && suppliers.length > 0
        ? (suppliers[0]?.id || '')
        : '',
        image: null
      });
      navigate("/admin/products", {
        state: { toast: { message: 'Product created successfully!', type: 'success' } }
      });
    } catch (err) {
      console.error('Error creating product:', err.message || err);
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to create product.',
        type: 'error',
        autoHide: false,
      });
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
        <h3>Create New Product</h3>
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
                <label className="label" htmlFor="price">Price</label>
                <input
                  type="number"
                  step="1000"
                  name="price"
                  value={formData.additionalFee}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="label" htmlFor="category">Category</label>
                <select
                  className="form-select"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group col-md-6">
                <label className="label" htmlFor="supplier">Supplier</label>
                <select
                  className="form-select"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                >
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row" style={{ display: 'block' }}>
              <label className="label" htmlFor="description">Description</label>
              <textarea className="form-group"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-row" style={{ display: 'block' }}>
              <label className="label" htmlFor="image" >Image</label>
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
              <button onClick={() => navigate("/admin/products")} className="button-cancel" disabled={loadingCreate}>Cancel</button>
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