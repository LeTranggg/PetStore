import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Delete({ roleId, onDelete }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`/role/${roleId}`);
      setSuccess(true);
      setError(null);
      onDelete(roleId);  // Gọi callback để xóa role khỏi danh sách
      navigate("/roles", { state: { message: "Xoá role thành công!", type: 'success' }});
    } catch (error) {
      setSuccess(false);
      navigate("/roles", { state: { message: "Không thể xoá role! Vui lòng thử lại. ", type: 'danger' }});
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
