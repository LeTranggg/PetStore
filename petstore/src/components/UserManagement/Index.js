import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import axios from "../../utils/Axios";
import Delete from "./Delete";

function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);

  const handleCreateUserClick = () => {
    navigate("/users/create"); // Điều hướng tới trang create user
  };
  const handleUpdateUserClick = (userId) => {
    navigate(`/users/update/${userId}`); // Điều hướng tới trang update với userId
  };

  // Fetch roles immediately when the component is mounted
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/user");
        const fetchedUsers = response.data;
        setUsers(fetchedUsers);
      } catch (error) {
        setError("Failed to fetch users.");
      }
    };

    fetchUsers();
  }, []); // This will run only once when the component mounts

  // Handle toast message visibility
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDeleteUser = (id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  // Hàm generateRandomPassword tạo mật khẩu ngẫu nhiên
  const generateRandomPassword = () => {
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const specialChars = "!@#$%^&*?";
    // Chọn ít nhất 1 ký tự từ mỗi loại
    let password = "";
    password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
    password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

    // Tạo chuỗi ký tự cho các ký tự còn lại
    const allChars = upperChars + lowerChars + numberChars + specialChars;

    // Bổ sung các ký tự ngẫu nhiên để đủ ít nhất 8 ký tự
    while (password.length < 8) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Trộn ngẫu nhiên các ký tự trong mật khẩu để đảm bảo tính ngẫu nhiên
    const shuffledPassword = password.split('').sort(() => 0.5 - Math.random()).join('');

    return shuffledPassword;
  };

  // Hàm handlePasswordReset để reset mật khẩu người dùng
  const handlePasswordReset = async (userId) => {
    const newPassword = generateRandomPassword(); // Tạo mật khẩu ngẫu nhiên một lần
    try {
      await axios.put(`/user/${userId}`, {
        password: newPassword,
        passwordConfirmed: newPassword // Sử dụng cùng một giá trị cho password và passwordConfirmed
      });
      alert('Mật khẩu mới đã được gửi đến email của bạn.');
    } catch (error) {
      console.error("Failed to reset password:", error); // Log lỗi chi tiết để xem trong console
      alert("Failed to reset password.");
    }
  };

  return (
    <div>
      <h2>Users List</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p>{error}</p>}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Address</th>
              <th>Phone Number</th>
              <th>Date of Birth</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.address}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}</td>
                <td>{user.role ? user.role.name : "No Role Assigned"}</td>
                <td>
                  <button key={user.id} type="button" onClick={() => handleUpdateUserClick(user.id)}>Update</button>
                  <Delete userId={user.id} onDelete={handleDeleteUser} />
                  {/* Nút Reset Password mới */}
                  <button type="button" onClick={() => handlePasswordReset(user.id)}>Reset Password</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" onClick={() => handleCreateUserClick()}>Create</button>

      <ToastContainer position="top-end" className="p-3">
        {message && (
          <Toast
            bg={location.state?.type === 'success' ? 'success' : 'danger'}
            onClose={() => setMessage(null)}
            show={!!message}
            delay={3000}
            autohide>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </div>
  );
}

export default Index;
