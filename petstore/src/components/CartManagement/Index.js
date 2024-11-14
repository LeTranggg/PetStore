import React, { useState, useEffect } from "react";
import axios from "../../utils/Axios";
import { Card } from "react-bootstrap";
import CartItem from "./CartItem";
import UpdateQuantity from "./Update";
import DeleteCartItem from "./Delete";

function Index() {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const { handleUpdate } = UpdateQuantity({ onSuccess: fetchCart });
  const { handleDelete } = DeleteCartItem({ onSuccess: fetchCart });

  if (!cart) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Shopping Cart</h1>
        {cart.cartItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Classification</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdate}
                    onRemove={handleDelete}
                  />
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right">
              <p className="text-xl font-bold">
                Total: ${cart.cartItems.reduce(
                  (total, item) => total + (item.classification.price * item.quantity),
                  0
                )}
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default Index;