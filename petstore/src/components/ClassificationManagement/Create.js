import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Create({ onCreate }) {
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/product`);
        setProducts(response.data);
      } catch (error) {
        setError("Failed to fetch products.");
      }
    };

    fetchProducts();
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
      const response = await axios.post("/classification", formData, {
        headers: {
          'Content-Type': 'application/json' // Ensure the headers are set for JSON data
        }
      });
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onCreate) {
          onCreate(response.data);
        }

        navigate("/classifications", { state: { message: "Tạo classification thành công!", type: 'success'}});
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
        setError(`Failed to create classification: ${errorMessage}`);
      } else {
        navigate("/classifications", { state: { message: "Không thể tạo classification! Vui lòng thử lại.", type: 'danger' }});
      }
    }
  };

  return (
    <div>
      <h2>Create classification</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Value:</label>
          <input type="text" name="value" value={formData.value} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Price:</label>
          <input type="text" name="price" value={formData.price} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Quantity:</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required/>
        </div>
        <div>
          <label>Weight:</label>
          <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} required/>
        </div>
        <div>
          <label>Height:</label>
          <input type="text" name="height" value={formData.height} onChange={handleInputChange} required/>
        </div>
        <div>
          <label>Length:</label>
          <input type="text" name="length" value={formData.length} onChange={handleInputChange} required/>
        </div>
        <div>
          <label>Width:</label>
          <input type="text" name="width" value={formData.width} onChange={handleInputChange} required/>
        </div>
        <div>
          <label>Product:</label>
          <select name="product" value={formData.product} onChange={handleInputChange}>
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Create classification</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Create;
