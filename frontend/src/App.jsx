import React, { useState, useEffect } from 'react';
import { phoneApi } from './services/phoneApi';

function App() {
  // States
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [toast, setToast] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPhoneId, setCurrentPhoneId] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    price: '',
    stock_quantity: '',
    description: '',
    images: []
  });

  // Fetch Phones
  const fetchPhones = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await phoneApi.getAllPhones(filters);
      setPhones(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search/filter
    const delayDebounce = setTimeout(() => {
      fetchPhones({ search, brand: brandFilter });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, brandFilter]);

  // Toast handler
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // KPI Calculations
  const totalProducts = phones.length;
  const totalStockValue = phones.reduce((acc, curr) => acc + (curr.price * curr.stock_quantity), 0);
  const lowStockCount = phones.filter(p => p.stock_quantity < 5).length;
  const uniqueBrands = [...new Set(phones.map(p => p.brand).filter(Boolean))];

  // Format Currency (VND)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setFormData({
      productName: '',
      brand: '',
      price: '',
      stock_quantity: '',
      description: '',
      images: []
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = async (phone) => {
    try {
      // Get fresh details from API
      const details = await phoneApi.getPhoneById(phone.productID);
      setFormData({
        productName: details.productName || '',
        brand: details.brand || '',
        price: details.price || '',
        stock_quantity: details.stock_quantity || '',
        description: details.description || '',
        images: details.images || []
      });
      setCurrentPhoneId(phone.productID);
      setIsEditing(true);
      setShowModal(true);
    } catch (err) {
      showToast('Không thể tải thông tin sản phẩm: ' + err.message, 'error');
    }
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add Image URL
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    
    // Add if not already present
    if (!formData.images.includes(imageUrlInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()]
      }));
    }
    setImageUrlInput('');
  };

  // Remove Image URL
  const handleRemoveImageUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName.trim()) {
      showToast('Vui lòng nhập tên điện thoại!', 'error');
      return;
    }
    if (!formData.brand.trim()) {
      showToast('Vui lòng nhập thương hiệu!', 'error');
      return;
    }
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      showToast('Vui lòng nhập giá bán hợp lệ!', 'error');
      return;
    }
    if (formData.stock_quantity === '' || isNaN(formData.stock_quantity) || Number(formData.stock_quantity) < 0) {
      showToast('Vui lòng nhập số lượng hợp lệ!', 'error');
      return;
    }

    try {
      const payload = {
        productName: formData.productName.trim(),
        brand: formData.brand.trim(),
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
        description: formData.description.trim()
      };

      if (isEditing) {
        await phoneApi.updatePhone(currentPhoneId, payload, formData.images);
        showToast('Cập nhật điện thoại thành công!');
      } else {
        await phoneApi.createPhone(payload, formData.images);
        showToast('Thêm điện thoại mới thành công!');
      }
      
      setShowModal(false);
      fetchPhones({ search, brand: brandFilter });
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    }
  };

  // Handle Delete Phone
  const handleDeletePhone = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      try {
        await phoneApi.deletePhone(id);
        showToast('Xóa điện thoại thành công!');
        fetchPhones({ search, brand: brandFilter });
      } catch (err) {
        showToast('Lỗi khi xóa: ' + err.message, 'error');
      }
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-logo">
          <div className="brand-icon">⚡</div>
          <span>NEO PHONES</span>
        </div>
        <ul className="menu-list">
          <li className="menu-item active">
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            <span>Quản Lý Sản Phẩm</span>
          </li>
          <li className="menu-item" onClick={() => showToast('Chức năng bán hàng đang phát triển', 'success')}>
            <span style={{ fontSize: '1.25rem' }}>🛒</span>
            <span>Đơn Hàng</span>
          </li>
          <li className="menu-item" onClick={() => showToast('Chức năng khách hàng đang phát triển', 'success')}>
            <span style={{ fontSize: '1.25rem' }}>👥</span>
            <span>Khách Hàng</span>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Header */}
        <header className="content-header">
          <div className="page-title">
            <h1>Hệ Thống Quản Lý Điện Thoại</h1>
            <p>Bảng điều khiển quản trị viên (Admin Dashboard)</p>
          </div>
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm Điện Thoại
          </button>
        </header>

        {/* Metrics Section */}
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrapper blue">📱</div>
            <div className="metric-details">
              <p>Tổng số mẫu</p>
              <h3>{totalProducts}</h3>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-wrapper purple">💰</div>
            <div className="metric-details">
              <p>Giá trị kho hàng</p>
              <h3>{formatCurrency(totalStockValue)}</h3>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-wrapper orange">⚠️</div>
            <div className="metric-details">
              <p>Sắp hết hàng (&lt;5)</p>
              <h3>{lowStockCount}</h3>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-wrapper teal">🏷️</div>
            <div className="metric-details">
              <p>Thương hiệu</p>
              <h3>{uniqueBrands.length}</h3>
            </div>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <section className="filter-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm điện thoại theo tên..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="select-filter"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">Tất cả hãng</option>
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
            <option value="Xiaomi">Xiaomi</option>
            <option value="Oppo">Oppo</option>
            <option value="Vivo">Vivo</option>
            <option value="Realme">Realme</option>
          </select>
        </section>

        {/* Grid/Table Listing Section */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '1rem' }}>🔄</div>
            <p>Đang tải dữ liệu điện thoại...</p>
          </div>
        ) : phones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Không Tìm Thấy Điện Thoại</h3>
            <p>Không có sản phẩm nào khớp với tìm kiếm của bạn hoặc kho hàng đang trống. Hãy thử thêm điện thoại mới!</p>
          </div>
        ) : (
          <section className="product-grid">
            {phones.map((phone) => {
              const mainImage = phone.images && phone.images.length > 0 
                ? phone.images[0] 
                : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
              
              const isLowStock = phone.stock_quantity < 5;
              const isOutOfStock = phone.stock_quantity === 0;

              return (
                <article key={phone.productID} className="product-card">
                  <div className="card-image-container">
                    <img 
                      src={mainImage} 
                      alt={phone.productName} 
                      className="card-image"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
                      }}
                    />
                    <span className="brand-badge">{phone.brand}</span>
                    
                    {isOutOfStock ? (
                      <span className="stock-badge empty">Hết Hàng</span>
                    ) : isLowStock ? (
                      <span className="stock-badge warning">Chỉ còn {phone.stock_quantity}</span>
                    ) : (
                      <span className="stock-badge safe">Còn {phone.stock_quantity} cái</span>
                    )}
                  </div>
                  
                  <div className="card-info">
                    <h3 className="product-title" title={phone.productName}>{phone.productName}</h3>
                    <p className="product-desc" title={phone.description || 'Không có mô tả'}>
                      {phone.description || 'Chưa cập nhật mô tả chi tiết cho mẫu điện thoại này.'}
                    </p>
                    
                    <div className="price-row">
                      <span className="price-label">Giá bán</span>
                      <span className="price-value">{formatCurrency(phone.price)}</span>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button className="btn-secondary" onClick={() => handleOpenEditModal(phone)}>
                      ✏️ Sửa
                    </button>
                    <button className="btn-danger" onClick={() => handleDeletePhone(phone.productID)}>
                      🗑️ Xóa
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {/* Product Edit/Add Modal Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal-btn" onClick={() => setShowModal(false)}>✕</button>
            
            <div className="modal-header">
              <h2>{isEditing ? 'Cập Nhật Thông Tin Điện Thoại' : 'Thêm Điện Thoại Mới'}</h2>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Tên Điện Thoại *</label>
                <input 
                  type="text" 
                  name="productName"
                  className="form-control"
                  placeholder="Ví dụ: iPhone 15 Pro Max"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Thương Hiệu (Hãng) *</label>
                  <input 
                    type="text" 
                    name="brand"
                    className="form-control"
                    placeholder="Ví dụ: Apple, Samsung..."
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Số Lượng Trong Kho *</label>
                  <input 
                    type="number" 
                    name="stock_quantity"
                    className="form-control"
                    placeholder="Ví dụ: 10"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Giá Bán (VND) *</label>
                <input 
                  type="number" 
                  name="price"
                  className="form-control"
                  placeholder="Ví dụ: 25000000"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô Tả Sản Phẩm</label>
                <textarea 
                  name="description"
                  className="form-control"
                  placeholder="Mô tả thông số cấu hình, màu sắc..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* Dynamic Images URLs Manager */}
              <div className="images-input-section">
                <label className="form-label">Quản Lý Đường Dẫn Ảnh (URLs)</label>
                
                <div className="image-input-row">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Dán link ảnh vào đây..." 
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                  />
                  <button type="button" className="btn-primary" style={{ padding: '0.75rem 1rem' }} onClick={handleAddImageUrl}>
                    +
                  </button>
                </div>
                
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Thêm link ảnh trực tuyến (https://...) để xem trước.
                </p>

                {formData.images.length > 0 && (
                  <div className="image-previews-container">
                    {formData.images.map((imgUrl, index) => (
                      <div key={index} className="image-preview-card" title={imgUrl}>
                        <img 
                          src={imgUrl} 
                          alt={`preview-${index}`} 
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format&fit=crop&q=60';
                          }}
                        />
                        <button type="button" className="remove-img-url-btn" onClick={() => handleRemoveImageUrl(index)}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" style={{ padding: '0.8rem 1.5rem' }} onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
                  {isEditing ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Alert System */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
