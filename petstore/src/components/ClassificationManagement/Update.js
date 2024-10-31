import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from "../../utils/Axios";

function Update({ onUpdate }) {
  const navigate = useNavigate();
  const { classificationId } = useParams();
  const [formData, setFormData] = useState({
    value: "",
    name: "",
    price: "",
    quantity: "",
    weight: "",
    height: "",
    length: "",
    width: "",
    product: ""
  });
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  console.log('classification ID:', classificationId);

  useEffect(() => {
    if (!classificationId) {
      setError("classification ID is not provided.");
      return;
    }

    const fetchClassification = async () => {
      try {
        const response = await axios.get(`/classification/${classificationId}`);
        const classificationData = response.data;

        setFormData({
          value: classificationData.value,
          name: classificationData.name,
          price: classificationData.price,
          quantity: classificationData.quantity,
          weight: classificationData.weight,
          height: classificationData.height,
          length: classificationData.length,
          width: classificationData.width,
          product: classificationData.product || ""
        });
      } catch (error) {
        setError("Failed to fetch classification.");
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get("/product");
        setProducts(response.data);
      } catch (error) {
        setError("Failed to fetch products.");
      }
    };

    fetchClassification();
    fetchProducts();
  }, [classificationId]);

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
      value: formData.value.trim(),
      name: formData.name.trim(),
      price: String(formData.price).trim(),
      quantity: String(formData.quantity).trim(),
      weight: String(formData.weight).trim(),
      height: String(formData.height).trim(),
      length: String(formData.length).trim(),
      width: String(formData.width).trim(),
      product: typeof formData.product === 'object' ? formData.product.name : formData.product
    };

    if (!updatedData.value || !updatedData.name || !updatedData.price || !updatedData.quantity || !updatedData.weight || !updatedData.height || !updatedData.length || !updatedData.width || (!updatedData.product && formData.product === "")) {
      setError("All fields must be filled out.");
      return;
    }

    try {
      console.log("Updated Data Payload:", JSON.stringify(updatedData));
      const response = await axios.put(`/classification/${classificationId}`, updatedData);
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onUpdate) {
          onUpdate(updatedData);
        }

        navigate("/classifications", { state: { message: "Cập nhật classification thành công!" }});
      } else {
        // Nếu mã trạng thái không phải 2xx, coi như thất bại
        throw new Error("API failed but role might have been created.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
        setError(`Failed to update classification: ${errorMessage}`);
      } else {
        setError("Failed to update classification.");
        setError("Không thể cập nhật classification! Vui lòng thử lại.");
      }
    }

  };

  return (
    <div>
      <h2>Update classification</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Value:</label>
          <input
            type="text"
            name="value"
            value={formData.value}
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
          <label>Price:</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Weight:</label>
          <input
            type="text"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Height:</label>
          <input
            type="text"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Length:</label>
          <input
            type="text"
            name="length"
            value={formData.length}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Width:</label>
          <input
            type="text"
            name="width"
            value={formData.width}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Product:</label>
          <select name="product" value={formData.product.name} onChange={handleInputChange}>
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name}
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
