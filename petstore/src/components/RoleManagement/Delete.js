import React, { useState } from "react";
import axios from "../../utils/Axios";

function Delete({ roleId, onDelete }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`/role/${roleId}`);
      setSuccess(true);
      setError(null);
      onDelete(roleId);  // Gọi callback để xóa role khỏi danh sách
    } catch (error) {
      setError("Failed to delete role.");
      setSuccess(false);
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete Role</button>
      {error && <p>{error}</p>}
      {success && <p>Role deleted successfully!</p>}
    </div>
  );
}

export default Delete;
