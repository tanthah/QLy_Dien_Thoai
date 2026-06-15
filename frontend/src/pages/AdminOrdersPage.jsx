import { Fragment, useCallback, useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import './AdminOrdersPage.css';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'];

const STATUS_LABELS = {
  PENDING:    'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  COMPLETED:  'Hoàn thành',
  FAILED:     'Thất bại',
  CANCELLED:  'Đã hủy',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllOrders();
      setOrders(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timerId = setTimeout(() => loadOrders(), 0);
    return () => clearTimeout(timerId);
  }, [loadOrders]);

  const handleStatusChange = async (orderID, newStatus) => {
    setUpdatingId(orderID);
    try {
      await adminApi.updateOrderStatus(orderID, newStatus);
      setOrders(prev =>
        prev.map(o => o.orderID === orderID ? { ...o, orderStatus: newStatus } : o)
      );
      showToast(`Đã đổi trạng thái → ${STATUS_LABELS[newStatus]}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  // Stats
  const stats = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.orderStatus === s).length;
    return acc;
  }, {});

  return (
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <h2>📦 Quản Lý Đơn Hàng</h2>
        <p>Tất cả đơn hàng từ mọi khách hàng — cập nhật trạng thái ngay trên bảng</p>
      </div>

      {/* Stats row */}
      <div className="orders-stats-row">
        <div className="orders-stat-card total">
          <span className="stat-label">Tổng đơn</span>
          <span className="stat-value">{orders.length}</span>
        </div>
        {ORDER_STATUSES.map(s => (
          <div key={s} className={`orders-stat-card ${s.toLowerCase()}`}>
            <span className="stat-label">{STATUS_LABELS[s]}</span>
            <span className="stat-value">{stats[s]}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="orders-loading">
          <div className="spinner" />
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <p>Chưa có đơn hàng nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Địa chỉ giao</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Đổi trạng thái</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const totalAmount = (order.items || []).reduce(
                  (sum, item) => sum + (item.totalPrice || 0), 0
                );
                const isExpanded = expandedId === order.orderID;

                return (
                  <Fragment key={order.orderID}>
                    <tr>
                      <td>
                        <span className="order-id-cell" title={order.orderID}>
                          {order.orderID.slice(0, 8)}…
                        </span>
                      </td>
                      <td>
                        <div className="customer-name">{order.fullName || order.receiver || '-'}</div>
                        <div className="customer-username">@{order.username || '-'}</div>
                      </td>
                      <td>
                        <span className="order-date">{formatDate(order.orderDate)}</span>
                      </td>
                      <td style={{ maxWidth: 200, whiteSpace: 'normal', fontSize: '0.85rem' }}>
                        {order.receiver && <strong>{order.receiver}</strong>}
                        {order.phoneNumber && <span style={{ color: 'var(--text-muted)' }}> · {order.phoneNumber}</span>}
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {order.shippingAddress || '-'}
                        </div>
                      </td>
                      <td>
                        <span className="order-amount">{formatCurrency(totalAmount)}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                          {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                        </span>
                      </td>
                      <td>
                        <select
                          id={`status-select-${order.orderID}`}
                          className="status-select"
                          value={order.orderStatus}
                          disabled={updatingId === order.orderID}
                          onChange={e => handleStatusChange(order.orderID, e.target.value)}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="expand-btn"
                          onClick={() => toggleExpand(order.orderID)}
                        >
                          {isExpanded ? '▲ Ẩn' : `▼ ${order.items?.length || 0} SP`}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="order-items-row">
                        <td colSpan={8}>
                          <div className="order-items-inner">
                            <h4>Sản phẩm trong đơn</h4>
                            <ul>
                              {(order.items || []).map(item => (
                                <li key={item.orderDetailID}>
                                  <span className="item-qty">×{item.quantity}</span>
                                  <span>{item.productName}</span>
                                  {item.brand && (
                                    <span style={{ color: 'var(--text-muted)' }}>({item.brand})</span>
                                  )}
                                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {formatCurrency(item.totalPrice)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className={`orders-toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
