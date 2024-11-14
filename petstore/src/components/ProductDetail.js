import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/Axios";
import { Card } from "react-bootstrap";

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const { productId } = useParams();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`/product/product-detail/${productId}`);
        setProduct(response.data);
        // Initialize selectedItems with 0 quantities
        const initial = {};
        response.data.classifications.forEach(c => {
          initial[c.id] = 0;
        });
        setSelectedItems(initial);
      } catch (error) {
        console.error('Error fetching product detail:', error);
      }
    };

    fetchProductDetail();
  }, [productId]);

  const handleQuantityChange = (classificationId, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [classificationId]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const addToCart = async () => {
  try {
    const items = Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([classificationId, quantity]) => ({
        classificationId: parseInt(classificationId),
        quantity: parseInt(quantity)
      }));

    // Only send request if there are items to add
    if (items.length === 0) {
      return;
    }

    // Send the items array directly
    await axios.post('/cart', items);

    alert('Items added to cart successfully!');
    // Reset quantities
    const reset = {};
    Object.keys(selectedItems).forEach(key => {
      reset[key] = 0;
    });
    setSelectedItems(reset);
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
      alert(`Error adding items to cart: ${error.response.data.message || 'Unknown error'}`);
    } else {
      alert('Error adding items to cart');
      console.error('Error adding to cart:', error);
    }
  }
};

  if (!product) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <div className="p-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-lg"><span className="font-semibold">Price:</span> ${product.price}</p>
              <p><span className="font-semibold">Category:</span> {product.category.name}</p>
              <p><span className="font-semibold">Supplier:</span> {product.supplier.name}</p>
              <p><span className="font-semibold">Description:</span></p>
              <p className="mt-2">{product.description}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Classifications</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Value</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Available</th>
              <th className="text-left p-2">Dimensions</th>
              <th className="text-left p-2">Weight</th>
              <th className="text-left p-2">Quantity to Add</th>
            </tr>
          </thead>
          <tbody>
            {product.classifications.map((classification) => (
              <tr key={classification.id} className="border-t">
                <td className="p-2">{classification.name}</td>
                <td className="p-2">{classification.value}</td>
                <td className="p-2">${classification.price}</td>
                <td className="p-2">{classification.quantity}</td>
                <td className="p-2">
                  {classification.height}×{classification.length}×{classification.width}
                </td>
                <td className="p-2">{classification.weight}</td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    max={classification.quantity}
                    value={selectedItems[classification.id] || 0}
                    onChange={(e) => handleQuantityChange(classification.id, e.target.value)}
                    className="w-20 p-1 border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={addToCart}
          disabled={!Object.values(selectedItems).some(q => q > 0)}>
          Add to Cart
        </button>
      </Card>
    </div>
  );
}

export default ProductDetail;