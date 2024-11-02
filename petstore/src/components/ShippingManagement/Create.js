import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Create({ onCreate }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: ""
  });
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/shipping", formData, {
        headers: {
          'Content-Type': 'application/json' // Ensure the headers are set for JSON data
        }
      });
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onCreate) {
          onCreate(response.data);
        }

        navigate("/shippings", { state: { message: "Tạo shipping thành công!", type: 'success'}});
      } else {
        // Nếu mã trạng thái không phải 2xx, coi như thất bại
        throw new Error("API failed but role might have been created.");
      }
    } catch (error) {
      // Hiển thị chi tiết lỗi trả về từ backend
      if (error.response && error.response.data) {
        const errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
        setError(`Failed to create shipping: ${errorMessage}`);
      } else {
        navigate("/shippings", { state: { message: "Không thể tạo shipping! Vui lòng thử lại.", type: 'danger' }});
      }
    }
  };

  return (
    <div>
      <h2>Create shipping</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Price:</label>
          <input type="text" name="price" value={formData.price} onChange={handleInputChange} required />
        </div>
        <button type="submit">Create shipping</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Create;
