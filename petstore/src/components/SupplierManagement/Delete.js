import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Delete({ supplierId, onDelete }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`/supplier/${supplierId}`);
      setSuccess(true);
      setError(null);
      onDelete(supplierId);  // Gọi callback để xóa supplier khỏi danh sách
      navigate("/suppliers", { state: { message: "Xoá supplier thành công!" }});
    } catch (error) {
      setError("Failed to delete supplier.");
      setSuccess(false);
      navigate("/suppliers", { state: { message: "Không thể xoá supplier! Vui lòng thử lại." }});
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete supplier</button>
      {error && <p>{error}</p>}
      {success && <p>Supplier deleted successfully!</p>}
    </div>
  );
}

export default Delete;
