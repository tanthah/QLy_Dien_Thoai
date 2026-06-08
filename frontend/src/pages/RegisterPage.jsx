import { useState } from 'react';
import { userApi } from '../services/userApi';
import './LoginPage.css';

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]{9,15}$/;

const normalizePhoneNumber = (phoneNumber) => phoneNumber.trim().replace(/[\s.-]/g, '');

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
    const safeData = {
      username: formData.username.trim(),
      password: formData.password.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: normalizePhoneNumber(formData.phoneNumber)
    };
    
    if (!safeData.username || !safeData.password || !safeData.fullName || !safeData.email || !safeData.phoneNumber) {
      setError('Vui lòng nhập đầy đủ tất cả thông tin');
      return;
    }
    if (safeData.username.length < 3 || safeData.username.length > 50 || !USERNAME_PATTERN.test(safeData.username)) {
      setError('Tên đăng nhập phải có 3-50 ký tự và chỉ gồm chữ, số, dấu gạch dưới');
      return;
    }
    if (safeData.password.length < 6 || safeData.password.length > 128) {
      setError('Mật khẩu phải có từ 6 đến 128 ký tự');
      return;
    }
    if (safeData.fullName.length > 100) {
      setError('Họ và tên không được vượt quá 100 ký tự');
      return;
    }
    if (safeData.email.length > 100 || !EMAIL_PATTERN.test(safeData.email)) {
      setError('Email không hợp lệ');
      return;
    }
    if (!PHONE_PATTERN.test(safeData.phoneNumber)) {
      setError('Số điện thoại phải gồm 9 đến 15 chữ số');
      return;
    }

    try {
      setLoading(true);
      await userApi.register(safeData);
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
              required
              minLength={3}
              maxLength={50}
              pattern="[A-Za-z0-9_]+"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu *</label>
            <input 
              type="password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="Ít nhất 6 ký tự" className="form-control"
              required
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>Họ và Tên *</label>
            <input 
              type="text" name="fullName"
              value={formData.fullName} onChange={handleChange}
              className="form-control"
              required
              maxLength={100}
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" name="email"
              value={formData.email} onChange={handleChange}
              className="form-control"
              required
              maxLength={100}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại *</label>
            <input 
              type="text" name="phoneNumber"
              value={formData.phoneNumber} onChange={handleChange}
              className="form-control"
              required
              inputMode="numeric"
              pattern="[0-9]{9,15}"
              maxLength={15}
              autoComplete="tel"
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
