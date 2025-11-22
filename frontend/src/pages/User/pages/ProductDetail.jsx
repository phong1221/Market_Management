import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../../../services/productService';
import { fetchBrand } from '../../../services/brandService';
import { FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import useWishlist from '../../../hooks/useWishlist.js';
import '../css/ProductDetail.css';

const ProductDetail = () => {
  const { idProduct } = useParams();
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const allProducts = await fetchProduct();
        const found = allProducts.find(p => String(p.idProduct) === String(idProduct));
        setProduct(found || null);
        if (found && found.idBrand) {
          const brands = await fetchBrand();
          const foundBrand = brands.find(b => String(b.idBrand) === String(found.idBrand));
          setBrand(foundBrand || null);
        }
      } catch (err) {
        setError('Lỗi khi tải sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [idProduct]);

  const isInWishlist = product && wishlist.some(item => item.idProduct === product.idProduct);

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước khi thực hiện thao tác!');
      return;
    }
    toggleWishlist(product);
    toast.success(isInWishlist ? 'Đã xóa khỏi Wishlist!' : 'Đã thêm vào Wishlist!');
  };
  const handleAddToCart = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước khi thực hiện thao tác!');
      return;
    }
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng!');
  };
  const handleBuyNow = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước khi thực hiện thao tác!');
      return;
    }
    addToCart(product);
    navigate('/user/shopping-cart');
  };

  // Overlay close handler
  const handleClose = () => {
    navigate(-1);
  };

  if (loading) return (
    <div className="product-detail-overlay">
      <div className="product-detail-modal" style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:300}}>
        <div style={{textAlign:'center', color:'#ffd700', fontSize:20}}>Đang tải sản phẩm...</div>
      </div>
    </div>
  );
  if (error || !product) return (
    <div className="product-detail-overlay">
      <div className="product-detail-modal" style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:300}}>
        <div style={{textAlign:'center', color:'red', fontSize:20}}>Không tìm thấy sản phẩm.</div>
      </div>
    </div>
  );

  return (
    <div className="product-detail-overlay" onClick={handleClose}>
      <div className="product-detail-modal form-animate-pop-in" onClick={e => e.stopPropagation()}>
        <button className="product-detail-close" onClick={handleClose} title="Đóng">&times;</button>
        <div className="product-detail-main">
          <div className="product-detail-img">
            <img
              src={product.picture ? `http://localhost/market_management/backend/uploads/${product.picture}` : 'https://via.placeholder.com/320x320?text=No+Image'}
              alt={product.nameProduct}
            />
          </div>
          <div className="product-detail-info">
            <h2>{product.nameProduct}</h2>
            <div className="product-price">
              {product.exportCost ? Number(product.exportCost).toLocaleString() + '₫' : 'Liên hệ'}
              {product.importCost && product.importCost !== product.exportCost && (
                <span className="product-import-price">{Number(product.importCost).toLocaleString()}₫</span>
              )}
            </div>
            {brand && <div className="product-brand">Thương hiệu: {brand.nameBrand}</div>}
            <div className="product-desc">{product.descriptionProduct}</div>
            <div className="product-detail-actions">
              <button className="product-detail-btn" onClick={handleAddToCart}><FaShoppingCart style={{marginRight:6}}/>Thêm vào giỏ</button>
              <button className="product-detail-btn buy-now" onClick={handleBuyNow}><FaShoppingCart style={{marginRight:6}}/>Mua ngay</button>
              <button className={`product-detail-wishlist-btn${isInWishlist ? ' active' : ''}`} onClick={handleWishlistToggle} title={isInWishlist ? 'Xóa khỏi Wishlist' : 'Thêm vào Wishlist'}>
                {isInWishlist ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 