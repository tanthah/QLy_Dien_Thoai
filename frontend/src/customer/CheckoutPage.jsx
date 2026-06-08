import { useState, useEffect } from 'react';
import { userApi } from '../services/userApi';
import { orderApi } from '../services/orderApi';
import { formatCurrency } from '../utils/formatCurrency';

function CheckoutPage({ items, totalPrice, onOrderSuccess, onCancel }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [addressDetails, setAddressDetails] = useState({
    houseNumber: '',
    street: '',
    ward: '',
    city: ''
  });
  const [formData, setFormData] = useState({
    receiver: '',
    phoneNumber: '',
    shippingAddress: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, addrList] = await Promise.all([
          userApi.getProfile(),
          userApi.getAddresses()
        ]);

        setAddresses(addrList);
        
        // Pre-fill with profile data
        setFormData(prev => ({
          ...prev,
          receiver: profile.fullName || '',
          phoneNumber: profile.phoneNumber || ''
        }));

        if (addrList.length > 0) {
          setSelectedAddressId(addrList[0].addressID);
          const firstAddr = addrList[0];
          const fullAddress = [firstAddr.houseNumber, firstAddr.street, firstAddr.ward, firstAddr.city].filter(Boolean).join(', ');
          setFormData(prev => ({ ...prev, shippingAddress: fullAddress }));
        }
      } catch (err) {
        console.error('Lỗi lấy dữ liệu:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateShippingAddress = (details) => {
    const fullAddress = [details.houseNumber, details.street, details.ward, details.city]
      .map(s => s.trim())
      .filter(Boolean)
      .join(', ');
    setFormData(prev => ({ ...prev, shippingAddress: fullAddress }));
  };

  const handleAddressSelect = (addr) => {
    if (addr === 'new') {
      setSelectedAddressId('new');
      updateShippingAddress(addressDetails);
    } else {
      setSelectedAddressId(addr.addressID);
      const fullAddress = [addr.houseNumber, addr.street, addr.ward, addr.city].filter(Boolean).join(', ');
      setFormData(prev => ({ ...prev, shippingAddress: fullAddress }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        receiver: formData.receiver,
        phoneNumber: formData.phoneNumber,
        shippingAddress: formData.shippingAddress,
        addressDetails: selectedAddressId === 'new' ? addressDetails : null,
        items: items.map(item => ({
          productID: item.productID,
          quantity: item.quantity
        }))
      };

      await orderApi.placeOrder(orderData);
      onOrderSuccess();
    } catch (err) {
      alert(err.message || 'Lỗi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="customer-state"><h2>Đang chuẩn bị...</h2></div>;

  return (
    <section className="checkout-container">
      <div className="checkout-header-main">
        <h1>Thanh toán</h1>
        <p>Vui lòng kiểm tra lại thông tin nhận hàng của bạn</p>
      </div>

      <div className="checkout-grid">
        <div className="checkout-info">
          <form id="checkout-form" onSubmit={handleSubmit} className="checkout-card">
            <div className="checkout-section">
              <h3><span className="section-number">1</span> Thông tin người nhận</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={formData.receiver}
                    onChange={e => setFormData({ ...formData, receiver: e.target.value })}
                    placeholder="Tên người nhận hàng"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Số điện thoại liên lạc"
                  />
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <h3><span className="section-number">2</span> Địa chỉ nhận hàng</h3>
              
              <div className="address-selector">
                {addresses.map(addr => (
                  <div 
                    key={addr.addressID} 
                    className={`address-card ${selectedAddressId === addr.addressID ? 'active' : ''}`}
                    onClick={() => handleAddressSelect(addr)}
                  >
                    <div className="radio-circle"></div>
                    <div className="address-details">
                      <p>{[addr.houseNumber, addr.street].filter(Boolean).join(' ')}</p>
                      <span>{[addr.ward, addr.city].filter(Boolean).join(', ')}</span>
                    </div>
                  </div>
                ))}
                
                <div 
                  className={`address-card ${selectedAddressId === 'new' ? 'active' : ''}`}
                  onClick={() => handleAddressSelect('new')}
                >
                  <div className="radio-circle"></div>
                  <div className="address-details">
                    <p>Nhập địa chỉ mới</p>
                    <span>Sử dụng địa chỉ giao hàng khác</span>
                  </div>
                </div>
              </div>

              {selectedAddressId === 'new' && (
                <div className="address-new-grid animate-fade-in">
                  <div className="form-group">
                    <label>Số nhà</label>
                    <input
                      type="text"
                      required
                      value={addressDetails.houseNumber}
                      onChange={e => {
                        const updated = { ...addressDetails, houseNumber: e.target.value };
                        setAddressDetails(updated);
                        updateShippingAddress(updated);
                      }}
                      placeholder="Ví dụ: 123/4"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên đường</label>
                    <input
                      type="text"
                      required
                      value={addressDetails.street}
                      onChange={e => {
                        const updated = { ...addressDetails, street: e.target.value };
                        setAddressDetails(updated);
                        updateShippingAddress(updated);
                      }}
                      placeholder="Ví dụ: Nguyễn Trãi"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phường / Xã</label>
                    <input
                      type="text"
                      required
                      value={addressDetails.ward}
                      onChange={e => {
                        const updated = { ...addressDetails, ward: e.target.value };
                        setAddressDetails(updated);
                        updateShippingAddress(updated);
                      }}
                      placeholder="Ví dụ: Phường 2"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tỉnh / Thành phố / Quận / Huyện</label>
                    <input
                      type="text"
                      required
                      value={addressDetails.city}
                      onChange={e => {
                        const updated = { ...addressDetails, city: e.target.value };
                        setAddressDetails(updated);
                        updateShippingAddress(updated);
                      }}
                      placeholder="Ví dụ: Quận 5, TP. Hồ Chí Minh"
                      className="form-control"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="checkout-section">
              <h3><span className="section-number">3</span> Phương thức thanh toán</h3>
              <div className="payment-method-static">
                <div className="payment-icon">💵</div>
                <div>
                  <p>Thanh toán khi nhận hàng (COD)</p>
                  <span>Chỉ hỗ trợ thanh toán tiền mặt khi nhận hàng</span>
                </div>
                <div className="check-mark">✓</div>
              </div>
            </div>
          </form>
        </div>

        <aside className="checkout-sidebar">
          <div className="order-summary-card">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-items">
              {items.map(item => (
                <div key={item.productID} className="summary-item">
                  <div className="item-info">
                    <span className="item-name">{item.productName}</span>
                    <span className="item-qty">x{item.quantity}</span>
                  </div>
                  <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="summary-totals">
              <div className="total-row">
                <span>Tạm tính</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="total-row">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="total-row grand-total">
                <span>Tổng cộng</span>
                <strong>{formatCurrency(totalPrice)}</strong>
              </div>
            </div>

            <div className="checkout-buttons">
              <button 
                type="submit" 
                form="checkout-form"
                className="btn-primary btn-large" 
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'ĐẶT HÀNG NGAY'}
              </button>
              <button 
                type="button" 
                className="btn-link" 
                onClick={onCancel}
              >
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
