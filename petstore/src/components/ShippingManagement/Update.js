import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from "../../utils/Axios";

function Update({ onUpdate }) {
  const navigate = useNavigate();
  const { shippingId } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    price: ""
  });
  const [error, setError] = useState(null);

  console.log('shipping ID:', shippingId);

  useEffect(() => {
    if (!shippingId) {
      setError("shipping ID is not provided.");
      return;
    }

    const fetchShipping = async () => {
      try {
        const response = await axios.get(`/shipping/${shippingId}`);
        const shippingData = response.data;

        setFormData({
          name: shippingData.name,
          price: shippingData.price
        });
      } catch (error) {
        setError("Failed to fetch shipping.");
      }
    };

    fetchShipping();
  }, [shippingId]);

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
      name: formData.name.trim(),
      price: String(formData.price).trim()
    };

    if (!updatedData.name || !updatedData.price) {
      setError("All fields must be filled out.");
      return;
    }

    try {
      console.log("Updated Data Payload:", JSON.stringify(updatedData));
      const response = await axios.put(`/shipping/${shippingId}`, updatedData);
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onUpdate) {
          onUpdate(updatedData);
        }

        navigate("/shippings", { state: { message: "Cập nhật shipping thành công!", type: 'success' }});
      } else {
        // Nếu mã trạng thái không phải 2xx, coi như thất bại
        throw new Error("API failed but role might have been created.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
        setError(`Failed to update shipping: ${errorMessage}`);
      } else {
        navigate("/shippings", { state: { message: "Không thể cập nhật shipping! Vui lòng thử lại.", type: 'danger' }});
      }
    }

  };

  return (
    <div>
      <h2>Update shipping</h2>
      <form onSubmit={handleSubmit}>
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
          <label>Price:</label>
          <input
            type="text"
            name="price"
            value={formData.price}
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
