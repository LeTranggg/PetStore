import React, { useState } from "react";
import axios from "../../utils/Axios";

function Create({ onCreate }) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/role", { name });
      setSuccess(true);
      setError(null);
      setName(""); // Clear the input after success

      // Gọi callback để thêm role vào danh sách
      onCreate(response.data);
    } catch (error) {
      setError("Failed to create role.");
      setSuccess(false);
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
      {error && <p>{error}</p>}
      {success && <p>Role created successfully!</p>}
    </div>
  );
}

export default Create;
