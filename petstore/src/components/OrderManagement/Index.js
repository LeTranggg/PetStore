import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Index = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/order', {
        params: {
          page: currentPage,
          search: searchTerm,
        },
      });

      // Assuming the API returns an object with orders and total pages
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditStatus = (orderId) => {
    // Implement edit status logic
    console.log(`Edit status for order ${orderId}`);
  };

  const handleDeleteOrder = (orderId) => {
    // Implement delete order logic
    console.log(`Delete order ${orderId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-1/2 p-2 border rounded"
        />
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Order ID</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border p-2">{order.id}</td>
                  <td className="border p-2">{order.customer.name}</td>
                  <td className="border p-2">{order.status}</td>
                  <td className="border p-2">${order.total.toFixed(2)}</td>
                  <td className="border p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="border p-2">
                    <div className="flex space-x-2">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        onClick={() => handleEditStatus(order.id)}
                      >
                        Edit Status
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center items-center space-x-2">
            <button
              className={`px-4 py-2 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`px-4 py-2 border rounded ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;