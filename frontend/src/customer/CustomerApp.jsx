import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { usePhones } from '../hooks/usePhones';
import { useToast } from '../hooks/useToast';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import RegisterPage from '../pages/RegisterPage';
import CartPage from './CartPage';
import CustomerHomePage from './CustomerHomePage';
import CustomerLayout from './CustomerLayout';
import './CustomerApp.css';

function CustomerApp() {
  const auth = useAuth();
  const { toast, showToast } = useToast();
  const phones = usePhones({ enabled: true, showToast });
  const cart = useCart();

  const requireLogin = () => {
    if (auth.currentUser) return true;

    showToast('Vui lòng đăng nhập để tiếp tục', 'error');
    auth.navigateTo('login');
    return false;
  };

  const handleAddToCart = (phone) => {
    cart.addToCart(phone);
    showToast('Đã thêm sản phẩm vào giỏ hàng');
  };

  const handleCheckout = () => {
    if (!requireLogin()) return;

    showToast('Chức năng đặt hàng đang được phát triển');
  };

  const renderPage = () => {
    if (auth.currentPage === 'login') {
      return (
        <LoginPage
          onLoginSuccess={auth.handleLoginSuccess}
          onNavigateToRegister={() => auth.navigateTo('register')}
        />
      );
    }

    if (auth.currentPage === 'register') {
      return <RegisterPage onNavigateToLogin={() => auth.navigateTo('login')} />;
    }

    if (auth.currentPage === 'profile') {
      return auth.currentUser ? (
        <ProfilePage />
      ) : (
        <LoginPage
          onLoginSuccess={auth.handleLoginSuccess}
          onNavigateToRegister={() => auth.navigateTo('register')}
        />
      );
    }

    if (auth.currentPage === 'cart') {
      return (
        <CartPage
          items={cart.items}
          totalPrice={cart.totalPrice}
          onUpdateQuantity={cart.updateQuantity}
          onRemove={cart.removeFromCart}
          onCheckout={handleCheckout}
          onContinueShopping={() => auth.navigateTo('home')}
        />
      );
    }

    return (
      <CustomerHomePage
        phones={phones.phones}
        loading={phones.loading}
        search={phones.search}
        brandFilter={phones.brandFilter}
        onSearchChange={phones.setSearch}
        onBrandFilterChange={phones.setBrandFilter}
        onAddToCart={handleAddToCart}
      />
    );
  };

  return (
    <CustomerLayout
      currentUser={auth.currentUser}
      currentPage={auth.currentPage}
      cartCount={cart.totalItems}
      onNavigate={auth.navigateTo}
      onLogout={auth.handleLogout}
    >
      {renderPage()}
      <Toast toast={toast} />
    </CustomerLayout>
  );
}

export default CustomerApp;
