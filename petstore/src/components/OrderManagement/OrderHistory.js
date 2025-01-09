import React, { useState, useEffect } from 'react';
import axios from '../../utils/Axios';
import { Card, Modal, Button, Form } from 'react-bootstrap';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order history
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/orders');
      setOrders(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load order history');
      setIsLoading(false);
    }
  };

  // Open cancel order modal
  const handleOpenCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      await axios.put(`/orders/${selectedOrder.id}/status`, {
        orderStatus: 'cancelled',
        reason: cancelReason
      });

      // Update local state
      setOrders(orders.map(order =>
        order.id === selectedOrder.id
          ? { ...order, orderStatus: 'cancelled' }
          : order
      ));

      // Close modal and reset
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert('Failed to cancel order. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirming': return 'text-blue-500';
      case 'processing': return 'text-yellow-500';
      case 'shipped': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading order history...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        orders.map(order => (
          <Card key={order.id} className="mb-4 p-4 border rounded">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-xl font-semibold">
                  Order #{order.id}
                </h2>
                <p className="text-gray-600">
                  Ordered on {formatDate(order.dateCreated)}
                </p>
              </div>
              <div className={`font-bold ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </div>
            </div>

            {/* Order Details Table */}
            <table className="w-full border-collapse mb-3">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Product</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Price</th>
                  <th className="border p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderDetails.map(detail => (
                  <tr key={detail.id} className="border-t">
                    <td className="border p-2">
                      {detail.classification.product.name}
                      - {detail.classification.name}
                    </td>
                    <td className="border p-2 text-center">
                      {detail.quantity}
                    </td>
                    <td className="border p-2">
                      ${detail.price.toFixed(2)}
                    </td>
                    <td className="border p-2">
                      ${(detail.price * detail.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Order Summary */}
            <div className="flex justify-between items-center">
              <div>
                <p>Total: <span className="font-bold">${order.totalPrice.toFixed(2)}</span></p>
                <p>Shipping: {order.shipping.name}</p>
              </div>

              {/* Cancel Button - Only show for non-cancelled orders */}
              {order.orderStatus !== 'cancelled' && (
                <Button
                  variant="danger"
                  onClick={() => handleOpenCancelModal(order)}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </Card>
        ))
      )}

      {/* Cancel Order Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Reason for Cancellation</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling the order"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCancelModal(false)}
          >
            Close
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelOrder}
            disabled={!cancelReason.trim()}
          >
            Confirm Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderHistory;