import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function View() {
  const [roles, setRoles] = useState([]);
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
  const [newRoleName, setNewRoleName] = useState(''); // State để lưu tên role mới
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [updatedRoleName, setUpdatedRoleName] = useState(''); // State để lưu tên role được cập nhật
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await API.get('/role');
        setRoles(response.data);
      } catch (err) {
        setError('Failed to load roles.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Toggle sorting order
  const toggleSortOrder = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Search roles
  const getSearchRoles = () => {
    return roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  // Get sorted results
  const getSortedRoles = () => {
    const searchRoles = getSearchRoles();
    const sortedRoles = [...searchRoles].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);
      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });
    return sortedRoles;
  };

  const sortedRoles = getSortedRoles();

  useEffect(() => {
    setTotalPages(Math.ceil(sortedRoles.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, roles, rowsPerPage, sortConfig]);

  // Get current page data
  const getCurrentPageData = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return sortedRoles.slice(indexOfFirstRow, indexOfLastRow);
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
    setNewRoleName(''); // Reset giá trị input
    setShowCreateModal(true);
  };

  const handleUpdateClick = (role) => {
    setSelectedRole(role);
    setUpdatedRoleName(role.name); // Đặt giá trị ban đầu cho input
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  // Handle create role submission
  const handleCreateSubmit = async () => {
    if (!newRoleName.trim()) {
      setToast({
        show: true,
        message: 'Role name is required.',
        type: 'error',
        autoHide: false
      });
      return;
    }

    try {
      setLoadingCreate(true);
      const response = await API.post('/role', { name: newRoleName }, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Cập nhật danh sách roles mà không cần điều hướng
      setRoles([...roles, response.data]);
      setShowCreateModal(false);
      setToast({
        show: true,
        message: 'Role created successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to create role.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewRoleName('');
  };

  // Handle update role submission
  const handleUpdateSubmit = async () => {
    if (!selectedRole || !updatedRoleName.trim()) {
      setToast({
        show: true,
        message: 'Role name is required.',
        type: 'error',
        autoHide: false
      });
      return;
    }

    try {
      setLoadingUpdate(true);
      const response = await API.put(`/role/${selectedRole.id}`, { name: updatedRoleName }, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Cập nhật danh sách roles
      setRoles(roles.map(role => (role.id === selectedRole.id ? response.data : role)));
      setShowUpdateModal(false);
      setToast({
        show: true,
        message: 'Role updated successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to update role.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdatedRoleName('');
    setSelectedRole(null);
  };

  // Handle delete role submission
  const handleDeleteSubmit = async () => {
    if (!selectedRole) return;

    try {
      setLoadingDelete(true);
      await API.delete(`/role/${selectedRole.id}`);
      setRoles(roles.filter(role => role.id !== selectedRole.id));
      setShowDeleteModal(false);
      setToast({
        show: true,
        message: 'Role deleted successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to delete role.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRole(null);
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (error) return <div className="error-message">{error}</div>;

  const currentPageData = getCurrentPageData();

  return (
    <div>
      <h2>Role List</h2>
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
                placeholder="Search for roles..."
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
            {sortedRoles.length > 0 ? (
              currentPageData.map((role) => (
                <tr key={role.id}>
                  <td>{role.id}</td>
                  <td>{role.name}</td>
                  <td>
                    <button type="button" onClick={() => handleUpdateClick(role)}>✏️</button>
                    <button type="button" onClick={() => handleDeleteClick(role)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Roles not in the list.
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
          Showing {currentPageData.length} of {sortedRoles.length} roles
        </div>
      </main>

      {/* Create Role Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Create New Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="name">Enter Name:</label>
            <input
              type="text"
              name="name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
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

      {/* Update Role Modal */}
      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Update Role (ID: {selectedRole?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="name">Role Name:</label>
            <input
              type="text"
              name="name"
              value={updatedRoleName}
              onChange={(e) => setUpdatedRoleName(e.target.value)}
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

      {/* Delete Role Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Delete Role (ID: {selectedRole?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            Are you sure you want to delete this role? This action cannot be undone.
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