import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/Axios';

function Welcome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProducts = async () => {
    try {
      const response = await API.get('/product');
      // Lọc chỉ hiển thị product có ít nhất một variant
      const filteredProducts = response.data.filter(
        (product) => product.variants && product.variants.length > 0
      );
      // Sắp xếp sản phẩm theo thời gian tạo (createdAt) giảm dần và lấy 3 sản phẩm mới nhất
      const sortedProducts = filteredProducts
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);
      setProducts(sortedProducts);
    } catch (err) {
      setError('Failed to load product.');
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProducts()]);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        // Redirect based on role
        switch (role) {
          case 'Admin':
            navigate('/admin');
            break;
          case 'Customer':
            navigate('/customer');
            break;
          default:
            break;
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, [navigate]);

  const handleAddToCartClick = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleShopNowClick = (identifier) => {
    // Nếu identifier là một số hoặc chuỗi dạng ID, điều hướng đến trang chi tiết sản phẩm
    if (/^\d+$/.test(identifier) || typeof identifier === 'number') {
      navigate('/login');
    } else {
      // Nếu identifier là danh mục (dog, cat, eat, sleep), điều hướng đến trang products với bộ lọc danh mục
      const categoryMap = {
        dogAccessories: 'Dog Accessories',
        catAccessories: 'Cat Accessories',
        eat: 'Eat',
        sleep: 'Sleep'
      };
      const category = categoryMap[identifier] || identifier;
      navigate(`/products?category=${encodeURIComponent(category)}`);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <main>
        <div>
          <img
            src={`${process.env.PUBLIC_URL}/HomeHeader.jpeg`}
            alt="logo"
            height="100%"
            width="100%"
          />
        </div>

        <div className="link-container-image">
          <div className="accessory-item" style={{ backgroundColor: '#C8B9D9' }}>
            <img
              src={`${process.env.PUBLIC_URL}/DogAcc.jpg`}
              alt="Dog Accessories"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Dog Accessories</h1>
              <button type="button" onClick={() => handleShopNowClick('dogAccessories')}>
                Shop Now
              </button>
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
              <button type="button" onClick={() => handleShopNowClick('catAccessories')}>
                Shop Now
              </button>
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <div className="product-body">
            <h1>Our Newest Products</h1>
            <p>We Offer a Wide Variety of Beautiful Products</p>

            <div className="product">
              {products.map((product) => (
                <div key={product.id} className="card-list">
                  <img
                    src={product.image || `${process.env.PUBLIC_URL}/placeholder.jpg`}
                    alt={product.name}
                    className="card-image"
                  />
                  <div className="card-info">
                    <h3>{product.name}</h3>
                    <p>{product.price.toLocaleString('vi-VN')} VND</p>
                    <button onClick={() => handleAddToCartClick(product)}>
                      Add To Cart
                    </button>
                    <button onClick={() => handleShopNowClick(product.id)}>
                      Shop Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="link-container-image" style={{ marginBottom: '30px' }}>
          <div className="accessory-item">
            <img
              src={`${process.env.PUBLIC_URL}/Eat.jpeg`}
              alt="Eat"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Eat</h1>
              <button type="button" onClick={() => handleShopNowClick('eat')}>
                Shop Now
              </button>
            </div>
          </div>

          <div className="accessory-item" style={{ backgroundColor: '#C8B9D9' }}>
            <img
              src={`${process.env.PUBLIC_URL}/Sleep.jpeg`}
              alt="Sleep"
              className="accessory-image"
            />
            <div className="overlay">
              <h1>Sleep</h1>
              <button type="button" onClick={() => handleShopNowClick('sleep')}>
                Shop Now
              </button>
            </div>
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
      </main>
    </div>
  );
}

export default Welcome;