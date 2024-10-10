import axios from "axios";
import React, { useState } from "react";

function Login({ setAuth }) {
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

      // If login is successful, store the JWT token
      const token = response.data.token;
      localStorage.setItem("token", token);

      // Update authentication status
      setAuth(true); // This will update the state in App.js

      // Redirect or show a success message
      console.log("Login successful");
    } catch (error) {
      setError("Login failed. Please check your credentials.");
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
