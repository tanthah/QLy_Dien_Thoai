import { useEffect } from 'react';
import AdminApp from './admin/AdminApp';
import CustomerApp from './customer/CustomerApp';

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  useEffect(() => {
    document.title = isAdminRoute ? 'PhoneShop Admin' : 'PhoneShop';
  }, [isAdminRoute]);

  return isAdminRoute ? <AdminApp /> : <CustomerApp />;
}

export default App;
