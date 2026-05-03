import { PlusCircle, Search, ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Badge, Card, DetailModal, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { filterByText, formatDate } from '../utils/formatters';

export default function PurchaseOrdersPage() {
  const {
    purchaseRequests,
    purchaseOrders,
    createPORecord,
    getProductById,
    getEmployeeById,
    getPRById,
  } = useProcurement();

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredOrders = useMemo(
    () => filterByText(purchaseOrders, search, (purchaseOrder) => [purchaseOrder.id, purchaseOrder.prId, purchaseOrder.status]),
    [purchaseOrders, search],
  );

  function handleCreate(prId) {
    if (!prId) {
      window.alert('Invalid purchase request.');
      return;
    }

    const pr = purchaseRequests.find((item) => item.id === prId);

    if (!pr) {
      window.alert('Purchase request not found.');
      return;
    }

    if (pr.status !== 'Approved') {
      window.alert('Cannot create a PO until the PR is approved.');
      return;
    }

    try {
      createPORecord(prId);
    } catch (error) {
      console.error('Create PO failed:', error);
      window.alert(error.message);
    }
  }

  return (
    <div className="page-stack">
      <Card
        title="Create PO From Purchase Request"
        subtitle="Only approved PRs can move into ordering, which keeps the workflow controlled."
        action={<span className="section-chip">Approval Gate</span>}
      >
        <ActionHint
          title="What this button does"
          description="Create PO converts an approved PR into a formal purchase order and blocks duplicate order creation."
        />
        <div className="table-scroll">
          {purchaseRequests.length === 0 ? (
            <p className="form-helper">No purchase requests available. Create a PR first.</p>
          ) : (
          <table>
            <thead>
              <tr>
                <th>PR</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Create PO</th>
              </tr>
            </thead>
            <tbody>
              {purchaseRequests.map((purchaseRequest) => {
                const linkedPO = purchaseOrders.find((purchaseOrder) => purchaseOrder.prId === purchaseRequest.id);

                return (
                  <tr key={purchaseRequest.id}>
                    <td>{purchaseRequest.id}</td>
                    <td>{getProductById(purchaseRequest.productId)?.name ?? '-'}</td>
                    <td>{purchaseRequest.quantity}</td>
                    <td>{getEmployeeById(purchaseRequest.requestedById)?.name ?? '-'}</td>
                    <td><Badge status={purchaseRequest.status} /></td>
                    <td>
                      {linkedPO ? (
                        <span className="inline-note">{linkedPO.id} already exists</span>
                      ) : (
                        <button className="primary-button small-button" onClick={() => handleCreate(purchaseRequest.id)} type="button">
                          <PlusCircle size={14} />
                          Create PO
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

      <Card title="Purchase Order List" subtitle="Search persisted POs">
        <div className="field-with-icon">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search PO ID, PR ID, or status"
          />
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No purchase orders found"
            description="Create a PO from an approved PR to continue the procurement chain."
          />
        ) : (
          <div className="table-scroll top-gap">
            <table>
              <thead>
                <tr>
                  <th>PO</th>
                  <th>PR Reference</th>
                  <th>Created</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((purchaseOrder) => {
                  const pr = getPRById(purchaseOrder.prId);
                  const product = getProductById(pr?.productId);
                  const employee = getEmployeeById(pr?.requestedById);
                  return (
                    <tr
                      key={purchaseOrder.id}
                      className="row-clickable"
                      onClick={() => setSelectedItem({ po: purchaseOrder, pr, product, employee })}
                      title="Click to view details"
                    >
                      <td>{purchaseOrder.id}</td>
                      <td>{purchaseOrder.prId}</td>
                      <td>{formatDate(purchaseOrder.createdAt)}</td>
                      <td><Badge status={purchaseOrder.status} /></td>
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
          title={`Purchase Order — ${selectedItem.po.id}`}
          onClose={() => setSelectedItem(null)}
          fields={[
            { label: 'PO ID', value: selectedItem.po.id },
            { label: 'PR Reference', value: selectedItem.po.prId },
            { label: 'Product', value: selectedItem.product?.name ?? '—' },
            { label: 'Quantity', value: selectedItem.pr?.quantity ?? '—' },
            { label: 'Requested By', value: selectedItem.employee?.name ?? '—' },
            { label: 'Employee Role', value: selectedItem.employee?.role ?? '—' },
            { label: 'Created At', value: formatDate(selectedItem.po.createdAt) },
            { label: 'Status', value: selectedItem.po.status },
          ]}
        />
      )}
    </div>
  );
}
