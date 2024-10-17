import React, { useState, useEffect } from "react";
import axios from "../../utils/Axios";
import Create from "./Create";
import Update from "./Update";
import Delete from "./Delete";

function Index() {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

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
  }, []);

  const handleDeleteRole = (id) => {
    setRoles((prevRoles) => prevRoles.filter((role) => role.id !== id));
  };

  const handleCreateRole = (newRole) => {
    setRoles((prevRoles) => [...prevRoles, newRole]);
  };

  const handleUpdateRole = (updatedRole) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === updatedRole.id ? updatedRole : role
      )
    );
  };

  return (
    <div>
      <h2>Roles List</h2>
      {error && <p>{error}</p>}
      {roles.length === 0 ? (
        <p>No roles found.</p>
      ) : (
        <ul>
          {roles.map((role) => (
            <li key={role.id}>
              <h3>{role.id}</h3>
              {role.name}
              <Update roleId={role.id} onUpdate={handleUpdateRole} />
              <Delete roleId={role.id} onDelete={handleDeleteRole} />
            </li>
          ))}
        </ul>
      )}
      <Create onCreate={handleCreateRole} />
    </div>
  );
}

export default Index;
