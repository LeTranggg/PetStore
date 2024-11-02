import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Create({ onCreate }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    supplier: ""
  });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`/category`);
        setCategories(response.data);
      } catch (error) {
        setError("Failed to fetch categories.");
      }
    };

    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(`/supplier`);
        setSuppliers(response.data);
      } catch (error) {
        setError("Failed to fetch suppliers.");
      }
    };

    fetchCategories();
    fetchSuppliers();
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
      const response = await axios.post("/product", formData, {
        headers: {
          'Content-Type': 'application/json' // Ensure the headers are set for JSON data
        }
      });
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onCreate) {
          onCreate(response.data);
        }

        navigate("/products", { state: { message: "Tạo product thành công!", type: 'success'}});
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
        setError(`Failed to create product: ${errorMessage}`);
      } else {
        navigate("/products", { state: { message: "Không thể tạo product! Vui lòng thử lại.", type: 'danger' }});
      }
    }
  };

  return (
    <div>
      <h2>Create product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Description:</label>
          <input type="text" name="description" value={formData.description} onChange={handleInputChange} />
        </div>
        <div>
          <label>Price:</label>
          <input type="text" name="price" value={formData.price} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Category:</label>
          <select name="category" value={formData.category} onChange={handleInputChange}>
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Supplier:</label>
          <select name="supplier" value={formData.supplier} onChange={handleInputChange}>
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.name}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Create product</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Create;
