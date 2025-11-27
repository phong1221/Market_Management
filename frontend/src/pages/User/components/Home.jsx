import React, { useState, useEffect, useRef } from 'react';
import videoBg from '../../../assets/102959-661305174.mp4';
import { FaShoppingCart, FaStar, FaTruck, FaLeaf, FaArrowRight, FaHeart, FaRegHeart } from 'react-icons/fa';
import { BiStore } from 'react-icons/bi';
import '../css/home.css';
import Header from './Header';
import { fetchProduct } from '../../../services/productService';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import useWishlist from '../../../hooks/useWishlist.js';
import ChatBotWidget from '../../../components/ChatBotWidget';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
// SVG avatar vàng-đen cho icon nổi
const BotAvatarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#FFD600" />
    <path d="M8 26c0-4 3.5-7 8-7s8 3 8 7" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="14" r="6" fill="#222" />
    <rect x="5" y="10" width="4" height="10" rx="2" fill="#FFD600" stroke="#222" strokeWidth="2"/>
    <rect x="23" y="10" width="4" height="10" rx="2" fill="#FFD600" stroke="#222" strokeWidth="2"/>
    <rect x="10" y="4" width="12" height="4" rx="2" fill="#FFD600" stroke="#222" strokeWidth="2"/>
  </svg>
);

const getColumnCount = () => {
  if (window.innerWidth < 700) return 2;
  if (window.innerWidth < 1000) return 3;
  return 4;
};

const Home = () => {
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardRefs = useRef([]);
  const [visibleCards, setVisibleCards] = useState([]);
  const listSectionRef = useRef(null);
  const [listSectionVisible, setListSectionVisible] = useState(false);
  const [colCount, setColCount] = useState(getColumnCount());
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatBotAnimating, setChatBotAnimating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


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

  // No need for these useEffects anymore - hooks handle localStorage automatically

  // Handle wishlist toggle
  const handleWishlistToggle = (product) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước khi thực hiện thao tác!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const isInWishlist = wishlist.some(item => item.idProduct === product.idProduct);
    
    if (isInWishlist) {
      toggleWishlist(product);
      toast.success('Đã xóa khỏi Wishlist!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toggleWishlist(product);
      toast.success('Đã thêm vào Wishlist!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước khi thực hiện thao tác!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const existingItem = cart.find(item => item.idProduct === product.idProduct);
    
    if (existingItem) {
      addToCart(product);
      toast.success('Đã tăng số lượng sản phẩm trong giỏ hàng!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      addToCart(product);
      toast.success('Đã thêm vào giỏ hàng!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <>
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
                const isRowStart = idx >= colCount && idx % colCount === 0;
                const isInWishlist = wishlist.some(item => item.idProduct === product.idProduct);
                return (
                  <div
                    className={`product-card-centered${visibleCards[idx] ? ' visible' : ''}${isRowStart ? ' row-separator' : ''}`}
                    key={product.idProduct}
                    ref={el => cardRefs.current[idx] = el}
                    data-index={idx}
                    style={{ animationDelay: visibleCards[idx] ? `${idx * 0.08 + 0.1}s` : '0s' }}
                    onClick={e => {
                      // Không trigger khi click vào các nút actions
                      if (
                        e.target.closest('.home-product-actions') ||
                        e.target.closest('.wishlist-btn') ||
                        e.target.closest('.cart-btn')
                      ) return;
                      navigate(`/user/product/${product.idProduct}`, { state: { backgroundLocation: location } });
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <div className="home-product-actions">
                      <button 
                        className={`wishlist-btn${isInWishlist ? ' active' : ''}`}
                        onClick={ev => { ev.stopPropagation(); handleWishlistToggle(product); }}
                        title={isInWishlist ? 'Xóa khỏi Wishlist' : 'Thêm vào Wishlist'}
                      >
                        {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      <button 
                        className="cart-btn"
                        onClick={ev => { ev.stopPropagation(); handleAddToCart(product); }}
                        title="Thêm vào giỏ hàng"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                    <img
                      src={product.picture ? `http://localhost/market_management/backend/uploads/${product.picture}` : ''}
                      alt={product.nameProduct}
                      className="product-img-centered"
                    />
                    <div className="product-info-centered">
                      <div className="product-name-centered">{product.nameProduct}</div>
                      <div className="product-price-centered">{Number(product.exportCost).toLocaleString('vi-VN')}₫</div>
                      <div className="product-desc-centered">{product.descriptionProduct}</div>
                      <button className="product-btn-centered" onClick={ev => { ev.stopPropagation(); navigate(`/user/product/${product.idProduct}`, { state: { backgroundLocation: location } }); }}>
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
      {/* Chatbot Floating Icon */}
      <div className="chatbot-animated-container" style={{ position: 'fixed', bottom: 24, right: 32, zIndex: 9999 }}>
        <div
          className={`chatbot-fab${showChatBot ? ' hide' : ''}`}
          onClick={() => {
            if (!chatBotAnimating) {
              setChatBotAnimating(true);
              setShowChatBot(true);
              setTimeout(() => setChatBotAnimating(false), 400);
            }
          }}
          title="Chăm sóc khách hàng"
          tabIndex={0}
          style={{ outline: 'none', position: 'absolute', bottom: 0, right: 0, transition: 'opacity 0.4s' }}
        >
          <div className="chatbot-fab-icon">
            <BotAvatarIcon />
          </div>
        </div>
        <ChatBotWidget
          onClose={() => setShowChatBot(false)}
          isOpen={showChatBot}
        />
      </div>
    </>
  );
};

export default Home; 