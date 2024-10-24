import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from "../../utils/Axios";

function Update({ onUpdate }) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    role: ""
  });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

  console.log('User ID:', userId);

  useEffect(() => {
    if (!userId) {
      setError("User ID is not provided.");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`/user/${userId}`);
        const userData = response.data;

        setFormData({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          dateOfBirth: userData.dateOfBirth?.split("T")[0], // Handle date formatting
          role: userData.role || ""
        });
      } catch (error) {
        setError("Failed to fetch user.");
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axios.get("/role");
        setRoles(response.data);
      } catch (error) {
        setError("Failed to fetch roles.");
      }
    };

    fetchUser();
    fetchRoles();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      address: formData.address.trim(),
      dateOfBirth: formData.dateOfBirth.trim(),
      role: typeof formData.role === 'object' ? formData.role.name : formData.role,
    };

    if (!updatedData.email || !updatedData.firstName || !updatedData.lastName || !updatedData.phoneNumber || !updatedData.address || !updatedData.dateOfBirth || (!updatedData.role && formData.role === "")) {
      setError("All fields must be filled out.");
      return;
    }

    try {
      console.log("Updated Data Payload:", JSON.stringify(updatedData));
      const response = await axios.put(`/user/${userId}`, updatedData);
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onUpdate) {
          onUpdate(updatedData);
        }

        navigate("/users", { state: { message: "Cập nhật tài khoản thành công!" }});
      } else {
        // Nếu mã trạng thái không phải 2xx, coi như thất bại
        throw new Error("API failed but role might have been created.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
        setError(`Failed to update user: ${errorMessage}`);
      } else {
        setError("Failed to update user.");
        navigate("/users", { state: { message: "Không thể cập nhật tài khoản! Vui lòng thử lại." }});
      }
    }

  };

  return (
    <div>
      <h2>Update User</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Role:</label>
          <select name="role" value={formData.role.name} onChange={handleInputChange}>
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Update</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Update;
