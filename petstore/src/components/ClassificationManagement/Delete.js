import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Delete({ classificationId, onDelete }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`/classification/${classificationId}`);
      setSuccess(true);
      setError(null);
      onDelete(classificationId);  // Gọi callback để xóa classification khỏi danh sách
      navigate("/classifications", { state: { message: "Xoá classification thành công!" }});
    } catch (error) {
      setError("Failed to delete classification.");
      setSuccess(false);
      navigate("/classifications", { state: { message: "Không thể xoá classification! Vui lòng thử lại." }});
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete classification</button>
      {error && <p>{error}</p>}
      {success && <p>Classification deleted successfully!</p>}
    </div>
  );
}

export default Delete;
