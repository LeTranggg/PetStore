import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';

function View() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Sort
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);

  // Filter
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCancelReasonDropdown, setShowCancelReasonDropdown] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    cancelReason: [],
  });
  const [availableStatus, setAvailableStatus] = useState([]);
  const [availableCancelReasons, setAvailableCancelReasons] = useState([]);

  // Status Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState('Pending');
  const [cancelReason, setCancelReason] = useState('Mistake');
  const [statusError, setStatusError] = useState('');

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Hàm chuẩn hóa chuỗi
  const normalizeString = (str) => {
    if (!str) return null;
    return str.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get('/order');
        // Chuẩn hóa dữ liệu trước khi lưu vào state
        const normalizedOrders = response.data.map(order => ({
          ...order,
          status: normalizeString(order.status),
          cancelReason: normalizeString(order.cancelReason),
        }));
        setOrders(normalizedOrders);

        const status = [...new Set(normalizedOrders.map(order => order.status))];
        const cancelReasons = [...new Set(normalizedOrders.map(order => order.cancelReason).filter(Boolean))];
        setAvailableStatus(status);
        setAvailableCancelReasons(cancelReasons);
      } catch (err) {
        setError('Failed to load orders.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleSortOrder = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = order.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status.length === 0 || filters.status.includes(order.status);
      const matchesCancelReason = filters.cancelReason.length === 0 || filters.cancelReason.includes(order.cancelReason);

      return matchesSearch && matchesStatus && matchesCancelReason;
    });
  };

  const getFilteredAndSortedOrders = () => {
    const filteredOrders = getFilteredOrders();
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);

      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });

    return sortedOrders;
  };

  const filteredAndSortedOrders = getFilteredAndSortedOrders();

  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedOrders.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, filters, orders, rowsPerPage, sortConfig]);

  const getCurrentPageData = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return filteredAndSortedOrders.slice(indexOfFirstRow, indexOfLastRow);
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
          className={i === currentPage ? 'active' : ''}
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
          [filterType]: currentValues.filter(v => v !== value),
        };
      } else {
        return {
          ...prevFilters,
          [filterType]: [...currentValues, value],
        };
      }
    });
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleStatusClick = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setCancelReason('Mistake');
    setStatusError('');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedOrder) return;

    try {
      const payload = orderStatus === 'Cancelled' ? { status: orderStatus, cancelReason } : { status: orderStatus };
      await API.put(`/order/${selectedOrder.id}/status`, payload);
      const response = await API.get('/order');
      const normalizedOrders = response.data.map(order => ({
        ...order,
        status: normalizeString(order.status),
        cancelReason: normalizeString(order.cancelReason),
      }));
      setOrders(normalizedOrders);
      setShowStatusModal(false);
      alert('Order status updated successfully');
      setTimeout(() => window.location.reload(), 0);
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setStatusError('');
  };

  const handleDetailClick = (order) => {
    setSelectedOrder(order);
    setDetailError('');
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setDetailError('');
    setSelectedOrder(null);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedOrder) return;

    try {
      await API.delete(`/order/${selectedOrder.id}`);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== selectedOrder.id));
      setShowDeleteModal(false);
      alert('Order deleted successfully');
      setTimeout(() => window.location.reload(), 0);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete order');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteError('');
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>{error}</div>;

  const currentPageData = getCurrentPageData();

  return (
    <div>
      <h2>Order List</h2>
      <main>
        <div className="table-header">
          <div className="action-bar">
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
                placeholder="Search for orders by user email..."
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
              <th>User</th>
              <th>Date Created</th>
              <th>Coin Earned</th>
              <th>Total Price</th>
              <th>
                <div className="filter-dropdown">
                  Cancel Reason
                  <span
                    onClick={() => setShowCancelReasonDropdown(!showCancelReasonDropdown)}
                    className="filter-label"
                  >
                    {showCancelReasonDropdown ? '↑' : '↓'}
                  </span>
                  {showCancelReasonDropdown && (
                    <ul className="dropdown-content">
                      {availableCancelReasons.map(reason => (
                        <label key={reason} className="dropdown-item">
                          <li>
                            <input
                              type="checkbox"
                              checked={filters.cancelReason.includes(reason)}
                              onChange={() => handleFilterChange('cancelReason', reason)}
                            />
                            {reason}
                          </li>
                        </label>
                      ))}
                    </ul>
                  )}
                </div>
              </th>
              <th>
                <div className="filter-dropdown">
                  Status
                  <span
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="filter-label"
                  >
                    {showStatusDropdown ? '↑' : '↓'}
                  </span>
                  {showStatusDropdown && (
                    <ul className="dropdown-content">
                      {availableStatus.map(status => (
                        <label key={status} className="dropdown-item">
                          <li>
                            <input
                              type="checkbox"
                              checked={filters.status.includes(status)}
                              onChange={() => handleFilterChange('status', status)}
                            />
                            {status}
                          </li>
                        </label>
                      ))}
                    </ul>
                  )}
                </div>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedOrders.length > 0 ? (
              currentPageData.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.userName}</td>
                  <td>{new Date(order.dateCreated).toLocaleString()}</td>
                  <td>{order.coinEarned || 0}</td>
                  <td>${order.totalPrice.toFixed(2)}</td>
                  <td>{order.cancelReason || '-'}</td>
                  <td>{order.status}</td>
                  <td>
                    <button type="button" onClick={() => handleDetailClick(order)}>👁️</button>
                    <button type="button" onClick={() => handleStatusClick(order)}>🔒</button>
                    <button type="button" onClick={() => handleDeleteClick(order)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Orders not in the list.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          {renderPaginationButtons()}
        </div>

        <div>
          Page {currentPage} of {totalPages} | Showing {currentPageData.length} of {filteredAndSortedOrders.length} orders
          {(filters.status.length > 0 || filters.cancelReason.length > 0) && (
            <span> (filtered from {orders.length} total orders)</span>
          )}
        </div>
      </main>

      <Modal show={showStatusModal} onHide={handleCloseStatusModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Update Order Status (ID: {selectedOrder?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {statusError && <div className="error">{statusError}</div>}
          <div>
            <label htmlFor="statusReason">Select Status:</label>
            <select
              id="statusReason"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="form-select"
            >
              <option value="Pending">Pending</option>
              <option value="Delivering">Delivering</option>
              <option value="Received">Received</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          {orderStatus === 'Cancelled' && (
            <div className="cancel-reason-section">
              <label htmlFor="cancelReason">Select Cancel Reason:</label>
              <select
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="form-select"
              >
                <option value="Mistake">Mistake</option>
                <option value="ChangedMind">Changed Mind</option>
                <option value="FoundBetterPrice">Found Better Price</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-danger" onClick={handleStatusSubmit}>
            Update Status
          </button>
          <button className="button-cancel" onClick={handleCloseStatusModal}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Delete Order (ID: {selectedOrder?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <div className="error">{deleteError}</div>}
          <div>
            Are you sure you want to delete this order? This action cannot be undone.
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-danger" onClick={handleDeleteSubmit}>
            Delete Order
          </button>
          <button className="button-cancel" onClick={handleCloseDeleteModal}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDetailModal} onHide={handleCloseDetailModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Order Details (ID: {selectedOrder?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailError && <div className="error">{detailError}</div>}
          {selectedOrder ? (
            <div>
              <p><strong>Date Created:</strong> {new Date(selectedOrder.dateCreated).toLocaleString()}</p>
              <p><strong>Total Price:</strong> ${selectedOrder.totalPrice.toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Cancel Reason:</strong> {selectedOrder.cancelReason || '-'}</p>
              <h3>Order Items</h3>
              <ul>
                {selectedOrder.orderDetails.map((detail) => (
                  <li key={detail.id}>
                    <p><strong>Product:</strong> {detail.variantName}</p>
                    <p><strong>Quantity:</strong> {detail.quantity}</p>
                    <p><strong>Price:</strong> ${detail.price.toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No order selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-cancel" onClick={handleCloseDetailModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default View;