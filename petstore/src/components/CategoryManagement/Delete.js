import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Delete({ categoryId, onDelete }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`/category/${categoryId}`);
      setSuccess(true);
      setError(null);
      onDelete(categoryId);  // Gọi callback để xóa category khỏi danh sách
      navigate("/categories", { state: { message: "Xoá category thành công!", type: 'success' }});
    } catch (error) {
      setSuccess(false);
      navigate("/categories", { state: { message: "Không thể xoá category! Vui lòng thử lại.", type: 'danger' }});
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete Category</button>
      {error && <p>{error}</p>}
      {success && <p>Category deleted successfully!</p>}
    </div>
  );
}

export default Delete;
