import ProductCard from './ProductCard';

function ProductGrid({ phones, loading, onEditPhone, onDeletePhone }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <div
          style={{
            fontSize: '2rem',
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
            marginBottom: '1rem',
          }}
        >
          🔄
        </div>
        <p>Đang tải dữ liệu điện thoại...</p>
      </div>
    );
  }

  if (phones.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <h3>Không Tìm Thấy Điện Thoại</h3>
        <p>
          Không có sản phẩm nào khớp với tìm kiếm của bạn hoặc kho hàng đang trống. Hãy thử thêm
          điện thoại mới!
        </p>
      </div>
    );
  }

  return (
    <section className="product-grid">
      {phones.map((phone) => (
        <ProductCard
          key={phone.productID}
          phone={phone}
          onEdit={onEditPhone}
          onDelete={onDeletePhone}
        />
      ))}
    </section>
  );
}

export default ProductGrid;
