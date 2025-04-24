import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../../misc/ToastNotification';

function Create({ onVariantCreated }) {
  const [formData, setFormData] = useState({
    additionalFee: '',
    quantity: '',
    weight: '',
    height: '',
    width: '',
    length: '',
    productId: '',
    image: null,
    valueIds: [],
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
  const [products, setProducts] = useState([]);
  const [values, setValues] = useState([]);
  const [groupedValues, setGroupedValues] = useState({});
  const [selectedFeatures, setSelectedFeatures] = useState({}); // State để lưu các feature được chọn

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, valueResponse] = await Promise.all([
          API.get('/product'),
          API.get('/value')
        ]);

        setProducts(productResponse.data);
        setValues(valueResponse.data);

        const grouped = valueResponse.data.reduce((acc, value) => {
          const feature = value.feature;
          if (!acc[feature]) {
            acc[feature] = [];
          }
          acc[feature].push(value);
          return acc;
        }, {});
        setGroupedValues(grouped);

        // Khởi tạo selectedFeatures (mặc định không chọn feature nào)
        const initialSelectedFeatures = {};
        Object.keys(grouped).forEach(feature => {
          initialSelectedFeatures[feature] = false;
        });
        setSelectedFeatures(initialSelectedFeatures);

        if (productResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, productId: productResponse.data[0].id }));
        }
      } catch (err) {
        setError('Failed to load data.');
        console.error('Error:', err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleFeatureChange = (feature) => {
    setSelectedFeatures(prev => {
      const newSelectedFeatures = { ...prev, [feature]: !prev[feature] };
      // Nếu bỏ chọn feature, xóa các valueIds thuộc feature đó
      if (!newSelectedFeatures[feature]) {
        const updatedValueIds = formData.valueIds.filter(id => {
          const value = values.find(v => v.id === id);
          return value && value.feature !== feature;
        });
        setFormData(prevForm => ({ ...prevForm, valueIds: updatedValueIds }));
      }
      return newSelectedFeatures;
    });
  };

  const handleValueChange = (valueId, feature) => {
    setFormData(prev => {
      const otherFeatureValueIds = prev.valueIds.filter(id => {
        const value = values.find(v => v.id === id);
        return value && value.feature !== feature;
      });
      const newValueIds = [...otherFeatureValueIds, valueId];
      return { ...prev, valueIds: newValueIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'valueIds') {
        formData.valueIds.forEach(valueId => data.append('ValueIds', valueId));
      } else if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      setLoadingCreate(true);
      const response = await API.post('/variant', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (typeof onVariantCreated === 'function') {
        onVariantCreated(response.data);
      }
      setFormData({
        additionalFee: '',
        quantity: '',
        weight: '',
        height: '',
        width: '',
        length: '',
        productId: '',
        image: null,
        valueIds: [],
      });
      setSelectedFeatures(
        Object.keys(groupedValues).reduce((acc, feature) => {
          acc[feature] = false;
          return acc;
        }, {})
      );
      navigate("/admin/variants", {
        state: { toast: { message: 'Variants created successfully!', type: 'success' } }
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to create variant.',
        type: 'error',
        autoHide: false,
      });
      console.error('Error creating variant:', err.message || err);
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

   if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <div className="function">
        <h3>Create New Variant</h3>
        <form onSubmit={handleSubmit}>
          <div className="function-container">
            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="label">Values (Select one value per feature)</label>
                <div className="values-container">
                  {Object.keys(groupedValues).map(feature => (
                    <div key={feature} className="feature-group">
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFeatures[feature] || false}
                          onChange={() => handleFeatureChange(feature)}
                        />
                        <strong>{feature}</strong>
                      </label>
                      {selectedFeatures[feature] && (
                        <div className="values-list">
                          {groupedValues[feature].map(value => (
                            <label key={value.id} className="chip">
                              <input
                                type="checkbox"
                                checked={formData.valueIds.includes(value.id)}
                                onChange={() => handleValueChange(value.id, feature)}
                              />
                              <span className="chip-content">{value.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group col-md-6">
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label className="label" htmlFor="weight">Weight</label>
                    <input
                      type="number"
                      step="0.001"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label className="label" htmlFor="height">Height</label>
                    <input
                      type="number"
                      step="0.1"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label className="label" htmlFor="width">Width</label>
                    <input
                      type="number"
                      step="0.1"
                      name="width"
                      value={formData.width}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label className="label" htmlFor="length">Length</label>
                    <input
                      type="number"
                      step="0.1"
                      name="length"
                      value={formData.length}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="label" htmlFor="additionalFee">Additional Fee</label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  name="additionalFee"
                  value={formData.additionalFee}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label className="label" htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="label" htmlFor="product">Product</label>
                <select
                  className="form-select"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
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
              <button onClick={() => navigate("/admin/variants")} className="button-cancel" disabled={loadingCreate}>Cancel</button>
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