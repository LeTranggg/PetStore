import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function Update() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  // State cho formData, categories, error và loading
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    description: product?.description || '',
    categoryId: '',
    supplierId: '',
    image: null,
  });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });


  // Fetch categories từ API khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await API.get('/category');
        setCategories(categoryResponse.data);

        // Gán categoryId dựa trên product.category
        if (product?.category && categoryResponse.data.length > 0) {
          const productCategory = categoryResponse.data.find(category => category.name === product.category);
          if (productCategory) {
            setFormData(prev => ({ ...prev, categoryId: productCategory.id }));
          } else {
            // Nếu không tìm thấy category, gán category đầu tiên trong danh sách
            setFormData(prev => ({ ...prev, categoryId: categoryResponse.data[0].id }));
          }
        }
      } catch (err) {
        setError('Failed to load categories.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSuppliers = async () => {
      try {
        const supplierResponse = await API.get('/supplier');
        setSuppliers(supplierResponse.data);

        // Gán supplierId dựa trên product.supplier
        if (product?.supplier && supplierResponse.data.length > 0) {
          const productSuppiler = supplierResponse.data.find(supplier => supplier.name === product.supplier);
          if (productSuppiler) {
            setFormData(prev => ({ ...prev, supplierId: productSuppiler.id }));
          } else {
            // Nếu không tìm thấy supplier, gán supplier đầu tiên trong danh sách
            setFormData(prev => ({ ...prev, supplierId: supplierResponse.data[0].id }));
          }
        }
      } catch (err) {
        setError('Failed to load suppliers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchSuppliers();
  }, [product]); // Dependency là product để đảm bảo fetch categories và suppliers khi product thay đổi

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      setLoadingUpdate(true);
      const response = await API.put(`/product/${product.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate("/admin/products", {
        state: { toast: { message: 'Product updated successfully!', type: 'success' } }
      });
    } catch (err) {
      console.error('Error updating product:', err.response);
      let errorMessage = 'Failed to update product.'; // Default fallback
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

  if (!product) {
    return (
      <div>
        No product selected for update. <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div>
      <div className="function">
        <h3>Update Product (ID: {product.id})</h3>
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
                <label className="label" htmlFor="price">Price</label>
                <input
                  type="number"
                  step="1000"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="label" htmlFor="categoryId">Category</label>
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
                <label className="label" htmlFor="supplierId">Supplier</label>
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
              <button onClick={() => navigate("/admin/products")} className="button-cancel" disabled={loadingUpdate}>Cancel</button>
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