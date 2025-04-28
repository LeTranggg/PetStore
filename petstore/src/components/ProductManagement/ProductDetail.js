import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedValues, setSelectedValues] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [availableValues, setAvailableValues] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });

  const fetchProduct = async () => {
    try {
      const response = await API.get(`/product/${id}`);
      if (!response.data) {
        throw new Error('No product found.');
      }
      const productData = response.data;
      setProduct(productData);

      // Tạo danh sách features từ variant.values, tương tự Home.js
      const featureSet = new Set();
      const valuesByFeature = {};
      productData.variants.forEach((variant) => {
        variant.values.forEach((value) => {
          const featureName = value.feature;
          if (featureName) {
            featureSet.add(featureName);
            if (!valuesByFeature[featureName]) {
              valuesByFeature[featureName] = new Set();
            }
            valuesByFeature[featureName].add(value.name);
          }
        });
      });

      const featuresList = [...featureSet]
        .filter((featureName) => featureName != null)
        .map((featureName, index) => ({
          id: index + 1,
          name: featureName,
        }));
      setFeatures(featuresList);

      Object.keys(valuesByFeature).forEach((featureName) => {
        valuesByFeature[featureName] = [...valuesByFeature[featureName]];
      });

      setAvailableValues(valuesByFeature);
      console.log('Available values:', valuesByFeature);
    } catch (err) {
      console.error('Failed to load product details:', err);
      throw err;
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;
      setUserId(userId);

      const userResponse = await API.get(`/account/${userId}`);
      setUser(userResponse.data);
      console.log('User fetched successfully:', userResponse.data);
    } catch (err) {
      console.error('Fetch user error:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([fetchProduct(), fetchUser()]);
      } catch (err) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const getFilteredValues = (featureIndex) => {
    if (!product || !features[featureIndex]) return [];

    const currentFeature = features[featureIndex].name;
    const previousSelections = {};

    for (let i = 0; i < featureIndex; i++) {
      const featureName = features[i].name;
      if (selectedValues[featureName]) {
        previousSelections[featureName] = selectedValues[featureName];
      }
    }

    const filteredVariants = product.variants.filter((variant) => {
      return Object.keys(previousSelections).every((featureName) => {
        const value = variant.values.find((v) => v.feature === featureName)?.name;
        return value === previousSelections[featureName];
      });
    });

    const available = new Set();
    filteredVariants.forEach((variant) => {
      const value = variant.values.find((v) => v.feature === currentFeature)?.name;
      if (value) {
        available.add(value);
      }
    });

    return [...available];
  };

  useEffect(() => {
    if (!product || !features.length) return;

    if (Object.keys(selectedValues).length === features.length) {
      const variant = product.variants.find((v) => {
        return features.every((feature) => {
          const value = v.values.find((val) => val.feature === feature.name)?.name;
          return value === selectedValues[feature.name];
        });
      });

      if (variant) {
        setSelectedVariant(variant);
        setQuantity(1);
      } else {
        setSelectedVariant(null);
        setToast({
          show: true,
          message: 'This variant does not exist. Please select again.',
          type: 'error',
          autoHide: false,
        });
      }
    } else {
      setSelectedVariant(null);
    }
  }, [selectedValues, product, features]);

  const handleValueSelect = (featureName, value) => {
    setSelectedValues((prev) => {
      const newValues = { ...prev, [featureName]: value };
      const featureIndex = features.findIndex((f) => f.name === featureName);
      for (let i = featureIndex + 1; i < features.length; i++) {
        delete newValues[features[i].name];
      }
      return newValues;
    });
  };

  const handleAddToCart = async () => {
    if (!user || !userId) {
      setToast({
        show: true,
        message: 'Please login to add products to cart.',
        type: 'error',
        autoHide: false,
      });
      navigate('/login');
      return;
    }

    setLoadingAdd(true);

    try {
      if (!selectedVariant) {
        setToast({
          show: true,
          message: 'Please select all values.',
          type: 'error',
          autoHide: false,
        });
        return;
      }

      if (selectedVariant.quantity === 0) {
        setToast({
          show: true,
          message: 'This variant is sold out.',
          type: 'error',
          autoHide: false,
        });
        return;
      }

      const payload = {
        userId: parseInt(userId),
        variantId: selectedVariant.id,
        quantity,
      };

      console.log('Adding to cart with payload:', payload);
      const response = await API.post('/cart/add', payload);
      console.log('Add to cart response:', response.data);
      setToast({
        show: true,
        message: 'Product added to cart successfully!',
        type: 'success',
        autoHide: true,
      });
    } catch (err) {
      console.error('Failed to add to cart:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add to cart. Please try again.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error',
        autoHide: false,
      });
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleToastClose = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Hàm để xác định style của nút "Add To Cart" trong modal
  const getAddToCartButtonStyle = () => {
    if (!selectedVariant) {
      return { backgroundColor: '#C8C9CB' }; // Màu xám khi chưa chọn variant
    }
    if (selectedVariant.quantity === 0) {
      return { backgroundColor: '#EB2606' }; // Màu đỏ khi sold out
    }
    return { backgroundColor: '#12967A' }; // Màu xanh khi chọn đúng variant và còn hàng
  };

  if (error) return <div className="error-message">{error}</div>;

  if (!product) {
    return (
      <div>
        No product selected found. <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <div className="product-detail-image">
          <img
            src={product.image || `${process.env.PUBLIC_URL}/default.png`}
            alt={product.name}
            style={{
              width: '500px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              objectFit: 'cover',
            }}
          />
        </div>

        <div className="product-detail-content">
          <h1>{product.name}</h1>
          <h5 style={{ color: '#EB2606', fontWeight: 'bold', marginBottom: '10px' }}>
            {product.price.toLocaleString('vi-VN')} VND
          </h5>
          <div style={{ margin: '20px 0px' }}>
            {features.map((feature, index) => (
              <div key={feature.id} className="variant-group">
                <h4 style={{ fontSize: '15px' }}>{feature.name.toUpperCase()}</h4>
                <div className="variant-options">
                  {(index === 0 ? availableValues[feature.name] || [] : getFilteredValues(index)).map((value) => (
                    <button
                      key={value}
                      className={`variant-button ${selectedValues[feature.name] === value ? 'selected' : ''}`}
                      onClick={() => handleValueSelect(feature.name, value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedVariant && selectedVariant.quantity > 0 && (
            <div className="variant-info">
              <div>
                {selectedVariant.image && (
                  <img
                    src={selectedVariant.image || product.image}
                    alt="Variant"
                    style={{ width: '50px', height: '50px', borderRadius: '5px' }}
                  />
                )}
              </div>
              <p>Quantity: {selectedVariant.quantity}</p>
            </div>
          )}

          <div className="quantity-selector">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              disabled={quantity <= 1}
              >
              -
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              disabled={selectedVariant && quantity >= selectedVariant.quantity}
              >
              +
            </button>
          </div>

          <div className="action-buttons" style={{ width: '600px', marginLeft: '30px' }}>
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant?.quantity === 0 || loadingAdd}
              className="button-save"
              style={getAddToCartButtonStyle()}
              >
              {loadingAdd ? 'Adding...' : (
                selectedVariant?.quantity === 0 ? 'Sold out' : (
                  `Add To Cart | ${selectedVariant
                    ? ((product.price + selectedVariant.additionalFee) * quantity).toLocaleString('vi-VN')
                    : product.price.toLocaleString('vi-VN')} VND`
                )
              )}
            </button>
            <button
              onClick={() => navigate('/customer')}
              className="button-cancel"
            >
              Back To Home
            </button>
          </div>

        </div>

      </div>

      <div className="product-detail-info">
        <h3>Description</h3>
        <p>{product.description || 'N/A'}</p>
        <p style={{ fontSize: '16px', marginBottom: '5px' }}>
          Category: <span style={{ fontWeight: 'bold' }}>{product.category}</span>
        </p>
        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          Supplier: <span style={{ fontWeight: 'bold' }}>{product.supplier}</span>
        </p>
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

export default ProductDetail;