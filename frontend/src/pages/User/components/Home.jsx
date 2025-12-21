import React, { useState, useEffect, useRef } from 'react';
import videoBg from '../../../assets/102959-661305174.mp4';
import { FaShoppingCart, FaStar, FaFire, FaBolt, FaArrowRight, FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight, FaLeaf, FaTruck } from 'react-icons/fa';
import { BiStore } from 'react-icons/bi';
import '../css/home.css';
import Header from './Header';
import { fetchProduct } from '../../../services/productService';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import useWishlist from '../../../hooks/useWishlist.js';
import ChatBotWidget from '../../../components/ChatBotWidget';
import { useNavigate, useLocation } from 'react-router-dom';

// Avatar Icon
const BotAvatarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#FFD600" />
    <path d="M8 26c0-4 3.5-7 8-7s8 3 8 7" stroke="#222" strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="14" r="6" fill="#222" />
    <rect x="5" y="10" width="4" height="10" rx="2" fill="#FFD600" stroke="#222" strokeWidth="2" />
    <rect x="23" y="10" width="4" height="10" rx="2" fill="#FFD600" stroke="#222" strokeWidth="2" />
    <rect x="10" y="4" width="12" height="4" rx="2" fill="#FFD600" stroke="#222" strokeWidth="2" />
  </svg>
);

const Home = () => {
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatBotAnimating, setChatBotAnimating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Banner State
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop",
      title: "Fresh & Organic Market",
      desc: "Giảm giá đến 50% cho các sản phẩm rau củ quả hữu cơ."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1604719312566-b76d772740e7?q=80&w=2574&auto=format&fit=crop",
      title: "Best Selling Electronics",
      desc: "Khám phá các sản phẩm công nghệ hot nhất tháng này."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1506617420156-8e4536971650?q=80&w=2323&auto=format&fit=crop",
      title: "Premium Groceries",
      desc: "Chất lượng hảo hạng, giao hàng thần tốc ngay hôm nay."
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4000); // 4 seconds per slide for better UX (2s is too fast usually, but I can adjust if insisted)
    return () => clearInterval(slideInterval);
  }, [banners.length]);

  // Handle Controls
  const nextSlide = () => {
    setCurrentSlide(prev => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? banners.length - 1 : prev - 1));
  };


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

  // Filter Logic
  // 1. Best Selling (Mock logic: take first 8 items or random)
  const bestSellingProducts = products.slice(0, 8);

  // 2. Flash Sale (Logic: items where exportCost < importCost OR just random subset for demo/display)
  // Since real data might not have discounts, let's mock it by taking items from index 8 to 16
  // Or if we have data with sale logic, use it. For now, we take products with ID divisible by 2 or random subset.
  const flashSaleProducts = products.filter(p => p.idProduct % 2 !== 0).slice(0, 4);


  const handleWishlistToggle = (product) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập !');
      return;
    }
    toggleWishlist(product);
    const isIn = wishlist.some(i => i.idProduct === product.idProduct);
    toast.success(isIn ? 'Đã xóa khỏi Wishlist' : 'Đã thêm vào Wishlist');
  };

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập !');
      return;
    }
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng');
  };

  // Render Product Card
  const renderProductCard = (product, isFlashSale = false) => {
    const isInWishlist = wishlist.some(item => item.idProduct === product.idProduct);
    // Mock discount for flash sale if needed
    const oldPrice = isFlashSale ? Number(product.exportCost) * 1.2 : null;

    return (
      <div key={product.idProduct} className="home-product-card" onClick={() => navigate(`/user/product/${product.idProduct}`)}>
        {isFlashSale && <div className="discount-badge">-20%</div>}

        <div className="home-card-actions">
          {/* Wishlist Icon */}
          <button
            className={`action-icon-btn ${isInWishlist ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleWishlistToggle(product); }}
          >
            {isInWishlist ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        <img
          src={product.picture ? `http://localhost/market_management/backend/uploads/${product.picture}` : 'https://via.placeholder.com/200'}
          className="home-card-img"
          alt={product.nameProduct}
        />

        <div className="home-card-info">
          <div className="home-card-name">{product.nameProduct}</div>

          <div className="home-card-price-row">
            <div className="home-current-price">{Number(product.exportCost).toLocaleString('vi-VN')}₫</div>
            {isFlashSale && <div className="home-old-price">{oldPrice?.toLocaleString('vi-VN')}₫</div>}
          </div>

          <button
            className="home-card-btn"
            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
          >
            <FaShoppingCart /> Thêm vào giỏ
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="home-user">
        {/* Helper BG Video */}
        <video className="home-user-bg-video" src={videoBg} autoPlay loop muted playsInline />
        <div className="home-user-overlay"></div>

        <Header />

        {/* Hero Section (Restored Text) */}

        {/* Hero Section (Restored Text) */}
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
        </div>

        {/* 1. Banner Slider Section (Moved Below Text) */}
        <div className="home-banner-container">
          <div className="banner-slider">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <img src={banner.image} alt={banner.title} className="banner-image" />
                <div className="banner-content">
                  <div className="banner-title">{banner.title}</div>
                  <div className="banner-desc">{banner.desc}</div>
                  <button className="banner-btn">Mua ngay <FaArrowRight /></button>
                </div>
              </div>
            ))}

            <button className="slider-control slider-prev" onClick={prevSlide}>
              <FaChevronLeft />
            </button>
            <button className="slider-control slider-next" onClick={nextSlide}>
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* 2. Best Selling Section */}
        <div className="home-section">
          <div className="section-header">
            <div className="section-title">
              <FaFire /> Sản Phẩm Bán Chạy
            </div>
            <span className="section-view-all" onClick={() => navigate('/user/typeproduct/1')}>Xem tất cả &rarr;</span>
          </div>
          <div className="section-grid">
            {loading ? <p style={{ color: '#fff' }}>Đang tải...</p> : bestSellingProducts.map(p => renderProductCard(p))}
          </div>
        </div>

        {/* 3. Flash Sale Section */}
        <div className="home-section">
          <div className="section-header">
            <div className="section-title">
              <FaBolt /> Flash Sale - Đang Hạ Giá
            </div>
            <span className="section-view-all" onClick={() => navigate('/user/typeproduct/1')}>Xem tất cả &rarr;</span>
          </div>
          <div className="section-grid">
            {loading ? <p style={{ color: '#fff' }}>Đang tải...</p> : flashSaleProducts.map(p => renderProductCard(p, true))}
          </div>
        </div>

      </div>

      {/* Chatbot */}
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
          style={{ cursor: 'pointer' }}
        >
          <div className="chatbot-fab-icon">
            <BotAvatarIcon />
          </div>
        </div>
        <ChatBotWidget onClose={() => setShowChatBot(false)} isOpen={showChatBot} />
      </div>
    </>
  );
};

export default Home; 