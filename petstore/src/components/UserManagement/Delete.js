import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Delete({ userId, onDelete }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`/user/${userId}`);
      setSuccess(true);
      setError(null);
      onDelete(userId);  // Gọi callback để xóa user khỏi danh sách
      navigate("/users", { state: { message: "Xoá tài khoản thành công!", type: 'success' }});
    } catch (error) {
      setSuccess(false);
      navigate("/users", { state: { message: "Không thể xoá tài khoản! Vui lòng thử lại.", type: 'danger' }});
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete User</button>
      {error && <p>{error}</p>}
      {success && <p>User deleted successfully!</p>}
    </div>
  );
}

export default Delete;
