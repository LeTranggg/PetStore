import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Delete({ shippingId, onDelete }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`/shipping/${shippingId}`);
      setSuccess(true);
      setError(null);
      onDelete(shippingId);  // Gọi callback để xóa shipping khỏi danh sách
      navigate("/shippings", { state: { message: "Xoá shipping thành công!", type: 'success' }});
    } catch (error) {
      setSuccess(false);
      navigate("/shippings", { state: { message: "Không thể xoá shipping! Vui lòng thử lại.", type: 'danger' }});
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete shipping</button>
      {error && <p>{error}</p>}
      {success && <p>Shipping deleted successfully!</p>}
    </div>
  );
}

export default Delete;
