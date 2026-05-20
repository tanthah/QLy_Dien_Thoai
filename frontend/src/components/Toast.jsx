function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${toast.type}`}>
        <span>{toast.type === 'success' ? '✅' : '❌'}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

export default Toast;
