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

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quản lý sản phẩm</h1>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => setShowForm(true)}
        >
          Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Tên sản phẩm:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nameProduct}
                  onChange={(e) => setFormData({...formData, nameProduct: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Hình ảnh sản phẩm:</label>
                <input
                  type="file"
                  className="form-input"
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
              
              <div className="form-group">
                <label className="form-label">Mô tả:</label>
                <textarea
                  className="form-input"
                  value={formData.descriptionProduct}
                  onChange={(e) => setFormData({...formData, descriptionProduct: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Nhà cung cấp:</label>
                <select
                  className="form-input"
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
              
              <div className="form-group">
                <label className="form-label">Số lượng:</label>
                <input
                  key={`amount-${editingProduct?.idProduct || 'new'}`}
                  type="number"
                  className="form-input"
                  value={formData.amountProduct === '' ? '' : formData.amountProduct}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({...formData, amountProduct: value === '' ? '' : parseInt(value) || 0});
                  }}
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Danh mục:</label>
                <select
                  className="form-input"
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
              
              <div className="form-group">
                <label className="form-label">Giá nhập:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.importCost || ''}
                  onChange={(e) => setFormData({...formData, importCost: e.target.value ? parseFloat(e.target.value) : ''})}
                  min="0"
                  step="1000"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Giá bán:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.exportCost || ''}
                  onChange={(e) => setFormData({...formData, exportCost: e.target.value ? parseFloat(e.target.value) : ''})}
                  min="0"
                  step="1000"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Thương hiệu:</label>
                <select
                  className="form-input"
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
              
              <div className="form-group">
                <label className="form-label">Khuyến mãi:</label>
                <select
                  className="form-input"
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
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Cập nhật' : 'Lưu'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Mô tả</th>
              <th>Nhà cung cấp</th>
              <th>Số lượng</th>
              <th>Danh mục</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Thương hiệu</th>
              <th>Khuyến mãi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.idProduct} style={{ animationDelay: `${index * 0.1}s` }}>
                <td>{product.idProduct}</td>
                <td>{renderProductImage(product)}</td>
                <td className="product-name">{product.nameProduct}</td>
                <td className="product-description">{product.descriptionProduct}</td>
                <td>{providers.find(p => p.idProvider === product.idProvider)?.nameProvider}</td>
                <td>
                  <span className={`status-badge ${product.amountProduct > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.amountProduct > 0 ? `${product.amountProduct} in stock` : 'Out of stock'}
                  </span>
                </td>
                <td>{categories.find(c => c.idType === product.idType)?.nameType}</td>
                <td className="price import">{product.importCost?.toLocaleString()} VNĐ</td>
                <td className="price export">{product.exportCost?.toLocaleString()} VNĐ</td>
                <td>{brands.find(b => b.idBrand === product.idBrand)?.nameBrand}</td>
                <td>
                  {(() => {
                    const promotion = promotions.find(p => p.idPromotion === parseInt(product.idPromotion));
                    console.log('Product:', product.nameProduct, 'idPromotion:', product.idPromotion, 'Found promotion:', promotion);
                    return promotion ? promotion.namePromotion : 'Không có';
                  })()}
                </td>
                <td className="action-buttons">
                  <button 
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: 48, padding: '4px 10px', fontSize: '0.95rem' }}
                    onClick={() => handleEdit(product)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ minWidth: 48, padding: '4px 10px', fontSize: '0.95rem' }}
                    onClick={() => handleDelete(product.idProduct)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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