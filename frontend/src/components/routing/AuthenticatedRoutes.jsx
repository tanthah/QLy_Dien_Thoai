import AdminUsersPage from '../../pages/AdminUsersPage';
import DashboardPage from '../../pages/DashboardPage';
import ProfilePage from '../../pages/ProfilePage';

function AuthenticatedRoutes({ currentPage, currentUser, dashboardProps }) {
  if (currentPage === 'profile') {
    return <ProfilePage />;
  }

  if (currentPage === 'admin' && currentUser.role === 'ADMIN') {
    return <AdminUsersPage />;
  }

  return <DashboardPage {...dashboardProps} />;
}

export default AuthenticatedRoutes;
