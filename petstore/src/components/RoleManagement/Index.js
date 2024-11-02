import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";
import { Toast, ToastContainer } from "react-bootstrap";
import Delete from "./Delete";

function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);

  const handleCreateRoleClick = () => {
    navigate("/roles/create");
  };

  const handleUpdateRoleClick = (roleId) => {
    navigate(`/roles/update/${roleId}`);
  };

  // Fetch roles immediately when the component is mounted
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get("/role");
        setRoles(response.data);
      } catch (error) {
        setError("Failed to fetch roles.");
      }
    };

    fetchRoles();
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

  const handleDeleteRole = (id) => {
    setRoles((prevRoles) => prevRoles.filter((role) => role.id !== id));
  };

  return (
    <div>
      <h2>Roles List</h2>
      {error && <p>{error}</p>}
      {roles.length === 0 ? (
        <p>No roles found.</p>
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
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.name}</td>
                <td>
                  <button key={role.id} type="button" onClick={() => handleUpdateRoleClick(role.id)}>Update</button>
                  <Delete roleId={role.id} onDelete={handleDeleteRole} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" onClick={handleCreateRoleClick}>Create</button>

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
