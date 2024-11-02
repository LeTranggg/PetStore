import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import axios from "../../utils/Axios";
import Delete from "./Delete";

function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [shippings, setShippings] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);

  const handleCreateShippingClick = () => {
    navigate("/shippings/create"); // Điều hướng tới trang create shipping
  };
  const handleUpdateShippingClick = (shippingId) => {
    navigate(`/shippings/update/${shippingId}`); // Điều hướng tới trang update với shippingId
  };

  // Fetch roles immediately when the component is mounted
  useEffect(() => {
    const fetchShippings = async () => {
      try {
        const response = await axios.get("/shipping");
        const fetchedShippings = response.data;
        setShippings(fetchedShippings);
      } catch (error) {
        setError("Failed to fetch shippings.");
      }
    };

    fetchShippings();
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

  const handleDeleteShipping = (id) => {
    setShippings((prevShippings) => prevShippings.filter((shipping) => shipping.id !== id));
  };

  return (
    <div>
      <h2>Shippings List</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p>{error}</p>}
      {shippings.length === 0 ? (
        <p>No shippings found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shippings.map((shipping) => (
              <tr key={shipping.id}>
                <td>{shipping.id}</td>
                <td>{shipping.name}</td>
                <td>{shipping.price}</td>
                <td>
                  <button key={shipping.id} type="button" onClick={() => handleUpdateShippingClick(shipping.id)}>Update</button>
                  <Delete shippingId={shipping.id} onDelete={handleDeleteShipping} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" onClick={() => handleCreateShippingClick()}>Create</button>

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
