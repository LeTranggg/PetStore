import React, { useState, useEffect } from "react";
import axios from "../../utils/Axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "react-bootstrap";

const Create = () => {
  const location = useLocation();
  const [cartItems, setCartItems] = useState(location.state?.selectedCartItems || []);
  const [shippings, setShippings] = useState([]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CashOnDelivery");
  const [useLoyaltyCoins, setUseLoyaltyCoins] = useState(false);
  const [loyaltyCoins, setLoyaltyCoins] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const navigate = useNavigate();

  // Fetch shipping methods
  const fetchShippings = async () => {
  try {
    const response = await axios.get("/shipping");
    const data = response.data || [];
    console.log("Shipping methods:", data); // Add this line to see the actual data
    setShippings(data);
    if (data.length > 0) {
      setShippingMethod(data[0].id);
      setShippingCost(data[0].price);
    } else {
      console.warn("No shipping methods available.");
    }
  } catch (error) {
    console.error("Failed to fetch shipping methods:", error);
  }
};

  // Fetch user and cart data
  const fetchUserData = async () => {
    try {
      const response = await axios.get("/cart");
      setShippingAddress(response.data.user.address || "");
      setRecipientName(response.data.user.lastName || "");
      setRecipientPhone(response.data.user.phoneNumber || "");
      setLoyaltyCoins(response.data.user.loyaltyCoin || 0);

      // If no items passed from cart, use cart items from response
      if (cartItems.length === 0) {
        setCartItems(response.data.cartItems || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Calculate total price
  const calculateTotal = (items, useCoins, shippingCost) => {
    // Calculate subtotal
    const subtotal = items.reduce(
      (acc, item) =>
        acc +
        (item.classification.price + item.classification.product.price) *
          item.quantity,
      0
    );

    // Calculate loyalty coin discount
    const discount = useCoins
      ? Math.min(subtotal, loyaltyCoins)
      : 0;

    // Calculate final total
    const total = subtotal + shippingCost - discount;

    // Ensure total is a number
    setTotalPrice(Number(total.toFixed(2)));
  };

  // Effects for calculating total and fetching data
  useEffect(() => {
    fetchShippings();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      calculateTotal(cartItems, useLoyaltyCoins, shippingCost);
    }
  }, [cartItems, useLoyaltyCoins, shippingCost]);

  // Place order handler
  const handlePlaceOrder = async () => {
  // Validation
  if (!shippingAddress || !recipientName || !recipientPhone) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const orderData = {
      cartId: cartItems[0]?.cartId,
      shippingAddress,
      recipientName,
      recipientPhone,
      shippingId: shippingMethod,
      paymentId: paymentMethod === "VNPay" ? 2 : 1,
      useLoyaltyCoins
    };

    console.log("Order Data:", orderData); // Log the exact data being sent

    const response = await axios.post("/order", orderData);

    if (paymentMethod === "VNPay") {
      // Redirect to VNPay payment
      window.location.href = response.data.vnpayUrl;
    } else {
      // Navigate to order status
      navigate("/orders/history");
    }
  } catch (error) {
    console.error("Full Error Response:", error.response); // Log full error details
    alert(`Failed to create order: ${error.response?.data?.message || error.message}`);
  }
};

  return (
    <div className="container mx-auto p-4">
      <Card className="p-4">
        <h1 className="text-2xl font-bold mb-4">Create Order</h1>

        {/* Products Table */}
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Product</th>
              <th className="border p-2">Classification</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="border p-2">
                  {item.classification.product.name}
                </td>
                <td className="border p-2">
                  {item.classification.name}
                </td>
                <td className="border p-2">
                  ${(item.classification.price + item.classification.product.price).toFixed(2)}
                </td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">
                  $
                  {(
                    (item.classification.price +
                      item.classification.product.price) *
                    item.quantity
                  ).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Order Information Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shipping Information */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Shipping Information</h2>
            <div className="mb-3">
              <label className="block mb-2">Shipping Address</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter shipping address"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-2">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter recipient name"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-2">Recipient Phone</label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter recipient phone"
              />
            </div>
          </div>

          {/* Order Options */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Order Options</h2>
            <div className="mb-3">
              <label className="block mb-2">Shipping Method</label>
              <select
  value={shippingMethod}
  onChange={(e) => {
    const selectedShipping = shippings.find(
      (s) => s.id === Number(e.target.value)
    );
    setShippingMethod(selectedShipping.id);
    setShippingCost(selectedShipping.price);
  }}
  className="w-full p-2 border rounded"
>
  {shippings.map((shipping) => (
    <option key={shipping.id} value={shipping.id}>
      {shipping.shippingMethod} - ${shipping.price.toFixed(2)}
    </option>
  ))}
</select>
            </div>
            <div className="mb-3">
              <label className="block mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="CashOnDelivery">Cash on Delivery</option>
                <option value="VNPay">VNPay</option>
              </select>
            </div>
            <div className="mb-3 flex items-center">
              <input
                type="checkbox"
                checked={useLoyaltyCoins}
                onChange={(e) => setUseLoyaltyCoins(e.target.checked)}
                className="mr-2"
              />
              <label>
                Use Loyalty Coins ({loyaltyCoins} available)
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>
              $
              {cartItems
                .reduce(
                  (acc, item) =>
                    acc +
                    (item.classification.price +
                      item.classification.product.price) *
                      item.quantity,
                  0
                )
                .toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping Cost:</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          {useLoyaltyCoins && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>Loyalty Coins Discount:</span>
              <span>
                -$
                {Math.min(
                  cartItems.reduce(
                    (acc, item) =>
                      acc +
                      (item.classification.price +
                        item.classification.product.price) *
                        item.quantity,
                    0
                  ),
                  loyaltyCoins
                ).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          className="mt-4 w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
        >
          Place Order
        </button>
      </Card>
    </div>
  );
};

export default Create;