import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function View() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Sort
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState(''); // State để lưu tên feature mới

  // Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [updatedFeatureName, setUpdatedFeatureName] = useState(''); // State để lưu tên feature được cập nhật

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await API.get('/feature');
        setFeatures(response.data);
      } catch (err) {
        setError('Failed to load features.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatures();
  }, []);

  // Toggle sorting order
  const toggleSortOrder = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Search features
  const getSearchFeatures = () => {
    return features.filter(feature => {
      const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  // Get sorted results
  const getSortedFeatures = () => {
    const searchFeatures = getSearchFeatures();
    const sortedFeatures = [...searchFeatures].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);
      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });
    return sortedFeatures;
  };

  const sortedFeatures = getSortedFeatures();

  useEffect(() => {
    setTotalPages(Math.ceil(sortedFeatures.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, features, rowsPerPage, sortConfig]);

  // Get current page data
  const getCurrentPageData = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return sortedFeatures.slice(indexOfFirstRow, indexOfLastRow);
  };

  // Page navigation
  const goToPage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Pagination controls UI
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <button key="prev" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
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
        disabled={currentPage === totalPages}>
        ▷
      </button>
    );

    return buttons;
  };

  const handleCreateClick = () => {
    setNewFeatureName(''); // Reset giá trị input
    setShowCreateModal(true);
  };

  const handleUpdateClick = (feature) => {
    setSelectedFeature(feature);
    setUpdatedFeatureName(feature.name); // Đặt giá trị ban đầu cho input
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (feature) => {
    setSelectedFeature(feature);
    setShowDeleteModal(true);
  };

  // Handle create feature submission
  const handleCreateSubmit = async () => {
    if (!newFeatureName.trim()) {
      setToast({
        show: true,
        message: 'Feature name is required.',
        type: 'error',
        autoHide: false
      });
      return;
    }

    try {
      setLoadingCreate(true);
      const response = await API.post('/feature', { name: newFeatureName }, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Cập nhật danh sách features mà không cần điều hướng
      setFeatures([...features, response.data]);
      setShowCreateModal(false);
      setToast({
        show: true,
        message: 'Feature created successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      console.error('Error creating feature:', err.response);
      let errorMessage = 'Failed to create feature.'; // Default fallback
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
      setLoadingCreate(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewFeatureName('');
  };

  // Handle update feature submission
  const handleUpdateSubmit = async () => {
    if (!selectedFeature || !updatedFeatureName.trim()) {
      setToast({
        show: true,
        message: 'Feature name is required.',
        type: 'error',
        autoHide: false
      });
      return;
    }

    try {
      setLoadingUpdate(true);
      const response = await API.put(`/feature/${selectedFeature.id}`, { name: updatedFeatureName }, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Cập nhật danh sách features
      setFeatures(features.map(feature => (feature.id === selectedFeature.id ? response.data : feature)));
      setShowUpdateModal(false);
      setToast({
        show: true,
        message: 'Feature updated successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      console.error('Error updating feature:', err.response);
      let errorMessage = 'Failed to update feature.'; // Default fallback
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

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdatedFeatureName('');
    setSelectedFeature(null);
  };

  // Handle delete feature submission
  const handleDeleteSubmit = async () => {
    if (!selectedFeature) return;

    try {
      await API.delete(`/feature/${selectedFeature.id}`);
      setFeatures(features.filter(feature => feature.id !== selectedFeature.id));
      setShowDeleteModal(false);
      setToast({
        show: true,
        message: 'Feature deleted successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to delete feature.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedFeature(null);
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (error) return <div className="error-message">{error}</div>;

  const currentPageData = getCurrentPageData();

  return (
    <div>
      <h2>Feature List</h2>
      <main>
        <div className="table-header">
          <div className="action-bar">
            <button type="button" onClick={handleCreateClick}>+</button>
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
                placeholder="Search for features..."
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedFeatures.length > 0 ? (
              currentPageData.map((feature) => (
                <tr key={feature.id}>
                  <td>{feature.id}</td>
                  <td>{feature.name}</td>
                  <td>
                    <button type="button" onClick={() => handleUpdateClick(feature)}>✏️</button>
                    <button type="button" onClick={() => handleDeleteClick(feature)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Features not in the list.
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
          Showing {currentPageData.length} of {sortedFeatures.length} features
        </div>
      </main>

      {/* Create Feature Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Create New Feature</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="name">Enter Name:</label>
            <input
              type="text"
              name="name"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-save" onClick={handleCreateSubmit} disabled={loadingCreate}>
            {loadingCreate ? 'Creating...' : 'Create'}
          </button>
          <button className="button-cancel" onClick={handleCloseCreateModal} disabled={loadingCreate}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>

      {/* Update Feature Modal */}
      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Update Feature (ID: {selectedFeature?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="name">Feature Name:</label>
            <input
              type="text"
              name="name"
              value={updatedFeatureName}
              onChange={(e) => setUpdatedFeatureName(e.target.value)}
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-save" onClick={handleUpdateSubmit} disabled={loadingUpdate}>
            {loadingUpdate ? 'Updating...' : 'Update'}
          </button>
          <button className="button-cancel" onClick={handleCloseUpdateModal} disabled={loadingUpdate}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Feature Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Delete Feature (ID: {selectedFeature?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            Are you sure you want to delete this feature? This action cannot be undone.
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-danger" onClick={handleDeleteSubmit} disabled={loadingDelete}>
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