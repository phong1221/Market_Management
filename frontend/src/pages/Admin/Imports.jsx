import React, { useState, useEffect } from 'react'
import { 
  fetchImports, 
  fetchImportById, 
  addImport, 
  updateImport, 
  deleteImport, 
  generateImportCode, 
  formatCurrency, 
  formatDate 
} from '../../services/importService'
import { fetchProduct } from '../../services/productService'
import { fetchProvider } from '../../services/providerService'
import { fetchTypeProduct } from '../../services/typeProductService'
import '../../css/import.css'
import '../../css/notification.css'

const Imports = () => {
  const [imports, setImports] = useState([])
  const [products, setProducts] = useState([])
  const [providers, setProviders] = useState([])
  const [typeProducts, setTypeProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingImport, setEditingImport] = useState(null)
  const [selectedImport, setSelectedImport] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [notification, setNotification] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  
  const [formData, setFormData] = useState({
    importDate: new Date().toISOString().slice(0, 16),
    selectedTypeProduct: '',
    idProvider: '',
    items: [{ idProduct: '', quantity: '', importPrice: '', exportPrice: '', notes: '' }]
  })

  // State để lưu trữ danh sách đã lọc
  const [filteredProviders, setFilteredProviders] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedTypeProductInfo, setSelectedTypeProductInfo] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);



  const fetchData = async () => {
    try {
      setLoading(true)
      const [importsData, productsData, providersData, typeProductsData] = await Promise.all([
        fetchImports(),
        fetchProduct(),
        fetchProvider(),
        fetchTypeProduct()
      ])
      
      setImports(importsData)
      setProducts(productsData)
      setProviders(providersData)
      setTypeProducts(typeProductsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Hàm lọc nhà cung cấp và sản phẩm theo loại sản phẩm
  const filterByTypeProduct = (typeProductId) => {
    if (!typeProductId) {
      setFilteredProviders([])
      setFilteredProducts([])
      setSelectedTypeProductInfo(null)
      return
    }

    // Lọc nhà cung cấp theo loại sản phẩm
    const filteredProvidersList = providers.filter(provider => provider.idType === typeProductId)
    setFilteredProviders(filteredProvidersList)

    // Lọc sản phẩm theo loại sản phẩm
    const filteredProductsList = products.filter(product => product.idType === typeProductId)
    setFilteredProducts(filteredProductsList)

    // Lưu thông tin loại sản phẩm đã chọn
    const typeProductInfo = typeProducts.find(type => type.idType === typeProductId)
    setSelectedTypeProductInfo(typeProductInfo)
  }

  // Hàm để lấy label cho trường số lượng/khối lượng
  const getQuantityLabel = () => {
    if (!selectedTypeProductInfo) return 'Số lượng'
    
    // Dựa vào typeSell để quyết định hiển thị
    switch (selectedTypeProductInfo.typeSell) {
      case 'Khối lượng':
        return 'Khối lượng (kg)'
      case 'Số lượng':
        return 'Số lượng (cái)'
      default:
        return 'Số lượng'
    }
  }

  // Hàm để lấy placeholder cho trường số lượng/khối lượng
  const getQuantityPlaceholder = () => {
    if (!selectedTypeProductInfo) return 'Nhập số lượng'
    
    switch (selectedTypeProductInfo.typeSell) {
      case 'Khối lượng':
        return 'Nhập khối lượng (kg)'
      case 'Số lượng':
        return 'Nhập số lượng (cái)'
      default:
        return 'Nhập số lượng'
    }
  }

  // Xử lý khi thay đổi loại sản phẩm
  const handleTypeProductChange = (typeProductId) => {
    // Lọc nhà cung cấp và sản phẩm theo loại sản phẩm mới
    filterByTypeProduct(typeProductId)
    
    // Kiểm tra và reset các sản phẩm không thuộc loại sản phẩm mới
    const updatedItems = formData.items.map(item => {
      if (item.idProduct) {
        const product = products.find(p => p.idProduct === item.idProduct)
        if (product && product.idType !== typeProductId) {
          // Reset sản phẩm nếu không thuộc loại sản phẩm mới
          return { idProduct: '', quantity: '', importPrice: '', exportPrice: '', notes: '' }
        }
      }
      return item
    })
    
    setFormData({
      ...formData,
      selectedTypeProduct: typeProductId,
      idProvider: '', // Reset nhà cung cấp khi thay đổi loại sản phẩm
      items: updatedItems
    })
  }

  const resetForm = () => {
    setFormData({
      importDate: new Date().toISOString().slice(0, 16),
      selectedTypeProduct: '',
      idProvider: '',
      items: [{ idProduct: '', quantity: '', importPrice: '', exportPrice: '', notes: '' }]
    })
    setEditingImport(null)
    setFilteredProviders([])
    setFilteredProducts([])
    setSelectedTypeProductInfo(null)
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { idProduct: '', quantity: '', importPrice: '', exportPrice: '', notes: '' }]
    })
  }

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData({ ...formData, items: newItems })
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const importData = {
        ...formData,
        items: formData.items.filter(item => item.idProduct && item.quantity && item.importPrice && item.exportPrice)
      }

      if (editingImport) {
        const result = await updateImport(editingImport.import.idImport, importData)
        if (result.success) {
          setNotification({ message: result.message, type: 'success' });
          setShowForm(false)
          resetForm()
          fetchData()
        } else {
          setNotification({ message: result.message, type: 'error' });
        }
      } else {
        const result = await addImport(importData)
        if (result.success) {
          setNotification({ message: result.message, type: 'success' });
          setShowForm(false)
          resetForm()
          fetchData()
        } else {
          setNotification({ message: result.message, type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error saving import:', error)
      setNotification({ message: 'Lỗi khi lưu import: ' + error.message, type: 'error' });
    }
  }

  const handleEdit = async (importItem) => {
    try {
      // Fetch chi tiết import trước khi edit
      const importWithDetails = await fetchImportById(importItem.idImport);
      
      // Tìm loại sản phẩm từ sản phẩm đầu tiên trong danh sách
      const firstProduct = products.find(p => p.idProduct === importWithDetails.details[0]?.idProduct);
      const typeProductId = firstProduct?.idType || '';
      
      setEditingImport(importWithDetails);
      setFormData({
        importDate: importWithDetails.import.importDate ? importWithDetails.import.importDate.slice(0, 16) : new Date().toISOString().slice(0, 16),
        selectedTypeProduct: typeProductId,
        idProvider: importWithDetails.import.idProvider,
        items: importWithDetails.details?.map(detail => ({
          idProduct: detail.idProduct,
          quantity: detail.quantity,
          importPrice: detail.importPrice,
          exportPrice: detail.exportPrice,
          notes: detail.notes || ''
        })) || [{ idProduct: '', quantity: '', importPrice: '', exportPrice: '', notes: '' }]
      });
      
      // Lọc nhà cung cấp và sản phẩm theo loại sản phẩm
      filterByTypeProduct(typeProductId);
      
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching import details for edit:', error);
      alert('Lỗi khi lấy chi tiết import để chỉnh sửa: ' + error.message);
    }
  }

  const handleViewDetail = async (importItem) => {
    try {
      const importWithDetails = await fetchImportById(importItem.idImport);
      setSelectedImport(importWithDetails);
      setShowDetail(true);
    } catch (error) {
      console.error('Error fetching import details:', error);
      alert('Lỗi khi lấy chi tiết import: ' + error.message);
    }
  };

  const handleDelete = (importItem) => {
    setConfirmDelete(importItem);
  };

  const confirmDeleteImport = async () => {
    if (!confirmDelete) return;
    try {
      const result = await deleteImport(confirmDelete.idImport);
      if (result.success) {
        setNotification({ message: result.message, type: 'success' });
        fetchData();
      } else {
        setNotification({ message: result.message, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi xóa import: ' + error.message, type: 'error' });
    } finally {
      setConfirmDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Function to close notification
  const closeNotification = () => {
    setNotification(null);
  }

  if (loading) return <div className="imports-loading">Đang tải...</div>

  return (
    <div className="imports-page">
      {/* Notification Component */}
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button className="notification-close" onClick={closeNotification}>
            ×
          </button>
        </div>
      )}
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="imports-modal-overlay">
          <div className="imports-modal" style={{ maxWidth: 400, textAlign: 'center' }}>
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa phiếu nhập này?</p>
            <div className="imports-form-actions">
              <button className="imports-btn imports-btn-danger" onClick={confirmDeleteImport}>Xóa</button>
              <button className="imports-btn imports-btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="imports-page-header">
        <h1 className="imports-page-title">Quản lý nhập hàng</h1>
        <button 
          className="imports-btn imports-btn-primary" 
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          Tạo phiếu nhập hàng mới
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="imports-modal-overlay">
          <div className="imports-modal">
            <h2>{editingImport ? 'Cập nhật phiếu nhập hàng' : 'Tạo phiếu nhập hàng mới'}</h2>
            <form onSubmit={handleSubmit} className="imports-form">
              <div className="imports-form-row">
                <div className="imports-form-group">
                  <label className="imports-form-label">Ngày nhập:</label>
                  <input
                    type="datetime-local"
                    className="imports-form-input"
                    value={formData.importDate}
                    onChange={(e) => setFormData({...formData, importDate: e.target.value})}
                    required
                  />
                </div>
                <div className="imports-form-group">
                  <label className="imports-form-label">Loại sản phẩm:</label>
                  <select
                    className="imports-form-input"
                    value={formData.selectedTypeProduct}
                    onChange={(e) => handleTypeProductChange(e.target.value)}
                    required
                  >
                    <option value="">Chọn loại sản phẩm</option>
                    {typeProducts.map(typeProduct => (
                      <option key={typeProduct.idType} value={typeProduct.idType}>
                        {typeProduct.nameType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="imports-form-row">
                <div className="imports-form-group">
                  <label className="imports-form-label">Nhà cung cấp:</label>
                  <select
                    className="imports-form-input"
                    value={formData.idProvider}
                    onChange={(e) => setFormData({...formData, idProvider: e.target.value})}
                    required
                    disabled={!formData.selectedTypeProduct}
                  >
                    <option value="">
                      {formData.selectedTypeProduct ? 'Chọn nhà cung cấp' : 'Vui lòng chọn loại sản phẩm trước'}
                    </option>
                    {filteredProviders.map(provider => (
                      <option key={provider.idProvider} value={provider.idProvider}>
                        {provider.nameProvider}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Items Section */}
              <div className="imports-form-section">
                <div className="imports-section-header">
                  <h3>Danh sách sản phẩm</h3>
                  <button 
                    type="button" 
                    className="imports-btn imports-btn-secondary imports-btn-sm" 
                    onClick={handleAddItem}
                    disabled={!formData.selectedTypeProduct}
                  >
                    + Thêm sản phẩm
                  </button>
                </div>
                {!formData.selectedTypeProduct && (
                  <div className="imports-alert imports-alert-info">
                    Vui lòng chọn loại sản phẩm để hiển thị danh sách sản phẩm
                  </div>
                )}
                {formData.items.map((item, index) => (
                  <div key={index} className="imports-item-row">
                    <div className="imports-form-group">
                      <label className="imports-form-label">Sản phẩm:</label>
                      <select
                        className="imports-form-input"
                        value={item.idProduct}
                        onChange={(e) => handleItemChange(index, 'idProduct', e.target.value)}
                        required
                        disabled={!formData.selectedTypeProduct}
                      >
                        <option value="">
                          {formData.selectedTypeProduct ? 'Chọn sản phẩm' : 'Vui lòng chọn loại sản phẩm trước'}
                        </option>
                        {filteredProducts.map(product => (
                          <option key={product.idProduct} value={product.idProduct}>
                            {product.nameProduct}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="imports-form-group">
                      <label className="imports-form-label">{getQuantityLabel()}:</label>
                      <input
                        type="number"
                        className="imports-form-input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                        min="1"
                        placeholder={getQuantityPlaceholder()}
                      />
                    </div>
                    <div className="imports-form-group">
                      <label className="imports-form-label">Giá nhập:</label>
                      <input
                        type="number"
                        className="imports-form-input"
                        value={item.importPrice}
                        onChange={(e) => handleItemChange(index, 'importPrice', e.target.value)}
                        required
                        min="0"
                      />
                    </div>
                    <div className="imports-form-group">
                      <label className="imports-form-label">Giá bán:</label>
                      <input
                        type="number"
                        className="imports-form-input"
                        value={item.exportPrice}
                        onChange={(e) => handleItemChange(index, 'exportPrice', e.target.value)}
                        required
                        min="0"
                      />
                    </div>
                    <div className="imports-form-group">
                      <label className="imports-form-label">Ghi chú:</label>
                      <input
                        type="text"
                        className="imports-form-input"
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <div className="imports-form-group imports-form-group-button">
                        <button 
                          type="button" 
                          className="imports-btn imports-btn-danger imports-btn-sm"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="imports-form-actions">
                <button type="submit" className="imports-btn imports-btn-primary">
                  {editingImport ? 'Cập nhật' : 'Lưu'}
                </button>
                <button 
                  type="button" 
                  className="imports-btn imports-btn-secondary"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {showDetail && selectedImport && (
        <div className="imports-modal-overlay">
          <div className="imports-modal" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>Chi tiết phiếu nhập hàng: {selectedImport.import.idImport}</h2>
            <div className="imports-detail-section">
              <h3>Thông tin chung</h3>
              <div className="imports-detail-grid">
                <div><strong>ID Import:</strong> {selectedImport.import.idImport}</div>
                <div><strong>Ngày nhập:</strong> {formatDate(selectedImport.import.importDate)}</div>
                <div><strong>Nhà cung cấp:</strong> {selectedImport.import.providerName}</div>
                <div><strong>Loại sản phẩm:</strong> {selectedImport.details && selectedImport.details.length > 0 ? 
                  (() => {
                    const firstProduct = products.find(p => p.idProduct === selectedImport.details[0].idProduct);
                    const typeProduct = typeProducts.find(t => t.idType === firstProduct?.idType);
                    return typeProduct ? typeProduct.nameType : 'Không xác định';
                  })() : 'Không xác định'
                }</div>
                <div><strong>Kiểu bán:</strong> {selectedImport.details && selectedImport.details.length > 0 ? 
                  (() => {
                    const firstProduct = products.find(p => p.idProduct === selectedImport.details[0].idProduct);
                    const typeProduct = typeProducts.find(t => t.idType === firstProduct?.idType);
                    if (typeProduct) {
                      switch (typeProduct.typeSell) {
                        case 'Khối lượng':
                          return 'Khối lượng (kg)'
                        case 'Số lượng':
                          return 'Số lượng (cái)'
                        default:
                          return typeProduct.typeSell || 'Không xác định'
                      }
                    }
                    return 'Không xác định';
                  })() : 'Không xác định'
                }</div>
                <div><strong>Tổng tiền:</strong> {formatCurrency(selectedImport.import.totalAmount)}</div>
              </div>
            </div>
            <div className="imports-detail-section">
              <h3>Danh sách sản phẩm</h3>
              <table className="imports-data-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>{(() => {
                      if (selectedImport.details && selectedImport.details.length > 0) {
                        const firstProduct = products.find(p => p.idProduct === selectedImport.details[0].idProduct);
                        if (firstProduct) {
                          const typeProduct = typeProducts.find(t => t.idType === firstProduct.idType);
                          if (typeProduct) {
                            switch (typeProduct.typeSell) {
                              case 'Khối lượng':
                                return 'Khối lượng (kg)'
                              case 'Số lượng':
                                return 'Số lượng (cái)'
                              default:
                                return 'Số lượng'
                            }
                          }
                        }
                      }
                      return 'Số lượng'
                    })()}</th>
                    <th>Giá nhập</th>
                    <th>Giá bán</th>
                    <th>Thành tiền</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedImport.details && selectedImport.details.map((detail, index) => (
                    <tr key={index}>
                      <td>{detail.nameProduct}</td>
                      <td>{detail.quantity}</td>
                      <td>{formatCurrency(detail.importPrice)}</td>
                      <td>{formatCurrency(detail.exportPrice)}</td>
                      <td>{formatCurrency(detail.totalPrice)}</td>
                      <td>{detail.notes || 'Không có'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="imports-form-actions">
              <button 
                type="button" 
                className="imports-btn imports-btn-secondary"
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="imports-table-container">
        <table className="imports-data-table">
          <thead>
            <tr>
              <th>ID Import</th>
              <th>Ngày nhập</th>
              <th>Nhà cung cấp</th>
              <th>Loại sản phẩm</th>
              <th>Kiểu bán</th>
              <th>Số sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {imports.map((importItem) => (
              <tr key={importItem.idImport}>
                <td>{importItem.idImport}</td>
                <td>{formatDate(importItem.importDate)}</td>
                <td>{importItem.providerName}</td>
                <td>
                  {(() => {
                    // Tìm loại sản phẩm từ nhà cung cấp
                    const provider = providers.find(p => p.idProvider === importItem.idProvider);
                    if (provider) {
                      const typeProduct = typeProducts.find(t => t.idType === provider.idType);
                      return typeProduct ? typeProduct.nameType : 'Không xác định';
                    }
                    return 'Không xác định';
                  })()}
                </td>
                <td>
                  {(() => {
                    // Tìm kiểu bán từ nhà cung cấp
                    const provider = providers.find(p => p.idProvider === importItem.idProvider);
                    if (provider) {
                      const typeProduct = typeProducts.find(t => t.idType === provider.idType);
                      if (typeProduct) {
                        switch (typeProduct.typeSell) {
                          case 'Khối lượng':
                            return 'Khối lượng (kg)'
                          case 'Số lượng':
                            return 'Số lượng (cái)'
                          default:
                            return typeProduct.typeSell || 'Không xác định'
                        }
                      }
                    }
                    return 'Không xác định';
                  })()}
                </td>
                <td>{importItem.itemCount}</td>
                <td>{formatCurrency(importItem.totalAmount)}</td>
                <td>
                  <div className="imports-action-buttons">
                    <button 
                      className="imports-btn imports-btn-info imports-btn-sm"
                      onClick={() => handleViewDetail(importItem)}
                      title="Xem chi tiết"
                    >
                      👁️
                    </button>
                    <button 
                      className="imports-btn imports-btn-warning imports-btn-sm"
                      onClick={() => handleEdit(importItem)}
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button 
                      className="imports-btn imports-btn-danger imports-btn-sm"
                      onClick={() => handleDelete(importItem)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Imports 