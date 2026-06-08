import { useState } from 'react';
import { userApi } from '../services/userApi';
import './LoginPage.css';

function LoginPage({
  onLoginSuccess,
  onNavigateToRegister,
  onLogin = userApi.login,
  title = 'Đăng Nhập',
  subtitle = 'Chào mừng trở lại NEO PHONES',
  showRegisterLink = true
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const safeUsername = username.trim();
    const safePassword = password.trim();
    
    if (!safeUsername || !safePassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const data = await onLogin(safeUsername, safePassword);
      onLoginSuccess(data.user);
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
          <div className="auth-icon">⚡</div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              className="form-control"
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="form-control"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
        
        {showRegisterLink && onNavigateToRegister && (
          <div className="auth-footer">
            <p>Chưa có tài khoản? <span onClick={onNavigateToRegister} className="auth-link">Đăng ký ngay</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
