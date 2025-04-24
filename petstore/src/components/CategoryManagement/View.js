import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function View() {
  const [categories, setCategories] = useState([]);
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
  const [newCategoryName, setNewCategoryName] = useState(''); // State để lưu tên category mới

  // Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [updatedCategoryName, setUpdatedCategoryName] = useState(''); // State để lưu tên category được cập nhật

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/category');
        setCategories(response.data);
      } catch (err) {
        setError('Failed to load categories.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Toggle sorting order
  const toggleSortOrder = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Search categories
  const getSearchCategories = () => {
    return categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  // Get sorted results
  const getSortedCategories = () => {
    const searchCategories = getSearchCategories();
    const sortedCategories = [...searchCategories].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);
      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });
    return sortedCategories;
  };

  const sortedCategories = getSortedCategories();

  useEffect(() => {
    setTotalPages(Math.ceil(sortedCategories.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, categories, rowsPerPage, sortConfig]);

  // Get current page data
  const getCurrentPageData = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return sortedCategories.slice(indexOfFirstRow, indexOfLastRow);
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
    setNewCategoryName(''); // Reset giá trị input
    setShowCreateModal(true);
  };

  const handleUpdateClick = (category) => {
    setSelectedCategory(category);
    setUpdatedCategoryName(category.name); // Đặt giá trị ban đầu cho input
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  // Handle create category submission
  const handleCreateSubmit = async () => {
    if (!newCategoryName.trim()) {
      setToast({
        show: true,
        message: 'Category name is required.',
        type: 'error',
        autoHide: false
      });
      return;
    }

    try {
      setLoadingCreate(true);
      const response = await API.post('/category', { name: newCategoryName }, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Cập nhật danh sách categories mà không cần điều hướng
      setCategories([...categories, response.data]);
      setShowCreateModal(false);
      setToast({
        show: true,
        message: 'Category created successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to create category.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewCategoryName('');
  };

  // Handle update category submission
  const handleUpdateSubmit = async () => {
    if (!selectedCategory || !updatedCategoryName.trim()) {
      setToast({
        show: true,
        message: 'Category name is required.',
        type: 'error',
        autoHide: false
      });
      return;
    }

    try {
      setLoadingUpdate(true);
      const response = await API.put(`/category/${selectedCategory.id}`, { name: updatedCategoryName }, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Cập nhật danh sách categories
      setCategories(categories.map(category => (category.id === selectedCategory.id ? response.data : category)));
      setShowUpdateModal(false);
      setToast({
        show: true,
        message: 'Category updated successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to update category.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdatedCategoryName('');
    setSelectedCategory(null);
  };

  // Handle delete category submission
  const handleDeleteSubmit = async () => {
    if (!selectedCategory) return;

    try {
      setLoadingDelete(true);
      await API.delete(`/category/${selectedCategory.id}`);
      setCategories(categories.filter(category => category.id !== selectedCategory.id));
      setShowDeleteModal(false);
      setToast({
        show: true,
        message: 'Category deleted successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to delete category.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (error) return <div className="error-message">{error}</div>;

  const currentPageData = getCurrentPageData();

  return (
    <div>
      <h2>Category List</h2>
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
                placeholder="Search for categories..."
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
            {sortedCategories.length > 0 ? (
              currentPageData.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>
                    <button type="button" onClick={() => handleUpdateClick(category)}>✏️</button>
                    <button type="button" onClick={() => handleDeleteClick(category)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Categories not in the list.
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
          Showing {currentPageData.length} of {sortedCategories.length} categories
        </div>
      </main>

      {/* Create Category Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Create New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="name">Enter Name:</label>
            <input
              type="text"
              name="name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
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

      {/* Update Category Modal */}
      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Update Category (ID: {selectedCategory?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="name">Category Name:</label>
            <input
              type="text"
              name="name"
              value={updatedCategoryName}
              onChange={(e) => setUpdatedCategoryName(e.target.value)}
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

      {/* Delete Category Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Delete Category (ID: {selectedCategory?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            Are you sure you want to delete this category? This action cannot be undone.
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