import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:7100/api',
});

// Thêm JWT token vào headers của tất cả các yêu cầu
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;