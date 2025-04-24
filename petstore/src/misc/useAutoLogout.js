import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { message: 'No token found. Please log in.' } });
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Chuyển từ giây sang milliseconds
        const now = Date.now();

        if (now >= exp) {
          localStorage.removeItem('token');
          localStorage.removeItem('loginTime'); // Nếu có dùng loginTime từ trước
          navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
        }
      } catch (err) {
        console.error('Invalid token format:', err);
        localStorage.removeItem('token');
        navigate('/login', { state: { message: 'Invalid token. Please log in again.' } });
      }
    };

    // Kiểm tra ngay khi load
    checkTokenExpiration();

    // Kiểm tra định kỳ mỗi 10 giây
    const interval = setInterval(checkTokenExpiration, 10000);

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(interval);
  }, [navigate]);
};

export default useAutoLogout;