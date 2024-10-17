import axios from "axios";
import React, { useState } from "react";

function Login({ setAuth, setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page

    try {
      const response = await axios.post("/api/account/login", {
        email: email,
        password: password,
      });

      // Kiểm tra dữ liệu từ API
      console.log("Response data:", response.data);

      // If login is successful, store the JWT token and role
      const token = response.data.token;
      const role = response.data.role;

      if (role) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        setRole(role); // Set the role for App.js state
        setAuth(true); // Set authentication status to true in App.js

        // Redirect or show a success message
        console.log("Login successful, role:", role);
      } else {
        console.error("Role is undefined or missing in the response");
        setError("Unable to retrieve role information. Please contact support.");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;
