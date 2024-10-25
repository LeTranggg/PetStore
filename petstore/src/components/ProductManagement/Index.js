import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import axios from "../../utils/Axios";
import Delete from "./Delete";

function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);

  const handleCreateProductClick = () => {
    navigate("/products/create"); // Điều hướng tới trang create product
  };
  const handleUpdateProductClick = (productId) => {
    navigate(`/products/update/${productId}`); // Điều hướng tới trang update với productId
  };

  // Fetch roles immediately when the component is mounted
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/product");
        const fetchedProducts = response.data;
        setProducts(fetchedProducts);
      } catch (error) {
        setError("Failed to fetch products.");
      }
    };

    fetchProducts();
  }, []); // This will run only once when the component mounts

  // Handle toast message visibility
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDeleteProduct = (id) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
  };

  return (
    <div>
      <h2>Products List</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p>{error}</p>}
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.price}</td>
                <td>{product.category ? product.category.name : "No Category Assigned"}</td>
                <td>{product.supplier ? product.supplier.name : "No Supplier Assigned"}</td>
                <td>
                  <button key={product.id} type="button" onClick={() => handleUpdateProductClick(product.id)}>Update</button>
                  <Delete productId={product.id} onDelete={handleDeleteProduct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" onClick={() => handleCreateProductClick()}>Create</button>

      <ToastContainer position="top-end" className="p-3">
        {message && (
          <Toast bg="success" onClose={() => setMessage(null)} show={!!message} delay={3000} autohide>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </div>
  );
}

export default Index;
