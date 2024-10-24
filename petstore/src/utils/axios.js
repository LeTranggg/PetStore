import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://localhost:7100/api',
  withCredentials: true,
});

// Thêm JWT token vào headers của tất cả các yêu cầu
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error response is 401, clear the token and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token'); // Xóa token khỏi localStorage
      window.location.href = '/login'; // Chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

export default instance;