import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import axios from "../../utils/Axios";
import Delete from "./Delete";

function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);

  const handleCreateSupplierClick = () => {
    navigate("/suppliers/create"); // Điều hướng tới trang create supplier
  };
  const handleUpdateSupplierClick = (supplierId) => {
    navigate(`/suppliers/update/${supplierId}`); // Điều hướng tới trang update với supplierId
  };

  // Fetch roles immediately when the component is mounted
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get("/supplier");
        const fetchedSuppliers = response.data;
        setSuppliers(fetchedSuppliers);
      } catch (error) {
        setError("Failed to fetch suppliers.");
      }
    };

    fetchSuppliers();
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

  const handleDeleteSupplier = (id) => {
    setSuppliers((prevSuppliers) => prevSuppliers.filter((supplier) => supplier.id !== id));
  };

  return (
    <div>
      <h2>Suppliers List</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p>{error}</p>}
      {suppliers.length === 0 ? (
        <p>No suppliers found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Address</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.id}</td>
                <td>{supplier.email}</td>
                <td>{supplier.name}</td>
                <td>{supplier.address}</td>
                <td>{supplier.phoneNumber}</td>
                <td>
                  <button key={supplier.id} type="button" onClick={() => handleUpdateSupplierClick(supplier.id)}>Update</button>
                  <Delete supplierId={supplier.id} onDelete={handleDeleteSupplier} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" onClick={() => handleCreateSupplierClick()}>Create</button>

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
