function DashboardHeader({ onAddPhone }) {
  return (
    <header className="content-header">
      <div className="page-title">
        <h1>Hệ Thống Quản Lý Điện Thoại</h1>
        <p>Bảng điều khiển quản trị viên (Admin Dashboard)</p>
      </div>
      <button className="btn-primary" onClick={onAddPhone}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Thêm Điện Thoại
      </button>
    </header>
  );
}

export default DashboardHeader;
