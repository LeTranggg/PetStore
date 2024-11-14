import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <tr key={item.id}>
      <td>{item.classification.product.name}</td>
      <td>{item.classification.name}</td>
      <td>${item.classification.price}</td>
      <td>
        <input
          type="number"
          min="0"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
          className="w-20 p-1 border rounded"
        />
      </td>
      <td>${item.classification.price * item.quantity}</td>
      <td>
        <button
          onClick={() => onRemove(item.id)}
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

export default CartItem;