import React, { useEffect, useState } from 'react';
import { fetchProduct } from '../../../services/productService';
import { FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import useWishlist from '../../../hooks/useWishlist.js';
import { useNavigate, Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import '../css/typeProduct.css';
import { fetchBrand } from '../../../services/brandService';

const Household = () => {
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchName, setSearchName] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brandList, setBrandList] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const allProducts = await fetchProduct();
        console.log('Fetched products:', allProducts); // Debug dữ liệu trả về
        // Lọc sản phẩm có idType === 4 (Household)
        const householdProducts = allProducts.filter(p => String(p.idType) === '4' || p.idType === 4);
        setProducts(householdProducts);
      } catch (err) {
        setError('Lỗi khi tải sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);
  useEffect(() => {
    const getBrands = async () => {
      const brands = await fetchBrand();
      setBrandList(brands);
    };
    getBrands();
  }, []);
  const handleReset = () => {
    setSearchName('');
    setMinPrice(0);
    setMaxPrice(1000000);
    setSelectedBrand('');
  };
  const filteredProducts = products.filter(p => {
    const matchName = p.nameProduct.toLowerCase().includes(searchName.toLowerCase());
    const price = Number(p.exportCost);
    const matchPrice = price >= minPrice && price <= maxPrice;
    const matchBrand = selectedBrand ? String(p.idBrand) === String(selectedBrand) : true;
    return matchName && matchPrice && matchBrand;
  });

  const handleWishlistToggle = (product) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước khi thực hiện thao tác!');
      return;
    }
    const isInWishlist = wishlist.some(item => item.idProduct === product.idProduct);
    toggleWishlist(product);
    toast.success(isInWishlist ? 'Đã xóa khỏi Wishlist!' : 'Đã thêm vào Wishlist!');
  };
  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước khi thực hiện thao tác!');
      return;
    }
    const existingItem = cart.find(item => item.idProduct === product.idProduct);
    addToCart(product);
    toast.success(existingItem ? 'Đã tăng số lượng sản phẩm trong giỏ hàng!' : 'Đã thêm vào giỏ hàng!');
  };
  const handleBuyNow = (product) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước khi thực hiện thao tác!');
      return;
    }
    addToCart(product);
    navigate('/user/shopping-cart');
  };

  return (
    <div className="typeproduct-container">
      <div className="typeproduct-breadcrumb">Shop All / Household Essentials</div>
      <div className="typeproduct-title">Household Essentials</div>
      <div className="typeproduct-main">
        <aside className="typeproduct-sidebar">
          <div className="sidebar-title">Tìm kiếm & Lọc</div>
          <div className="sidebar-search">
            <input
              type="text"
              placeholder="Tìm theo tên..."
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className="sidebar-search-input"
            />
          </div>
          <div className="sidebar-price">
            <div className="sidebar-price-label">Giá sản phẩm tối thiểu</div>
            <input
              type="range"
              min={0}
              max={maxPrice}
              value={minPrice}
              onChange={e => setMinPrice(Number(e.target.value))}
              className="sidebar-range"
            />
            <div className="sidebar-range-labels">
              <span>{minPrice.toLocaleString()}₫</span><span>{maxPrice.toLocaleString()}₫</span>
            </div>
            <div className="sidebar-price-label" style={{marginTop:16}}>Giá sản phẩm tối đa</div>
            <input
              type="range"
              min={minPrice}
              max={1000000}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="sidebar-range"
            />
            <div className="sidebar-range-labels">
              <span>{minPrice.toLocaleString()}₫</span><span>{maxPrice.toLocaleString()}₫</span>
            </div>
          </div>
          <div className="sidebar-brand" style={{marginBottom:24}}>
            <div className="sidebar-price-label">Thương hiệu</div>
            <select
              className="sidebar-search-input"
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
            >
              <option value="">Tất cả</option>
              {brandList.map((brand, idx) => (
                <option key={brand.idBrand} value={brand.idBrand}>{brand.nameBrand}</option>
              ))}
            </select>
          </div>
          <div className="sidebar-reset">
            <button
              className="sidebar-reset-btn"
              onClick={handleReset}
            >
              Reset bộ lọc
            </button>
          </div>
        </aside>
        <main style={{flex:1}}>
          {loading ? (
            <div style={{textAlign:'center', fontSize:'1.2rem', color:'#888'}}>Đang tải sản phẩm...</div>
          ) : error ? (
            <div style={{textAlign:'center', color:'red'}}>{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{textAlign:'center', color:'#888'}}>Không có sản phẩm nào thuộc danh mục này.</div>
          ) : (
            <div className="typeproduct-grid">
              {filteredProducts.map((p, idx) => {
                const isInWishlist = wishlist.some(item => item.idProduct === p.idProduct);
                return (
                  <div key={p.idProduct || idx} className="typeproduct-card">
                    <Link to={`/user/product/${p.idProduct}`} state={{ backgroundLocation: location }} style={{display:'block', width:'100%', height:'100%', textDecoration:'none', color:'inherit', position:'absolute', top:0, left:0, zIndex:1}} />
                    <div className="typeproduct-actions">
                      <button 
                        className={`wishlist-btn${isInWishlist ? ' active' : ''}`}
                        onClick={() => handleWishlistToggle(p)}
                        title={isInWishlist ? 'Xóa khỏi Wishlist' : 'Thêm vào Wishlist'}
                      >
                        {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      <button 
                        className="cart-btn"
                        onClick={() => handleAddToCart(p)}
                        title="Thêm vào giỏ hàng"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                    <img 
                      src={p.picture ? `http://localhost/market_management/backend/uploads/${p.picture}` : 'https://via.placeholder.com/220x220?text=No+Image'}
                      alt={p.nameProduct}
                      className="typeproduct-img"
                      style={{zIndex:2, position:'relative'}}
                    />
                    <div className="typeproduct-info">
                      <div className="typeproduct-name">{p.nameProduct}</div>
                      <div className="typeproduct-price">
                        {p.importCost && p.importCost !== p.exportCost && (
                          <span className="old">{p.importCost.toLocaleString()}₫</span>
                        )}
                        {p.exportCost ? p.exportCost.toLocaleString() + '₫' : 'Liên hệ'}
                      </div>
                      {/* Nút Buy Now */}
                      <button
                        className="product-btn-centered"
                        onClick={() => {
                          if (!user) return handleBuyNow(p);
                          addToCart(p);
                          navigate('/user/shopping-cart', { state: { backgroundLocation: location } });
                        }}
                      >
                        <FaShoppingCart style={{marginRight: 6}} /> Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Household; 