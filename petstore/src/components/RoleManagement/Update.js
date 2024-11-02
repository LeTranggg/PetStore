import React, { useState, useEffect } from "react";
import axios from "../../utils/Axios";
import { useNavigate, useParams } from "react-router-dom";

function Update({ onUpdate }) {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get(`/role/${roleId}`);
        setName(response.data.name);
      } catch (error) {
        setError("Failed to fetch roles.");
      }
    };
    fetchRole();
  }, [roleId]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const updatedRole = {
      name: name.trim(), // Loại bỏ khoảng trắng thừa
      // Nếu backend yêu cầu thêm các trường khác, hãy bổ sung chúng ở đây
    };
    const response = await axios.put(`/role/${roleId}`, updatedRole);
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onUpdate) {
          onUpdate(updatedRole);
        }

        navigate("/roles", { state: { message: "Cập nhật role thành công!", type: 'success' } });
      } else {
        // Nếu mã trạng thái không phải 2xx, coi như thất bại
        throw new Error("API failed but role might have been created.");
      }
    } catch (error) {
      console.error('Error:', error); // Log chi tiết lỗi
      navigate("/roles", { state: { message: "Không thể cập nhật role! Vui lòng thử lại.", type: 'danger' } });
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

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Update;
