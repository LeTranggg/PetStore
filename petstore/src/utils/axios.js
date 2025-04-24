import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:7100/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', config.headers.Authorization); // Log để kiểm tra
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => {
    console.log('Raw response from interceptor:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Danh sách các endpoint liên quan đến user mà lỗi 404 nên dẫn đến đăng xuất
    const userRelatedEndpoints = ['/account/', '/cart/', '/orders/'];

    // Endpoint không áp dụng logic đăng xuất cho lỗi 401
    const exclude401Endpoints = ['/google-login'];

    // Xử lý lỗi 401, 403 (user bị khóa hoặc token không hợp lệ) và 404 (user bị xóa)
    if (
      (error.response?.status === 401 && !exclude401Endpoints.some(endpoint => error.config.url.includes(endpoint))) || // Token không hợp lệ hoặc user bị khóa
      error.response?.status === 403 || // User bị khóa
      (error.response?.status === 404 && userRelatedEndpoints.some(endpoint => error.config.url.includes(endpoint))) // User bị xóa
    ) {
      localStorage.removeItem('token');
      const message =
        error.response?.status === 404
          ? 'Your account no longer exists.'
          : 'Your account has been locked by an admin or your session is invalid.';
      window.location.href = '/login?message=' + encodeURIComponent(message);
    }

    return Promise.reject(error);
  }
);

export default API;