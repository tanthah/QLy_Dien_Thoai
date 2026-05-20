function CustomerLayout({
  currentUser,
  currentPage,
  cartCount,
  onNavigate,
  onLogout,
  children,
}) {
  return (
    <div className="customer-shell">
      <header className="customer-header">
        <button className="customer-brand" onClick={() => onNavigate('home')}>
          <span>⚡</span>
          <strong>NEO PHONES</strong>
        </button>

        <nav className="customer-nav">
          <button
            className={currentPage === 'home' ? 'active' : ''}
            onClick={() => onNavigate('home')}
          >
            Cửa hàng
          </button>
          <button
            className={currentPage === 'cart' ? 'active' : ''}
            onClick={() => onNavigate('cart')}
          >
            Giỏ hàng ({cartCount})
          </button>
          {currentUser && (
            <button
              className={currentPage === 'profile' ? 'active' : ''}
              onClick={() => onNavigate('profile')}
            >
              Tài khoản
            </button>
          )}
        </nav>

        <div className="customer-actions">
          {currentUser ? (
            <>
              <span>{currentUser.fullName || currentUser.username}</span>
              <button className="customer-link-button" onClick={onLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button className="customer-link-button" onClick={() => onNavigate('login')}>
                Đăng nhập
              </button>
              <button className="btn-primary" onClick={() => onNavigate('register')}>
                Đăng ký
              </button>
            </>
          )}
        </div>
      </header>

      <main className="customer-main">{children}</main>
    </div>
  );
}

export default CustomerLayout;
