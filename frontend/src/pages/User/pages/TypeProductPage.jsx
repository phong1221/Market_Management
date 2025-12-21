import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { fetchProduct } from '../../../services/productService';
import { fetchBrand } from '../../../services/brandService';
import { fetchTypeProduct } from '../../../services/typeProductService';
import { FaShoppingCart, FaHeart, FaRegHeart, FaSearch, FaRedo, FaFilter, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import useWishlist from '../../../hooks/useWishlist.js';
import '../css/typeProduct.css';

const TypeProductPage = () => {
  const { idType } = useParams();
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [typeProduct, setTypeProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brandList, setBrandList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [idType]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load tất cả dữ liệu song song
        const [allProducts, allTypeProducts, brands] = await Promise.all([
          fetchProduct(),
          fetchTypeProduct(),
          fetchBrand()
        ]);

        // Tìm typeProduct tương ứng
        const foundTypeProduct = allTypeProducts.find(tp => String(tp.idType) === String(idType));

        if (!foundTypeProduct) {
          setError('Không tìm thấy danh mục sản phẩm này.');
          setLoading(false);
          return;
        }

        setTypeProduct(foundTypeProduct);

        // Lọc sản phẩm theo idType
        const filteredProducts = allProducts.filter(
          p => String(p.idType) === String(idType)
        );
        setProducts(filteredProducts);
        setBrandList(brands);

        // Tự động điều chỉnh maxPrice dựa trên giá sản phẩm - DISABLED as per user request for fixed range
        // if (filteredProducts.length > 0) {
        //   const prices = filteredProducts.map(p => Number(p.exportCost) || 0);
        //   const maxProductPrice = Math.max(...prices);
        //   setMaxPrice(Math.max(1000000, maxProductPrice));
        // }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Lỗi khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };

    if (idType) {
      loadData();
    }
  }, [idType]);

  // Hàm reset filter
  const handleReset = () => {
    setSearchName('');
    setMinPrice(0);
    // Fixed max price as requested
    setMaxPrice(10000000);
    setSelectedBrand('');
  };

  // Lọc sản phẩm theo filter
  const filteredProducts = products.filter(p => {
    const matchName = p.nameProduct.toLowerCase().includes(searchName.toLowerCase());
    const price = Number(p.exportCost) || 0;
    const matchPrice = price >= minPrice && price <= maxPrice;
    const matchBrand = selectedBrand ? String(p.idBrand) === String(selectedBrand) : true;
    return matchName && matchPrice && matchBrand;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, minPrice, maxPrice, selectedBrand]);

  // Đảm bảo currentPage hợp lệ
  useEffect(() => {
    if (validCurrentPage !== currentPage && totalPages > 0) {
      setCurrentPage(validCurrentPage);
    }
  }, [filteredProducts.length, totalPages]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, validCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`typeproduct-pagination-button ${validCurrentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="typeproduct-pagination-container">
        <button
          onClick={() => handlePageChange(1)}
          disabled={validCurrentPage === 1}
          className="typeproduct-pagination-button"
        >
          &laquo;
        </button>
        <button
          onClick={() => handlePageChange(validCurrentPage - 1)}
          disabled={validCurrentPage === 1}
          className="typeproduct-pagination-button"
        >
          &lsaquo;
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(validCurrentPage + 1)}
          disabled={validCurrentPage === totalPages}
          className="typeproduct-pagination-button"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={validCurrentPage === totalPages}
          className="typeproduct-pagination-button"
        >
          &raquo;
        </button>
        <span className="typeproduct-pagination-info">
          Trang {validCurrentPage} / {totalPages}
        </span>
      </div>
    );
  };

  // Thêm hàm xử lý wishlist
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
    toggleWishlist(product);
    toast.success(isInWishlist ? 'Đã xóa khỏi Wishlist!' : 'Đã thêm vào Wishlist!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

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
    addToCart(product);
    toast.success(existingItem ? 'Đã tăng số lượng sản phẩm trong giỏ hàng!' : 'Đã thêm vào giỏ hàng!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  if (loading) {
    return (
      <div className="typeproduct-container">
        <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#ffd700', padding: '40px' }}>
          Đang tải sản phẩm...
        </div>
      </div>
    );
  }

  if (error || !typeProduct) {
    return (
      <div className="typeproduct-container">
        <div style={{ textAlign: 'center', color: '#ff6b6b', padding: '40px' }}>
          {error || 'Không tìm thấy danh mục sản phẩm này.'}
        </div>
      </div>
    );
  }

  return (
    <div className="typeproduct-container">
      {/* Title */}
      <div className="typeproduct-title">{typeProduct.nameType}</div>
      {typeProduct.descriptionType && (
        <div style={{ padding: '0 20px 20px', color: '#fff', fontSize: '0.85rem' }}>
          {typeProduct.descriptionType}
        </div>
      )}
      <div className="typeproduct-main">
        {/* Sidebar filter */}
        <aside className="typeproduct-sidebar">
          <div className="sidebar-fixed-header">
            <div className="sidebar-title"><FaSearch /> Tìm kiếm & Lọc</div>
            <div className="sidebar-search">
              <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm theo tên..."
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  className="sidebar-search-input"
                />
              </div>
            </div>
          </div>
          <div className="sidebar-scrollable-content">

            {/* Price Filter */}
            <div className="sidebar-section">
              <label className="sidebar-label">Khoảng giá</label>
              <div className="sidebar-price-values">
                <span>{minPrice.toLocaleString('vi-VN')}₫</span>
                <span>{maxPrice.toLocaleString('vi-VN')}₫</span>
              </div>

              <input
                type="range"
                min={0}
                max={10000000}
                value={minPrice}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (val <= maxPrice) setMinPrice(val);
                }}
                className="sidebar-range"
                style={{ marginBottom: '12px' }}
              />
              <input
                type="range"
                min={0}
                max={10000000}
                value={maxPrice}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (val >= minPrice) setMaxPrice(val);
                }}
                className="sidebar-range"
              />
            </div>

            {/* Brand Filter */}
            <div className="sidebar-section">
              <label className="sidebar-label">Thương hiệu</label>
              <select
                className="sidebar-select"
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
              >
                <option value="">Tất cả thương hiệu</option>
                {brandList.map((brand) => (
                  <option key={brand.idBrand} value={brand.idBrand}>
                    {brand.nameBrand}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="sidebar-reset">
              <button
                className="sidebar-reset-btn"
                onClick={handleReset}
              >
                <FaRedo /> Reset bộ lọc
              </button>
            </div>
          </div>
        </aside>
        {/* Product grid */}
        <main style={{ flex: 1 }}>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#ffd700', padding: '40px' }}>
              Không có sản phẩm nào thuộc danh mục này.
            </div>
          ) : (
            <div className="typeproduct-grid">
              {currentProducts.map((p, idx) => {
                const isInWishlist = wishlist.some(item => item.idProduct === p.idProduct);
                return (
                  <div key={p.idProduct || idx} className="typeproduct-card">
                    <Link
                      to={`/user/product/${p.idProduct}`}
                      state={{ backgroundLocation: location }}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        textDecoration: 'none',
                        color: 'inherit',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1
                      }}
                    />
                    {/* Nút actions */}
                    <div className="typeproduct-actions">
                      <button
                        className={`wishlist-btn${isInWishlist ? ' active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlistToggle(p);
                        }}
                        title={isInWishlist ? 'Xóa khỏi Wishlist' : 'Thêm vào Wishlist'}
                      >
                        {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      <button
                        className="cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        title="Thêm vào giỏ hàng"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                    <img
                      src={p.picture ? `http://localhost/market_management/backend/uploads/${p.picture}` : 'https://via.placeholder.com/220x220?text=No+Image'}
                      alt={p.nameProduct}
                      className="typeproduct-img"
                      style={{ zIndex: 2, position: 'relative' }}
                    />
                    <div className="typeproduct-info">
                      <div className="typeproduct-name">{p.nameProduct}</div>
                      <div className="typeproduct-price">
                        {p.importCost && p.importCost !== p.exportCost && (
                          <span className="old">{Number(p.importCost).toLocaleString('vi-VN')}₫</span>
                        )}
                        {p.exportCost ? Number(p.exportCost).toLocaleString('vi-VN') + '₫' : 'Liên hệ'}
                      </div>
                      {/* Nút Buy Now */}
                      <button
                        className="product-btn-centered"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            toast.error('Vui lòng đăng nhập trước khi thực hiện thao tác!');
                            return;
                          }
                          addToCart(p);
                          navigate('/user/cart', { state: { backgroundLocation: location } });
                        }}
                      >
                        <FaShoppingCart style={{ marginRight: 6 }} /> Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {renderPagination()}
        </main>
      </div>
    </div>
  );
};

export default TypeProductPage;

