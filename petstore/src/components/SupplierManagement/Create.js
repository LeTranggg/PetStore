import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Create({ onCreate }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phoneNumber: "",
    address: "",
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
      const response = await axios.post("/supplier", formData, {
        headers: {
          'Content-Type': 'application/json' // Ensure the headers are set for JSON data
        }
      });
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onCreate) {
          onCreate(response.data);
        }

        navigate("/suppliers", { state: { message: "Tạo supplier thành công!", type: 'success'}});
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
        setError(`Failed to create supplier: ${errorMessage}`);
      } else {
        navigate("/suppliers", { state: { message: "Không thể tạo supplier! Vui lòng thử lại.", type: 'danger' }});
      }
    }
  };

  return (
    <div>
      <h2>Create supplier</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Phone Number:</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Address:</label>
          <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
        </div>
        <button type="submit">Create supplier</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Create;
