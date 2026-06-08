import { PHONE_FALLBACK_THUMBNAIL } from '../constants/phones';

function ProductFormModal({
  isOpen,
  isEditing,
  formData,
  imageUrlInput,
  onClose,
  onSubmit,
  onInputChange,
  onImageUrlInputChange,
  onImageUrlInputKeyDown,
  onAddImageUrl,
  onRemoveImageUrl,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-modal-btn" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <h2>
            {isEditing
              ? 'Cập Nhật Thông Tin Điện Thoại'
              : 'Thêm Điện Thoại Mới'}
          </h2>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Tên Điện Thoại *</label>
            <input
              type="text"
              name="productName"
              className="form-control"
              placeholder="Ví dụ: iPhone 15 Pro Max"
              value={formData.productName}
              onChange={onInputChange}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
            />
          </div>

          <div className="images-input-section">
            <label className="form-label">Quản Lý Đường Dẫn Ảnh (URLs)</label>

            <div className="image-input-row">
              <input
                type="text"
                className="form-control"
                placeholder="Dán link ảnh vào đây..."
                value={imageUrlInput}
                onChange={(event) => onImageUrlInputChange(event.target.value)}
                onKeyDown={onImageUrlInputKeyDown}
              />
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '0.75rem 1rem' }}
                onClick={onAddImageUrl}
              >
                +
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Thêm link ảnh trực tuyến (https://...) để xem trước.
            </p>

            {formData.images.length > 0 && (
              <div className="image-previews-container">
                {formData.images.map((imgUrl, index) => (
                  <div key={imgUrl} className="image-preview-card" title={imgUrl}>
                    {index === 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: '#fff',
                          borderRadius: 4,
                          fontSize: '0.65rem',
                          padding: '2px 5px',
                        }}
                      >
                        Chính
                      </span>
                    )}
                    <img
                      src={imgUrl}
                      alt={`preview-${index}`}
                      onError={(event) => {
                        event.currentTarget.src = PHONE_FALLBACK_THUMBNAIL;
                      }}
                    />
                    <button
                      type="button"
                      className="remove-img-url-btn"
                      onClick={() => onRemoveImageUrl(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '0.8rem 1.5rem' }}
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
              {isEditing ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;
