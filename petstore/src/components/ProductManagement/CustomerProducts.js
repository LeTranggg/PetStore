import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function CustomerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Sort
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filter
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    supplier: [],
    priceRange: [0, 0],
    searchKeyword: ''
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSuppliers, setAvailableSuppliers] = useState([]);

  // Add to Cart Modal
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [relevantFeatures, setRelevantFeatures] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedValues, setSelectedValues] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [availableValues, setAvailableValues] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showAddCartModal, setShowAddCartModal] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await API.get('/product');
      console.log('API response:', response.data);
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid product data.');
      }
      const filteredProducts = response.data.filter(
        (product) => product.variants && product.variants.length > 0
      );
      console.log('Filtered products (variants):', filteredProducts);
      setProducts(filteredProducts);

      // Extract unique categories and suppliers
      const categories = [...new Set(filteredProducts.map(product => product.category || 'Unknown'))];
      const suppliers = [...new Set(filteredProducts.map(product => product.supplier || 'Unknown'))];
      console.log('Categories:', categories);
      console.log('Suppliers:', suppliers);
      setAvailableCategories(categories);
      setAvailableSuppliers(suppliers);

      // Tính toán phạm vi giá mặc định
      if (filteredProducts.length > 0) {
        const prices = filteredProducts.map(product => product.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setFilters(prevFilters => ({
          ...prevFilters,
          priceRange: [minPrice, maxPrice]
        }));
      }
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Fetch products error:', err);
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
      setError('Failed to load user data');
    }
  };

  // Fetch products and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchUser(), fetchProducts()]);

        // Đọc từ khóa tìm kiếm và danh mục từ URL
        const queryParams = new URLSearchParams(location.search);
        const searchKeyword = queryParams.get('search') || '';
        const category = queryParams.get('category') || '';

        setFilters(prevFilters => ({
          ...prevFilters,
          searchKeyword: searchKeyword.toLowerCase().trim(), // Loại bỏ khoảng trắng thừa
          category: category ? [category] : prevFilters.category // Áp dụng bộ lọc danh mục từ URL
        }));
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search]);

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

  // Handle Add to Cart Click
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
        setShowAddCartModal(false);
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
    setToast({
      show: false,
      message: '',
      type: 'success',
      autoHide: true
    });
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

  const getFilteredProducts = () => {
    const filtered = products.filter(product => {
      const matchesCategory = filters.category.length === 0 || filters.category.includes(product.category);
      const matchesSupplier = filters.supplier.length === 0 || filters.supplier.includes(product.supplier);
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const matchesSearch = filters.searchKeyword.trim() !== ''
        ? product.name.toLowerCase().includes(filters.searchKeyword)
        : true;
      return matchesCategory && matchesSupplier && matchesPrice && matchesSearch;
    });
    console.log('Filtered products (after all filters):', filtered);
    return filtered;
  };

  const getFilteredAndSortedProducts = () => {
    const filteredProducts = getFilteredProducts();
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      let aValue, bValue;
      if (sortConfig.key === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortConfig.key === 'price') {
        aValue = a.price;
        bValue = b.price;
      } else if (sortConfig.key === 'rating') {
        aValue = a.rating || 0;
        bValue = b.rating || 0;
      }

      if (sortConfig.direction === 'ascending') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    return sortedProducts;
  };

  const filteredAndSortedProducts = getFilteredAndSortedProducts();

  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedProducts.length / productsPerPage) || 1);
    setCurrentPage(1);
  }, [filters, products, sortConfig]);

  const getCurrentPageData = () => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredAndSortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  };

  const goToPage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ◁
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={i === currentPage ? "active" : ""}
          onClick={() => goToPage(i)}
        >
          {i}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ▷
      </button>
    );

    return buttons;
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[filterType];
      if (currentValues.includes(value)) {
        return {
          ...prevFilters,
          [filterType]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prevFilters,
          [filterType]: [...currentValues, value]
        };
      }
    });
  };

  const handlePriceRangeChange = (e, index) => {
    const newPriceRange = [...filters.priceRange];
    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
    newPriceRange[index] = value;
    setFilters(prevFilters => ({
      ...prevFilters,
      priceRange: newPriceRange
    }));
  };

  const handleSortChange = (e) => {
    const [key, direction] = e.target.value.split('-');
    setSortConfig({ key, direction });
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (error) return <div className="error-message">{error}</div>;

  const currentPageData = getCurrentPageData();

  return (
    <div className="products-container">
      <div className="filter-bar">
        <div className="filter-section">
          <h3>
            Categories
            <span
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="dropdown-arrow"
            >
              {showCategoryDropdown ? "↑" : "↓"}
            </span>
          </h3>
          {showCategoryDropdown && (
            <ul className="filter-list">
              {availableCategories.length > 0 ? (
                availableCategories.map(category => (
                  <li key={category}>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category)}
                        onChange={() => handleFilterChange('category', category)}
                      />
                      {category}
                    </label>
                  </li>
                ))
              ) : (
                <li>No categories found.</li>
              )}
            </ul>
          )}
        </div>

        <div className="filter-section">
          <h3>
            Suppliers
            <span
              onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
              className="dropdown-arrow"
            >
              {showSupplierDropdown ? "↑" : "↓"}
            </span>
          </h3>
          {showSupplierDropdown && (
            <ul className="filter-list">
              {availableSuppliers.length > 0 ? (
                availableSuppliers.map(supplier => (
                  <li key={supplier}>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={filters.supplier.includes(supplier)}
                        onChange={() => handleFilterChange('supplier', supplier)}
                      />
                      {supplier}
                    </label>
                  </li>
                ))
              ) : (
                <li>No suppliers found.</li>
              )}
            </ul>
          )}
        </div>

        <div className="filter-section">
          <h3>Price Range</h3>
          <div className="price-range-inputs">
            <input
              type="number"
              min="0"
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceRangeChange(e, 0)}
              placeholder="Min Price"
            />
            <span>to</span>
            <input
              type="number"
              min="0"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceRangeChange(e, 1)}
              placeholder="Max Price"
            />
          </div>
        </div>
      </div>

      <div className="products-content">
        <div className="products-header">
          <span>Products found {filteredAndSortedProducts.length}</span>
          <select onChange={handleSortChange} defaultValue="name-ascending" className="form-select">
            <option value="name-ascending">Name: A to Z</option>
            <option value="name-descending">Name: Z to A</option>
            <option value="price-ascending">Price: Low to High</option>
            <option value="price-descending">Price: High to Low</option>
            <option value="rating-descending">Rating: High to Low</option>
            <option value="rating-ascending">Rating: Low to High</option>
          </select>
        </div>

        <div className="products-grid">
          {currentPageData.length > 0 ? (
            currentPageData.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image || `${process.env.PUBLIC_URL}/default.png`} alt={product.name} />
                <h4>{product.name}</h4>
                <p>{product.price.toLocaleString('vi-VN')} VND</p>
                <button onClick={() => handleAddToCartClick(product)}>
                  Add to Cart
                </button>
                <button onClick={() => handleShopNowClick(product.id)}>
                  Shop Now
                </button>
              </div>
            ))
          ) : (
            <div className="no-products">
              No products found.
            </div>
          )}
        </div>

        <div className="pagination">
          {renderPaginationButtons()}
        </div>
      </div>

      {/* Add to Cart Modal */}
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
                <div>
                  {selectedVariant.image && (
                    <img src={selectedVariant.image || selectedProduct.image} alt="Variant" width="50" height="50" />
                  )}
                </div>
                <p>Quantity: {selectedVariant.quantity}</p>
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
            disabled={!selectedVariant || selectedVariant.quantity === 0}
            className="button-save"
            style={getAddToCartButtonStyle()}
            >
            {loadingAdd ? 'Adding...' : (
              selectedVariant?.quantity === 0 ? 'Sold out' : (
                `Add To Cart | ${selectedProduct && selectedVariant
                ? ((selectedProduct.price + selectedVariant.additionalFee) * quantity)
                : selectedProduct?.price}`
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
        delay={30000}
      />
    </div>
  );
}

export default CustomerProducts;