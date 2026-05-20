const userPanelStyle = {
  padding: '1rem',
  borderBottom: '1px solid var(--border-color)',
  marginBottom: '1rem',
  color: 'var(--text-muted)',
};

const usernameStyle = {
  fontWeight: 'bold',
  color: 'var(--text-color)',
};

const roleBadgeStyle = {
  fontSize: '0.7rem',
  padding: '2px 6px',
  display: 'inline-block',
  marginTop: '4px',
};

const sidebarIconStyle = {
  fontSize: '1.25rem',
};

function AppLayout({
  currentUser,
  currentPage,
  onNavigate,
  onLogout,
  onNotify,
  showOrders = true,
  showProfile = true,
  logoutLabel = '🚪 Đăng Xuất',
  children,
  overlays,
}) {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand-logo">
          <div className="brand-icon">⚡</div>
          <span>NEO PHONES</span>
        </div>

        <div style={userPanelStyle}>
          <small>Xin chào,</small>
          <div style={usernameStyle}>{currentUser.fullName || currentUser.username}</div>
          <span className={`role-badge ${currentUser.role.toLowerCase()}`} style={roleBadgeStyle}>
            {currentUser.role}
          </span>
        </div>

        <ul className="menu-list">
          <li
            className={`menu-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <span style={sidebarIconStyle}>📊</span>
            <span>Quản Lý Sản Phẩm</span>
          </li>
          {showOrders && (
            <li
              className="menu-item"
              onClick={() => onNotify('Chức năng bán hàng đang phát triển', 'success')}
            >
              <span style={sidebarIconStyle}>🛒</span>
              <span>Đơn Hàng</span>
            </li>
          )}
          {showProfile && (
            <li
              className={`menu-item ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => onNavigate('profile')}
            >
              <span style={sidebarIconStyle}>👤</span>
              <span>Tài Khoản Của Tôi</span>
            </li>
          )}
          {currentUser.role === 'ADMIN' && (
            <li
              className={`menu-item ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => onNavigate('admin')}
            >
              <span style={sidebarIconStyle}>👥</span>
              <span>Quản Lý Người Dùng</span>
            </li>
          )}
        </ul>

        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={onLogout}>
            {logoutLabel}
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
      {overlays}
    </div>
  );
}

export default AppLayout;
