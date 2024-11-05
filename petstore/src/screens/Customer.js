import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/Axios";
import { Card } from "react-bootstrap";

function Customer({ user }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/product');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      };
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Welcome, Customer!</h2>
      <p>Hello, {user.firstName}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link key={product.id} to={`/products/product-detail/${product.id}`}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-lg font-bold text-primary">${product.price}</p>
              <p className="text-gray-600">Category: {product.category.name}</p>
              <p className="text-gray-600">Supplier: {product.supplier.name}</p>
              {product.description && (
                <p className="mt-2 text-gray-700 line-clamp-2">
                  {product.description}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Customer;