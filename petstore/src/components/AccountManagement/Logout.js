import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the token from local storage
    localStorage.removeItem('token');

    // Redirect to the login page
    navigate('/');
  }, [navigate]);

  return (
    <div className="logout-container">
      <p>Logging out...</p>
    </div>
  );
}

export default Logout;