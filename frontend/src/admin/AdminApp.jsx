import { useState } from 'react';
import ProductFormModal from '../components/ProductFormModal';
import AppLayout from '../components/layout/AppLayout';
import Toast from '../components/Toast';
import { useAdminSession } from '../hooks/useAdminSession';
import { usePhoneDashboard } from '../hooks/usePhoneDashboard';
import { useToast } from '../hooks/useToast';
import AdminUsersPage from '../pages/AdminUsersPage';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';

function AdminApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { toast, showToast } = useToast();
  const { adminUser, login, logout } = useAdminSession(showToast);
  const phoneDashboard = usePhoneDashboard({
    enabled: Boolean(adminUser) && currentPage === 'dashboard',
    showToast,
  });

  if (!adminUser) {
    return (
      <>
        <LoginPage
          onLogin={login}
          onLoginSuccess={() => setCurrentPage('dashboard')}
          title="Đăng Nhập Admin"
          subtitle="Đăng nhập bằng tài khoản quản trị để tiếp tục"
          showRegisterLink={false}
        />
        <Toast toast={toast} />
      </>
    );
  }

  return (
    <AppLayout
      currentUser={adminUser}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={logout}
      onNotify={showToast}
      showOrders={false}
      showProfile={false}
      logoutLabel="🚪 Đăng Xuất"
      overlays={
        <>
          <ProductFormModal {...phoneDashboard.productModalProps} />
          <Toast toast={toast} />
        </>
      }
    >
      {currentPage === 'admin' ? (
        <AdminUsersPage />
      ) : (
        <DashboardPage {...phoneDashboard.dashboardProps} />
      )}
    </AppLayout>
  );
}

export default AdminApp;
