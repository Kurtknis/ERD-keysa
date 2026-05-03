import { BadgeCheck, ClipboardPlus, Search, Sheet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Badge, Card, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { exportPurchaseRequests } from '../utils/exportExcel';
import { filterByText, formatCurrency, formatDate } from '../utils/formatters';

const EMPTY_FORM = {
  productId: '',
  quantity: 1,
  requestedById: '',
};

export default function PurchaseRequestsPage() {
  const {
    products,
    employees,
    purchaseRequests,
    createPRRecord,
    approvePRRecord,
    getProductById,
    getEmployeeById,
  } = useProcurement();

  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRequests = useMemo(() => {
    const baseList = filterByText(
      purchaseRequests,
      search,
      (purchaseRequest) => [
        purchaseRequest.id,
        getProductById(purchaseRequest.productId)?.name,
        getEmployeeById(purchaseRequest.requestedById)?.name,
        purchaseRequest.status,
      ],
    );

    if (statusFilter === 'All') {
      return baseList;
    }

    return baseList.filter((purchaseRequest) => purchaseRequest.status === statusFilter);
  }, [getEmployeeById, getProductById, purchaseRequests, search, statusFilter]);

  function handleCreate(event) {
    event.preventDefault();

    try {
      createPRRecord(form);
      setForm(EMPTY_FORM);
    } catch (error) {
      window.alert(error.message);
    }
  }

  function handleApprove(prId) {
    try {
      approvePRRecord(prId);
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <div className="page-stack">
      <div className="two-column-grid">
        <Card
          title="Create Purchase Request"
          subtitle="Capture a buying need with the right item, quantity, and requester in one step."
          action={<span className="section-chip">Workflow Start</span>}
        >
          <ActionHint
            title="What this button does"
            description="Create PR submits a new requisition in Pending status so it can be reviewed before ordering."
          />
          <form className="form-grid" onSubmit={handleCreate}>
            <label>
              Product
              <select
                value={form.productId}
                onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
              />
            </label>

            <label>
              Requested By
              <select
                value={form.requestedById}
                onChange={(event) => setForm((current) => ({ ...current, requestedById: event.target.value }))}
              >
                <option value="">Select an employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.role}
                  </option>
                ))}
              </select>
            </label>

            <button className="primary-button" type="submit">
              <ClipboardPlus size={16} />
              Create PR
            </button>
            <p className="form-helper">A new PR is stored immediately and starts in Pending until approved.</p>
          </form>
        </Card>

        <Card
          title="Search, Filter, Export"
          subtitle="Export PR data with product and employee names"
          action={
            <button
              className="secondary-button"
              onClick={() => exportPurchaseRequests(purchaseRequests, { getProductById, getEmployeeById })}
              type="button"
            >
              <Sheet size={16} />
              Export Excel
            </button>
          }
        >
          <ActionHint
            title="Filter guidance"
            description="Use search and status filters to focus on requests that are ready to approve or need follow-up."
          />
          <div className="form-grid">
            <div className="field-with-icon">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search PR ID, product, employee, or status"
              />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
        </Card>
      </div>

      <Card title="Purchase Request List" subtitle={`${filteredRequests.length} request(s) shown`}>
        {filteredRequests.length === 0 ? (
          <EmptyState
            icon={ClipboardPlus}
            title="No purchase requests found"
            description="Create a PR or adjust your filters to reveal saved requests."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Requested By</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((purchaseRequest) => {
                  const product = getProductById(purchaseRequest.productId);
                  const employee = getEmployeeById(purchaseRequest.requestedById);
                  const total = (product?.price ?? 0) * purchaseRequest.quantity;

                  return (
                    <tr key={purchaseRequest.id}>
                      <td>{purchaseRequest.id}</td>
                      <td>{product?.name ?? '-'}</td>
                      <td>{purchaseRequest.quantity}</td>
                      <td>{employee?.name ?? '-'}</td>
                      <td>{formatCurrency(total)}</td>
                      <td>{formatDate(purchaseRequest.createdAt)}</td>
                      <td><Badge status={purchaseRequest.status} /></td>
                      <td>
                        <button
                          className="secondary-button small-button"
                          disabled={purchaseRequest.status !== 'Pending'}
                          onClick={() => handleApprove(purchaseRequest.id)}
                          type="button"
                        >
                          <BadgeCheck size={14} />
                          Approve
                        </button>
                        <div className="button-description">
                          Moves the PR into Approved status so a PO can be created.
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
    </div>
  );
}
