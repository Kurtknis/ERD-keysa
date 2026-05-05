import { BadgeCheck, ClipboardPlus, Edit2, Search, Sheet, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Badge, Card, ConfirmModal, DetailModal, EditModal, EmptyState } from '../components/UI';
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
    updatePRRecord,
    deletePRRecordCascade,
    approvePRRecord,
    getProductById,
    getEmployeeById,
  } = useProcurement();

  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modal, setModal] = useState(null); // 'edit' | 'confirm-delete'
  const [target, setTarget] = useState(null);
  const [editForm, setEditForm] = useState({ productId: '', quantity: 1, requestedById: '' });

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

    if (!form.productId) {
      window.alert('Please select a product.');
      return;
    }

    if (!form.requestedById) {
      window.alert('Please select an employee.');
      return;
    }

    if (Number(form.quantity) <= 0) {
      window.alert('Quantity must be greater than zero.');
      return;
    }

    try {
      createPRRecord(form);
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error('Create PR failed:', error);
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

  function handleDeleteClick(pr) {
    setTarget(pr);
    setModal('confirm-delete');
  }

  function handleDeleteConfirm() {
    if (!target) return;
    try {
      deletePRRecordCascade(target.id);
      setModal(null);
      setTarget(null);
    } catch (error) {
      window.alert(error.message);
    }
  }

  function handleEditClick(pr) {
    setTarget(pr);
    setEditForm({ productId: pr.productId, quantity: pr.quantity, requestedById: pr.requestedById });
    setModal('edit');
  }

  function handleEditSave() {
    if (!target) return;
    try {
      updatePRRecord(target.id, editForm);
      setModal(null);
      setTarget(null);
    } catch (error) {
      console.error('Update PR failed:', error);
      window.alert(error.message);
    }
  }

  function closeModal() {
    setModal(null);
    setTarget(null);
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
                    <tr
                      key={purchaseRequest.id}
                      className="row-clickable"
                      onClick={() => setSelectedItem({ pr: purchaseRequest, product, employee, total })}
                      title="Click to view details"
                    >
                      <td>{purchaseRequest.id}</td>
                      <td>{product?.name ?? '-'}</td>
                      <td>{purchaseRequest.quantity}</td>
                      <td>{employee?.name ?? '-'}</td>
                      <td>{formatCurrency(total)}</td>
                      <td>{formatDate(purchaseRequest.createdAt)}</td>
                      <td><Badge status={purchaseRequest.status} /></td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="secondary-button small-button"
                            onClick={(e) => { e.stopPropagation(); handleEditClick(purchaseRequest); }}
                            type="button"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            className="secondary-button small-button"
                            disabled={purchaseRequest.status !== 'Pending'}
                            onClick={(e) => { e.stopPropagation(); handleApprove(purchaseRequest.id); }}
                            type="button"
                          >
                            <BadgeCheck size={14} /> Approve
                          </button>
                          <button
                            className="danger-button small-button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(purchaseRequest); }}
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
          title={`Purchase Request — ${selectedItem.pr.id}`}
          onClose={() => setSelectedItem(null)}
          fields={[
            { label: 'PR ID', value: selectedItem.pr.id },
            { label: 'Product', value: selectedItem.product?.name ?? '—' },
            { label: 'Unit Price', value: formatCurrency(selectedItem.product?.price ?? 0) },
            { label: 'Quantity', value: selectedItem.pr.quantity },
            { label: 'Total Amount', value: formatCurrency(selectedItem.total) },
            { label: 'Requested By', value: selectedItem.employee?.name ?? '—' },
            { label: 'Role', value: selectedItem.employee?.role ?? '—' },
            { label: 'Status', value: selectedItem.pr.status },
            { label: 'Created At', value: formatDate(selectedItem.pr.createdAt) },
            { label: 'Approved At', value: formatDate(selectedItem.pr.approvedAt) },
          ]}
        />
      )}

      {modal === 'edit' && target && (
        <EditModal
          title={`Edit Purchase Request — ${target.id}`}
          fields={[
            {
              name: 'productId',
              label: 'Product',
              type: 'select',
              value: editForm.productId,
              onChange: (e) => setEditForm((c) => ({ ...c, productId: e.target.value })),
              required: true,
              options: [
                { value: '', label: 'Select a product' },
                ...products.map((p) => ({ value: p.id, label: p.name })),
              ],
            },
            {
              name: 'quantity',
              label: 'Quantity',
              type: 'number',
              value: editForm.quantity,
              onChange: (e) => setEditForm((c) => ({ ...c, quantity: e.target.value })),
              required: true,
              min: '1',
            },
            {
              name: 'requestedById',
              label: 'Requested By',
              type: 'select',
              value: editForm.requestedById,
              onChange: (e) => setEditForm((c) => ({ ...c, requestedById: e.target.value })),
              required: true,
              options: [
                { value: '', label: 'Select an employee' },
                ...employees.map((emp) => ({ value: emp.id, label: `${emp.name} - ${emp.role}` })),
              ],
            },
          ]}
          onSave={handleEditSave}
          onClose={closeModal}
        />
      )}

      {modal === 'confirm-delete' && target && (
        <ConfirmModal
          title="Delete Purchase Request (Cascade)"
          message={`Delete PR "${target.id}" and ALL related records?\n\nThis will also delete:\n- Related Purchase Order (if exists)\n- Related Goods Receipt (if exists)\n- Related Invoice (if exists)\n\nThis action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
          confirmLabel="Delete All"
          danger
        />
      )}
    </div>
  );
}
