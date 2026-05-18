import React, { useState, useEffect } from 'react';
import { userApi } from '../services/userApi';
import './AdminUsersPage.css';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, role) => {
    if (role === 'ADMIN') {
      if (!window.confirm('Bạn đang chuẩn bị xóa một tài khoản ADMIN. Bạn có chắc chắn?')) return;
    } else {
      if (!window.confirm('Xóa tài khoản này?')) return;
    }

    try {
      await userApi.deleteUser(id);
      showToast('Xóa người dùng thành công!');
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="admin-users-container">
      <div className="admin-header">
        <h2>Quản Lý Người Dùng</h2>
        <p>Danh sách tất cả tài khoản trong hệ thống</p>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '2rem'}}>Đang tải danh sách...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Họ và Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.userID}>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.fullName || '-'}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                  </td>
                  <td>
                    <button 
                      className="btn-danger-small"
                      onClick={() => handleDelete(user.userID, user.role)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
