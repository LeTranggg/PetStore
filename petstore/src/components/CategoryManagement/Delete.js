import React, { useState } from "react";
import axios from "../../utils/Axios";

function Delete({ categoryId, onDelete }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`/category/${categoryId}`);
      setSuccess(true);
      setError(null);
      onDelete(categoryId);  // Gọi callback để xóa category khỏi danh sách
    } catch (error) {
      setError("Failed to delete category.");
      setSuccess(false);
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
