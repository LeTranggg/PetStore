import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "../utils/Axios";

function Guest() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/product');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Welcome, Guest!</h2>
      <div>
        <Link to="/login">Đăng nhập</Link>
      </div>
      <div>
        <Link to="/register">Đăng ký</Link>
      </div>
      <div>
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <h2 className="text-xl font-bold mb-2">{product.name}</h2>
            <p className="text-lg font-semibold mb-2">${product.price}</p>
            <p className="mb-2">
              <span className="font-semibold">Category:</span> {product.category.name}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Supplier:</span> {product.supplier.name}
            </p>
            {product.description && (
              <p className="mb-4">{product.description}</p>
            )}
            <Link to={`/products/product-detail/${product.id}`}>View Details</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Guest;