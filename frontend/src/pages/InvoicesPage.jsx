import { BadgeDollarSign, CheckCheck, PlusCircle, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Badge, Card, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { filterByText, formatCurrency, formatDate } from '../utils/formatters';

export default function InvoicesPage() {
  const {
    purchaseOrders,
    invoices,
    createInvoiceRecord,
    markInvoicePaidRecord,
  } = useProcurement();

  const [search, setSearch] = useState('');

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
    try {
      createInvoiceRecord(poId);
    } catch (error) {
      window.alert(error.message);
    }
  }

  function handleMarkPaid(invoiceId) {
    try {
      markInvoicePaidRecord(invoiceId);
    } catch (error) {
      window.alert(error.message);
    }
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{invoice.poId}</td>
                    <td>{invoice.prId}</td>
                    <td>{invoice.grId}</td>
                    <td>{formatCurrency(invoice.amount)}</td>
                    <td>{formatDate(invoice.createdAt)}</td>
                    <td><Badge status={invoice.status} /></td>
                    <td>
                      <button
                        className="secondary-button small-button"
                        disabled={invoice.status === 'Paid'}
                        onClick={() => handleMarkPaid(invoice.id)}
                        type="button"
                      >
                        <CheckCheck size={14} />
                        Mark Paid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
