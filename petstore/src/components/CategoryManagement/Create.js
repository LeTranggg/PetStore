import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";

function Create({ onCreate }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/category", { name });

      if (response.status === 201 || response.status === 200) {
        setError(null);
        setName(""); // Clear the input after success
        if (onCreate) {
          onCreate(response.data);
        }

        // Chuyển hướng ngay lập tức và truyền message tới trang Index
        navigate("/categories", { state: { message: "Tạo category thành công!", type: 'success' } });
      } else {
        throw new Error("API failed but category might have been created.");
      }
    } catch (error) {
      navigate("/categories", { state: { message: "Không thể tạo category! Vui lòng thử lại.", type: 'danger' } });
    }
  };

  return (
    <div>
      <h2>Create category</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>category Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Create;
