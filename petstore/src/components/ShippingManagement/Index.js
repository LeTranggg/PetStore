import React, { useState, useEffect } from "react";
import axios from "../../utils/Axios";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const ShippingMethod = {
  0: "Road",
  1: "Air",
  2: "Sea",
  3: "Rail",
  getMethodName: (method) => {
    if (typeof method === 'number') {
      return ShippingMethod[method] || `Unknown (${method})`;
    }
    const methodInt = parseInt(method);
    if (!isNaN(methodInt)) {
      return ShippingMethod[methodInt] || `Unknown (${method})`;
    }
    const methodMap = {
      'Road': 0,
      'Air': 1,
      'Sea': 2,
      'Rail': 3
    };
    return method in methodMap ? ShippingMethod[methodMap[method]] : `Unknown (${method})`;
  }
};

function Index({ onCreate, onUpdate, onDelete }) {
  const [shippings, setShippings] = useState([]);
  const [error, setError] = useState('');
  const [editModalShow, setEditModalShow] = useState(false);
  const [createModalShow, setCreateModalShow] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [formData, setFormData] = useState({
    shippingMethod: "",
    price: ""
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const fetchShippings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/Shipping');
      setShippings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shipping methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippings();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/shipping", formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 201 || response.status === 200) {
        setError(null);
        if (onCreate) {
          onCreate(response.data);
        }
        fetchShippings();
        setCreateModalShow(false);
        setFormData({ shippingMethod: "", price: "" });
      } else {
        throw new Error("Failed to create shipping method");
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create shipping method');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedShipping?.id) {
      setError("No shipping method selected");
      return;
    }

    // Prepare updated data by only including fields that have been changed
    const updatedData = {};
    if (formData.shippingMethod !== "") {
      updatedData.shippingMethod = parseInt(formData.shippingMethod, 10);
    }
    if (formData.price !== "") {
      updatedData.price = parseFloat(formData.price);
    }

    try {
      const response = await axios.put(`/shipping/${selectedShipping.id}`, updatedData);
      if (response.status === 200 || response.status === 204) {
        setError(null);
        if (onUpdate) {
          onUpdate(response.data);
        }
        fetchShippings();
        setEditModalShow(false);
      } else {
        throw new Error("Failed to update shipping method");
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update shipping method');
    }
  };

  const handleDelete = async (shippingId) => {
    if (!window.confirm('Are you sure you want to delete this shipping method?')) return;
    try {
      await axios.delete(`/shipping/${shippingId}`);
      if (onDelete) {
        onDelete(shippingId);
      }
      fetchShippings();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete shipping method');
    }
  };

  const openCreateModal = () => {
    setFormData({ shippingMethod: "", price: "" });
    setError('');
    setCreateModalShow(true);
  };

  const openEditModal = (shipping) => {
    setSelectedShipping(shipping);
    setFormData({
      shippingMethod: shipping.shippingMethod !== null ? shipping.shippingMethod.toString() : "",
      price: shipping.price !== null ? shipping.price.toString() : ""
    });
    setError('');
    setEditModalShow(true);
  };

  return (
    <>
      <div>
        <h1>Shipping Method</h1>
        <Button variant="primary" onClick={openCreateModal}>
          Create Shipping
        </Button>

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
              Create Shipping
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label">Method:</label>
                <select
                  name="shippingMethod"
                  className="form-select"
                  value={formData.shippingMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Shipping</option>
                  {Object.entries(ShippingMethod)
                    .filter(([key]) => !isNaN(Number(key)))
                    .map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Price:</label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setCreateModalShow(false)}>Close</Button>
            <Button variant="primary" onClick={handleCreate}>
              Create
            </Button>
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
              Update Shipping Method
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label">Method:</label>
                <select
                  name="shippingMethod"
                  className="form-select"
                  value={formData.shippingMethod}
                  onChange={handleInputChange}
                >
                  <option value="">Select Shipping</option>
                  {Object.entries(ShippingMethod)
                    .filter(([key]) => !isNaN(Number(key)))
                    .map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Price:</label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditModalShow(false)}>Close</Button>
            <Button variant="primary" onClick={handleUpdate}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border border-gray-200">
          <thead>
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Method</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shippings.map((shipping) => (
              <tr key={shipping.id}>
                <td className="border px-4 py-2">{shipping.id}</td>
                <td className="border px-4 py-2">
                  {ShippingMethod.getMethodName(shipping.shippingMethod)}
                </td>
                <td className="border px-4 py-2">${shipping.price}</td>
                <td className="border px-4 py-2">
                  <Button
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    variant="primary"
                    onClick={() => openEditModal(shipping)}
                  >
                    Edit
                  </Button>
                  <button
                    onClick={() => handleDelete(shipping.id)}
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
    </>
  );
}

export default Index;