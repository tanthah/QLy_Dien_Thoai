import { useState, useEffect } from 'react';
import { orderApi } from '../services/orderApi';
import { formatCurrency } from '../utils/formatCurrency';

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Lỗi lấy lịch sử đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Chờ xử lý',
      'PROCESSING': 'Đang giao',
      'COMPLETED': 'Đã hoàn thành',
      'FAILED': 'Thất bại',
      'CANCELLED': 'Đã hủy'
    };
    return labels[status] || status;
  };

  if (loading) return <div className="customer-state"><h2>Đang tải...</h2></div>;

  if (orders.length === 0) {
    return (
      <div className="customer-state">
        <h2>Bạn chưa có đơn hàng nào</h2>
        <p>Hãy chọn sản phẩm và đặt hàng ngay!</p>
      </div>
    );
  }

  return (
    <section className="orders-container">
      <h2>Đơn hàng của tôi</h2>
      <div className="orders-list">
        {orders.map(order => (
          <article key={order.orderID} className="order-card">
            <header className="order-header">
              <div>
                <strong>Mã đơn: {order.orderID.slice(0, 8)}...</strong>
                <p>Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <span className={`status-badge status-${order.orderStatus.toLowerCase()}`}>
                {getStatusLabel(order.orderStatus)}
              </span>
            </header>
            
            <div className="order-items">
              {order.items.map(item => (
                <div key={item.orderDetailID} className="order-item-row">
                  <span>{item.productName} ({item.brand})</span>
                  <span>x{item.quantity}</span>
                  <span>{formatCurrency(item.unitPrice)}</span>
                </div>
              ))}
            </div>

            <footer className="order-footer">
              <div className="order-address">
                <p><strong>Người nhận:</strong> {order.receiver} - {order.phoneNumber}</p>
                <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
              </div>
              <div className="order-total">
                <span>Tổng tiền:</span>
                <strong>{formatCurrency(order.items.reduce((sum, item) => sum + item.totalPrice, 0))}</strong>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MyOrdersPage;
