import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function View() {
  const [shippings, setShippings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true
  });
  const [formData, setFormData] = useState({
    method: 'Road',
    price: '',
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Sort
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    method: '',
    price: '',
  });
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchShippings = async () => {
      try {
        const response = await API.get('/shipping');
        setShippings(response.data);
      } catch (err) {
        setError('Failed to load shippings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShippings();
  }, []);

  // Toggle sorting order
  const toggleSortOrder = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Search shippings
  const getSearchShippings = () => {
    return shippings.filter(shipping =>
      shipping.method.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get sorted results
  const getSortedShippings = () => {
    const searchShippings = getSearchShippings();
    const sortedShippings = [...searchShippings].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);
      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });
    return sortedShippings;
  };

  const sortedShippings = getSortedShippings();

  const handleCreateClick = () => {
    setFormData({
      method: 'Road',
      price: '',
    });
    setShowCreateModal(true);
  };

  const handleUpdateClick = (shipping) => {
    setSelectedShipping(shipping);
    setUpdateFormData({
      method: shipping.method,
      price: shipping.price.toString(),
    });
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (shipping) => {
    setSelectedShipping(shipping);
    setShowDeleteModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle create shipping submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
     if (formData.price === '') {
       setToast({
         show: true,
         message: 'Price are required.',
         type: 'error',
         autoHide: false
       });
       return;
     }

    try {
      setLoadingCreate(true);
      const response = await API.post('/shipping', {
        method: formData.method,
        price: parseFloat(formData.price),
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      setFormData({
        method: 'Road',
        price: '',
      });

      setShippings([...shippings, response.data]);
      setShowCreateModal(false);
      setToast({
        show: true,
        message: 'Shipping created successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      console.error('Error creating shipping:', err.response);
      let errorMessage = 'Failed to create shipping.'; // Default fallback
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
    setFormData({
      method: 'Road',
      price: '',
    });
  };

  // Handle update shipping submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoadingUpdate(true);
      const response = await API.put(`/shipping/${selectedShipping.id}`, {
        method: updateFormData.method,
        price: parseFloat(updateFormData.price),
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      setShippings(shippings.map(shipping =>
        shipping.id === selectedShipping.id ? response.data : shipping
      ));
      setShowUpdateModal(false);
      setToast({
        show: true,
        message: 'Shipping updated successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      console.error('Error updating shipping:', err.response);
      let errorMessage = 'Failed to update shipping.'; // Default fallback
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
    setUpdateFormData({
      method: '',
      price: '',
    });
    setSelectedShipping(null);
  };

  // Handle delete shipping submission
  const handleDeleteSubmit = async () => {
    if (!selectedShipping) return;

    try {
      setLoadingDelete(true);
      await API.delete(`/shipping/${selectedShipping.id}`);
      setShippings(shippings.filter(shipping => shipping.id !== selectedShipping.id));
      setShowDeleteModal(false);
      setToast({
        show: true,
        message: 'Shipping deleted successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to delete shipping.',
        type: 'error',
        autoHide: false
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedShipping(null);
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2>Shipping List</h2>
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
                placeholder="Search for shippings..."
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
              <th>Method</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedShippings.length > 0 ? (
              sortedShippings.map((shipping) => (
                <tr key={shipping.id}>
                  <td>{shipping.id}</td>
                  <td>{shipping.method}</td>
                  <td>{shipping.price}</td>
                  <td>
                    <button type="button" onClick={() => handleUpdateClick(shipping)}>✏️</button>
                    <button type="button" onClick={() => handleDeleteClick(shipping)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Shippings not in the list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>

      {/* Create Shipping Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Create New Shipping</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label className="label" htmlFor="method">Method</label>
            <select
              className="form-select"
              name="method"
              value={formData.method}
              onChange={handleChange}
            >
              <option value="Road">Road</option>
              <option value="Air">Air</option>
              <option value="Sea">Sea</option>
              <option value="Rail">Rail</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="price">Price</label>
            <input
              type="number"
              step="1000"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-control"
              style={{ marginTop: '10px' }}
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

      {/* Update Shipping Modal */}
      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Update Shipping (ID: {selectedShipping?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label className="label" htmlFor="method">Method</label>
            <select
              className="form-select"
              name="method"
              value={updateFormData.method}
              onChange={handleUpdateChange}
            >
              <option value="Road">Road</option>
              <option value="Air">Air</option>
              <option value="Sea">Sea</option>
              <option value="Rail">Rail</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="price">Price</label>
            <input
              type="number"
              step="1000"
              name="price"
              value={updateFormData.price}
              onChange={handleUpdateChange}
              style={{ marginTop: '10px' }}
              className="form-control"
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

      {/* Delete Shipping Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Delete Shipping (ID: {selectedShipping?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            Are you sure you want to delete this shipping? This action cannot be undone.
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