import { useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { ProcurementProvider, useProcurement } from './context/ProcurementContext';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import GoodsReceiptsPage from './pages/GoodsReceiptsPage';
import InvoicesPage from './pages/InvoicesPage';
import ProductsPage from './pages/ProductsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PurchaseRequestsPage from './pages/PurchaseRequestsPage';

const PAGE_META = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Summary of procurement activities',
  },
  products: {
    title: 'Product Management',
    subtitle: 'Add, search, export, and reuse products in purchase requests.',
  },
  employees: {
    title: 'Employee Management',
    subtitle: 'Store employees who can request or approve procurement records.',
  },
  'purchase-requests': {
    title: 'Purchase Requests',
    subtitle: 'Create requests and approve them before purchase order generation.',
  },
  'purchase-orders': {
    title: 'Purchase Orders',
    subtitle: 'Create purchase orders only from approved purchase requests.',
  },
  'goods-receipts': {
    title: 'Goods Receipts',
    subtitle: 'Create receipts from purchase orders and mark goods as received.',
  },
  invoices: {
    title: 'Invoices',
    subtitle: 'Create invoices only when PO, PR, and received GR all exist.',
  },
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { purchaseRequests } = useProcurement();

  const pageMeta = PAGE_META[currentPage];
  const pendingCount = useMemo(
    () => purchaseRequests.filter((purchaseRequest) => purchaseRequest.status === 'Pending').length,
    [purchaseRequests],
  );

  function renderPage() {
    switch (currentPage) {
      case 'products':
        return <ProductsPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'purchase-requests':
        return <PurchaseRequestsPage />;
      case 'purchase-orders':
        return <PurchaseOrdersPage />;
      case 'goods-receipts':
        return <GoodsReceiptsPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      title={pageMeta.title}
      subtitle={pageMeta.subtitle}
      pendingCount={pendingCount}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <ProcurementProvider>
      <AppContent />
    </ProcurementProvider>
  );
}
