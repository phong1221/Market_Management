import React, { useState, useEffect } from 'react'
import { fetchProduct, addProduct, updateProduct, deleteProduct } from '../../services/productService'
import { fetchProvider } from '../../services/providerService'
import { fetchPromotion } from '../../services/promotionService'
import { fetchTypeProduct } from '../../services/typeProductService'
import { fetchBrand } from '../../services/brandService'
import '../../css/notification.css';
import '../../css/product.css';

// Define the base URL for your backend's image uploads folder
const IMAGE_BASE_URL = 'http://localhost/market_management/backend/uploads/';

const Products = () => {
  const [products, setProducts] = useState([])
  const [providers, setProviders] = useState([])
  const [categories, setCategories] = useState([])
  const [promotions, setPromotions] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [notification, setNotification] = useState(null)
  const [formData, setFormData] = useState({
    nameProduct: '',
    picture: '',
    descriptionProduct: '',
    idProvider: '',
    amountProduct: '',
    idType: '',
    importCost: '',
    exportCost: '',
    idPromotion: '',
    idBrand: ''
  })
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchData()
  }, [])

  // Hàm lưu ảnh vào localStorage
  const saveImageToLocalStorage = (file, productId) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target.result
        const imageKey = `product_image_${productId || Date.now()}`
        localStorage.setItem(imageKey, imageData)
        resolve(imageKey)
      }
      reader.readAsDataURL(file)
    })
  }

  // Hàm lấy ảnh từ localStorage
  const getImageFromLocalStorage = (imageKey) => {
    return localStorage.getItem(imageKey) || null
  }

  // Hàm xử lý upload ảnh
  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsData, providersData, categoriesData, promotionsData, brandsData] = await Promise.all([
        fetch('http://localhost/market_management/backend/api/product/getProduct.php').then(res => res.json()),
        fetch('http://localhost/market_management/backend/api/provider/getProvider.php').then(res => res.json()),
        fetch('http://localhost/market_management/backend/api/typeProduct/getTypeProduct.php').then(res => res.json()),
        fetch('http://localhost/market_management/backend/api/promotion/getPromotion.php').then(res => res.json()),
        fetchBrand()
      ])
      
      setProducts(productsData.data || [])
      setProviders(providersData.data || [])
      setCategories(categoriesData.data || [])
      setPromotions(promotionsData.data || [])
      setBrands(brandsData || [])
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nameProduct: '',
      picture: '',
      descriptionProduct: '',
      idProvider: '',
      amountProduct: '',
      idType: '',
      importCost: '',
      exportCost: '',
      idPromotion: '',
      idBrand: ''
    })
    setEditingProduct(null)
    setSelectedImage(null)
    setImagePreview('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData();

      // Append all form data fields
      Object.keys(formData).forEach(key => {
        if (key === 'idPromotion' && (formData[key] === '' || formData[key] === null)) {
          data.append(key, 'null');
        } else if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      // Append the selected image file if it exists
      if (selectedImage) {
        data.append('picture', selectedImage);
      } else if (editingProduct && editingProduct.picture) {
        // If not editing image, pass the existing picture name
        data.append('existing_picture', editingProduct.picture);
      }
      
      let result;
      if (editingProduct) {
        // Append the product ID for updates
        data.append('idProduct', editingProduct.idProduct);
        result = await updateProduct(data);
      } else {
        result = await addProduct(data);
      }
      
      if (result.success) {
        showNotification(result.message, 'success')
        setShowForm(false)
        resetForm()
        fetchData()
      } else {
        showNotification('Lỗi: ' + result.message, 'error')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      showNotification('Có lỗi xảy ra khi lưu sản phẩm', 'error')
    }
  }

  const handleEdit = (product) => {
    console.log('Editing product:', product);
    setEditingProduct(product)
    const formDataToSet = {
      nameProduct: product.nameProduct || '',
      picture: product.picture || '',
      descriptionProduct: product.descriptionProduct || '',
      idProvider: product.idProvider || '',
      amountProduct: product.amountProduct === 0 ? 0 : (product.amountProduct || ''),
      idType: product.idType || '',
      importCost: product.importCost || '',
      exportCost: product.exportCost || '',
      idPromotion: product.idPromotion || '',
      idBrand: product.idBrand || ''
    }
    console.log('Setting form data:', formDataToSet);
    setFormData(formDataToSet)
    
    // Construct the dynamic image URL for the preview
    const imageSrc = product.picture ? `${IMAGE_BASE_URL}${product.picture}` : '';
    setImagePreview(imageSrc);
    
    setShowForm(true)
  }

  const handleDelete = async (idProduct) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        const result = await deleteProduct(idProduct)
        if (result.success) {
          // Xóa ảnh khỏi localStorage
          const imageKey = `product_image_${idProduct}`
          localStorage.removeItem(imageKey)
          
          showNotification(result.message, 'success')
          fetchData()
        } else {
          showNotification('Lỗi: ' + result.message, 'error')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        showNotification('Có lỗi xảy ra khi xóa sản phẩm', 'error')
      }
    }
    resetForm()
  }

  const handleCancel = () => {
    setShowForm(false)
    resetForm()
  }

  // Function to display the product image dynamically
  const renderProductImage = (product) => {
    // Construct the image source from the base URL and the picture filename from the database
    const imageSrc = product.picture ? `${IMAGE_BASE_URL}${product.picture}` : '';

    return (
      <img
        src={imageSrc}
        alt={product.nameProduct}
        className="product-image"
        onError={(e) => {
          e.target.style.display = 'none'; // Hide broken image icon
        }}
      />
    )
  }

  // Function to display notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  // Function to close notification
  const closeNotification = () => {
    setNotification(null)
  }

  // Search & Pagination
  const filterData = () => {
    if (!searchTerm.trim()) return products;
    return products.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const category = categories.find(c => c.idType === item.idType);
      const provider = providers.find(p => p.idProvider === item.idProvider);
      const brand = brands.find(b => b.idBrand === item.idBrand);
      switch (searchCriteria) {
        case 'nameProduct':
          return item.nameProduct.toLowerCase().includes(searchLower);
        case 'descriptionProduct':
          return item.descriptionProduct.toLowerCase().includes(searchLower);
        case 'provider':
          return provider && provider.nameProvider.toLowerCase().includes(searchLower);
        case 'category':
          return category && category.nameType.toLowerCase().includes(searchLower);
        case 'brand':
          return brand && brand.nameBrand.toLowerCase().includes(searchLower);
        case 'all':
          return (
            item.nameProduct.toLowerCase().includes(searchLower) ||
            item.descriptionProduct.toLowerCase().includes(searchLower) ||
            (provider && provider.nameProvider.toLowerCase().includes(searchLower)) ||
            (category && category.nameType.toLowerCase().includes(searchLower)) ||
            (brand && brand.nameBrand.toLowerCase().includes(searchLower))
          );
        default:
          return true;
      }
    });
  };

  const filteredProducts = filterData();
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  // Đảm bảo currentPage không vượt quá totalPages
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="products-page">
      <div className="products-page-header">
        <h1 className="products-page-title">Quản lý sản phẩm</h1>
        <button 
          className="products-btn products-btn-primary products-btn-sm" 
          onClick={() => setShowForm(true)}
        >
          Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <div className="products-modal-overlay">
          <div className="products-modal">
            <h2>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <form onSubmit={handleSubmit} className="products-form">
              <div className="products-form-group">
                <label className="products-form-label">Tên sản phẩm:</label>
                <input
                  type="text"
                  className="products-form-input"
                  value={formData.nameProduct}
                  onChange={(e) => setFormData({...formData, nameProduct: e.target.value})}
                  required
                />
              </div>
              
              <div className="products-form-group">
                <label className="products-form-label">Hình ảnh sản phẩm:</label>
                <input
                  type="file"
                  className="products-form-input"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {imagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="product-image"
                      style={{ width: '120px', height: '120px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
              
              <div className="products-form-group">
                <label className="products-form-label">Mô tả:</label>
                <textarea
                  className="products-form-input"
                  value={formData.descriptionProduct}
                  onChange={(e) => setFormData({...formData, descriptionProduct: e.target.value})}
                  required
                />
              </div>
              
              <div className="products-form-group">
                <label className="products-form-label">Nhà cung cấp:</label>
                <select
                  className="products-form-input"
                  value={formData.idProvider || ''}
                  onChange={(e) => setFormData({...formData, idProvider: e.target.value ? parseInt(e.target.value) : ''})}
                  required
                >
                  <option value="">Chọn nhà cung cấp</option>
                  {providers.map(provider => (
                    <option key={provider.idProvider} value={provider.idProvider}>
                      {provider.nameProvider}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="products-form-group">
                <label className="products-form-label">Số lượng:</label>
                <input
                  key={`amount-${editingProduct?.idProduct || 'new'}`}
                  type="number"
                  className="products-form-input"
                  value={formData.amountProduct === '' ? '' : formData.amountProduct}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({...formData, amountProduct: value === '' ? '' : parseInt(value) || 0});
                  }}
                  min="0"
                  required
                />
              </div>
              
              <div className="products-form-group">
                <label className="products-form-label">Danh mục:</label>
                <select
                  className="products-form-input"
                  value={formData.idType || ''}
                  onChange={(e) => setFormData({...formData, idType: e.target.value ? parseInt(e.target.value) : ''})}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.idType} value={category.idType}>
                      {category.nameType}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="products-form-group">
                <label className="products-form-label">Giá nhập:</label>
                <input
                  type="number"
                  className="products-form-input"
                  value={formData.importCost || ''}
                  onChange={(e) => setFormData({...formData, importCost: e.target.value ? parseFloat(e.target.value) : ''})}
                  min="0"
                  step="1000"
                  required
                />
              </div>
              
              <div className="products-form-group">
                <label className="products-form-label">Giá bán:</label>
                <input
                  type="number"
                  className="products-form-input"
                  value={formData.exportCost || ''}
                  onChange={(e) => setFormData({...formData, exportCost: e.target.value ? parseFloat(e.target.value) : ''})}
                  min="0"
                  step="1000"
                  required
                />
              </div>
              
              <div className="products-form-group">
                <label className="products-form-label">Thương hiệu:</label>
                <select
                  className="products-form-input"
                  value={formData.idBrand || ''}
                  onChange={(e) => setFormData({...formData, idBrand: e.target.value ? parseInt(e.target.value) : ''})}
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(brand => (
                    <option key={brand.idBrand} value={brand.idBrand}>
                      {brand.nameBrand}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="products-form-group">
                <label className="products-form-label">Khuyến mãi:</label>
                <select
                  className="products-form-input"
                  value={formData.idPromotion || ''}
                  onChange={(e) => setFormData({...formData, idPromotion: e.target.value ? parseInt(e.target.value) : null})}
                >
                  <option value="">Không có khuyến mãi</option>
                  {promotions.map(promotion => (
                    <option key={promotion.idPromotion} value={promotion.idPromotion}>
                      {promotion.namePromotion} ({promotion.discountPromotion}%)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="products-form-actions">
                <button type="submit" className="products-btn products-btn-primary">
                  {editingProduct ? 'Cập nhật' : 'Lưu'}
                </button>
                <button 
                  type="button" 
                  className="products-btn products-btn-secondary"
                  onClick={handleCancel}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="products-form-input"
          style={{ flex: 1 }}
        />
        <select
          value={searchCriteria}
          onChange={(e) => {
            setSearchCriteria(e.target.value)
            setCurrentPage(1)
          }}
          className="products-form-input"
          style={{ width: 'auto' }}
        >
          <option value="all">Tất cả</option>
          <option value="nameProduct">Tên sản phẩm</option>
          <option value="descriptionProduct">Mô tả</option>
          <option value="provider">Nhà cung cấp</option>
          <option value="category">Danh mục</option>
          <option value="brand">Thương hiệu</option>
        </select>
      </div>

      <div className="products-table-container">
        <table className="products-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Mô tả</th>
              <th>Nhà cung cấp</th>
              <th>{/* Số lượng/Khối lượng */}
                {(() => {
                  // Nếu tất cả sản phẩm trên trang đều cùng 1 danh mục thì lấy typeSell của danh mục đó
                  if (currentProducts.length > 0) {
                    const firstCategory = categories.find(c => c.idType === currentProducts[0].idType);
                    if (firstCategory && currentProducts.every(p => p.idType === firstCategory.idType)) {
                      return firstCategory.typeSell === 'Khối lượng' ? 'Khối lượng' : 'Số lượng';
                    }
                  }
                  return 'Số lượng / Khối lượng';
                })()}
              </th>
              <th>Danh mục</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Thương hiệu</th>
              <th>Khuyến mãi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => {
              const category = categories.find(c => c.idType === product.idType);
              
              // Sửa logic tìm khuyến mãi để xử lý cả string và number
              const promotion = promotions.find(p => 
                p.idPromotion == product.idPromotion || // So sánh lỏng lẻo
                p.idPromotion === parseInt(product.idPromotion) || // Chuyển đổi sang number
                p.idPromotion === String(product.idPromotion) // Chuyển đổi sang string
              );
              
              // Debug: Log thông tin khuyến mãi
              console.log('Product:', product.idProduct, 'idPromotion:', product.idPromotion, 'type:', typeof product.idPromotion);
              console.log('Available promotions:', promotions.map(p => ({ id: p.idPromotion, name: p.namePromotion })));
              console.log('Found promotion:', promotion);
              
              console.log('Rendering product:', product.idProduct, 'with buttons');
              return (
                <tr key={product.idProduct}>
                  <td>{product.idProduct}</td>
                  <td>{renderProductImage(product)}</td>
                  <td>{product.nameProduct}</td>
                  <td>{product.descriptionProduct}</td>
                  <td>{providers.find(p => p.idProvider === product.idProvider)?.nameProvider || 'N/A'}</td>
                  <td>
                    <span className={`stock-badge ${product.amountProduct > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {category && category.typeSell === 'Khối lượng'
                        ? `${product.amountProduct} kg`
                        : product.amountProduct > 0
                          ? `${product.amountProduct} IN STOCK`
                          : 'OUT OF STOCK'}
                    </span>
                  </td>
                  <td>{category?.nameType || 'N/A'}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.importCost)}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.exportCost)}</td>
                  <td>{brands.find(b => b.idBrand === product.idBrand)?.nameBrand || 'N/A'}</td>
                  <td>
                    {promotion ? (
                      <span className="status-badge in-stock">
                        {promotion.namePromotion} ({promotion.discountPromotion}%)
                      </span>
                    ) : (
                      <span className="status-badge out-of-stock">
                        Không có 
                      </span>
                    )}
                  </td>
                  <td style={{ minWidth: '120px', textAlign: 'center' }}>
                    <button
                      className="products-btn products-btn-primary products-btn-sm"
                      style={{ marginRight: '8px', display: 'inline-block' }}
                      onClick={() => handleEdit(product)}
                    >
                      Sửa
                    </button>
                    <button
                      className="products-btn products-btn-danger products-btn-sm"
                      style={{ display: 'inline-block' }}
                      onClick={() => handleDelete(product.idProduct)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="products-pagination-container">
          <button
            className="products-pagination-button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
          <button
            className="products-pagination-button"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lsaquo;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`products-pagination-button${currentPage === page ? ' active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="products-pagination-button"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &rsaquo;
          </button>
          <button
            className="products-pagination-button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
          <span className="products-pagination-info">
            Trang {currentPage} / {totalPages}
          </span>
        </div>
      )}

      {/* Notification Component */}
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button className="notification-close" onClick={closeNotification}>
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default Products