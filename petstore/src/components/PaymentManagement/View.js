import React, { useEffect, useState } from 'react';
import API from '../../utils/Axios';

function View() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);

  // Filter
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showSuccessDropdown, setShowSuccessDropdown] = useState(false);
  const [filters, setFilters] = useState({
    method: [],
    isSuccessful: [],
  });
  const [availableMethods] = useState(['Cash', 'Stripe']);
  const [availableSuccessStatuses] = useState(['Yes', 'No']);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await API.get('/payment');
        setPayments(response.data);
      } catch (err) {
        setError('Failed to load payments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const toggleSortPayment = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const getFilteredPayments = () => {
    return payments.filter(payment => {
      // Convert orderId to string for comparison
      const orderIdString = payment.orderId.toString();
      // If searchTerm is empty, show all payments; otherwise, check if searchTerm is a substring of orderId
      const matchesSearch = searchTerm === '' || orderIdString.includes(searchTerm);
      const matchesMethod = filters.method.length === 0 || filters.method.includes(payment.method);
      const matchesSuccess = filters.isSuccessful.length === 0 ||
        filters.isSuccessful.includes(payment.isSuccessful ? 'Yes' : 'No');

      return matchesSearch && matchesMethod && matchesSuccess;
    });
  };

  const getFilteredAndSortedPayments = () => {
    const filteredPayments = getFilteredPayments();
    const sortedPayments = [...filteredPayments].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);

      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });

    return sortedPayments;
  };

  const filteredAndSortedPayments = getFilteredAndSortedPayments();

  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedPayments.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, filters, payments, sortConfig]);

  const getCurrentPageData = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return filteredAndSortedPayments.slice(indexOfFirstRow, indexOfLastRow);
  };

  const goToPage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ◁
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={i === currentPage ? 'active' : ''}
          onClick={() => goToPage(i)}
        >
          {i}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ▷
      </button>
    );

    return buttons;
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[filterType];
      if (currentValues.includes(value)) {
        return {
          ...prevFilters,
          [filterType]: currentValues.filter(v => v !== value),
        };
      } else {
        return {
          ...prevFilters,
          [filterType]: [...currentValues, value],
        };
      }
    });
  };

  if (error) return <div className="error-message">{error}</div>;

  const currentPageData = getCurrentPageData();

  return (
    <div>
      <h2>Payment List</h2>
      <main>
        <div className="table-header">
          <div className="action-bar">
            <button
              type="button"
              onClick={toggleSortPayment}
              title={`Sort by ID (${sortConfig.direction === 'ascending' ? 'Low to High' : 'High to Low'})`}
            >
              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
            </button>
          </div>

          <div className="search-bar">
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <input
                className="search-in"
                type="number"
                placeholder="Search for payments by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        </div>

        <table className="table-body">
          <thead>
            <tr>
              <th>ID</th>
              <th>
                <div className="filter-dropdown">
                  Method
                  <span
                    onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                    className="filter-label"
                  >
                    {showMethodDropdown ? '↑' : '↓'}
                  </span>
                  {showMethodDropdown && (
                    <ul className="dropdown-content">
                      {availableMethods.map(method => (
                        <label key={method} className="dropdown-item">
                          <li>
                            <input
                              type="checkbox"
                              checked={filters.method.includes(method)}
                              onChange={() => handleFilterChange('method', method)}
                            />
                            {method}
                          </li>
                        </label>
                      ))}
                    </ul>
                  )}
                </div>
              </th>
              <th>Order ID</th>
              <th>Amount</th>
              <th>
                <div className="filter-dropdown">
                  Successful
                  <span
                    onClick={() => setShowSuccessDropdown(!showSuccessDropdown)}
                    className="filter-label"
                  >
                    {showSuccessDropdown ? '↑' : '↓'}
                  </span>
                  {showSuccessDropdown && (
                    <ul className="dropdown-content">
                      {availableSuccessStatuses.map(status => (
                        <label key={status} className="dropdown-item">
                          <li>
                            <input
                              type="checkbox"
                              checked={filters.isSuccessful.includes(status)}
                              onChange={() => handleFilterChange('isSuccessful', status)}
                            />
                            {status}
                          </li>
                        </label>
                      ))}
                    </ul>
                  )}
                </div>
              </th>
              <th>Date Created</th>
              <th>Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPayments.length > 0 ? (
              currentPageData.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.method}</td>
                  <td>{payment.orderId}</td>
                  <td>{payment.amount.toFixed(2)}</td>
                  <td>{payment.isSuccessful ? 'Yes' : 'No'}</td>
                  <td>{new Date(payment.dateCreated).toLocaleString()}</td>
                  <td>{payment.transactionId || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Payments not in the list.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          {renderPaginationButtons()}
        </div>

        <div>
          Page {currentPage} of {totalPages} | Showing {currentPageData.length} of {filteredAndSortedPayments.length} payments
          {(filters.method.length > 0 || filters.isSuccessful.length > 0) && (
            <span> (filtered from {payments.length} total payments)</span>
          )}
        </div>
      </main>

    </div>
  );
}

export default View;