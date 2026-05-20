import { PHONE_BRANDS, PHONE_FALLBACK_IMAGE } from '../constants/phones';
import { formatCurrency } from '../utils/formatCurrency';

function CustomerHomePage({
  phones,
  loading,
  search,
  brandFilter,
  onSearchChange,
  onBrandFilterChange,
  onAddToCart,
}) {
  return (
    <>
      <section className="customer-hero">
        <div>
          <p>Điện thoại chính hãng</p>
          <h1>Chọn mẫu máy phù hợp và đặt mua nhanh</h1>
        </div>
      </section>

      <section className="customer-filter">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm điện thoại theo tên..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <select
          className="select-filter"
          value={brandFilter}
          onChange={(event) => onBrandFilterChange(event.target.value)}
        >
          <option value="">Tất cả hãng</option>
          {PHONE_BRANDS.map((brand) => (
            <option value={brand} key={brand}>
              {brand}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="customer-state">Đang tải sản phẩm...</div>
      ) : phones.length === 0 ? (
        <div className="customer-state">Không tìm thấy sản phẩm phù hợp.</div>
      ) : (
        <section className="customer-product-grid">
          {phones.map((phone) => {
            const image = phone.images?.[0] || PHONE_FALLBACK_IMAGE;
            const isOutOfStock = phone.stock_quantity === 0;

            return (
              <article className="customer-product-card" key={phone.productID}>
                <img
                  src={image}
                  alt={phone.productName}
                  onError={(event) => {
                    event.currentTarget.src = PHONE_FALLBACK_IMAGE;
                  }}
                />
                <div>
                  <span className="brand-badge">{phone.brand}</span>
                  <h3>{phone.productName}</h3>
                  <p>{phone.description || 'Sản phẩm đang được cập nhật mô tả.'}</p>
                </div>
                <div className="customer-product-footer">
                  <strong>{formatCurrency(phone.price)}</strong>
                  <button
                    className="btn-primary"
                    disabled={isOutOfStock}
                    onClick={() => onAddToCart(phone)}
                  >
                    {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}

export default CustomerHomePage;
