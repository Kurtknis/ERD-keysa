import { BadgeDollarSign, CheckCheck, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Badge, Card, ConfirmModal, DetailModal, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { filterByText, formatCurrency, formatDate } from '../utils/formatters';

export default function InvoicesPage() {
  const {
    purchaseOrders,
    goodsReceipts,
    invoices,
    createInvoiceRecord,
    deleteInvoiceRecord,
    markInvoicePaidRecord,
    getPRById,
    getProductById,
  } = useProcurement();

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modal, setModal] = useState(null);
  const [target, setTarget] = useState(null);

  const filteredInvoices = useMemo(
    () =>
      filterByText(invoices, search, (invoice) => [
        invoice.id,
        invoice.poId,
        invoice.prId,
        invoice.status,
        invoice.amount,
      ]),
    [invoices, search],
  );

  function handleCreate(poId) {
    if (!poId) {
      window.alert('Invalid purchase order.');
      return;
    }

    const gr = goodsReceipts.find((item) => item.poId === poId);

    if (!gr) {
      window.alert('Cannot create an invoice until a goods receipt exists for this PO.');
      return;
    }

    if (gr.status !== 'Received') {
      window.alert('Cannot create an invoice until the goods receipt is marked as received.');
      return;
    }

    try {
      createInvoiceRecord(poId);
    } catch (error) {
      console.error('Create invoice failed:', error);
      window.alert(error.message);
    }
  }

  function handleMarkPaid(invoiceId) {
    if (!invoiceId) {
      window.alert('Invalid invoice.');
      return;
    }

    try {
      markInvoicePaidRecord(invoiceId);
    } catch (error) {
      console.error('Mark invoice paid failed:', error);
      window.alert(error.message);
    }
  }

  function handleDeleteClick(invoice) {
    setTarget(invoice);
    setModal('confirm-delete');
  }

  function handleDeleteConfirm() {
    if (!target) return;
    try {
      deleteInvoiceRecord(target.id);
      setModal(null);
      setTarget(null);
    } catch (error) {
      window.alert(error.message);
    }
  }

  function closeModal() {
    setModal(null);
    setTarget(null);
  }

  return (
    <div className="page-stack">
      <Card
        title="Create Invoice From PO"
        subtitle="Invoice generation stays protected by business rules so finance only sees valid payable documents."
        action={<span className="section-chip">Finance</span>}
      >
        <ActionHint
          title="What this button does"
          description="Create Invoice is only valid after a linked PR exists, a PO exists, and the goods receipt is marked as Received."
        />
        <div className="table-scroll">
          {purchaseOrders.length === 0 ? (
            <p className="form-helper">No purchase orders available. Create a PO first.</p>
          ) : (
          <table>
            <thead>
              <tr>
                <th>PO</th>
                <th>PR</th>
                <th>Invoice</th>
                <th>Create Invoice</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((purchaseOrder) => {
                const linkedInvoice = invoices.find((invoice) => invoice.poId === purchaseOrder.id);

                return (
                  <tr key={purchaseOrder.id}>
                    <td>{purchaseOrder.id}</td>
                    <td>{purchaseOrder.prId}</td>
                    <td>{linkedInvoice?.id ?? 'Not created'}</td>
                    <td>
                      {linkedInvoice ? (
                        <span className="inline-note">Invoice already exists</span>
                      ) : (
                        <button className="primary-button small-button" onClick={() => handleCreate(purchaseOrder.id)} type="button">
                          <PlusCircle size={14} />
                          Create Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </Card>

      <Card title="Invoice List" subtitle="Track unpaid and paid invoices">
        <div className="field-with-icon">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoice ID, PO ID, PR ID, amount, or status"
          />
        </div>

        {filteredInvoices.length === 0 ? (
          <EmptyState
            icon={BadgeDollarSign}
            title="No invoices found"
            description="Create an invoice after the linked goods receipt has been marked as received."
          />
        ) : (
          <div className="table-scroll top-gap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>PO</th>
                  <th>PR</th>
                  <th>GR</th>
                  <th>Amount</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const pr = getPRById(invoice.prId);
                  const product = getProductById(pr?.productId);
                  return (
                    <tr
                      key={invoice.id}
                      className="row-clickable"
                      onClick={() => setSelectedItem({ invoice, pr, product })}
                      title="Click to view details"
                    >
                      <td>{invoice.id}</td>
                      <td>{invoice.poId}</td>
                      <td>{invoice.prId}</td>
                      <td>{invoice.grId}</td>
                      <td>{formatCurrency(invoice.amount)}</td>
                      <td>{formatDate(invoice.createdAt)}</td>
                      <td><Badge status={invoice.status} /></td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="secondary-button small-button"
                            disabled={invoice.status === 'Paid'}
                            onClick={(e) => { e.stopPropagation(); handleMarkPaid(invoice.id); }}
                            type="button"
                          >
                            <CheckCheck size={14} /> Mark Paid
                          </button>
                          <button
                            className="danger-button small-button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(invoice); }}
                            type="button"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedItem && (
        <DetailModal
          title={`Invoice — ${selectedItem.invoice.id}`}
          onClose={() => setSelectedItem(null)}
          fields={[
            { label: 'Invoice ID', value: selectedItem.invoice.id },
            { label: 'PO Reference', value: selectedItem.invoice.poId },
            { label: 'PR Reference', value: selectedItem.invoice.prId },
            { label: 'GR Reference', value: selectedItem.invoice.grId },
            { label: 'Product', value: selectedItem.product?.name ?? '—' },
            { label: 'Quantity', value: selectedItem.pr?.quantity ?? '—' },
            { label: 'Amount', value: formatCurrency(selectedItem.invoice.amount) },
            { label: 'Status', value: selectedItem.invoice.status },
            { label: 'Created At', value: formatDate(selectedItem.invoice.createdAt) },
            { label: 'Paid At', value: formatDate(selectedItem.invoice.paidAt) },
          ]}
        />
      )}

      {modal === 'confirm-delete' && target && (
        <ConfirmModal
          title="Delete Invoice"
          message={`Delete invoice "${target.id}"?\n\nThis action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
          confirmLabel="Delete"
          danger
        />
      )}
    </div>
  );
}
