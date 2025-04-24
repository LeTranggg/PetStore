import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function View() {
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
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
    const fetchVariants = async () => {
      try {
        const response = await API.get('/variant');
        setVariants(response.data);
      } catch (err) {
        setError('Failed to load variants.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVariants();
  }, []);

  const toggleSortOrder = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const getSearchVariants = () => {
    return variants.filter(variant => {
      const matchesSearch =
        variant.product.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  };

  const getSortedVariants = () => {
    const searchVariants = getSearchVariants();
    const sortedVariants = [...searchVariants].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);

      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });

    return sortedVariants;
  };

  const sortedVariants = getSortedVariants();

  useEffect(() => {
    setTotalPages(Math.ceil(sortedVariants.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, variants, rowsPerPage, sortConfig]);

  const getCurrentPageData = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return sortedVariants.slice(indexOfFirstRow, indexOfLastRow);
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

  const handleCreateClick = () => {
    navigate('/admin/create-variant');
  };

  const handleUpdateClick = (variant) => {
    navigate('/admin/update-variant', { state: { variant } });
  };

  const handleDeleteClick = (variant) => {
    setSelectedVariant(variant);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedVariant) return;

    try {
      setLoadingDelete(true);
      await API.delete(`/variant/${selectedVariant.id}`);
      setVariants(prevVariants => prevVariants.filter(variant => variant.id !== selectedVariant.id));
      setShowDeleteModal(false);
      setToast({
        show: true,
        message: 'Variant deleted successfully!',
        type: 'success',
        autoHide: true,
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to delete variant.',
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

   if (error) return <div className="error-message">{error}</div>;

  const currentPageData = getCurrentPageData();

  return (
    <div>
      <h2>Variant List</h2>
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
                placeholder="Search for variants by products..."
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
              <th>Product</th>
              <th>Values</th>
              <th>Additional Fee</th>
              <th>Quantity</th>
              <th>Weight</th>
              <th>Height</th>
              <th>Width</th>
              <th>Length</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedVariants.length > 0 ? (
              currentPageData.map((variant) => (
                <tr key={variant.id}>
                  <td>{variant.id}</td>
                  <td>{variant.product}</td>
                  <td>{variant.values?.map(value => value.name).join(', ') || 'N/A'}</td>
                  <td>{variant.additionalFee}</td>
                  <td>{variant.quantity}</td>
                  <td>{variant.weight}</td>
                  <td>{variant.height}</td>
                  <td>{variant.width}</td>
                  <td>{variant.length}</td>
                  <td><img src={variant.image || `${process.env.PUBLIC_URL}/default.png`} alt="Variant" width="100" height="100"/> </td>
                  <td>
                    <button type="button" onClick={() => handleUpdateClick(variant)}>✏️</button>
                    <button type="button" onClick={() => handleDeleteClick(variant)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Variants not in the list.
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
          Showing {currentPageData.length} of {sortedVariants.length} variants
        </div>
      </main>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Delete Variant (ID: {selectedVariant?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            Are you sure you want to delete this variant? This action cannot be undone.
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