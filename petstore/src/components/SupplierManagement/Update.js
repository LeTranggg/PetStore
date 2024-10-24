import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from "../../utils/Axios";

function Update({ onUpdate }) {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phoneNumber: "",
    address: "",
  });
  const [error, setError] = useState(null);

  console.log('supplier ID:', supplierId);

  useEffect(() => {
    if (!supplierId) {
      setError("Supplier ID is not provided.");
      return;
    }

    const fetchSupplier = async () => {
      try {
        const response = await axios.get(`/supplier/${supplierId}`);
        const supplierData = response.data;

        setFormData({
          email: supplierData.email,
          name: supplierData.name,
          phoneNumber: supplierData.phoneNumber,
          address: supplierData.address
        });
      } catch (error) {
        setError("Failed to fetch supplier.");
      }
    };

    fetchSupplier();
  }, [supplierId]);

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
      name: formData.name.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      address: formData.address.trim(),
    };

    if (!updatedData.email || !updatedData.name || !updatedData.phoneNumber || !updatedData.address) {
      setError("All fields must be filled out.");
      return;
    }

    try {
      console.log("Updated Data Payload:", JSON.stringify(updatedData));
      const response = await axios.put(`/supplier/${supplierId}`, updatedData);
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onUpdate) {
          onUpdate(updatedData);
        }

        navigate("/suppliers", { state: { message: "Cập nhật supplier thành công!" }});
      } else {
        // Nếu mã trạng thái không phải 2xx, coi như thất bại
        throw new Error("API failed but role might have been created.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
        setError(`Failed to update supplier: ${errorMessage}`);
      } else {
        setError("Failed to update supplier.");
        navigate("/suppliers", { state: { message: "Không thể cập nhật supplier! Vui lòng thử lại." }});
      }
    }

  };

  return (
    <div>
      <h2>Update supplier</h2>
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
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
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
        <button type="submit">Update</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Update;
