import DashboardHeader from '../components/dashboard/DashboardHeader';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import PhoneFilters from '../components/dashboard/PhoneFilters';
import ProductGrid from '../components/dashboard/ProductGrid';

function DashboardPage({
  phones,
  loading,
  search,
  brandFilter,
  onSearchChange,
  onBrandFilterChange,
  onAddPhone,
  onEditPhone,
  onDeletePhone,
}) {
  return (
    <>
      <DashboardHeader onAddPhone={onAddPhone} />
      <MetricsGrid phones={phones} />
      <PhoneFilters
        search={search}
        brandFilter={brandFilter}
        onSearchChange={onSearchChange}
        onBrandFilterChange={onBrandFilterChange}
      />
      <ProductGrid
        phones={phones}
        loading={loading}
        onEditPhone={onEditPhone}
        onDeletePhone={onDeletePhone}
      />
    </>
  );
}

export default DashboardPage;
