import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const clientId = '561388206826-upvque1t8hdmg1450kt5k0l10a1bbieu.apps.googleusercontent.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/account/login', {
        email: formData.email,
        password: formData.password,
      });
      console.log('Full login response:', response); // Log toàn bộ response
      console.log('Login response data:', response.data);

      const token = response.data.token;
      if (!token) {
        throw new Error('No token returned from server. Response: ' + JSON.stringify(response.data));
      }

      localStorage.setItem('token', token);
      console.log('Stored token from login:', token);

      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded token claims from login:', payload);

      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const userId = payload.sub;
      console.log('User ID (sub):', userId, 'Role:', role);

      if (role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      console.log('Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    console.log('Google token:', credentialResponse.credential);
    try {
      const response = await API.post('/account/google-login', {
        token: credentialResponse.credential,
      });
      console.log('Full Google login response:', response);
      console.log('Google login response data:', response.data);

      const token = response.data.token;
      if (!token) {
        throw new Error('No token returned from Google login. Response: ' + JSON.stringify(response.data));
      }

      localStorage.setItem('token', token);
      console.log('Stored token from Google login:', token);

      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded token claims from Google login:', payload);

      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const userId = payload.sub;
      console.log('User ID (sub):', userId, 'Role:', role);

      if (role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      console.error('Google login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Google login failed';
      console.log('Error message:', errorMessage);

      if (errorMessage.startsWith("NewGoogleUser")) {
        const [, email, name] = errorMessage.split(":");
        console.log('Redirecting to register with:', { email, name });
        navigate('/register', { state: { email, name, fromGoogle: true } });
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("Google login failure:", error);
    setError('Google login failed');
  };

  return (
    <div className="auth">

      <div className="auth-body">
        <h2>Login account</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder='Email'
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder='Password'
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button className="button-save" type="submit" disabled={loading} style={{ borderRadius: '5px'}}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="or-separator">
          <span>OR</span>
        </div>

        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        </GoogleOAuthProvider>

        <div className="auth-footer">

          <div>
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <div>
            Not a member? <a href="/register">Register</a>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Login;