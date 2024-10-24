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
      const response = await axios.post("/role", { name });

      if (response.status === 201 || response.status === 200) {
        setError(null);
        setName(""); // Clear the input after success
        if (onCreate) {
          onCreate(response.data);
        }

        // Chuyển hướng ngay lập tức và truyền message tới trang Index
        navigate("/roles", { state: { message: "Tạo role thành công!" } });
      } else {
        throw new Error("API failed but role might have been created.");
      }
    } catch (error) {
      setError("Không thể tạo role! Vui lòng thử lại.");
    }
  };

  return (
    <div>
      <h2>Create Role</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Role Name:</label>
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
