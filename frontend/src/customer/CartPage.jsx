import { PHONE_FALLBACK_IMAGE } from '../constants/phones';
import { formatCurrency } from '../utils/formatCurrency';

function CartPage({
  items,
  totalPrice,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  onContinueShopping,
}) {
  if (items.length === 0) {
    return (
      <div className="customer-state">
        <h2>Giỏ hàng đang trống</h2>
        <p>Hãy chọn vài mẫu điện thoại trước khi thanh toán.</p>
        <button className="btn-primary" onClick={onContinueShopping}>
          Tiếp tục mua hàng
        </button>
      </div>
    );
  }

  return (
    <section className="cart-layout">
      <div className="cart-items">
        <h2>Giỏ hàng</h2>
        {items.map((item) => (
          <article className="cart-item" key={item.productID}>
            <img
              src={item.image || PHONE_FALLBACK_IMAGE}
              alt={item.productName}
              onError={(event) => {
                event.currentTarget.src = PHONE_FALLBACK_IMAGE;
              }}
            />
            <div>
              <h3>{item.productName}</h3>
              <p>{item.brand}</p>
              <strong>{formatCurrency(item.price)}</strong>
            </div>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(event) => onUpdateQuantity(item.productID, event.target.value)}
            />
            <button className="btn-danger" onClick={() => onRemove(item.productID)}>
              Xóa
            </button>
          </article>
        ))}
      </div>

      <aside className="cart-summary">
        <h2>Tóm tắt</h2>
        <div>
          <span>Tổng tiền</span>
          <strong>{formatCurrency(totalPrice)}</strong>
        </div>
        <button className="btn-primary" onClick={onCheckout}>
          Thanh toán
        </button>
      </aside>
    </section>
  );
}

export default CartPage;
