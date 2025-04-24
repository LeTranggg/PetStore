import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/Axios';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../misc/ToastNotification';


function Home() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [products, setProducts] = useState([]);
  const [relevantFeatures, setRelevantFeatures] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedValues, setSelectedValues] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [availableValues, setAvailableValues] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true
  });
  const [showAddCartModal, setShowAddCartModal] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await API.get('/product');
      // Lọc chỉ hiển thị product có ít nhất một variant
      const filteredProducts = response.data.filter(
        (product) => product.variants && product.variants.length > 0
      );
      // Sắp xếp sản phẩm theo thời gian tạo (createdAt) giảm dần và lấy 3 sản phẩm mới nhất
      const sortedProducts = filteredProducts
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);
      setProducts(sortedProducts);
    } catch (err) {
      setError('Failed to load products.');
      console.error(err);
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found.');
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;
      setUserId(userId);

      const userResponse = await API.get(`/account/${userId}`);
      setUser(userResponse.data);
      console.log('User fetched successfully:', userResponse.data);
    } catch (err) {
      console.error('Fetch user error:', err);
      setError('Failed to load user data.');
    }
  };

  const fetchProductDetails = async (productId) => {
    try {
      const response = await API.get(`/product/${productId}`);
      if (!response.data) {
        throw new Error('No products found.');
      }
      return response.data;
    } catch (err) {
      console.error('Failed to load product details:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUser(), fetchProducts()]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddToCartClick = async (product) => {
    try {
      const productDetails = await fetchProductDetails(product.id);
      setSelectedProduct(productDetails);

      // Nếu product không có variants, không hiển thị modal (đã lọc ở fetchProducts)
      if (!productDetails.variants || productDetails.variants.length === 0) {
        setRelevantFeatures([]);
        setAvailableValues({});
        setSelectedValues({});
        setSelectedVariant(null);
        setQuantity(1);
        setShowAddCartModal(false); // Không hiển thị modal vì product đã bị lọc
        return;
      }

      const featureSet = new Set();
      const valuesByFeature = {};
      productDetails.variants.forEach((variant) => {
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
      setRelevantFeatures(featuresList);

      Object.keys(valuesByFeature).forEach((featureName) => {
        valuesByFeature[featureName] = [...valuesByFeature[featureName]];
      });

      setAvailableValues(valuesByFeature);
      setSelectedValues({});
      setSelectedVariant(null);
      setQuantity(1);
      setShowAddCartModal(true);
    } catch (err) {
      setError('Failed to load product details to add to cart.');
      console.error(err);
    }
  };

  const handleShopNowClick = (identifier) => {
    // Nếu identifier là một số hoặc chuỗi dạng ID, điều hướng đến trang chi tiết sản phẩm
    if (/^\d+$/.test(identifier) || typeof identifier === 'number') {
      navigate(`/customer/product/${identifier}`);
    } else {
      // Nếu identifier là danh mục (dog, cat, eat, sleep), điều hướng đến trang products với bộ lọc danh mục
      const categoryMap = {
        dogAccessories: 'Dog Accessories',
        catAccessories: 'Cat Accessories',
        eat: 'Eat',
        sleep: 'Sleep'
      };
      const category = categoryMap[identifier] || identifier;
      navigate(`/products?category=${encodeURIComponent(category)}`);
    }
  };

  const getFilteredValues = (featureIndex) => {
    if (!selectedProduct || !relevantFeatures[featureIndex]) return [];

    const currentFeature = relevantFeatures[featureIndex].name;
    const previousSelections = {};

    for (let i = 0; i < featureIndex; i++) {
      const featureName = relevantFeatures[i].name;
      if (selectedValues[featureName]) {
        previousSelections[featureName] = selectedValues[featureName];
      }
    }

    const filteredVariants = selectedProduct.variants.filter((variant) => {
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
    if (!selectedProduct || !relevantFeatures.length) return;

    if (Object.keys(selectedValues).length === relevantFeatures.length) {
      const variant = selectedProduct.variants.find((v) => {
        return relevantFeatures.every((feature) => {
          const value = v.values.find((val) => val.feature === feature.name)?.name;
          return value === selectedValues[feature.name];
        });
      });

      if (variant) {
        setSelectedVariant(variant);
        // Đặt lại quantity về 1 khi chọn variant mới
        setQuantity(1);
      } else {
        setSelectedVariant(null);
        setToast({
        show: true,
        message: 'This variant does not exist. Please select again.',
        type: 'error',
        autoHide: false
        });
      }
    } else {
      setSelectedVariant(null);
    }
  }, [selectedValues, selectedProduct, relevantFeatures]);

  const handleValueSelect = (featureName, value) => {
    setSelectedValues((prev) => {
      const newValues = { ...prev, [featureName]: value };
      const featureIndex = relevantFeatures.findIndex((f) => f.name === featureName);
      for (let i = featureIndex + 1; i < relevantFeatures.length; i++) {
        delete newValues[relevantFeatures[i].name];
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
        autoHide: false
      });
      return;
    }

    setLoadingAdd(true);

    try {
      if (!selectedVariant) {
        setToast({
        show: true,
        message: 'Please select all values.',
        type: 'error',
        autoHide: false
        });
        return;
      }

      if (selectedVariant.quantity === 0) {
        setToast({
        show: true,
        message: 'This variant is sold out.',
        type: 'error',
        autoHide: false
        });
        return;
      }

      const payload = {
        userId: parseInt(userId),
        variantId: selectedVariant.id,
        quantity,
      };

      console.log('Data sent to /cart/add:', payload);
      const response = await API.post('/cart/add', payload);
      console.log('Response from /cart/add:', response.data);
      setShowAddCartModal(false);
      setToast({
        show: true,
        message: 'Product added to cart successfully!',
        type: 'success',
        autoHide: true
        });
    } catch (err) {
      console.error('Failed to add to cart:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add to cart. Please try again.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleCloseAddCartModal = () => {
    setShowAddCartModal(false);
    setSelectedProduct(null);
    setRelevantFeatures([]);
    setAvailableValues({});
    setSelectedValues({});
    setSelectedVariant(null);
    setQuantity(1);
    setLoadingAdd(false);
    setToast({ show: false, message: '', type: 'success', autoHide: true });
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

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <main>
        <div>
          <img
            src={`${process.env.PUBLIC_URL}/HomeHeader.jpeg`}
            alt="header"
            height="100%"
            width="100%"
          />
        </div>

        <div className="link-container-image">
          <div className="accessory-item">
            <img
              src={`${process.env.PUBLIC_URL}/DogAcc.jpg`}
              alt="Phụ kiện cho chó"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Dog Accessories</h1>
              <button type="button" onClick={() => handleShopNowClick('dogAccessories')}>
                Shop Now
              </button>
            </div>
          </div>

          <div className="accessory-item">
            <img
              src={`${process.env.PUBLIC_URL}/CatAcc.jpeg`}
              alt="Phụ kiện cho mèo"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Cat Accessories</h1>
              <button type="button" onClick={() => handleShopNowClick('catAccessories')}>
                Shop Now
              </button>
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <div className="product-body">
            <h1>Our Newest Products</h1>
            <p>We Offer a Wide Variety of Beautiful Products</p>

            <div className="product">
              {products.map((product) => (
                <div key={product.id} className="card-list">
                  <img
                    src={product.image || `${process.env.PUBLIC_URL}/default.png`}
                    alt={product.name}
                    className="card-image"
                  />
                  <div className="card-info">
                    <h3>{product.name}</h3>
                    <p>${product.price.toFixed(2)}</p>
                    <button onClick={() => handleAddToCartClick(product)}>
                      Add To Cart
                    </button>
                    <button onClick={() => handleShopNowClick(product.id)}>
                      Shop Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="link-container-image" style={{ marginBottom: '30px' }}>
          <div className="accessory-item">
            <img
              src={`${process.env.PUBLIC_URL}/Eat.jpeg`}
              alt="Eat"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Eat</h1>
              <button type="button" onClick={() => handleShopNowClick('eat')}>
                Shop Now
              </button>
            </div>
          </div>

          <div className="accessory-item" style={{ backgroundColor: '#C8B9D9' }}>
            <img
              src={`${process.env.PUBLIC_URL}/Sleep.jpeg`}
              alt="Sleep"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Sleep</h1>
              <button type="button" onClick={() => handleShopNowClick('sleep')}>
                Shop Now
              </button>
            </div>
          </div>
        </div>

        <div>
          <img
            src={`${process.env.PUBLIC_URL}/Footer.jpeg`}
            alt="footer"
            height="100%"
            width="100%"
          />
        </div>
      </main>

      <Modal show={showAddCartModal && selectedProduct} onHide={handleCloseAddCartModal}>
        <Modal.Header closeButton>
          <Modal.Title>Variants of Product (ID: {selectedProduct?.id || 'N/A'})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {relevantFeatures.map((feature, index) => (
              <div key={feature.id}>
                <h4>{feature.name ? feature.name.toUpperCase() : 'Unknown'}</h4>
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

            {selectedVariant && selectedVariant.quantity > 0 && (
              <div className="variant-in">
                <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Varriant Information</h4>
                <table  style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                  <thead style={{ textAlign: 'center'}}>
                    <tr style={{ backgroundColor: '#f1f1f1' }}>
                      <th>Addtional Fee</th>
                      <th>Quantity</th>
                      <th>Weight (kg)</th>
                      <th>Height (cm)</th>
                      <th>Width (cm)</th>
                      <th>Length (cm)</th>
                      <th>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{selectedVariant.additionalFee.toFixed(2)}</td>
                      <td>{selectedVariant.quantity}</td>
                      <td>{selectedVariant.weight}</td>
                      <td>{selectedVariant.height}</td>
                      <td>{selectedVariant.width}</td>
                      <td>{selectedVariant.length}</td>
                      <td>
                        {selectedVariant.image && (
                          <img src={selectedVariant.image || selectedProduct.image} alt="Variant" width="50" height="50" />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="quantity-selector">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(selectedVariant.quantity, prev + 1))}
                    disabled={quantity >= selectedVariant.quantity}
                    >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant?.quantity === 0 || loadingAdd}
            className="button-save"
            style={getAddToCartButtonStyle()}
            >
            {loadingAdd ? 'Adding...' : (
              selectedVariant?.quantity === 0 ? 'Sold out' : (
                `Add To Cart | $${selectedProduct && selectedVariant
                ? ((selectedProduct.price + selectedVariant.additionalFee) * quantity).toFixed(2)
                : selectedProduct?.price.toFixed(2)}`
              )
            )}
          </button>
        </Modal.Footer>
      </Modal>

      <ToastNotification
        show={toast.show}
        onClose={handleToastClose}
        message={toast.message}
        type={toast.type}
        autoHide={toast.autoHide}
        delay={3000}
      />
    </div>
  );
}

export default Home;