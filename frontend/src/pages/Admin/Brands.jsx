import React, { useState, useEffect } from 'react'
import { fetchBrand, addBrand, updateBrand, deleteBrand } from '../../services/brandService';
import '../../css/brand.css';
import '../../css/notification.css';

const Brands = () => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("add")
  const [editingBrand, setEditingBrand] = useState({
    idBrand: "",
    nameBrand: "",
    logoBrand: ""
  })
  const [selectedLogo, setSelectedLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [notification, setNotification] = useState(null)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [confirmDelete, setConfirmDelete] = useState(null);

  const IMAGE_BASE_URL = 'http://localhost/market_management/backend/uploads/';

  useEffect(() => { 
    fetchBrands()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await fetchBrand();
      setBrands(data);
      console.log('Số lượng nhãn hàng:', data.length, data);
    } catch (error) {
      setNotification({ message: "Lỗi khi tải dữ liệu: " + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (brand) => {
    setModalType("edit");
    setEditingBrand(brand);
    setSelectedLogo(null);
    
    // Construct the dynamic image URL for the preview
    const imageSrc = brand.logoBrand ? `${IMAGE_BASE_URL}${brand.logoBrand}` : '';
    setLogoPreview(imageSrc);
    
    setShowModal(true);
  };

  const handleAdd = () => {
    setModalType("add");
    setEditingBrand({
      idBrand: "",
      nameBrand: "",
      logoBrand: ""
    });
    setSelectedLogo(null);
    setLogoPreview('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingBrand.nameBrand.trim()) {
      setNotification({ message: "Vui lòng nhập tên nhãn hàng", type: "error" });
      return;
    }

    try {
      const brandData = {
        ...editingBrand,
        logoFile: selectedLogo,
        existingLogo: modalType === "edit" && !selectedLogo ? editingBrand.logoBrand : null
      };

      console.log('Modal type:', modalType);
      console.log('Brand data:', brandData);

      if (modalType === "edit") {
        // Gọi API update
        console.log('Sending update data:', brandData);
        const result = await updateBrand(brandData);
        if (result.success) {
          fetchBrands();
          setNotification({ message: "Cập nhật thành công", type: "success" });
        } else {
          setNotification({ message: result.message, type: "error" });
          return;
        }
      } else {
        // Gọi API add - không gửi idBrand vì database sẽ tự tạo
        const addData = {
          nameBrand: brandData.nameBrand,
          logoFile: brandData.logoFile,
          logoBrand: brandData.logoBrand
        };
        console.log('Sending add data:', addData);
        const result = await addBrand(addData);
        if (result.success) {
          fetchBrands();
          setNotification({ message: "Thêm thành công", type: "success" });
        } else {
          setNotification({ message: result.message, type: "error" });
          return;
        }
      }
      setShowModal(false);
      setSelectedLogo(null);
      setLogoPreview('');
    } catch (error) {
      setNotification({ message: "Có lỗi xảy ra: " + error.message, type: "error" });
    }
  };

  const handleDelete = async (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteBrand = async (id) => {
    try {
      const result = await deleteBrand(id);
      if (result.success) {
        fetchBrands();
        setNotification({ message: "Xóa nhãn hàng thành công!", type: "success" });
      } else {
        setNotification({ message: result.message || "Xóa thất bại!", type: "error" });
      }
    } catch (error) {
      setNotification({ message: "Lỗi khi xóa: " + error.message, type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const filterData = () => {
    if (!searchTerm.trim()) return brands;

    return brands.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      switch (searchCriteria) {
        case "nameBrand":
          return item.nameBrand.toLowerCase().includes(searchLower);
        case "logoBrand":
          return item.logoBrand.toLowerCase().includes(searchLower);
        case "all":
          return (
            item.nameBrand.toLowerCase().includes(searchLower) ||
            item.logoBrand.toLowerCase().includes(searchLower)
          );
        default:
          return true;
      }
    });
  };

  const filteredBrands = filterData();
  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBrands = filteredBrands.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          Trước
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Sau
        </button>
      </div>
    );
  };

  // Function to display the brand logo dynamically
  const renderBrandLogo = (brand) => {
    if (!brand.logoBrand) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>No image</span>;
    }

    const imageSrc = `${IMAGE_BASE_URL}${brand.logoBrand}`;

    return (
      <div style={{ position: 'relative' }}>
        <img
          src={imageSrc}
          alt={brand.nameBrand}
          className="brand-logo"
          onError={(e) => {
            e.target.style.display = 'none';
            // Check if nextSibling exists before accessing its style
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'block';
            }
          }}
        />
        <span 
          style={{ 
            color: '#999', 
            fontStyle: 'italic',
            display: 'none',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '12px'
          }}
        >
          No image
        </span>
      </div>
    )
  }

  console.log('filteredBrands:', filteredBrands.length, filteredBrands);

  if (loading) return <div className="page">Đang tải...</div>

  return (
    <div className="page">
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa nhãn hàng này?</p>
            <div className="form-actions">
              <button className="btn btn-danger" onClick={() => confirmDeleteBrand(confirmDelete)}>Xóa</button>
              <button className="btn btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="page-header">
        <h1 className="page-title">Quản lý nhãn hàng</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleAdd}
        >
          Thêm nhãn hàng mới
        </button>
      </div>

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="modal-input"
          style={{ flex: 1 }}
        />
        <select
          value={searchCriteria}
          onChange={(e) => {
            setSearchCriteria(e.target.value);
            setCurrentPage(1);
          }}
          className="modal-input"
          style={{ width: 'auto' }}
        >
          <option value="all">Tất cả</option>
          <option value="nameBrand">Tên nhãn hàng</option>
          <option value="logoBrand">Logo</option>
        </select>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{modalType === "add" ? "Thêm nhãn hàng mới" : "Sửa nhãn hàng"}</h2>
            <form onSubmit={handleSave} className="form">
              <div className="form-group">
                <label className="form-label">ID:</label>
                <input
                  type="text"
                  className="form-input"
                  value={modalType === "add" ? "Tự động tạo" : editingBrand.idBrand}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tên nhãn hàng:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingBrand.nameBrand}
                  onChange={e => setEditingBrand({ ...editingBrand, nameBrand: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Logo: <span style={{ color: '#666', fontSize: '12px' }}>(Tùy chọn)</span></label>
                <input
                  type="file"
                  className="form-input"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                {logoPreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'contain', 
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#f8f9fa',
                        padding: '5px'
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{modalType === "add" ? "Thêm" : "Lưu"}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
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
              <th>Logo</th>
              <th>Tên nhãn hàng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentBrands.map((brand) => (
              <tr key={brand.idBrand}>
                <td>{brand.idBrand}</td>
                <td>
                  {renderBrandLogo(brand)}
                </td>
                <td>{brand.nameBrand}</td>
                <td>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(brand.idBrand)}
                  >
                    Xóa
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginLeft: 8 }}
                    onClick={() => handleEdit(brand)}
                  >
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  )
}

export default Brands 