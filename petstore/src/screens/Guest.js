import React, { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../utils/Axios";

function Guest() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { productId } = useParams();
  const isAuthenticated = localStorage.getItem("token") !== null;
  const userRole = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).role : null;
  const [searchTerm, setSearchTerm] = useState("");

  const handleRegisterClick = () => {
    navigate("/register");
  };
  const handleLoginClick = () => {
    navigate("/login");
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product');
      setProducts(response.data);
      console.log("Selected Product:", response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const searchResults = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (product) => {
    setSelectedProduct(product); // Set the selected product
    const initial = {};

    // Check if classifications exist and are an array
    if (product.classifications && Array.isArray(product.classifications)) {
      product.classifications.forEach(c => {
        initial[c.id] = 0; // Initialize selectedItems for the selected product
      });
    } else if (product.classifications === null) {
      console.warn("Classifications are null for the selected product.");
    } else {
      console.error("No classifications found for the selected product.");
    }

    setSelectedItems(initial);
    setModalShow(true); // Show the modal
  };

  const handleQuantityChange = (classificationId, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [classificationId]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleAddToCart = async () => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          message: 'Please sign in to add items to cart',
          redirectTo: `/products/product-detail/${productId}`
        }
      });
      return;
    }

    // If user is not a customer, prevent adding to cart
    if (userRole !== 'Customer') {
      alert('Only customers can add items to cart');
      return;
    }

    try {
      const items = Object.entries(selectedItems)
        .filter(([_, quantity]) => quantity > 0)
        .map(([classificationId, quantity]) => ({
          classificationId: parseInt(classificationId),
          quantity: parseInt(quantity)
        }));

      // Only send request if there are items to add
      if (items.length === 0) {
        return;
      }

      // Send the items array directly
      await axios.post('/cart', items);
      setModalShow(false);
      alert('Items added to cart successfully!');
      // Reset quantities
      const reset = {};
      Object.keys(selectedItems).forEach(key => {
        reset[key] = 0;
      });
      setSelectedItems(reset);
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Error adding items to cart: ${error.response.data.message || 'Unknown error'}`);
      } else {
        alert('Error adding items to cart');
        console.error('Error adding to cart:', error);
      }
    }
  };

  return (
    <div className="body-g">
      <header className="header">
        <img
          src={`${process.env.PUBLIC_URL}/LogoWhite.jpeg`}
          alt="logo"
          width="100px"
          height="50px"
        />
        <div className="search-container">
          <form onSubmit={(e) => { e.preventDefaul();}}>
            <div className="search-wrapper">
              <input
                className="search-input"
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-button">
                <img
                  src={`${process.env.PUBLIC_URL}/search.png.jpg`}
                  alt="search icon"
                  className="search-icon"
                />
              </button>
            </div>
          </form>
        </div>
        <div className="link-container">
          <button type="button" onClick={() => handleRegisterClick()}>Register</button>
          <button type="button" onClick={() => handleLoginClick()}>Login</button>
        </div>
      </header>
      <nav>
        <ul>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
      <div>
        <div>
          <img
            src={`${process.env.PUBLIC_URL}/HomeHeader.jpeg`}
            alt="logo"
            height="100%"
            width="100%"
          />
        </div>
        <div className="link-container-image">
          <div className="accessory-item">
            <img
              src={`${process.env.PUBLIC_URL}/DogAcc.jpg`}
              alt="Dog Accessories"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Dog Accessories</h1>
              <button type="button">Shop Now</button>
            </div>
          </div>
          <div className="accessory-item">
            <img
              src={`${process.env.PUBLIC_URL}/CatAcc.jpeg`}
              alt="Cat Accessories"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Cat Accessories</h1>
              <button type="button">Shop Now</button>
            </div>
          </div>
        </div>
        <div className="container-product">
          <h1>Best Sellers</h1>
          <p>We cover a wide range of beauty products</p>
          <div className="product">
            {searchResults.map((product) => (
              <div key={product.id} className="card-list">
                <div className="card-image">
                  <img
                    src={`${process.env.PUBLIC_URL}/Default.jpg`}
                    alt={product.name}
                    width="100%"
                    height="220px"
                  />
                </div>
                <div className="card-info">
                  <h4>{product.name}</h4>
                  <p className="text-lg font-semibold mb-2">${product.price}</p>
                  <button type="button"
                    onClick={() => navigate(`/products/product-detail/${product.id}`)}>View Details
                  </button>
                  <button type="button"
                    onClick={() => openModal(product)}>Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <h5><Link to="/products">Products</Link></h5>
        </div>
        <div className="link-container-image">
          <div className="accessory-item">
            <img
              src={`${process.env.PUBLIC_URL}/Eat.jpeg`}
              alt="Eat"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Eat</h1>
              <button type="button">Shop Now</button>
            </div>
          </div>
          <div className="accessory-item">
            <img
              src={`${process.env.PUBLIC_URL}/Sleep.jpeg`}
              alt="Sleep"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Sleep</h1>
              <button type="button">Shop Now</button>
            </div>
          </div>
        </div>
        <div className="container-product">
          <h1>Best Sellers</h1>
          <p>We cover a wide range of beauty products</p>
          <div className="product">
            {searchResults.map((product) => (
              <div key={product.id} className="card-list">
                <div className="card-image">
                  <img
                    src={`${process.env.PUBLIC_URL}/Default.jpg`}
                    alt={product.name}
                    width="100%"
                    height="220px"
                  />
                </div>
                <div className="card-info">
                  <h4>{product.name}</h4>
                  <p className="text-lg font-semibold mb-2">${product.price}</p>
                  <button type="button"
                    onClick={() => navigate(`/products/product-detail/${product.id}`)}>View Details
                  </button>
                  <button type="button"
                    onClick={() => openModal(product)}>Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <h5><Link to="/products">Products</Link></h5>
        </div>
      </div>
      <div>
          <img
            src={`${process.env.PUBLIC_URL}/Footer.jpeg`}
            alt="logo"
            height="100%"
            width="100%"
          />
        </div>
      <footer className="footer">
        <img
          src={`${process.env.PUBLIC_URL}/Logo.jpeg`}
          alt="logo"
          width="100px"
          height="50px"
        />
        <div className="map">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
      </footer>

      {/* Modal */}
      {selectedProduct && (
        <Modal
          show={modalShow}
          onHide={() => setModalShow(false)}
          size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{selectedProduct.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="ta">
              {selectedProduct.classifications && Array.isArray(selectedProduct.classifications) && selectedProduct.classifications.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Value</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Available</th>
                    <th className="text-left p-2">Dimensions</th>
                    <th className="text-left p-2">Weight</th>
                    <th className="text-left p-2">Quantity to Add</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProduct.classifications.map((classification) => (
                    <tr key={classification.id} className="border-t">
                      <td className="p-2">{classification.name}</td>
                      <td className="p-2">{classification.value}</td>
                      <td className="p-2">${classification.price}</td>
                      <td className="p-2">{classification.quantity}</td>
                      <td className="p-2">
                        {classification.height}×{classification.length}×{classification.width}
                      </td>
                      <td className="p-2">{classification.weight}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max={classification.quantity}
                          value={selectedItems[classification.id] || 0}
                          onChange={(e) => handleQuantityChange(classification.id, e.target.value)}
                          className="w-20 p-1 border rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No classifications available for this product.</p>
            )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button onClick={handleAddToCart}>Add to Cart</button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default Guest;