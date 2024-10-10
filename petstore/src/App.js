import React, { useState } from 'react';
import Login from './components/Login';
import Logout from './components/Logout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token')); // Kiểm tra token trong localStorage

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login setAuth={setIsAuthenticated} /> // Truyền setAuth vào Login component
      ) : (
        <div>
          <h2>Chào mừng bạn!</h2>
          <Logout setAuth={setIsAuthenticated} />
        </div>
      )}
    </div>
  );
}

export default App;
