import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function View() {
  const [suppliers, setSuppliers] = useState([]);
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
  const [selectedSupplier, setSelectedSupplier] = useState(null);
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
    const fetchSuppliers = async () => {
      try {
        const response = await API.get('/supplier');
        setSuppliers(response.data);
      } catch (err) {
        setError('Failed to load suppliers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  // Toggle sorting order
  const toggleSortOrder = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Search suppliers
  const getSearchSuppliers = () => {
    return suppliers.filter(supplier => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  // Get sorted results
  const getSortedSuppliers = () => {
    const searchSuppliers = getSearchSuppliers();
    const sortedSuppliers = [...searchSuppliers].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);

      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });

    return sortedSuppliers;
  };

  const sortedSuppliers = getSortedSuppliers();

  useEffect(() => {
    setTotalPages(Math.ceil(sortedSuppliers.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, suppliers, rowsPerPage, sortConfig]);

  const getCurrentPageData = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return sortedSuppliers.slice(indexOfFirstRow, indexOfLastRow);
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
    navigate('/admin/create-supplier');
  };

  const handleUpdateClick = (supplier) => {
    navigate('/admin/update-supplier', { state: { supplier } });
  };

  const handleDeleteClick = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedSupplier) return;

    try {
      setLoadingDelete(true);
      await API.delete(`/supplier/${selectedSupplier.id}`);
      setSuppliers(prevSuppliers => prevSuppliers.filter(supplier => supplier.id !== selectedSupplier.id));
      setShowDeleteModal(false);
      setToast({
        show: true,
        message: 'Supplier deleted successfully!',
        type: 'success',
        autoHide: true,
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to delete supplier.',
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
      <h2>Supplier List</h2>
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
                placeholder="Search for suppliers..."
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
              <th>Email</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Address</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedSuppliers.length > 0 ? (
              currentPageData.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.id}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.name}</td>
                  <td>{supplier.phoneNumber}</td>
                  <td>{supplier.address}</td>
                  <td><img src={supplier.image || `${process.env.PUBLIC_URL}/default.png`} alt="Supplier" width="100" height="100"/></td>
                  <td>
                    <button type="button" onClick={() => handleUpdateClick(supplier)}>✏️</button>
                    <button type="button" onClick={() => handleDeleteClick(supplier)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Suppliers not in the list.
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
          Showing {currentPageData.length} of {sortedSuppliers.length} suppliers
        </div>
      </main>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Delete Supplier (ID: {selectedSupplier?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            Are you sure you want to delete this supplier? This action cannot be undone.
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