import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";
import { Toast, ToastContainer } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';

function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);
  const [editModalShow, setEditModalShow] = useState(false);
  const [createModalShow, setCreateModalShow] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");

  const fetchCategories = async () => {
      try {
        const response = await axios.get("/category");
        setCategories(response.data);
      } catch (error) {
        setError("Failed to fetch categories.");
      }
    };


  useEffect(() => {
    fetchCategories();
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
      const response = await axios.post("/category", { name });

      if (response.status === 201 || response.status === 200) {
        setError(null);
        setName(""); // Clear the input after success
        fetchCategories();
        setCreateModalShow(false);
        navigate(location.pathname, {
          state: { message: "Tạo category thành công!", type: 'success' }
        });
      } else {
        throw new Error("API failed but category might have been created.");
      }
    } catch (error) {
      navigate(location.pathname, {
        state: { message: "Không thể tạo category! Vui lòng thử lại.", type: 'danger' }
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedCategory = {
        name: name.trim(), // Loại bỏ khoảng trắng thừa
      };
      const response = await axios.put(`/category/${selectedCategory.id}`, updatedCategory);

      if (response.status === 201 || response.status === 200) {
        setError(null);
        fetchCategories();
        setEditModalShow(false);
        navigate(location.pathname, {
          state: { message: "Cập nhật category thành công!", type: 'success' }
        });
      } else {
        throw new Error("API failed but category might have been updated.");
      }
    } catch (error) {
      console.error('Error:', error);
      navigate(location.pathname, {
        state: { message: "Không thể cập nhật category! Vui lòng thử lại.", type: 'danger' }
      });
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`/category/${categoryId}`);
      fetchCategories();
      navigate(location.pathname, {
        state: { message: "Xoá category thành công!", type: 'success' }
      });
    } catch (error) {
      navigate(location.pathname, {
        state: { message: "Không thể xoá category! Vui lòng thử lại. ", type: 'danger' }
      });
    }
  };

  const openCreateModal = () => {
    setName("");
    setError('');
    setCreateModalShow(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setName(category.name || "");
    setError('');
    setEditModalShow(true);
  };

  return (
    <div>
      <h2>Categories List</h2>
      {error && <p>{error}</p>}
      {categories.length === 0 ? (
        <p>No categories found.</p>
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
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>
                  <button type="button" onClick={() => openEditModal(category)}>Update</button>
                  <button
                    onClick={() => handleDelete(category.id)}
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
            Create Category
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
            Update Category
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
