import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../utils/Axios';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email = '', name = '', fromGoogle = false } = location.state || {};
  const [formData, setFormData] = useState({
    name: name || '',
    email: email || '',
    dateOfBirth: '',
    gender: 'Male',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    fromGoogle: fromGoogle || false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const clientId = '561388206826-upvque1t8hdmg1450kt5k0l10a1bbieu.apps.googleusercontent.com';

  useEffect(() => {
    if (fromGoogle) {
      setSuccess('Please complete your registration using your Google account.');
    }
  }, [fromGoogle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateDateOfBirth = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Điều chỉnh tuổi nếu sinh nhật chưa đến trong năm nay
    const adjustedAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;

    if (adjustedAge < 15) {
      return 'You must be at least 15 years old.';
    }
    if (adjustedAge > 90) {
      return 'Age cannot exceed 90 years.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const dobError = validateDateOfBirth(formData.dateOfBirth);
    if (dobError) {
      setError(dobError);
      return;
    }

    setLoading(true);
    setError('');

    const data = {
      name: formData.name,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      fromGoogle: formData.fromGoogle,
    };

    console.log('Register data:', data);

    try {
      const response = await API.post('/account/register', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      setSuccess(fromGoogle
        ? 'Registration successful! You can now log in with your new password or Google.'
        : 'Registration successful! Please check your email to confirm your account.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Registration error:', err.response); // Log toàn bộ response
      const errorMessage = err.response?.data?.message || err.response?.data?.title || (err.response?.data?.errors ? Object.values(err.response.data.errors)[0] : 'Registration failed');
      console.log('Parsed error message:', errorMessage);
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
        setTimeout(() => window.location.reload(), 0);
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
        <h2>Create an account</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <input className="form-group"
            type="email"
            placeholder='Email'
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            readOnly={fromGoogle} // Không cho sửa email nếu từ Google
          />

          <div className="form-row">

            <div className="form-group col-md-6">
              <input
                type="text"
                placeholder='Name'
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group col-md-6">
              <input
                type="tel"
                placeholder='Phone Number'
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="form-row">

            <div className="form-group col-md-6">
              <input
                type="date"
                placeholder='Date of Birth'
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group col-md-6">
              <select className="form-select"
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

          </div>

          <div className="form-row">

            <div className="form-group col-md-6">
              <input
                type="password"
                placeholder='Password'
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group col-md-6">
              <input
                type="password"
                placeholder='Confirm Password'
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <textarea className="form-group"
            id="address"
            placeholder='Address'
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <button className="button-save" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
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
          Already have an account? <a href="/login">Login</a>
        </div>

      </div>

    </div>
  );
}

export default Register;