import {
  Boxes,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  PackageCheck,
  ShoppingCart,
  TriangleAlert,
  Users2,
} from 'lucide-react';
import { Badge, Card, StatCard } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function DashboardPage() {
  const {
    products,
    employees,
    purchaseRequests,
    purchaseOrders,
    goodsReceipts,
    invoices,
    getProductById,
    getEmployeeById,
    getPRById,
  } = useProcurement();

  const totalSpend = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidCount = invoices.filter((invoice) => invoice.status === 'Paid').length;
  const pendingPRCount = purchaseRequests.filter((item) => item.status === 'Pending').length;
  const totalUnpaid = invoices
    .filter((invoice) => invoice.status === 'Unpaid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="page-stack">
      {pendingPRCount > 0 ? (
        <div className="page-alert warning">
          <div className="page-alert-icon">
            <TriangleAlert size={18} />
          </div>
          <div className="page-alert-copy">
            <strong>{pendingPRCount} purchase request(s) are waiting for approval</strong>
            <span>Approve requests first so the team can continue to purchase orders without blockers.</span>
          </div>
        </div>
      ) : null}

      <div className="stats-grid">
        <StatCard icon={Boxes} label="Products" value={products.length} helper="Catalog ready for requisitions" tone="primary" />
        <StatCard icon={Users2} label="Employees" value={employees.length} helper="Requester and owner master data" tone="success" />
        <StatCard icon={ClipboardList} label="Pending PRs" value={pendingPRCount} helper="Needs approval before PO creation" tone="warning" />
        <StatCard icon={ShoppingCart} label="Purchase Orders" value={purchaseOrders.length} helper="Issued from approved requests" tone="purple" />
        <StatCard icon={PackageCheck} label="Goods Receipts" value={goodsReceipts.length} helper="Receiving recorded for ordered goods" tone="cyan" />
        <StatCard icon={CircleDollarSign} label="Invoice Value" value={formatCurrency(totalSpend)} helper={`${paidCount} paid invoice(s)`} tone="orange" />
      </div>

      <div className="two-column-grid">
        <Card
          title="Workflow Snapshot"
          subtitle="A clear chain from request to payment so users understand where each document sits."
          footer={
            <div className="card-footnote">
              <span>Unpaid exposure</span>
              <strong>{formatCurrency(totalUnpaid)}</strong>
            </div>
          }
        >
          <div className="chain-list">
            {purchaseOrders.map((purchaseOrder) => {
              const purchaseRequest = getPRById(purchaseOrder.prId);
              const goodsReceipt = goodsReceipts.find((item) => item.poId === purchaseOrder.id);
              const invoice = invoices.find((item) => item.poId === purchaseOrder.id);

              return (
                <div key={purchaseOrder.id} className="chain-item">
                  <div className="chain-copy">
                    <strong>{purchaseOrder.id}</strong>
                    <p>
                      {purchaseRequest?.id ?? '-'}
                      {' -> '}
                      {purchaseOrder.id}
                      {' -> '}
                      {goodsReceipt?.id ?? 'No GR'}
                      {' -> '}
                      {invoice?.id ?? 'No Invoice'}
                    </p>
                  </div>
                  <div className="chain-statuses">
                    <Badge status={purchaseRequest?.status ?? 'Missing'} />
                    <Badge status={goodsReceipt?.status ?? 'Pending'} />
                    <Badge status={invoice?.status ?? 'Unpaid'} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card
          title="Recent Purchase Requests"
          subtitle="Newest requests with who asked, what item is needed, and current approval status."
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Employee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseRequests.slice().reverse().slice(0, 5).map((purchaseRequest) => (
                  <tr key={purchaseRequest.id}>
                    <td>{purchaseRequest.id}</td>
                    <td>{getProductById(purchaseRequest.productId)?.name ?? '-'}</td>
                    <td>{purchaseRequest.quantity}</td>
                    <td>{getEmployeeById(purchaseRequest.requestedById)?.name ?? '-'}</td>
                    <td><Badge status={purchaseRequest.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card
        title="Invoice Overview"
        subtitle="Financial status remains available across refresh because every record is stored locally."
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>PO</th>
                <th>PR</th>
                <th>Amount</th>
                <th>Created</th>
                <th>Paid At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{invoice.poId}</td>
                  <td>{invoice.prId}</td>
                  <td>{formatCurrency(invoice.amount)}</td>
                  <td>{formatDate(invoice.createdAt)}</td>
                  <td>{formatDate(invoice.paidAt)}</td>
                  <td><Badge status={invoice.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
