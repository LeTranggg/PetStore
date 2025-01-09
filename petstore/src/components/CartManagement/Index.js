import React, { useState, useEffect } from "react";
import axios from "../../utils/Axios";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";

function Index() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null); // Lưu thông tin giỏ hàng
  const [selectedItems, setSelectedItems] = useState([]); // Lưu danh sách các item được chọn
  const [showModal, setShowModal] = useState(false); // Hiển thị modal ở dưới cùng

  useEffect(() => {
    fetchCart();
  }, []);

  // API gọi giỏ hàng
  const fetchCart = async () => {
    try {
      const response = await axios.get("/cart");
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // Hàm xử lý cập nhật số lượng
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) return; // Không cho phép số lượng < 1
      await axios.put(`/cart/${itemId}`, { quantity: newQuantity });
      fetchCart(); // Cập nhật lại giỏ hàng sau khi thay đổi
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Hàm xử lý khi chọn checkbox
  const handleSelect = (itemId) => {
    const alreadySelected = selectedItems.includes(itemId);
    const newSelected = alreadySelected
      ? selectedItems.filter((id) => id !== itemId)
      : [...selectedItems, itemId];

    setSelectedItems(newSelected);
    setShowModal(newSelected.length > 0); // Hiển thị modal nếu có item được chọn
  };

  // Xóa các item đã chọn
  const handleRemoveSelected = async () => {
    try {
      for (let id of selectedItems) {
        await axios.delete(`/cart/${id}`);
      }
      setSelectedItems([]);
      fetchCart();
      setShowModal(false); // Ẩn modal sau khi xóa
    } catch (error) {
      console.error("Error removing selected items:", error);
    }
  };

  // Đặt hàng
  const handlePlaceOrder = () => {
  const selectedCartItems = cart.cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );
  navigate("/orders/create", { state: { selectedCartItems } });
};

  // Tính tổng giá của các item được chọn
  const totalSelectedPrice = selectedItems.reduce((total, itemId) => {
    const item = cart?.cartItems.find((item) => item.id === itemId);
    return (
      total +
      (item.classification.price + item.classification.product.price) *
        item.quantity
    );
  }, 0);

  if (!cart) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Shopping Cart</h1>
        {cart.cartItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Select</th>
                  <th className="border border-gray-300 p-2">Product</th>
                  <th className="border border-gray-300 p-2">Product Price</th>
                  <th className="border border-gray-300 p-2">Classification</th>
                  <th className="border border-gray-300 p-2">
                    Classification Price
                  </th>
                  <th className="border border-gray-300 p-2">Total Price</th>
                  <th className="border border-gray-300 p-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {cart.cartItems.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelect(item.id)}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      {item.classification.product.name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      ${item.classification.product.price}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {item.classification.name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      ${item.classification.price}
                    </td>
                    <td className="border border-gray-300 p-2">
                      $
                      {(
                        (item.classification.price +
                          item.classification.product.price) *
                        item.quantity
                      ).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(item.id, Number(e.target.value))
                        }
                        className="w-16 text-center border border-gray-300"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Modal hiển thị khi chọn item */}
            {showModal && (
              <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold">
                    Total: ${totalSelectedPrice.toFixed(2)}
                  </p>
                  <div className="flex gap-4">
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded"
                      onClick={handleRemoveSelected}
                    >
                      Remove Selected
                    </button>
                    <button
  className="px-4 py-2 bg-green-500 text-white rounded"
  type="button"
  onClick={handlePlaceOrder} // Gọi hàm điều hướng
>
  Place Order
</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default Index;
