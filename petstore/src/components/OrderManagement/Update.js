// EditOrderStatus.js
import React, { useState } from 'react';
import axios from 'axios';

const Update = ({ order, onStatusUpdate }) => {
  const [status, setStatus] = useState(order.status);
  const [reason, setReason] = useState('');

  const handleStatusUpdate = async () => {
    try {
      await axios.put(`/api/order/${order.id}/status`, {
        orderStatus: status,
        reason: status === 'Cancelled' ? reason : '',
      });
      onStatusUpdate();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div>
      <h2>Edit Order Status</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Confirming">Confirming</option>
        <option value="InProgress">In Progress</option>
        <option value="Delivered">Delivered</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      {status === 'Cancelled' && (
        <input
          type="text"
          placeholder="Reason for cancellation"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      )}
      <button onClick={handleStatusUpdate}>Update Status</button>
    </div>
  );
};

export default Update;