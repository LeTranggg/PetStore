import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

function Login({ setAuth, setRole, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
  const [message, setMessage] = useState(location.state?.message || null);

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
      //console.log('Login response:', response.data);

      if (response.data && response.data.token) {
        // Lưu token
        localStorage.setItem('token', response.data.token);

        // Lấy thông tin user từ response
        const userData = response.data.user;

        if (userData) {
          // Lưu role riêng
          localStorage.setItem('role', userData.role);

          // Lưu toàn bộ thông tin user
          localStorage.setItem('user', JSON.stringify(userData));

          // Set states
          setAuth(true);
          setRole(userData.role);
          setUser(userData);

          //console.log('Saved user data:', userData);
          //console.log('Saved role:', userData.role);

          // Navigate to home
          navigate('/');
        }
      } else {
        setError("Invalid user data received");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false); // Tắt loading sau khi xử lý xong
    }
  };

  return (
    <div className="body-login">
      <div className="login-container">
        <h2>Log In</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-container">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "LOG IN"}
          </button>
        </form>
        <div className="or-separator">
          <span>OR</span>
        </div>
        <button className="google-login">
          <img
            src={`${process.env.PUBLIC_URL}/GoogleLogo.svg.webp`}
            alt="Google logo"
            className="google-logo"
          />
          Login with Google
        </button>
        <div className="login-footer">
          <div>
            <Link to="/forgot-pass">Forgot Password?</Link>
          </div>
          <div>
            Not a member? <Link to="/register">Register</Link>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
      </div>
      <ToastContainer position="top-end" className="p-3">
        {message && (
          <Toast
            bg={location.state?.type === "success" ? "success" : "danger"}
            onClose={() => setMessage(null)}
            show={!!message}
            delay={3000}
            autohide
          >
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </div>
  );
}

export default Login;
