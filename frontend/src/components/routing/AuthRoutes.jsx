import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';

function AuthRoutes({ currentPage, onLoginSuccess, onNavigate }) {
  if (currentPage === 'register') {
    return <RegisterPage onNavigateToLogin={() => onNavigate('login')} />;
  }

  return (
    <LoginPage
      onLoginSuccess={onLoginSuccess}
      onNavigateToRegister={() => onNavigate('register')}
    />
  );
}

export default AuthRoutes;
