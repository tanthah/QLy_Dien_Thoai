import { PHONE_FALLBACK_IMAGE } from '../../constants/phones';
import { formatCurrency } from '../../utils/formatCurrency';

function ProductCard({ phone, onEdit, onDelete }) {
  const mainImage =
    phone.images && phone.images.length > 0 ? phone.images[0] : PHONE_FALLBACK_IMAGE;

  const isLowStock = phone.stock_quantity < 5;
  const isOutOfStock = phone.stock_quantity === 0;

  return (
    <article className="product-card">
      <div className="card-image-container">
        <img
          src={mainImage}
          alt={phone.productName}
          className="card-image"
          onError={(event) => {
            event.currentTarget.src = PHONE_FALLBACK_IMAGE;
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
        <h3 className="product-title" title={phone.productName}>
          {phone.productName}
        </h3>
        <p className="product-desc" title={phone.description || 'Không có mô tả'}>
          {phone.description || 'Chưa cập nhật mô tả chi tiết cho mẫu điện thoại này.'}
        </p>

        <div className="price-row">
          <span className="price-label">Giá bán</span>
          <span className="price-value">{formatCurrency(phone.price)}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn-secondary" onClick={() => onEdit(phone)}>
          ✏️ Sửa
        </button>
        <button className="btn-danger" onClick={() => onDelete(phone.productID)}>
          🗑️ Xóa
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
