import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function View() {
  const [values, setValues] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState("");
  const value = location.state?.value;
  const [features, setFeatures] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    featureId: '',
  });

  // Sort
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);

  // Filter
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);
  const [filters, setFilters] = useState({
      feature: [],
    });
  const [availableFeatures, setAvailableFeatures] = useState([]);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newValueName, setNewValueName] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatedValueName, setUpdatedValueName] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchValues = async () => {
      try {
        const response = await API.get('/value');
        setValues(response.data);

        const features = [...new Set(response.data.map(value => value.feature))];

        setAvailableFeatures(features);
      } catch (err) {
        setError('Failed to load values.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeatures = async () => {
      try {
        const featureResponse = await API.get('/feature');
        setFeatures(featureResponse.data);
        // Đặt featureId mặc định là feature đầu tiên nếu danh sách không rỗng
        if (featureResponse.data.length > 0) {
          // Nếu có value và feature tương ứng, ưu tiên sử dụng feature đó
          if (value?.feature) {
            const valueFeature = featureResponse.data.find(feature => feature.name === value.feature);
            setFormData(prev => ({
              ...prev,
              featureId: valueFeature ? valueFeature.id : featureResponse.data[0].id,
            }));
          } else {
            setFormData(prev => ({ ...prev, featureId: featureResponse.data[0].id }));
          }
        }
      } catch (err) {
        setError('Failed to load features.');
        console.error('Error fetching features:', err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchValues();
    fetchFeatures();
  }, [value]);

  // Toggle sorting order
  const toggleSortOrder = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Filtered values
  const getFilteredValues = () => {
    return values.filter(value => {
      const matchesSearch =
        value.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFeature = filters.feature.length === 0 || filters.feature.includes(value.feature);

      return matchesSearch && matchesFeature;
    });
  };

  // Get sorted results
  const getFilteredAndSortedValues = () => {
    const filteredValues = getFilteredValues();
    const sortedValues = [...filteredValues].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);

      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });

    return sortedValues;
  };

  const filteredAndSortedValues = getFilteredAndSortedValues();

  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedValues.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, filters, values, rowsPerPage, sortConfig]);

  const getCurrentPageData = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return filteredAndSortedValues.slice(indexOfFirstRow, indexOfLastRow);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateClick = () => {
  setNewValueName('');

  // Set featureId to the first feature when creating a new value
  if (features.length > 0) {
    setFormData(prev => ({ ...prev, featureId: features[0].id, }));
  }

  setShowCreateModal(true);
};

const handleUpdateClick = (value) => {
  setSelectedValue(value);
  setUpdatedValueName(value.name);

  // Find featureId based on the feature name from the selected value
  const selectedFeature = features.find(feature => feature.name === value.feature);

  setFormData(prev => ({
    ...prev,
    featureId: selectedFeature ? selectedFeature.id : (features.length > 0 ? features[0].id : ''),
  }));

  setShowUpdateModal(true);
};

  const handleDeleteClick = (value) => {
    setSelectedValue(value);
    setShowDeleteModal(true);
  };

  // Handle create value submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!newValueName.trim()) {
      setToast({
        show: true,
        message: 'Value name is required.',
        type: 'error',
        autoHide: false
      });
      return;
    }

    try {
      setLoadingCreate(true);
      const response = await API.post('/value', { name: newValueName, featureId: formData.featureId }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setValues([...values, response.data]);
      setShowCreateModal(false);
      setToast({
        show: true,
        message: 'Value created successfully!',
        type: 'success',
        autoHide: true
      });
      setTimeout(() => window.location.reload(), 0);
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to create value.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewValueName('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoadingUpdate(true);
      const response = await API.put(`/value/${selectedValue.id}`, { name: updatedValueName, featureId: formData.featureId }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setValues(values.map(value => (value.id === selectedValue.id ? response.data : value)));
      setShowUpdateModal(false);
      setToast({
        show: true,
        message: 'Value updated successfully!',
        type: 'success',
        autoHide: true
      });
      setTimeout(() => window.location.reload(), 0);
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to update value.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdatedValueName('');
    setSelectedValue(null);
  };

  // Handle delete value submission
  const handleDeleteSubmit = async () => {
    if (!selectedValue) return;

    try {
      setLoadingDelete(true);
      await API.delete(`/value/${selectedValue.id}`);
      setValues(values.filter(value => value.id !== selectedValue.id));
      setShowDeleteModal(false);
      setToast({
        show: true,
        message: 'Value deleted successfully!',
        type: 'success',
        autoHide: true
      });
      setTimeout(() => window.location.reload(), 0);
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to delete value.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedValue(null);
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (error) return <div>{error}</div>;

  const currentPageData = getCurrentPageData();

  return (
    <div>
      <h2>Value List</h2>
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
                placeholder="Search for values..."
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
              <th>
                <div className="filter-dropdown">
                  Feature
                  <span
                    onClick={() => setShowFeatureDropdown(!showFeatureDropdown)}
                    className="filter-label"
                    >
                    {showFeatureDropdown ? "↑" : "↓"}
                  </span>
                  {showFeatureDropdown && (
                    <ul className="dropdown-content">
                      {availableFeatures.map(feature => (
                        <label key={feature} className="dropdown-item">
                          <li>
                            <input
                              type="checkbox"
                              checked={filters.feature.includes(feature)}
                              onChange={() => handleFilterChange('feature', feature)}
                            />
                            {feature}
                          </li>
                        </label>
                      ))}
                    </ul>
                  )}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedValues.length > 0 ? (
              currentPageData.map((value) => (
                <tr key={value.id}>
                  <td>{value.id}</td>
                  <td>{value.name}</td>
                  <td>{value.feature}</td>
                  <td>
                    <button type="button" onClick={() => handleUpdateClick(value)}>✏️</button>
                    <button type="button" onClick={() => handleDeleteClick(value)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Values not in the list.
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
          Showing {currentPageData.length} of {filteredAndSortedValues.length} values
          {(filters.feature.length > 0 || filters.feature.length > 0) && (
            <span> (filtered from {values.length} total values)</span>
          )}
        </div>
      </main>

      {/* Create Value Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Create New Value</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="name">Enter Name:</label>
            <input
              type="text"
              name="name"
              value={newValueName}
              onChange={(e) => setNewValueName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="feature">Select Feature:</label>
            <select
              className="form-select"
              name="featureId"
              value={formData.featureId}
              onChange={handleChange}
            >
              {features.map(feature => (
                <option key={feature.id} value={feature.id}>
                  {feature.name}
                </option>
              ))}
            </select>
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

      {/* Update Value Modal */}
      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Update Value (ID: {selectedValue?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="name">Value Name:</label>
            <input
              type="text"
              name="name"
              value={updatedValueName}
              onChange={(e) => setUpdatedValueName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="feature">Select Feature:</label>
            <select
              className="form-select"
              name="featureId"
              value={formData.featureId}
              onChange={handleChange}
              >
              {features.map(feature => (
                <option key={feature.id} value={feature.id}>
                  {feature.name}
                </option>
              ))}
            </select>
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

      {/* Delete Value Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Delete Value (ID: {selectedValue?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            Are you sure you want to delete this value? This action cannot be undone.
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