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
        // Tính toán số trang mới sau khi xóa dựa trên dữ liệu hiện tại
        const currentTotalItems = filteredBrands.length;
        const newTotalItems = currentTotalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);
        
        // Kiểm tra xem phần tử bị xóa có phải là phần tử cuối cùng của trang hiện tại không
        const itemsOnCurrentPage = currentBrands.length;
        const isLastItemOnPage = itemsOnCurrentPage === 1;
        
        // Logic điều hướng trang sau khi xóa:
        // 1. Nếu trang hiện tại lớn hơn số trang mới và có ít nhất 1 trang, chuyển về trang đầu tiên
        // 2. Nếu xóa phần tử cuối cùng của trang và không phải trang đầu tiên, chuyển về trang trước
        // 3. Nếu xóa phần tử cuối cùng của trang đầu tiên và không còn dữ liệu, giữ nguyên trang 1
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        } else if (isLastItemOnPage && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
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
  
  // Đảm bảo currentPage không vượt quá totalPages
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
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
          className={`brands-pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="brands-pagination-container">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="brands-pagination-button"
        >
          &laquo;
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="brands-pagination-button"
        >
          &lsaquo;
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="brands-pagination-button"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="brands-pagination-button"
        >
          &raquo;
        </button>
        <span className="brands-pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
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

  if (loading) return <div className="brands-loading">Đang tải...</div>

  return (
    <div className="brands-page">
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      {confirmDelete && (
        <div className="brands-modal-overlay">
          <div className="brands-modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa nhãn hàng này?</p>
            <div className="brands-form-actions">
              <button className="brands-btn brands-btn-danger" onClick={() => confirmDeleteBrand(confirmDelete)}>Xóa</button>
              <button className="brands-btn brands-btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="brands-page-header">
        <h1 className="brands-page-title">Quản lý nhãn hàng</h1>
        <button 
          className="brands-btn brands-btn-primary" 
          onClick={handleAdd}
        >
          Thêm nhãn hàng mới
        </button>
      </div>

      <div className="brands-search-container">
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="brands-form-input"
        />
        <select
          value={searchCriteria}
          onChange={(e) => {
            setSearchCriteria(e.target.value);
            setCurrentPage(1);
          }}
          className="brands-form-input"
        >
          <option value="all">Tất cả</option>
          <option value="nameBrand">Tên nhãn hàng</option>
          <option value="logoBrand">Logo</option>
        </select>
      </div>

      {showModal && (
        <div className="brands-modal-overlay">
          <div className="brands-modal">
            <h2>{modalType === "add" ? "Thêm nhãn hàng mới" : "Sửa nhãn hàng"}</h2>
            <form onSubmit={handleSave} className="brands-form">
              <div className="brands-form-group">
                <label className="brands-form-label">ID:</label>
                <input
                  type="text"
                  className="brands-form-input"
                  value={modalType === "add" ? "Tự động tạo" : editingBrand.idBrand}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="brands-form-group">
                <label className="brands-form-label">Tên nhãn hàng:</label>
                <input
                  type="text"
                  className="brands-form-input"
                  value={editingBrand.nameBrand}
                  onChange={e => setEditingBrand({ ...editingBrand, nameBrand: e.target.value })}
                  required
                />
              </div>
              
              <div className="brands-form-group">
                <label className="brands-form-label">Logo: <span style={{ color: '#666', fontSize: '12px' }}>(Tùy chọn)</span></label>
                <input
                  type="file"
                  className="brands-form-input"
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
              
              <div className="brands-form-actions">
                <button type="submit" className="brands-btn brands-btn-primary">{modalType === "add" ? "Thêm" : "Lưu"}</button>
                <button type="button" className="brands-btn brands-btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="brands-table-container">
        <table className="brands-data-table">
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
                    className="brands-btn brands-btn-secondary brands-btn-sm"
                    onClick={() => handleDelete(brand.idBrand)}
                  >
                    Xóa
                  </button>
                  <button
                    className="brands-btn brands-btn-primary brands-btn-sm"
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