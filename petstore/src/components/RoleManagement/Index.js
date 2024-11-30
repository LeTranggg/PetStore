import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";
import { Toast, ToastContainer } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';

function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);
  const [editModalShow, setEditModalShow] = useState(false);
  const [createModalShow, setCreateModalShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setName] = useState("");

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/role');
      setRoles(response.data);
    } catch (error) {
      setError("Failed to fetch roles.");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle toast message visibility
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/role", { name });

      if (response.status === 201 || response.status === 200) {
        setError(null);
        setName(""); // Clear the input after success
        fetchRoles();
        setCreateModalShow(false);
        navigate(location.pathname, {
          state: { message: "Tạo role thành công!", type: 'success' }
        });
      } else {
        throw new Error("API failed but role might have been created.");
      }
    } catch (error) {
      navigate(location.pathname, {
        state: { message: "Không thể tạo role! Vui lòng thử lại.", type: 'danger' }
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedRole = {
        name: name.trim(), // Loại bỏ khoảng trắng thừa
      };
      const response = await axios.put(`/role/${selectedRole.id}`, updatedRole);

      if (response.status === 201 || response.status === 200) {
        setError(null);
        fetchRoles();
        setEditModalShow(false);
        navigate(location.pathname, {
          state: { message: "Cập nhật role thành công!", type: 'success' }
        });
      } else {
        throw new Error("API failed but role might have been updated.");
      }
    } catch (error) {
      console.error('Error:', error);
      navigate(location.pathname, {
        state: { message: "Không thể cập nhật role! Vui lòng thử lại.", type: 'danger' }
      });
    }
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await axios.delete(`/role/${roleId}`);
      fetchRoles();
      navigate(location.pathname, {
        state: { message: "Xoá role thành công!", type: 'success' }
      });
    } catch (error) {
      navigate(location.pathname, {
        state: { message: "Không thể xoá role! Vui lòng thử lại. ", type: 'danger' }
      });
    }
  };

  const openCreateModal = () => {
    setName("");
    setError('');
    setCreateModalShow(true);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setName(role.name || "");
    setError('');
    setEditModalShow(true);
  };

  return (
    <div>
      <h2>Roles List</h2>
      {error && <p>{error}</p>}
      {roles.length === 0 ? (
        <p>No roles found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.name}</td>
                <td>
                  <button type="button" onClick={() => openEditModal(role)}>Update</button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" onClick={openCreateModal}>Create</button>

      {/* Create Modal */}
      <Modal
        show={createModalShow}
        onHide={() => {
          setCreateModalShow(false);
          setError('');
        }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Create Role
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label">Name:</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button variant="secondary" onClick={() => setCreateModalShow(false)}>Close</button>
          <button variant="primary" onClick={handleCreate}>
            Create
          </button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={editModalShow}
        onHide={() => {
          setEditModalShow(false);
          setError('');
        }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Update Role
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">Name:</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button variant="secondary" onClick={() => setEditModalShow(false)}>Close</button>
          <button variant="primary" onClick={handleUpdate}>
            Update
          </button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        {message && (
          <Toast
            bg={location.state?.type === 'success' ? 'success' : 'danger'}
            onClose={() => setMessage(null)}
            show={!!message}
            delay={3000}
            autohide>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </div>
  );
}

export default Index;