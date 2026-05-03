import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  ReceiptText,
  ShoppingCart,
  Users2,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'KPIs, workflow health, and recent activity',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Master Data',
    items: [
      {
        id: 'products',
        label: 'Products',
        description: 'Maintain purchasable item catalog',
        icon: Boxes,
      },
      {
        id: 'employees',
        label: 'Employees',
        description: 'Manage requesters and process owners',
        icon: Users2,
      },
    ],
  },
  {
    title: 'Procurement Flow',
    items: [
      {
        id: 'purchase-requests',
        label: 'Purchase Requests',
        description: 'Create and approve sourcing needs',
        icon: ClipboardList,
      },
      {
        id: 'purchase-orders',
        label: 'Purchase Orders',
        description: 'Issue orders from approved requests',
        icon: ShoppingCart,
      },
      {
        id: 'goods-receipts',
        label: 'Goods Receipts',
        description: 'Record arrivals and receiving status',
        icon: ReceiptText,
      },
      {
        id: 'invoices',
        label: 'Invoices',
        description: 'Track payable documents and payment',
        icon: CreditCard,
      },
    ],
  },
];

export function Layout({ currentPage, onNavigate, title, subtitle, pendingCount, children }) {
  const { purchaseOrders, goodsReceipts, invoices } = useProcurement();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">
            <BarChart3 size={18} />
          </div>
          <div>
            <h1>ERD System UMN</h1>
            <h1>KLOMPOK-6</h1>
            <p>Procurement Suite</p>
          </div>
        </div>

        <div className="sidebar-summary">
          <div>
            <strong>{pendingCount}</strong>
            <span>PR waiting approval</span>
          </div>
          <div>
            <strong>{purchaseOrders.length}</strong>
            <span>Total POs</span>
          </div>
          <div>
            <strong>{goodsReceipts.length}</strong>
            <span>Goods receipts</span>
          </div>
          <div>
            <strong>{invoices.filter((item) => item.status === 'Unpaid').length}</strong>
            <span>Unpaid invoices</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="nav-group">
              <div className="nav-group-title">{group.title}</div>
              <div className="nav-group-items">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
                      onClick={() => onNavigate(item.id)}
                      type="button"
                    >
                      <span className="nav-icon">
                        <Icon size={17} />
                      </span>
                      <span className="nav-copy">
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </span>
                      {item.id === 'purchase-requests' && pendingCount > 0 && (
                        <span className="nav-count">{pendingCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">PM</div>
          <div className="sidebar-user-copy">
            <strong>Procurement Manager</strong>
            <span>Local data mode enabled</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-copy">
            <span className="topbar-kicker">Procurement Workspace</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="topbar-meta">
            <span className="topbar-chip">Auto-saved to localStorage</span>
            <span className="topbar-date">{today}</span>
          </div>
        </header>

        <div className="page-body">{children}</div>
      </main>
    </div>
  );
}
