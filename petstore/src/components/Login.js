import axios from "axios";
import React, { useState } from "react";

function Login({ setAuth, setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page
    setLoading(true); // Hiển thị trạng thái loading
    setError(null); // Đặt lại lỗi nếu có

    try {
      const response = await axios.post("/api/account/login", {
        email: email,
        password: password,
      });

      // Nếu đăng nhập thành công, lưu token và role
      const { token, role } = response.data;

      if (role) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        setRole(role); // Set role cho App.js
        setAuth(true); // Set trạng thái authenticated thành true

        // Thông báo thành công
        console.log("Login successful, role:", role);
      } else {
        throw new Error("Role is undefined");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false); // Tắt loading sau khi xử lý xong
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        {/* Hiển thị loading khi đang chờ response */}
        {loading ? (
          <p>Logging in...</p>
        ) : (
          <>
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
          </>
        )}
      </form>
      {error && <p>{error}</p>} {/* Hiển thị lỗi nếu có */}
    </div>
  );
}

export default Login;
