import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../utils/Axios';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true
  });

  // Cancel Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Mistake');
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for toast message from Checkout.js
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
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await API.get('/order');
        console.log('Orders:', response.data); // Log để kiểm tra dữ liệu
        // Sắp xếp order theo thời gian tạo (createdAt) mới nhất
        const sortedOrders = response.data.sort((a, b) => b.id - a.id)
        setOrders(sortedOrders);
      } catch (err) {
        setError('Failed to load order.');
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
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    setLoading(true);
    setToast(prev => ({ ...prev, show: false }));

    try {
      setLoadingCancel(true);
      await API.put(`/order/${selectedOrderId}/cancel`, {
        cancelReason,
      });
      const response = await API.get('/order');
      console.log('Orders:', response.data); // Log để kiểm tra dữ liệu
      // Sắp xếp order theo thời gian tạo (createdAt) mới nhất
      const sortedOrders = response.data.sort((a, b) => b.id - a.id)
      setOrders(sortedOrders);
      setToast({
        show: true,
        message: 'Order cancelled successfully!',
        type: 'success',
        autoHide: true,
      });
      setShowCancelModal(false);
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to cancel order.',
        type: 'error',
        autoHide: false,
      });
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
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

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="main">
      <h2>Order List</h2>
      {orders.length === 0 ? (
        <p style={{ marginTop: '20px' }}>No Order found.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const timelineStep = getTimelineStatus(order.status);
            return (
              <div key={order.id} className="order-item">
                {/* Thanh trạng thái đơn hàng (Timeline) */}
                <div className="timeline">
                  <div className={`step ${timelineStep >= 1 ? 'active' : ''}`} data-step="😀">
                    <span>Pending</span>
                  </div>
                  <div className={`step ${timelineStep >= 2 ? 'active' : ''}`} data-step="😄">
                    <span>Delivering</span>
                  </div>
                  <div className={`step ${timelineStep >= 3 ? 'active' : ''}`} data-step="😍">
                    <span>Received</span>
                  </div>
                  <div className={`step ${timelineStep === 4 ? 'active' : ''}`} data-step="😭">
                    <span>Canceled</span>
                  </div>
                </div>

                {order.orderDetails.map((detail) => {
                  console.log('Order Detail:', detail); // Log để kiểm tra dữ liệu
                  return (
                    <div key={detail.id} className="order-detail">
                      <img
                        src={detail.image || `${process.env.PUBLIC_URL}/default.png`}
                        alt={detail.variantName}
                        className="product-image"
                      />
                      <p>{detail.variantName}</p>
                      <p>Quantity: {detail.quantity}</p>
                      <p>Date Created: {new Date(order.dateCreated).toLocaleString()}</p>
                      <div className="product-price">{detail.price.toLocaleString('vi-VN')} VND</div>
                    </div>
                  );
                })}

                <div className="order-total">
                  <table>
                    <tr>
                      <th>Subtotal:</th>
                      <td>{order.subtotal.toLocaleString('vi-VN')} VND</td>
                    </tr>
                    <tr>
                      <th>Shipping cost:</th>
                      <td>+{order.shippingCost.toLocaleString('vi-VN')} VND</td>
                    </tr>
                    <tr>
                      <th>Loyalty coins spent:</th>
                      <td>-{order.loyaltyCoinsSpent.toLocaleString('vi-VN')} VND</td>
                    </tr>
                    <tr>
                      <th style={{ fontSize: '20px', color: '#12967A' }}>Total price:</th>
                      <td style={{ fontSize: '20px', color: '#12967A' }}>{order.totalPrice.toLocaleString('vi-VN')} VND</td>
                    </tr>
                  </table>
                </div>

                <div className="action-buttons">
                  {order.status.toLowerCase() === 'pending' ? (
                    <button onClick={() => handleCancelClick(order.id)} className="cancel-button">
                      Cancel Order
                    </button>
                  ) : order.status.toLowerCase() === 'received' ? (
                    <>
                      <p>Received</p>
                    </>
                  ) : order.status.toLowerCase() === 'cancelled' ? (
                    <>
                      <p>Cancelled</p>
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
          <div>
            <label htmlFor="cancelReason">Select Reason:</label>
            <select
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="form-select"
            >
              <option value="Mistake">Mistake</option>
              <option value="ChangedMind">Changed Mind</option>
              <option value="FoundBetterPrice">Found Better Price</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-danger" onClick={handleCancelSubmit} disabled={loadingCancel}>
            {loadingCancel ? 'Canceling...' : 'Cancel'}
          </button>
          <button className="button-cancel" onClick={handleCloseCancelModal} disabled={loadingCancel}>
            Close
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

export default Orders;