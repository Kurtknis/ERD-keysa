import {
  Boxes,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  PackageCheck,
  ShoppingCart,
  TriangleAlert,
  Users2,
} from 'lucide-react';
import { useState } from 'react';
import { useMemo } from 'react';
import { Badge, Card, Modal, StatCard } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { exportAllData } from '../utils/exportExcel';
import { formatCurrency, formatDate } from '../utils/formatters';

const HOW_TO_STEPS = [
  {
    num: 1,
    title: 'Add Products',
    desc: 'Go to Product Management and register the items you need to procure. Each product stores a name and unit price used in calculations.',
  },
  {
    num: 2,
    title: 'Add Employees',
    desc: 'Go to Employee Management and create employee profiles. Employees are assigned as requesters when raising a purchase request.',
  },
  {
    num: 3,
    title: 'Create a Purchase Request (PR)',
    desc: 'Select a product, set a quantity, and pick the requesting employee. The PR starts in Pending status and must be approved before ordering.',
  },
  {
    num: 4,
    title: 'Approve the PR',
    desc: 'In the Purchase Requests page, click Approve on a Pending PR. Only Approved PRs can advance to a Purchase Order.',
  },
  {
    num: 5,
    title: 'Create a Purchase Order (PO)',
    desc: 'In Purchase Orders, click Create PO next to an Approved PR. Each PR can only have one PO, preventing duplicate orders.',
  },
  {
    num: 6,
    title: 'Create a Goods Receipt (GR)',
    desc: 'In Goods Receipts, click Create GR for a PO to open a receiving document. Then click Mark Received when goods physically arrive.',
  },
  {
    num: 7,
    title: 'Create an Invoice',
    desc: 'In Invoices, click Create Invoice once the GR is marked Received. The invoice amount is auto-calculated from product price × quantity.',
  },
  {
    num: 8,
    title: 'Mark Invoice as Paid',
    desc: 'After payment is processed, click Mark Paid on an invoice to record the payment date and close the procurement cycle.',
  },
];

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

  const [activeModal, setActiveModal] = useState(null);

  const totalSpend = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidCount = invoices.filter((invoice) => invoice.status === 'Paid').length;
  const pendingPRCount = purchaseRequests.filter((item) => item.status === 'Pending').length;
  const totalUnpaid = invoices
    .filter((invoice) => invoice.status === 'Unpaid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  function closeModal() {
    setActiveModal(null);
  }

  function handleExportAll() {
    exportAllData(
      {
        products,
        employees,
        purchaseRequests,
        purchaseOrders,
        goodsReceipts,
        invoices,
      },
      {
        getProductById,
        getEmployeeById,
        getPRById,
      },
    );
  }

  return (
    <div className="page-stack">
      {/* Export All Button - Prominent placement at top */}
      <Card
        title="Export Complete Procurement Data"
        subtitle="Download all data (Products, Employees, PRs, POs, GRs, Invoices) in one Excel file with multiple sheets."
        action={
          <button className="primary-button" onClick={handleExportAll} type="button">
            <FileSpreadsheet size={16} /> Export All Data
          </button>
        }
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, opacity: 0.85 }}>
          <span> {products.length} Products</span>
          <span> {employees.length} Employees</span>
          <span> {purchaseRequests.length} PRs</span>
          <span> {purchaseOrders.length} POs</span>
          <span> {goodsReceipts.length} GRs</span>
          <span> {invoices.length} Invoices</span>
          <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
            Total: {products.length + employees.length + purchaseRequests.length + purchaseOrders.length + goodsReceipts.length + invoices.length} records
          </span>
        </div>
      </Card>

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
        <StatCard
          icon={ClipboardList}
          label="Purchase Requests"
          value={purchaseRequests.length}
          helper={`${pendingPRCount} pending approval`}
          tone="warning"
          onClick={() => setActiveModal('pr')}
        />
        <StatCard
          icon={ShoppingCart}
          label="Purchase Orders"
          value={purchaseOrders.length}
          helper="Issued from approved requests"
          tone="purple"
          onClick={() => setActiveModal('po')}
        />
        <StatCard
          icon={PackageCheck}
          label="Goods Receipts"
          value={goodsReceipts.length}
          helper="Receiving recorded for ordered goods"
          tone="cyan"
          onClick={() => setActiveModal('gr')}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Invoices"
          value={invoices.length}
          helper={`${paidCount} paid · ${formatCurrency(totalSpend)} total`}
          tone="orange"
          onClick={() => setActiveModal('invoice')}
        />
      </div>

      {/* ── How To Use ── */}
      <Card
        title="How To Use This App"
        subtitle="Follow these steps in order to complete a full procurement cycle from request to payment."
        action={<span className="section-chip">Guide</span>}
      >
        <div className="how-to-grid">
          {HOW_TO_STEPS.map((step) => (
            <div key={step.num} className="how-to-step">
              <div className="how-to-step-num">{step.num}</div>
              <strong>{step.title}</strong>
              <span>{step.desc}</span>
            </div>
          ))}
        </div>
      </Card>

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

      {/* ── Modal: Purchase Requests ── */}
      {activeModal === 'pr' && (
        <Modal title={`Purchase Requests — ${purchaseRequests.length} record(s)`} onClose={closeModal}>
          {purchaseRequests.length === 0 ? (
            <p className="form-helper">No purchase requests found.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Requested By</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Created</th>
                    <th>Approved</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseRequests.map((pr) => {
                    const product = getProductById(pr.productId);
                    const employee = getEmployeeById(pr.requestedById);
                    const total = (product?.price ?? 0) * pr.quantity;
                    return (
                      <tr key={pr.id}>
                        <td>{pr.id}</td>
                        <td>{product?.name ?? '-'}</td>
                        <td>{pr.quantity}</td>
                        <td>{employee?.name ?? '-'}</td>
                        <td>{formatCurrency(product?.price ?? 0)}</td>
                        <td>{formatCurrency(total)}</td>
                        <td>{formatDate(pr.createdAt)}</td>
                        <td>{formatDate(pr.approvedAt)}</td>
                        <td><Badge status={pr.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* ── Modal: Purchase Orders ── */}
      {activeModal === 'po' && (
        <Modal title={`Purchase Orders — ${purchaseOrders.length} record(s)`} onClose={closeModal}>
          {purchaseOrders.length === 0 ? (
            <p className="form-helper">No purchase orders found.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>PO ID</th>
                    <th>PR Reference</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Requested By</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => {
                    const pr = getPRById(po.prId);
                    const product = getProductById(pr?.productId);
                    const employee = getEmployeeById(pr?.requestedById);
                    return (
                      <tr key={po.id}>
                        <td>{po.id}</td>
                        <td>{po.prId}</td>
                        <td>{product?.name ?? '-'}</td>
                        <td>{pr?.quantity ?? '-'}</td>
                        <td>{employee?.name ?? '-'}</td>
                        <td>{formatDate(po.createdAt)}</td>
                        <td><Badge status={po.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* ── Modal: Goods Receipts ── */}
      {activeModal === 'gr' && (
        <Modal title={`Goods Receipts — ${goodsReceipts.length} record(s)`} onClose={closeModal}>
          {goodsReceipts.length === 0 ? (
            <p className="form-helper">No goods receipts found.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>GR ID</th>
                    <th>PO Reference</th>
                    <th>PR Reference</th>
                    <th>Product</th>
                    <th>Created</th>
                    <th>Received At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {goodsReceipts.map((gr) => {
                    const po = purchaseOrders.find((item) => item.id === gr.poId);
                    const pr = getPRById(po?.prId);
                    const product = getProductById(pr?.productId);
                    return (
                      <tr key={gr.id}>
                        <td>{gr.id}</td>
                        <td>{gr.poId}</td>
                        <td>{po?.prId ?? '-'}</td>
                        <td>{product?.name ?? '-'}</td>
                        <td>{formatDate(gr.createdAt)}</td>
                        <td>{formatDate(gr.receivedAt)}</td>
                        <td><Badge status={gr.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* ── Modal: Invoices ── */}
      {activeModal === 'invoice' && (
        <Modal title={`Invoices — ${invoices.length} record(s)`} onClose={closeModal}>
          {invoices.length === 0 ? (
            <p className="form-helper">No invoices found.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>PO</th>
                    <th>PR</th>
                    <th>GR</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Created</th>
                    <th>Paid At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const pr = getPRById(inv.prId);
                    const product = getProductById(pr?.productId);
                    return (
                      <tr key={inv.id}>
                        <td>{inv.id}</td>
                        <td>{inv.poId}</td>
                        <td>{inv.prId}</td>
                        <td>{inv.grId}</td>
                        <td>{product?.name ?? '-'}</td>
                        <td>{pr?.quantity ?? '-'}</td>
                        <td>{formatCurrency(inv.amount)}</td>
                        <td>{formatDate(inv.createdAt)}</td>
                        <td>{formatDate(inv.paidAt)}</td>
                        <td><Badge status={inv.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
