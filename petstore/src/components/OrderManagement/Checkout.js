import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import ToastNotification from '../../misc/ToastNotification';

// Khởi tạo Stripe với Publishable Key
const stripePromise = loadStripe('pk_test_51R8SOFQBS6grTpy1zvwyYFLEphenZHN3okNgl0i2FoOavFM05o525Af8m6FRaFcN4zELVx175fcsar03ahWANM6A00CEFvWWEu');

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const selectedCartItems = state?.selectedCartItems || [];

  const stripe = useStripe();
  const elements = useElements();

  const [shippings, setShippings] = useState([]);
  const [shippingId, setShippingId] = useState('');
  const [shippingCost, setShippingCost] = useState(0); // Base shipping cost (for dropdown display)
  const [calculatedShippingCost, setCalculatedShippingCost] = useState(0); // Calculated shipping cost (for total)
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [useLoyaltyCoins, setUseLoyaltyCoins] = useState(false);
  const [loyaltyCoins, setLoyaltyCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);

  useEffect(() => {
    const fetchShippingsAndItems = async () => {
      try {
        // Fetch profile for loyaltyCoins
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;
        const profileResponse = await API.get(`/account/${userId}`);
        setLoyaltyCoins(profileResponse.data.loyaltyCoins || 0);

        // Fetch shippings
        const shippingResponse = await API.get('/shipping');
        setShippings(shippingResponse.data);
        const roadShipping = shippingResponse.data.find(s => s.method === 'Road');
        if (roadShipping) {
          setShippingId(roadShipping.id);
          setShippingCost(roadShipping.price);
        } else if (shippingResponse.data.length > 0) {
          setShippingId(shippingResponse.data[0].id);
          setShippingCost(shippingResponse.data[0].price);
        } else {
          setToast({
            show: true,
            message: 'Không có phương thức vận chuyển nào khả dụng.',
            type: 'error',
            autoHide: false,
          });
        }

        // Fetch cart items
        if (selectedCartItems.length > 0) {
          const itemsPromises = selectedCartItems.map(async (itemId) => {
            const response = await API.get(`/cart/item/${itemId}`);
            return response.data;
          });
          const items = await Promise.all(itemsPromises);
          setCartItems(items);

          // Simulate order creation to get calculated shipping cost
          if (items.length > 0 && shippingResponse.data.length > 0) {
            try {
              const simulationResponse = await API.post('/order/simulate', {
                cartItemIds: selectedCartItems,
                shippingId: roadShipping ? roadShipping.id : shippingResponse.data[0].id,
                paymentMethod: 'Cash',
                useLoyaltyCoins: false,
              });
              setCalculatedShippingCost(simulationResponse.data.shippingCost);
            } catch (simError) {
              console.error('Simulation error:', simError);
              setCalculatedShippingCost(roadShipping ? roadShipping.price : shippingResponse.data[0].price);
            }
          }
        }
      } catch (err) {
        setToast({
          show: true,
          message: 'Không thể tải dữ liệu. Vui lòng thử lại.',
          type: 'error',
          autoHide: false,
        });
        console.error(err);
      } finally {
        setFetchingItems(false);
      }
    };
    fetchShippingsAndItems();
  }, [selectedCartItems]);

  // Update calculated shipping cost when shipping method changes
  useEffect(() => {
    const updateShippingCost = async () => {
      if (cartItems.length > 0 && shippingId) {
        try {
          const simulationResponse = await API.post('/order/simulate', {
            cartItemIds: selectedCartItems,
            shippingId: parseInt(shippingId),
            paymentMethod: 'Cash',
            useLoyaltyCoins: false,
          });
          setCalculatedShippingCost(simulationResponse.data.shippingCost);
        } catch (simError) {
          console.error('Simulation error:', simError);
          const selectedShipping = shippings.find(s => s.id === parseInt(shippingId));
          setCalculatedShippingCost(selectedShipping ? selectedShipping.price : 0);
        }
      }
    };
    updateShippingCost();
  }, [shippingId, cartItems, selectedCartItems]);

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) {
      setToast({
        show: true,
        message: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.',
        type: 'error',
        autoHide: false,
      });
      return;
    }

    if (!shippingId) {
      setToast({
        show: true,
        message: 'Vui lòng chọn phương thức vận chuyển.',
        type: 'error',
        autoHide: false,
      });
      return;
    }

    if (!paymentMethod) {
      setToast({
        show: true,
        message: 'Vui lòng chọn phương thức thanh toán.',
        type: 'error',
        autoHide: false,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/order', {
        cartItemIds: selectedCartItems,
        shippingId: parseInt(shippingId),
        paymentMethod: paymentMethod.toUpperCase(),
        useLoyaltyCoins,
      });

      setOrder(response.data);
      setToast({
        show: true,
        message: `Tạo đơn hàng thành công! Tổng tiền: ${response.data.totalPrice.toLocaleString('vi-VN')} VND`,
        type: 'success',
        autoHide: true,
      });
      if (paymentMethod !== 'Stripe') {
        navigate('/orders');
      }
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error',
        autoHide: false,
      });
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const paymentIntentId = order.clientSecret.split('_secret_')[0];
      const response = await API.post(`/payment/${order.paymentId}/confirm`, paymentIntentId);
      setToast({
        show: true,
        message: 'Thanh toán qua Stripe thành công!',
        type: 'success',
        autoHide: true,
      });
      navigate('/orders');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể xác nhận thanh toán.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error',
        autoHide: false,
      });
      console.error('Confirm payment error:', err);
    }
  };

  const handleStripeSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!stripe || !elements) {
      setToast({
        show: true,
        message: 'Stripe chưa được khởi tạo.',
        type: 'error',
        autoHide: false,
      });
      setLoading(false);
      return;
    }

    if (!cardNumberComplete || !cardExpiryComplete || !cardCvcComplete) {
      setToast({
        show: true,
        message: 'Vui lòng điền đầy đủ thông tin thẻ tín dụng.',
        type: 'error',
        autoHide: false,
      });
      setLoading(false);
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(order.clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            address: {
              postal_code: '12345',
            },
          },
        },
      });

      if (error) {
        setToast({
          show: true,
          message: error.message,
          type: 'error',
          autoHide: false,
        });
        console.error('Stripe error:', error);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        handlePaymentSuccess();
      }
    } catch (err) {
      setToast({
        show: true,
        message: 'Thanh toán thất bại. Vui lòng thử lại.',
        type: 'error',
        autoHide: false,
      });
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToastClose = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
      },
    },
  };

  // Tính toán các giá trị hiển thị
  const subtotal = cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  const loyaltyCoinDeduction = useLoyaltyCoins ? Math.min(loyaltyCoins, subtotal + calculatedShippingCost) : 0;
  const totalPrice = Math.max(0, subtotal + calculatedShippingCost - loyaltyCoinDeduction);

  if (fetchingItems) return <div className="loading-message">Đang tải...</div>;

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Thanh toán</h2>

      <div className="checkout-flex">
        {/* Danh sách sản phẩm đã chọn */}
        <div className="product-list">
          <h3 className="product-list-title">Sản phẩm đã chọn</h3>
          {cartItems.length === 0 ? (
            <p className="products-info">Chưa chọn sản phẩm nào.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="product-item">
                <img
                  src={item.image || `${process.env.PUBLIC_URL}/default.png`}
                  alt={item.productName}
                  className="product-image"
                />
                <div className="product-details">
                  <h4 className="product-name">{item.productName}</h4>
                  <p className="product-info">Biến thể: {item.variantName}</p>
                  <p className="product-info">Đơn giá: {item.unitPrice.toLocaleString('vi-VN')} VND</p>
                  <p className="product-info">Số lượng: {item.quantity}</p>
                  <p className="product-total">Tổng: {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} VND</p>
                </div>
              </div>
            ))
          )}
          <div className="total-section">
            <h4 className="total-price">Tổng tiền hàng: {subtotal.toLocaleString('vi-VN')} VND</h4>
            <p className="total-price">Phí vận chuyển: +{calculatedShippingCost.toLocaleString('vi-VN')} VND</p>
            <p className="total-price">Xu tích lũy: -{loyaltyCoinDeduction.toLocaleString('vi-VN')} VND</p>
            <h4 className="total-price">Tổng ước tính: {totalPrice.toLocaleString('vi-VN')} VND</h4>
          </div>
        </div>

        {/* Form thanh toán */}
        <div className="payment-form">
          <h3 className="payment-form-title">Thông tin thanh toán</h3>

          <div className="form-group">
            <label className="form-label">Phương thức vận chuyển:</label>
            {shippings.length > 0 ? (
              <select
                value={shippingId}
                onChange={(e) => {
                  setShippingId(e.target.value);
                  const selectedShipping = shippings.find(s => s.id === parseInt(e.target.value));
                  setShippingCost(selectedShipping ? selectedShipping.price : 0);
                }}
                className="form-select"
              >
                {shippings.map((shipping) => (
                  <option key={shipping.id} value={shipping.id}>
                    {shipping.method} - {shipping.price.toLocaleString('vi-VN')} VND
                  </option>
                ))}
              </select>
            ) : (
              <p className="product-info">Không có phương thức vận chuyển nào.</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Phương thức thanh toán:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="form-select"
            >
              <option value="Cash">Thanh toán khi nhận hàng</option>
              <option value="Stripe">Thanh toán qua Stripe</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={useLoyaltyCoins}
                onChange={(e) => setUseLoyaltyCoins(e.target.checked)}
                className="form-checkbox"
              />
              Sử dụng xu tích lũy ({loyaltyCoins.toLocaleString('vi-VN')} xu khả dụng)
            </label>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || cartItems.length === 0}
            className="form-button"
          >
            {loading ? 'Đang xử lý...' : 'Tạo đơn hàng'}
          </button>

          {order && paymentMethod === 'Stripe' && order.clientSecret && (
            <form onSubmit={handleStripeSubmit} className="stripe-form">
              <div className="stripe-field">
                <label className="form-label">Số thẻ tín dụng:</label>
                <div className="stripe-input">
                  <CardNumberElement
                    options={elementOptions}
                    onChange={(e) => setCardNumberComplete(e.complete)}
                  />
                </div>
              </div>
              <div className="stripe-field-flex">
                <div>
                  <label className="form-label">Ngày hết hạn</label>
                  <div className="stripe-input">
                    <CardExpiryElement
                      options={elementOptions}
                      onChange={(e) => setCardExpiryComplete(e.complete)}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Mã CVC</label>
                  <div className="stripe-input">
                    <CardCvcElement
                      options={elementOptions}
                      onChange={(e) => setCardCvcComplete(e.complete)}
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={
                  !stripe ||
                  loading ||
                  !cardNumberComplete ||
                  !cardExpiryComplete ||
                  !cardCvcComplete
                }
                className="form-button"
              >
                {loading ? 'Đang xử lý...' : 'Thanh toán qua Stripe'}
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          )}

          {error && <p className="error-message">{error}</p>}
        </div>
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

export default function CheckoutWrapper() {
  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  );
}