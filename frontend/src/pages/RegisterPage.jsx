import React, { useState } from 'react';
import { userApi } from '../services/userApi';
import './LoginPage.css';

function RegisterPage({ onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!formData.username.trim() || !formData.password) {
      setError('Tên đăng nhập và mật khẩu là bắt buộc');
      return;
    }

    try {
      setLoading(true);
      await userApi.register(formData);
      setSuccessMsg('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => {
        onNavigateToLogin();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">✨</div>
          <h2>Tạo Tài Khoản</h2>
          <p>Tham gia với chúng tôi ngay hôm nay</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        {successMsg && <div className="auth-error" style={{backgroundColor: '#dcfce3', color: '#16a34a'}}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Tên đăng nhập *</label>
            <input 
              type="text" name="username"
              value={formData.username} onChange={handleChange}
              placeholder="Ít nhất 3 ký tự" className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu *</label>
            <input 
              type="password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="Ít nhất 6 ký tự" className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Họ và Tên</label>
            <input 
              type="text" name="fullName"
              value={formData.fullName} onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" name="email"
              value={formData.email} onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input 
              type="text" name="phoneNumber"
              value={formData.phoneNumber} onChange={handleChange}
              className="form-control"
            />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Đã có tài khoản? <span onClick={onNavigateToLogin} className="auth-link">Đăng nhập</span></p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
