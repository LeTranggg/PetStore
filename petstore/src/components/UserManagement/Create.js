import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Create({ onCreate }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirmed: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    role: ""
  });
  const [roles, setRoles] = useState([]); // Lưu danh sách role từ backend
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`/role`);
        setRoles(response.data);
      } catch (error) {
        setError("Failed to fetch roles.");
      }
    };
    fetchRoles();
  }, []);

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
      const response = await axios.post("/user", formData, {
        headers: {
          'Content-Type': 'application/json' // Ensure the headers are set for JSON data
        }
      });
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onCreate) {
          onCreate(response.data);
        }

        navigate("/users", { state: { message: "Tạo tài khoản thành công! Vui lòng kiểm tra email."}});
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
        setError(`Failed to create user: ${errorMessage}`);
      } else {
        setError("Failed to create user.");
        navigate("/users", { state: { message: "Không thể tạo tài khoản! Vui lòng thử lại." }});
      }
    }
  };

  return (
    <div>
      <h2>Create User</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input type="password" name="passwordConfirmed" value={formData.passwordConfirmed} onChange={handleInputChange} required />
        </div>
        <div>
          <label>First Name:</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Phone Number:</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Address:</label>
          <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleInputChange}>
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Create User</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Create;
