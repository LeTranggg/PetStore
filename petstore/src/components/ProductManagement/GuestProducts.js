import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useNavigate, useLocation } from 'react-router-dom';

function GuestProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  // Fetch products and handle search query
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchProducts();

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

  const handleAddToCartClick = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleShopNowClick = (identifier) => {
    // Nếu identifier là một số hoặc chuỗi dạng ID, điều hướng đến trang chi tiết sản phẩm
    if (/^\d+$/.test(identifier) || typeof identifier === 'number') {
      navigate('/login');
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
                <img src={product.image || `${process.env.PUBLIC_URL}/Default.png`} alt={product.name} />
                <h4>{product.name}</h4>
                <p>{product.price.toLocaleString('vi-VN')} VND</p>
                <button onClick={() => handleAddToCartClick()} >
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

        {currentPageData.length > 0 && (
          <div className="pagination" style={{ marginBottom: '20px' }}>
            {renderPaginationButtons()}
          </div>
        )}
      </div>
    </div>
  );
}

export default GuestProducts;