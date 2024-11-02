import React from "react";
import { Link } from 'react-router-dom';

function Admin({ user }) {

  return (
    <div>
      <h2>Welcome, Admin!</h2>
      <p>Hello, {user.firstName}!</p>
      <div>
        <Link to="/roles">Go to Role Management</Link>
      </div>
      <div>
        <Link to="/users">Go to User Management</Link>
      </div>
      <div>
        <Link to="/categories">Go to Category Management</Link>
      </div>
      <div>
        <Link to="/suppliers">Go to Supplier Management</Link>
      </div>
      <div>
        <Link to="/products">Go to Product Management</Link>
      </div>
      <div>
        <Link to="/classifications">Go to Classification Management</Link>
      </div>
      <div>
        <Link to="/shippings">Go to Shipping Management</Link>
      </div>
    </div>
  );
}

export default Admin;