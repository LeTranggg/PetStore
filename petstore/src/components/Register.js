import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/Axios";

function Register({ onCreate }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirmed: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: ""
  });
  const [error, setError] = useState(null);

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
      const response = await axios.post("/account/register", formData, {
        headers: {
          'Content-Type': 'application/json' // Ensure the headers are set for JSON data
        }
      });
      if (response.status === 201 || response.status === 200) { // Kiểm tra mã trạng thái trả về
        setError(null);
        if (onCreate) {
          onCreate(response.data);
        }

        navigate("/login", { state: { message: "Đăng ký tài khoản thành công! Vui lòng kiểm tra email.", type: 'success'}});
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
        setError(`Failed to create user: ${errorMessage}`);
      } else {
        navigate("/login", { state: { message: "Không thể đăng ký tài khoản! Vui lòng thử lại.", type: 'danger' }});
      }
    }
  };

  return (
    <div className="body-login">
      <div className="login-container">
        <h2>Create User</h2>
        <form onSubmit={handleSubmit}>
          <div class="form-group">
              <input type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required />
          </div>
          <div class="form-group">
            <div className="password-container">
              <input type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required />
            </div>
          </div>
          <div class="form-group">
              <div className="password-container">
                <input type="password"
                  name="passwordConfirmed"
                  placeholder="Password confirmation"
                  value={formData.passwordConfirmed}
                  onChange={handleInputChange}
                    required />
              </div>
            </div>
          <div class="form-row">
		          <div class="form-group col-md-6">
                <input type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required />
              </div>
              <div class="form-group col-md-6">
                <input type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required />
              </div>
	        </div>
          <div class="form-group">
              <input type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                required />
          </div>
          <div class="form-row">
            <div class="form-group col-md-6">
                <input type="text"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required />
            </div>
            <div class="form-group col-md-6">
                <input type="date"
                  name="dateOfBirth"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required />
            </div>
          </div>
          <button className="login-button" type="submit">Register</button>
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
          Google
        </button>
        <div className="login-footer">
          Have an account? <Link to="/login">Login</Link>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default Register;
