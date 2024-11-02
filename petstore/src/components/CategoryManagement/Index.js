import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";
import { Toast, ToastContainer } from "react-bootstrap";
import Delete from "./Delete";

function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);

  const handleCreateCategoryClick = () => {
    navigate("/categories/create");
  };

  const handleUpdateCategoryClick = (categoryId) => {
    navigate(`/categories/update/${categoryId}`);
  };

  // Fetch categories immediately when the component is mounted
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/category");
        setCategories(response.data);
      } catch (error) {
        setError("Failed to fetch categories.");
      }
    };

    fetchCategories();
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

  const handleDeleteCategory = (id) => {
    setCategories((prevCategories) => prevCategories.filter((category) => category.id !== id));
  };

  return (
    <div>
      <h2>Categories List</h2>
      {error && <p>{error}</p>}
      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>
                  <button key={category.id} type="button" onClick={() => handleUpdateCategoryClick(category.id)}>Update</button>
                  <Delete categoryId={category.id} onDelete={handleDeleteCategory} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" onClick={handleCreateCategoryClick}>Create</button>

      <ToastContainer position="top-end" className="p-3">
        {message && (
          <Toast
            bg={location.state?.type === 'success' ? 'success' : 'danger'}
            onClose={() => setMessage(null)}
            show={!!message}
            delay={3000}
            autohide>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </div>
  );
}

export default Index;
