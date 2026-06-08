import { PHONE_BRANDS } from '../../constants/phones';

function PhoneFilters({ search, brandFilter, onSearchChange, onBrandFilterChange }) {
  return (
    <section className="filter-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm điện thoại theo tên..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <select
        className="select-filter"
        value={brandFilter}
        onChange={(event) => onBrandFilterChange(event.target.value)}
      >
        <option value="">Tất cả hãng</option>
        {PHONE_BRANDS.map((brand) => (
          <option value={brand} key={brand}>
            {brand}
          </option>
        ))}
      </select>
    </section>
  );
}

export default PhoneFilters;
