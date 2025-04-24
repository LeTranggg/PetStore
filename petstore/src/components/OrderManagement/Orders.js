import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';
import Modal from 'react-bootstrap/Modal';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Mistake');
  const [cancelError, setCancelError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await API.get('/order');
        console.log('Orders:', response.data); // Log để kiểm tra dữ liệu
        setOrders(response.data);
      } catch (err) {
        setError('Không thể tải danh sách đơn hàng.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelClick = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelReason('Mistake');
    setCancelError('');
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    setLoading(true);
    setCancelError('');
    try {
      await API.put(`/order/${selectedOrderId}/cancel`, {
        cancelReason,
      });
      const response = await API.get('/order');
      setOrders(response.data);
      alert('Đơn hàng đã được hủy thành công!');
      setShowCancelModal(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể hủy đơn hàng.';
      setCancelError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelError('');
    setSelectedOrderId(null);
  };

  const getTimelineStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 1;
      case 'delivering':
        return 2;
      case 'received':
        return 3;
      case 'cancelled':
        return 4;
      default:
        return 0;
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="main">
      <h2>Danh sách đơn hàng</h2>
      {orders.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const timelineStep = getTimelineStatus(order.status);
            return (
              <div key={order.id} className="order-item">
                {/* Thanh trạng thái đơn hàng (Timeline) */}
                <div className="timeline">
                  <div className={`step ${timelineStep >= 1 ? 'active' : ''}`} data-step="1">
                    <span>Pending</span>
                  </div>
                  <div className={`step ${timelineStep >= 2 ? 'active' : ''}`} data-step="2">
                    <span>Delivering</span>
                  </div>
                  <div className={`step ${timelineStep >= 3 ? 'active' : ''}`} data-step="3">
                    <span>Received</span>
                  </div>
                  <div className={`step ${timelineStep === 4 ? 'active' : ''}`} data-step="4">
                    <span>Canceled</span>
                  </div>
                </div>

                {order.orderDetails.map((detail) => {
                  console.log('Order Detail:', detail); // Log để kiểm tra dữ liệu
                  return (
                    <div key={detail.id} className="order-detail">
                      <div className="product-info">
                        <img
                          src={detail.image || `${process.env.PUBLIC_URL}/default.png`}
                          alt={detail.variantName}
                          className="product-image"
                        />
                        <div className="product-details">
                          <p>{detail.variantName}</p>
                          <p>x{detail.quantity}</p>
                        </div>
                        <p>Ngày tạo: {new Date(order.dateCreated).toLocaleString()}</p>
                      </div>
                      <div className="product-status">
                        <Link to={`/order/${order.id}`} className="delivery-status">
                          Delivery successful
                        </Link>
                        <span className={`status ${order.status.toLowerCase()}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="product-price">${detail.price.toFixed(2)}</div>
                    </div>
                  );
                })}

                <div className="order-total">
                  <strong>Order Total:</strong> ${order.totalPrice.toFixed(2)}
                </div>

                <div className="action-buttons">
                  {order.status.toLowerCase() === 'pending' ? (
                    <button onClick={() => handleCancelClick(order.id)} className="cancel-button">
                      Hủy đơn hàng
                    </button>
                  ) : order.status.toLowerCase() === 'received' ? (
                    <>
                      <p>bbb</p>
                    </>
                  ) : order.status.toLowerCase() === 'cancelled' ? (
                    <>
                      <p>bbb</p>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal show={showCancelModal} onHide={handleCloseCancelModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Cancel Order (ID: {selectedOrderId})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cancelError && <div className="error">{cancelError}</div>}
          <div>
            <label htmlFor="cancelReason">Select Reason:</label>
            <select
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="form-select"
            >
              <option value="Mistake">Mistake</option>
              <option value="Expiration">Expiration</option>
              <option value="Violation">Violation</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-danger" onClick={handleCancelSubmit}>
            Cancel Order
          </button>
          <button className="button-cancel" onClick={handleCloseCancelModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Orders;