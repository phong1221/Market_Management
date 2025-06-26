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
import '../../css/import.css'

const Imports = () => {
  const [imports, setImports] = useState([])
  const [products, setProducts] = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingImport, setEditingImport] = useState(null)
  const [selectedImport, setSelectedImport] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  
  const [formData, setFormData] = useState({
    importDate: new Date().toISOString().slice(0, 16),
    idProvider: '',
    items: [{ idProduct: '', quantity: '', importPrice: '', exportPrice: '', notes: '' }]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [importsData, productsData, providersData] = await Promise.all([
        fetchImports(),
        fetchProduct(),
        fetchProvider()
      ])
      
      setImports(importsData)
      setProducts(productsData)
      setProviders(providersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      importDate: new Date().toISOString().slice(0, 16),
      idProvider: '',
      items: [{ idProduct: '', quantity: '', importPrice: '', exportPrice: '', notes: '' }]
    })
    setEditingImport(null)
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
        alert(result.message)
        if (result.success) {
          setShowForm(false)
          resetForm()
          fetchData()
        }
      } else {
        const result = await addImport(importData)
        alert(result.message)
        if (result.success) {
          setShowForm(false)
          resetForm()
          fetchData()
        }
      }
    } catch (error) {
      console.error('Error saving import:', error)
      alert('Lỗi khi lưu import: ' + error.message)
    }
  }

  const handleEdit = async (importItem) => {
    try {
      // Fetch chi tiết import trước khi edit
      const importWithDetails = await fetchImportById(importItem.idImport);
      
      setEditingImport(importWithDetails);
      setFormData({
        importDate: importWithDetails.import.importDate ? importWithDetails.import.importDate.slice(0, 16) : new Date().toISOString().slice(0, 16),
        idProvider: importWithDetails.import.idProvider,
        items: importWithDetails.details?.map(detail => ({
          idProduct: detail.idProduct,
          quantity: detail.quantity,
          importPrice: detail.importPrice,
          exportPrice: detail.exportPrice,
          notes: detail.notes || ''
        })) || [{ idProduct: '', quantity: '', importPrice: '', exportPrice: '', notes: '' }]
      });
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

  const handleDelete = async (importItem) => {
    if (window.confirm(`Bạn có chắc muốn xóa import ID: ${importItem.idImport}?`)) {
      try {
        const result = await deleteImport(importItem.idImport)
        alert(result.message)
        if (result.success) {
          fetchData()
        }
      } catch (error) {
        console.error('Error deleting import:', error)
        alert('Lỗi khi xóa import: ' + error.message)
      }
    }
  }

  if (loading) return <div className="page">Đang tải...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quản lý nhập hàng</h1>
        <button 
          className="btn btn-primary" 
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
        <div className="modal-overlay">
          <div className="modal-import">
            <h2>{editingImport ? 'Cập nhật phiếu nhập hàng' : 'Tạo phiếu nhập hàng mới'}</h2>
            <form onSubmit={handleSubmit} className="form-import">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ngày nhập:</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.importDate}
                    onChange={(e) => setFormData({...formData, importDate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Nhà cung cấp:</label>
                  <select
                    className="form-input"
                    value={formData.idProvider}
                    onChange={(e) => setFormData({...formData, idProvider: e.target.value})}
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
              </div>

              {/* Items Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Danh sách sản phẩm</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
                    + Thêm sản phẩm
                  </button>
                </div>
                
                {formData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="form-group">
                      <label className="form-label">Sản phẩm:</label>
                      <select
                        className="form-input"
                        value={item.idProduct}
                        onChange={(e) => handleItemChange(index, 'idProduct', e.target.value)}
                        required
                      >
                        <option value="">Chọn sản phẩm</option>
                        {products.map(product => (
                          <option key={product.idProduct} value={product.idProduct}>
                            {product.nameProduct}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Số lượng:</label>
                      <input
                        type="number"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                        min="1"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Giá nhập:</label>
                      <input
                        type="number"
                        className="form-input"
                        value={item.importPrice}
                        onChange={(e) => handleItemChange(index, 'importPrice', e.target.value)}
                        required
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Giá bán:</label>
                      <input
                        type="number"
                        className="form-input"
                        value={item.exportPrice}
                        onChange={(e) => handleItemChange(index, 'exportPrice', e.target.value)}
                        required
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Ghi chú:</label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                      />
                    </div>
                    
                    {formData.items.length > 1 && (
                      <div className="form-group form-group-button">
                        <button 
                          type="button" 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingImport ? 'Cập nhật' : 'Lưu'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
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
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>Chi tiết phiếu nhập hàng: {selectedImport.import.idImport}</h2>
            
            <div className="detail-section">
              <h3>Thông tin chung</h3>
              <div className="detail-grid">
                <div><strong>ID Import:</strong> {selectedImport.import.idImport}</div>
                <div><strong>Ngày nhập:</strong> {formatDate(selectedImport.import.importDate)}</div>
                <div><strong>Nhà cung cấp:</strong> {selectedImport.import.providerName}</div>
                <div><strong>Tổng tiền:</strong> {formatCurrency(selectedImport.import.totalAmount)}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Danh sách sản phẩm</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
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
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Import</th>
              <th>Ngày nhập</th>
              <th>Nhà cung cấp</th>
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
                <td>{importItem.itemCount}</td>
                <td>{formatCurrency(importItem.totalAmount)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-info btn-sm"
                      onClick={() => handleViewDetail(importItem)}
                      title="Xem chi tiết"
                    >
                      👁️
                    </button>
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEdit(importItem)}
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
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