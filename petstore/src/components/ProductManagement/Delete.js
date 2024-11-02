import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Delete({ productId, onDelete }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`/product/${productId}`);
      setSuccess(true);
      setError(null);
      onDelete(productId);  // Gọi callback để xóa product khỏi danh sách
      navigate("/products", { state: { message: "Xoá product thành công!", type: 'success' }});
    } catch (error) {
      setSuccess(false);
      navigate("/products", { state: { message: "Không thể xoá product! Vui lòng thử lại.", type: 'danger' }});
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete Product</button>
      {error && <p>{error}</p>}
      {success && <p>Product deleted successfully!</p>}
    </div>
  );
}

export default Delete;
