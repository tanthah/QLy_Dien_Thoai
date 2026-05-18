import React, { useState, useEffect } from 'react';
import { userApi } from '../services/userApi';
import './ProfilePage.css';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState({});
  const [addresses, setAddresses] = useState([]);
  
  const [infoForm, setInfoForm] = useState({ fullName: '', email: '', phoneNumber: '' });
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '' });
  const [addrForm, setAddrForm] = useState({ id: null, city: '', ward: '', street: '', houseNumber: '' });
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProfile = async () => {
    try {
      const data = await userApi.getProfile();
      setProfile(data);
      setInfoForm({
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || ''
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await userApi.getAddresses();
      setAddresses(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      await userApi.updateProfile(infoForm);
      showToast('Cập nhật thông tin thành công!');
      loadProfile();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    try {
      await userApi.changePassword(pwdForm.oldPassword, pwdForm.newPassword);
      showToast('Đổi mật khẩu thành công!');
      setPwdForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (addrForm.id) {
        await userApi.updateAddress(addrForm.id, addrForm);
        showToast('Cập nhật địa chỉ thành công!');
      } else {
        await userApi.addAddress(addrForm);
        showToast('Thêm địa chỉ thành công!');
      }
      setAddrForm({ id: null, city: '', ward: '', street: '', houseNumber: '' });
      loadAddresses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if(!window.confirm('Xóa địa chỉ này?')) return;
    try {
      await userApi.deleteAddress(id);
      showToast('Xóa địa chỉ thành công!');
      loadAddresses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Tài Khoản Của Tôi</h2>
        <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      <div className="profile-layout">
        <div className="profile-sidebar">
          <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Hồ Sơ</button>
          <button className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>Đổi Mật Khẩu</button>
          <button className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`} onClick={() => setActiveTab('address')}>Sổ Địa Chỉ</button>
        </div>

        <div className="profile-content">
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateInfo} className="profile-form">
              <h3>Thông Tin Cơ Bản</h3>
              <div className="form-group">
                <label>Tên đăng nhập (Không thể đổi)</label>
                <input type="text" className="form-control" value={profile.username || ''} disabled />
              </div>
              <div className="form-group">
                <label>Họ và tên</label>
                <input type="text" className="form-control" value={infoForm.fullName} onChange={e => setInfoForm({...infoForm, fullName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={infoForm.email} onChange={e => setInfoForm({...infoForm, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="text" className="form-control" value={infoForm.phoneNumber} onChange={e => setInfoForm({...infoForm, phoneNumber: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary">Lưu Thay Đổi</button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePwd} className="profile-form">
              <h3>Đổi Mật Khẩu</h3>
              <div className="form-group">
                <label>Mật khẩu cũ</label>
                <input type="password" required className="form-control" value={pwdForm.oldPassword} onChange={e => setPwdForm({...pwdForm, oldPassword: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input type="password" required className="form-control" value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary">Xác Nhận Đổi</button>
            </form>
          )}

          {activeTab === 'address' && (
            <div className="address-section">
              <h3>Danh Sách Địa Chỉ</h3>
              <div className="address-list">
                {addresses.length === 0 && <p className="text-muted">Bạn chưa thêm địa chỉ nào.</p>}
                {addresses.map(addr => (
                  <div key={addr.addressID} className="address-card">
                    <p><strong>{addr.houseNumber} {addr.street}</strong></p>
                    <p>{addr.ward}, {addr.city}</p>
                    <div className="address-actions">
                      <button onClick={() => setAddrForm({id: addr.addressID, city: addr.city, ward: addr.ward, street: addr.street, houseNumber: addr.houseNumber})} className="btn-secondary">Sửa</button>
                      <button onClick={() => handleDeleteAddress(addr.addressID)} className="btn-danger">Xóa</button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSaveAddress} className="profile-form mt-4" style={{marginTop: '2rem'}}>
                <h3>{addrForm.id ? 'Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tỉnh/Thành phố</label>
                    <input type="text" className="form-control" value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Quận/Huyện/Phường/Xã</label>
                    <input type="text" className="form-control" value={addrForm.ward} onChange={e => setAddrForm({...addrForm, ward: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Đường</label>
                    <input type="text" className="form-control" value={addrForm.street} onChange={e => setAddrForm({...addrForm, street: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Số nhà</label>
                    <input type="text" className="form-control" value={addrForm.houseNumber} onChange={e => setAddrForm({...addrForm, houseNumber: e.target.value})} />
                  </div>
                </div>
                <div>
                  <button type="submit" className="btn-primary">{addrForm.id ? 'Lưu Sửa' : 'Thêm Địa Chỉ'}</button>
                  {addrForm.id && <button type="button" className="btn-secondary" style={{marginLeft: '10px'}} onClick={() => setAddrForm({id: null, city: '', ward: '', street: '', houseNumber: ''})}>Hủy Sửa</button>}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
