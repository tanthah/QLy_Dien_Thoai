import { formatCurrency } from '../../utils/formatCurrency';

function MetricsGrid({ phones }) {
  const totalProducts = phones.length;
  const totalStockValue = phones.reduce(
    (acc, curr) => acc + curr.price * curr.stock_quantity,
    0,
  );
  const lowStockCount = phones.filter((phone) => phone.stock_quantity < 5).length;
  const uniqueBrands = [...new Set(phones.map((phone) => phone.brand).filter(Boolean))];

  const metrics = [
    { icon: '📱', tone: 'blue', label: 'Tổng số mẫu', value: totalProducts },
    { icon: '💰', tone: 'purple', label: 'Giá trị kho hàng', value: formatCurrency(totalStockValue) },
    { icon: '⚠️', tone: 'orange', label: 'Sắp hết hàng (<5)', value: lowStockCount },
    { icon: '🏷️', tone: 'teal', label: 'Thương hiệu', value: uniqueBrands.length },
  ];

  return (
    <section className="metrics-grid">
      {metrics.map((metric) => (
        <div className="metric-card" key={metric.label}>
          <div className={`metric-icon-wrapper ${metric.tone}`}>{metric.icon}</div>
          <div className="metric-details">
            <p>{metric.label}</p>
            <h3>{metric.value}</h3>
          </div>
        </div>
      ))}
    </section>
  );
}

export default MetricsGrid;
