import React, { useState, useEffect } from "react";
import axios from "../../utils/Axios";

function Update({ roleId, onUpdate }) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get(`/role/${roleId}`);
        setName(response.data.name);
      } catch (error) {
        setError("Failed to fetch role.");
      }
    };
    fetchRole();
  }, [roleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedRole = { id: roleId, name };
      await axios.put(`/role/${roleId}`, updatedRole);
      setSuccess(true);
      setError(null);

      // Gọi hàm onUpdate để cập nhật role trong danh sách
      if (onUpdate) {
        onUpdate(updatedRole);
      }
    } catch (error) {
      setError("Failed to update role.");
      setSuccess(false);
    }
  };

  return (
    <div>
      <h2>Update Role</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Role Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update</button>
      </form>
      {error && <p>{error}</p>}
      {success && <p>Role updated successfully!</p>}
    </div>
  );
}

export default Update;
