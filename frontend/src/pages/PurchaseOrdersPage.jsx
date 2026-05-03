import { PlusCircle, Search, ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Badge, Card, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { filterByText, formatDate } from '../utils/formatters';

export default function PurchaseOrdersPage() {
  const {
    purchaseRequests,
    purchaseOrders,
    createPORecord,
    getProductById,
    getEmployeeById,
  } = useProcurement();

  const [search, setSearch] = useState('');

  const filteredOrders = useMemo(
    () => filterByText(purchaseOrders, search, (purchaseOrder) => [purchaseOrder.id, purchaseOrder.prId, purchaseOrder.status]),
    [purchaseOrders, search],
  );

  function handleCreate(prId) {
    try {
      createPORecord(prId);
    } catch (error) {
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
                {filteredOrders.map((purchaseOrder) => (
                  <tr key={purchaseOrder.id}>
                    <td>{purchaseOrder.id}</td>
                    <td>{purchaseOrder.prId}</td>
                    <td>{formatDate(purchaseOrder.createdAt)}</td>
                    <td><Badge status={purchaseOrder.status} /></td>
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
