import React, { useState, useEffect } from 'react';
import API from '../../utils/Axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import ToastNotification from '../../misc/ToastNotification';

function View() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    autoHide: true,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Sort
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [totalPages, setTotalPages] = useState(1);

  // Filter
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [filters, setFilters] = useState({
    role: [],
    gender: [],
    status: []
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableGenders, setAvailableGenders] = useState([]);
  const [availableStatuses] = useState(['Locked', 'Unlocked']);

  // Lock Modal
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lockReason, setLockReason] = useState('Spam');
  const [loadingLock, setLoadingLock] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Check for toast message from Create.js or Update.js
  useEffect(() => {
    if (location.state?.toast) {
      setToast({
        show: true,
        message: location.state.toast.message,
        type: location.state.toast.type,
        autoHide: true,
      });
      // Clear the state to prevent re-showing the toast on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get('/user');
        setUsers(response.data);

        const roles = [...new Set(response.data.map(user => user.role))];
        const genders = [...new Set(response.data.map(user => user.gender))];

        setAvailableRoles(roles);
        setAvailableGenders(genders);
      } catch (err) {
        setError('Failed to load users.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleSortOrder = () => {
    setSortConfig(prevConfig => ({
      key: 'id',
      direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filters.role.length === 0 || filters.role.includes(user.role);
      const matchesGender = filters.gender.length === 0 || filters.gender.includes(user.gender);
      const matchesStatus = filters.status.length === 0 ||
      filters.status.includes(user.lockoutEnabled ? 'Locked' : 'Unlocked');

      return matchesSearch && matchesRole && matchesGender && matchesStatus;
    });
  };

  const getFilteredAndSortedUsers = () => {
    const filteredUsers = getFilteredUsers();
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const aId = parseInt(a.id);
      const bId = parseInt(b.id);

      if (sortConfig.direction === 'ascending') {
        return aId - bId;
      } else {
        return bId - aId;
      }
    });

    return sortedUsers;
  };

  const filteredAndSortedUsers = getFilteredAndSortedUsers();

  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedUsers.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, filters, users, rowsPerPage, sortConfig]);

  const getCurrentPageData = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return filteredAndSortedUsers.slice(indexOfFirstRow, indexOfLastRow);
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
          className={i === currentPage ? "active" : ""}
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
          [filterType]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prevFilters,
          [filterType]: [...currentValues, value]
        };
      }
    });
  };

  const handleCreateClick = () => {
    navigate('/admin/create-user');
  };

  const handleUpdateClick = (user) => {
    navigate('/admin/update-user', { state: { user } });
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleLockClick = (user) => {
    setSelectedUser(user);
    setLockReason('Spam');
    setShowLockModal(true);
  };

  const handleUnlockClick = async (user) => {
    if (!user) {
      setToast({
        show: true,
        message: 'No user selected to unlock.',
        type: 'error',
        autoHide: false,
      });
      return;
    }

    try {
      await API.post(`/user/${user.id}/unlock`);
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, lockoutEnabled: false } : u
        )
      );
      setToast({
        show: true,
        message: 'User unlocked successfully!',
        type: 'success',
        autoHide: true,
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to unlock user.',
        type: 'error',
        autoHide: false,
      });
    }
  };

  const handleRandomPasswordClick = async (user) => {
    if (!user) {
      setToast({
        show: true,
        message: 'No user selected to reset password.',
        type: 'error',
        autoHide: false,
      });
      return;
    }

    try {
      await API.post(`/user/${user.id}/reset-password`);
      setToast({
        show: true,
        message: 'Password reset successfully! New password sent to user\'s email.',
        type: 'success',
        autoHide: true,
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to reset password. Please try again.',
        type: 'error',
        autoHide: false,
      });
    }
  };

  const handleLockSubmit = async () => {
    if (!selectedUser) return;

    try {
      setLoadingLock(true);
      const response = await API.post(
        `/user/${selectedUser.id}/lock`,
        JSON.stringify(lockReason),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id ? { ...user, lockoutEnabled: true } : user
        )
      );

      setShowLockModal(false);
      setToast({
        show: true,
        message: 'User locked successfully!',
        type: 'success',
        autoHide: true,
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to lock user.',
        type: 'error',
        autoHide: false,
      });
    } finally {
      setLoadingLock(false);
    }
  };

  const handleCloseLockModal = () => {
    setShowLockModal(false);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;

    try {
      setLoadingDelete(true);
      await API.delete(`/user/${selectedUser.id}`);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setToast({
        show: true,
        message: 'User deleted successfully!',
        type: 'success',
        autoHide: true,
      });
      setTimeout(() => window.location.reload(), 0);
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to delete user.',
        type: 'error',
        autoHide: false,
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const currentPageData = getCurrentPageData();

  return (
    <div>
      <h2>User List</h2>
      <main>
        <div className="table-header">
          <div className="action-bar">
            <button type="button" onClick={() => handleCreateClick()}>+</button>
            <button
              type="button"
              onClick={toggleSortOrder}
              title={`Sort by ID (${sortConfig.direction === 'ascending' ? 'Low to High' : 'High to Low'})`}
              >
              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
            </button>
          </div>

          <div className="search-bar">
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <input
                className="search-in"
                type="text"
                placeholder="Search for users..."
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
              <th>Email</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Date Of Birth</th>
              <th>
                <div className="filter-dropdown">
                  Gender
                  <span
                    onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                    className="filter-label"
                  >
                    {showGenderDropdown ? "↑" : "↓"}
                  </span>
                  {showGenderDropdown && (
                    <ul className="dropdown-content">
                      {availableGenders.map(gender => (
                        <label key={gender} className="dropdown-item">
                          <li>
                            <input
                              type="checkbox"
                              checked={filters.gender.includes(gender)}
                              onChange={() => handleFilterChange('gender', gender)}
                            />
                            {gender}
                          </li>
                        </label>
                      ))}
                    </ul>
                  )}
                </div>
              </th>
              <th>
                <div className="filter-dropdown">
                  Status
                  <span
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="filter-label"
                  >
                    {showStatusDropdown ? "↑" : "↓"}
                  </span>
                  {showStatusDropdown && (
                    <ul className="dropdown-content">
                      {availableStatuses.map(status => (
                        <label key={status} className="dropdown-item">
                          <li>
                            <input
                              type="checkbox"
                              checked={filters.status.includes(status)}
                              onChange={() => handleFilterChange('status', status)}
                            />
                            {status}
                          </li>
                        </label>
                      ))}
                    </ul>
                  )}
                </div>
              </th>
              <th>
                <div className="filter-dropdown">
                  Role
                  <span
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="filter-label"
                  >
                    {showRoleDropdown ? "↑" : "↓"}
                  </span>
                  {showRoleDropdown && (
                    <ul className="dropdown-content">
                      {availableRoles.map(role => (
                        <label key={role} className="dropdown-item">
                          <li>
                            <input
                              type="checkbox"
                              checked={filters.role.includes(role)}
                              onChange={() => handleFilterChange('role', role)}
                            />
                            {role}
                          </li>
                        </label>
                      ))}
                    </ul>
                  )}
                </div>
              </th>
              <th>Address</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUsers.length > 0 ? (
              currentPageData.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{new Date(user.dateOfBirth).toLocaleDateString()}</td>
                  <td>{user.gender}</td>
                  <td>{user.lockoutEnabled ? 'Locked' : 'Unlocked'}</td>
                  <td>{user.role}</td>
                  <td>{user.address}</td>
                  <td><img src={user.image || `${process.env.PUBLIC_URL}/default.png`} alt="User" width="100" height="100" /></td>
                  <td>
                    <button type="button" onClick={() => handleUpdateClick(user)}>✏️</button>
                    <button type="button" onClick={() => handleDeleteClick(user)}>🗑️</button>
                    {user.lockoutEnabled ? (
                      <button type="button" onClick={() => handleUnlockClick(user)}>🔐</button>
                    ) : (
                      <button type="button" onClick={() => handleLockClick(user)}>🔒</button>
                    )}
                    <button type="button" onClick={() => handleRandomPasswordClick(user)}>🔑</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Users not in the list
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          {renderPaginationButtons()}
        </div>

        <div>
          Page {currentPage} of {totalPages} |
          Showing {currentPageData.length} of {filteredAndSortedUsers.length} users
          {(filters.role.length > 0 || filters.gender.length > 0) && (
            <span> (filtered from {users.length} total users)</span>
          )}
        </div>
      </main>

      <Modal show={showLockModal} onHide={handleCloseLockModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Lock User (ID: {selectedUser?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="lockReason">Select Reason:</label>
            <select
              id="lockReason"
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              className="form-select"
            >
              <option value="Spam">Spam</option>
              <option value="Harassment">Harassment</option>
              <option value="Fraud">Fraud</option>
              <option value="Violation">Violation</option>
              <option value="Deletion">Deletion</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-danger" onClick={handleLockSubmit} disabled={loadingLock}>
            {loadingLock ? 'Locking...' : 'Lock'}
          </button>
          <button className="button-cancel" onClick={handleCloseLockModal} disabled={loadingLock}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Delete User (ID: {selectedUser?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            Are you sure you want to delete this user? This action cannot be undone.
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button className="button-danger" onClick={handleDeleteSubmit}  disabled={loadingDelete}>
            {loadingDelete ? 'Deleting...' : 'Delete'}
          </button>
          <button className="button-cancel" onClick={handleCloseDeleteModal} disabled={loadingDelete}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>

      <ToastNotification
        show={toast.show}
        onClose={handleToastClose}
        message={toast.message}
        type={toast.type}
        autoHide={toast.autoHide}
        delay={30000}
      />
    </div>
  );
}

export default View;