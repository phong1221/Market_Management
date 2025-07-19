import React, { useState, useEffect, useRef } from 'react';
import videoBg from '../../../assets/102959-661305174.mp4';
import { FaShoppingCart, FaStar, FaTruck, FaLeaf, FaArrowRight } from 'react-icons/fa';
import { BiStore } from 'react-icons/bi';
import '../css/home.css';
import Header from '../components/Header';
import { fetchProduct } from '../../../services/productService';

const getColumnCount = () => {
  if (window.innerWidth < 700) return 2;
  if (window.innerWidth < 1000) return 3;
  return 4;
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardRefs = useRef([]);
  const [visibleCards, setVisibleCards] = useState([]);
  const listSectionRef = useRef(null);
  const [listSectionVisible, setListSectionVisible] = useState(false);
  const [colCount, setColCount] = useState(getColumnCount());

  // Debug logs
  console.log('UserHome component rendered');
  console.log('localStorage data:', {
    user: localStorage.getItem('user'),
    isLoggedIn: localStorage.getItem('isLoggedIn'),
    role: localStorage.getItem('role')
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productData = await fetchProduct();
        setProducts(productData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Responsive: cập nhật số cột khi resize
  useEffect(() => {
    const handleResize = () => setColCount(getColumnCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hiệu ứng xuất hiện khi cuộn tới từng card (xuất hiện lại khi lướt lên/xuống)
  useEffect(() => {
    if (!products.length) return;
    setVisibleCards(Array(products.length).fill(false));
    cardRefs.current = cardRefs.current.slice(0, products.length);

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-index'));
          setVisibleCards((prev) => {
            const updated = [...prev];
            updated[idx] = entry.isIntersecting;
            return updated;
          });
        });
      },
      { threshold: 0.18 }
    );
    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [products]);

  // Hiệu ứng xuất hiện cho wrapper danh sách sản phẩm
  useEffect(() => {
    if (!listSectionRef.current) return;
    const sectionObserver = new window.IntersectionObserver(
      ([entry]) => {
        setListSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.12 }
    );
    sectionObserver.observe(listSectionRef.current);
    return () => sectionObserver.disconnect();
  }, [loading]);

  return (
    <div className="home-user">

      
      {/* Video background */}
      <video
        className="home-user-bg-video"
        src={videoBg}
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Overlay */}
      <div className="home-user-overlay"></div>
      <Header />
      <div className="home-user-content">
        <div className="home-user-left">
          <div className="home-user-subtitle">
            <BiStore className="subtitle-icon" />
            Welcome to
          </div>
          <div className="home-user-title">HomeMart</div>
          <div className="home-user-desc">
            Discover a world of fresh groceries, organic produce, and gourmet snacks. 
            Enjoy unbeatable prices and quality delivered to your doorstep.
          </div>
          <div className="home-user-features">
            <div className="feature-item">
              <FaLeaf className="feature-icon" />
              <span>Fresh & Organic</span>
            </div>
            <div className="feature-item">
              <FaTruck className="feature-icon" />
              <span>Fast Delivery</span>
            </div>
            <div className="feature-item">
              <FaStar className="feature-icon" />
              <span>Premium Quality</span>
            </div>
          </div>
        </div>
        <div className="home-user-right">
          <button className="home-user-btn big">
            <FaShoppingCart className="btn-icon" />
            Shop Now
            <FaArrowRight className="btn-arrow" />
          </button>
        </div>
      </div>
      {/* Danh sách sản phẩm */}
      <div
        ref={listSectionRef}
        className={`product-list-section${listSectionVisible ? ' visible' : ''}`}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 32 }}>All Products</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: 'white', fontSize: '18px' }}>
              Loading products...
            </div>
        ) : products.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: 'white', fontSize: '18px' }}>
              No products available at the moment.
            </div>
        ) : (
          <div className="product-grid-centered">
            {products.map((product, idx) => {
              // Sửa logic xác định hàng đầu tiên: chỉ hàng thứ 2 trở đi mới có separator
              const isRowStart = idx >= colCount && idx % colCount === 0;
          return (
                <div
                  className={`product-card-centered${visibleCards[idx] ? ' visible' : ''}${isRowStart ? ' row-separator' : ''}`}
                  key={product.idProduct}
                  ref={el => cardRefs.current[idx] = el}
                  data-index={idx}
                  style={{ animationDelay: visibleCards[idx] ? `${idx * 0.08 + 0.1}s` : '0s' }}
                >
                  <img
                    src={product.picture ? `http://localhost/market_management/backend/uploads/${product.picture}` : ''}
                    alt={product.nameProduct}
                    className="product-img-centered"
                  />
                  <div className="product-info-centered">
                    <div className="product-name-centered">{product.nameProduct}</div>
                    <div className="product-price-centered">{Number(product.exportCost).toLocaleString('vi-VN')}₫</div>
                    <div className="product-desc-centered">{product.descriptionProduct}</div>
                    <button className="product-btn-centered">
                      <FaShoppingCart /> Buy Now
                    </button>
                  </div>
            </div>
          );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 