import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';
import ToastNotification from '../../misc/ToastNotification';

function View() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view cart.');
          return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        const response = await API.get(`/cart/user/${userId}`);
        console.log('Cart data from API:', response.data);
        setCart(response.data);
      } catch (err) {
        setError('Failed to load cart.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await API.delete(`/cart/item/${cartItemId}`);
      setCart((prevCart) => ({
        ...prevCart,
        cartItems: prevCart.cartItems.filter((item) => item.id !== cartItemId),
      }));
      setSelectedItems((prev) => prev.filter((id) => id !== cartItemId));
      setToast({
        show: true,
        message: 'Product deleted successfully!',
        type: 'success',
        autoHide: true
      });
    } catch (err) {
      console.error('Failed to delete product:', err);
      setToast({
        show: true,
        message: 'Failed to delete product.',
        type: 'error',
        autoHide: false
      });
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      const response = await API.put(`/cart/item/${cartItemId}`, { quantity: newQuantity });
      setCart((prevCart) => ({
        ...prevCart,
        cartItems: prevCart.cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: response.data.quantity, price: response.data.price } : item
        ),
      }));
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setToast({
        show: true,
        message: 'Cannot exceed the quantity in stock.',
        type: 'error',
        autoHide: false
      });
    }
  };

  const handleSelectItem = (cartItemId) => {
    setSelectedItems((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      setToast({
        show: true,
        message: 'Please select at least one product to checkout.',
        type: 'error',
        autoHide: false
      });
      return;
    }

    navigate('/customer/checkout', { state: { selectedCartItems: selectedItems } });
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!cart || !cart.cartItems || cart.cartItems.length === 0) return <div className="main"> <h2>My Cart</h2> <p style={{ marginTop: '20px' }}>Your shopping cart is empty. Start shopping now!</p></div>;

  const totalPrice = cart.cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((total, item) => total + item.unitPrice * item.quantity, 0); // Sử dụng unitPrice

  return (
    <div className="main">
      <h2>My Cart</h2>
      <div style={{ marginTop: '20px' }}>
        {cart.cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleSelectItem(item.id)}
              />
            </label>
            <img
              src={item.image || `${process.env.PUBLIC_URL}/default.png`}
              alt={item.productName}
              width="100"
              height="100"
            />
            <h4 style={{ marginBottom: '0'}}>{item.productName}</h4>
            <p>Varriant: {item.variantName}</p>
            <p>Unit price: ${(item.unitPrice).toLocaleString('vi-VN')} VND</p>
            <div className="quantity-selector">
              <button
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                >
                -
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
            <p>Total: ${(item.unitPrice * item.quantity).toLocaleString('vi-VN')} VND</p>
            <button onClick={() => handleRemoveFromCart(item.id)} className="remove-button">
              Delete
            </button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h4>Total order: ${totalPrice.toLocaleString('vi-VN')} VND</h4>
        <button onClick={handleCheckout} className="checkout-button">
          Checkout
        </button>
      </div>

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