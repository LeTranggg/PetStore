import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function View() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Sort
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [totalPages, setTotalPages] = useState(1);

  // Filter
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    supplier: []
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSuppliers, setAvailableSuppliers] = useState([]);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Check for toast message from Create.js or Update.js
  useEffect(() => {
    if (location.state?.toast) {
      setToast({
        show: true,
        message: location.state.toast.message,
        type: location.state.toast.type,
        autoHide: true,
      });
      // Clear the state to prevent re-showing the toast on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get('/product');
        setProducts(response.data);

        const categories = [...new Set(response.data.map(product => product.category))];
        const suppliers = [...new Set(response.data.map(product => product.supplier))];

        setAvailableCategories(categories);
        setAvailableSuppliers(suppliers);
      } catch (err) {
        setError('Failed to load products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleSortOrder = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filters.category.length === 0 || filters.category.includes(product.category);
      const matchesSupplier = filters.supplier.length === 0 || filters.supplier.includes(product.supplier);

      return matchesSearch && matchesCategory && matchesSupplier;
    });
  };

  const getFilteredAndSortedProducts = () => {
    const filteredProducts = getFilteredProducts();
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);

      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });

    return sortedProducts;
  };

  const filteredAndSortedProducts = getFilteredAndSortedProducts();

  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedProducts.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, filters, products, rowsPerPage, sortConfig]);

  const getCurrentPageData = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return filteredAndSortedProducts.slice(indexOfFirstRow, indexOfLastRow);
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

  const handleCreateClick = () => {
    navigate('/admin/create-product');
  };

  const handleUpdateClick = (product) => {
    navigate('/admin/update-product', { state: { product } });
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedProduct) return;

    try {
      setLoadingDelete(true);
      await API.delete(`/product/${selectedProduct.id}`);
      setProducts(prevProducts => prevProducts.filter(product => product.id !== selectedProduct.id));
      setShowDeleteModal(false);
      setToast({
        show: true,
        message: 'User deleted successfully!',
        type: 'success',
        autoHide: true,
      });
      setTimeout(() => window.location.reload(), 0);
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to delete user.',
        type: 'error',
        autoHide: false,
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const currentPageData = getCurrentPageData();

  return (
    <div>
      <h2>Product List</h2>
      <main>
        <div className="table-header">
          <div className="action-bar">
            <button type="button" onClick={() => handleCreateClick()}>+</button>
            <button
              type="button"
              onClick={toggleSortOrder}
              title={`Sort by ID (${sortConfig.direction === 'ascending' ? 'Low to High' : 'High to Low'})`}
            >
              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
            </button>
          </div>

          <div className="search-bar">
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <input
                className="search-in"
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        </div>

        <table className="table-body">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>
                <div className="filter-dropdown">
                  Category
                  <span
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="filter-label"
                  >
                    {showCategoryDropdown ? "↑" : "↓"}
                  </span>
                  {showCategoryDropdown && (
                    <ul className="dropdown-content">
                      {availableCategories.map(category => (
                        <label key={category} className="dropdown-item">
                          <li>
                            <input
                              type="checkbox"
                              checked={filters.category.includes(category)}
                              onChange={() => handleFilterChange('category', category)}
                            />
                            {category}
                          </li>
                        </label>
                      ))}
                    </ul>
                  )}
                </div>
              </th>
              <th>
                <div className="filter-dropdown">
                  Supplier
                  <span
                    onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
                    className="filter-label"
                  >
                    {showSupplierDropdown ? "↑" : "↓"}
                  </span>
                  {showSupplierDropdown && (
                    <ul className="dropdown-content">
                      {availableSuppliers.map(supplier => (
                        <label key={supplier} className="dropdown-item">
                          <li>
                            <input
                              type="checkbox"
                              checked={filters.supplier.includes(supplier)}
                              onChange={() => handleFilterChange('supplier', supplier)}
                            />
                            {supplier}
                          </li>
                        </label>
                      ))}
                    </ul>
                  )}
                </div>
              </th>
              <th>Description</th>
              <th>Variants</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.length > 0 ? (
              currentPageData.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.supplier}</td>
                  <td>{product.description}</td>
                  <td>
                    {product.variants?.length > 0
                      ? product.variants.map(variant =>
                          variant.values?.map(value => value.name).join(' + ') || 'N/A'
                        ).join(', ')
                      : 'N/A'}
                  </td>
                  <td><img src={product.image || `${process.env.PUBLIC_URL}/default.png`} alt="Product" width="100" height="100"/></td>
                  <td>
                    <button type="button" onClick={() => handleUpdateClick(product)}>✏️</button>
                    <button type="button" onClick={() => handleDeleteClick(product)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Products not in the list.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          {renderPaginationButtons()}
        </div>

        <div>
          Page {currentPage} of {totalPages} |
          Showing {currentPageData.length} of {filteredAndSortedProducts.length} products
          {(filters.category.length > 0 || filters.supplier.length > 0) && (
            <span> (filtered from {products.length} total products)</span>
          )}
        </div>
      </main>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Delete Product (ID: {selectedProduct?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            Are you sure you want to delete this product? This action cannot be undone.
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-danger" onClick={handleDeleteSubmit}  disabled={loadingDelete}>
            {loadingDelete ? 'Deleting...' : 'Delete'}
          </button>
          <button className="button-cancel" onClick={handleCloseDeleteModal} disabled={loadingDelete}>
            Cancel
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

export default View;