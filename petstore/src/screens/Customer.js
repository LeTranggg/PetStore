import React from "react";

function Customer({ user }) {
  return (
    <div>
      <h2>Welcome, Customer!</h2>
      <p>Hello, {user.firstName}!</p>
    </div>
  );
}

export default Customer;