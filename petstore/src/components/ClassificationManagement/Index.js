import React, { useEffect, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";
import Delete from "./Delete";

function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [classifications, setClassifications] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);

  const handleCreateClassificationClick = () => {
    navigate("/classifications/create"); // Điều hướng tới trang create classification
  };
  const handleUpdateClassificationClick = (classificationId) => {
    navigate(`/classifications/update/${classificationId}`); // Điều hướng tới trang update với classificationId
  };

  // Fetch roles immediately when the component is mounted
  useEffect(() => {
    const fetchClassifications = async () => {
      try {
        const response = await axios.get("/classification");
        const fetchedClassifications = response.data;
        setClassifications(fetchedClassifications);
      } catch (error) {
        setError("Failed to fetch classifications.");
      }
    };

    fetchClassifications();
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

  const handleDeleteClassification = (id) => {
    setClassifications((prevClassifications) => prevClassifications.filter((classification) => classification.id !== id));
  };

  return (
    <div>
      <h2>classifications List</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p>{error}</p>}
      {classifications.length === 0 ? (
        <p>No classifications found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Value</th>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Weight</th>
              <th>Height</th>
              <th>Length</th>
              <th>Width</th>
              <th>Product</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classifications.map((classification) => (
              <tr key={classification.id}>
                <td>{classification.id}</td>
                <td>{classification.value}</td>
                <td>{classification.name}</td>
                <td>{classification.price}</td>
                <td>{classification.quantity}</td>
                <td>{classification.weight}</td>
                <td>{classification.height}</td>
                <td>{classification.length}</td>
                <td>{classification.width}</td>
                <td>{classification.product ? classification.product.name : "No product Assigned"}</td>
                <td>
                  <button key={classification.id} type="button" onClick={() => handleUpdateClassificationClick(classification.id)}>Update</button>
                  <Delete classificationId={classification.id} onDelete={handleDeleteClassification} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" onClick={() => handleCreateClassificationClick()}>Create</button>

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
