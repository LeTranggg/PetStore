import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from "../../utils/Axios";

function Update({ onUpdate }) {
  const navigate = useNavigate();
  const { productId } = useParams();
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

  console.log('product ID:', productId);

  useEffect(() => {
    if (!productId) {
      setError("Product ID is not provided.");
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/product/${productId}`);
        const productData = response.data;

        setFormData({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category || "",
          supplier: productData.supplier || ""
        });
      } catch (error) {
        setError("Failed to fetch product.");
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get("/category");
        setCategories(response.data);
      } catch (error) {
        setError("Failed to fetch categories.");
      }
    };

    const fetchSuppliers = async () => {
      try {
        const response = await axios.get("/supplier");
        setSuppliers(response.data);
      } catch (error) {
        setError("Failed to fetch suppliers.");
      }
    };

    fetchProduct();
    fetchCategories();
    fetchSuppliers();
  }, [productId]);

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
      description: formData.description.trim(),
      price: String(formData.price).trim(),
      category: typeof formData.category === 'object' ? formData.category.name : formData.category,
      supplier: typeof formData.supplier === 'object' ? formData.supplier.name : formData.supplier
    };

    if (!updatedData.name || !updatedData.price || (!updatedData.category && formData.category === "")|| (!updatedData.supplier && formData.supplier === "")) {
      setError("All fields must be filled out.");
      return;
    }

    try {
      console.log("Updated Data Payload:", JSON.stringify(updatedData));
      const response = await axios.put(`/product/${productId}`, updatedData);
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onUpdate) {
          onUpdate(updatedData);
        }

        navigate("/products", { state: { message: "Cập nhật product thành công!", type: 'success' }});
      } else {
        // Nếu mã trạng thái không phải 2xx, coi như thất bại
        throw new Error("API failed but role might have been created.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
        setError(`Failed to update product: ${errorMessage}`);
      } else {
        navigate("/products", { state: { message: "Không thể cập nhật product! Vui lòng thử lại.", type: 'danger' }});
      }
    }

  };

  return (
    <div>
      <h2>Update product</h2>
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
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
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
          <label>Category:</label>
          <select name="category" value={formData.category.name} onChange={handleInputChange}>
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
          <select name="supplier" value={formData.supplier.name} onChange={handleInputChange}>
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.name}>
                {supplier.name}
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
