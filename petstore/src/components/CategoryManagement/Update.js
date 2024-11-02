import React, { useState, useEffect } from "react";
import axios from "../../utils/Axios";
import { useNavigate, useParams } from "react-router-dom";

function Update({ onUpdate }) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`/category/${categoryId}`);
        setName(response.data.name);
      } catch (error) {
        setError("Failed to fetch categories.");
      }
    };
    fetchCategory();
  }, [categoryId]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const updatedCategory = {
      name: name.trim(), // Loại bỏ khoảng trắng thừa
      // Nếu backend yêu cầu thêm các trường khác, hãy bổ sung chúng ở đây
    };
    const response = await axios.put(`/category/${categoryId}`, updatedCategory);
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onUpdate) {
          onUpdate(updatedCategory);
        }

        navigate("/categories", { state: { message: "Cập nhật category thành công!", type: 'success' } });
      } else {
        // Nếu mã trạng thái không phải 2xx, coi như thất bại
        throw new Error("API failed but category might have been created.");
      }
    } catch (error) {
      console.error('Error:', error); // Log chi tiết lỗi
      navigate("/categories", { state: { message: "Không thể cập nhật category! Vui lòng thử lại.", type: 'danger' } });
    }
  };

  return (
    <div>
      <h2>Update Category</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category Name:</label>
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
