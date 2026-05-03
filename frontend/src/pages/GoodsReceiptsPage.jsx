import { CheckCheck, PackageCheck, PlusCircle, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Badge, Card, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { filterByText, formatDate } from '../utils/formatters';

export default function GoodsReceiptsPage() {
  const {
    purchaseOrders,
    goodsReceipts,
    createGRRecord,
    markGRReceivedRecord,
  } = useProcurement();

  const [search, setSearch] = useState('');

  const filteredReceipts = useMemo(
    () => filterByText(goodsReceipts, search, (goodsReceipt) => [goodsReceipt.id, goodsReceipt.poId, goodsReceipt.status]),
    [goodsReceipts, search],
  );

  function handleCreate(poId) {
    try {
      createGRRecord(poId);
    } catch (error) {
      window.alert(error.message);
    }
  }

  function handleMarkReceived(grId) {
    try {
      markGRReceivedRecord(grId);
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <div className="page-stack">
      <Card
        title="Create Goods Receipt From PO"
        subtitle="Receiving records start from real purchase orders so stock and invoice steps stay traceable."
        action={<span className="section-chip">Receiving</span>}
      >
        <ActionHint
          title="What this button does"
          description="Create GR opens a receiving document for a PO, and Mark Received confirms that the goods physically arrived."
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>PO</th>
                <th>PR</th>
                <th>Status</th>
                <th>Create GR</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((purchaseOrder) => {
                const linkedReceipt = goodsReceipts.find((goodsReceipt) => goodsReceipt.poId === purchaseOrder.id);

                return (
                  <tr key={purchaseOrder.id}>
                    <td>{purchaseOrder.id}</td>
                    <td>{purchaseOrder.prId}</td>
                    <td><Badge status={purchaseOrder.status} /></td>
                    <td>
                      {linkedReceipt ? (
                        <span className="inline-note">{linkedReceipt.id} already exists</span>
                      ) : (
                        <button className="primary-button small-button" onClick={() => handleCreate(purchaseOrder.id)} type="button">
                          <PlusCircle size={14} />
                          Create GR
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

      <Card title="Goods Receipt List" subtitle="Mark goods as received when they arrive">
        <div className="field-with-icon">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search GR ID, PO ID, or status"
          />
        </div>

        {filteredReceipts.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="No goods receipts found"
            description="Create a goods receipt from a purchase order to document receiving activity."
          />
        ) : (
          <div className="table-scroll top-gap">
            <table>
              <thead>
                <tr>
                  <th>GR</th>
                  <th>PO</th>
                  <th>Created</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((goodsReceipt) => (
                  <tr key={goodsReceipt.id}>
                    <td>{goodsReceipt.id}</td>
                    <td>{goodsReceipt.poId}</td>
                    <td>{formatDate(goodsReceipt.createdAt)}</td>
                    <td>{formatDate(goodsReceipt.receivedAt)}</td>
                    <td><Badge status={goodsReceipt.status} /></td>
                    <td>
                      <button
                        className="secondary-button small-button"
                        disabled={goodsReceipt.status === 'Received'}
                        onClick={() => handleMarkReceived(goodsReceipt.id)}
                        type="button"
                      >
                        <CheckCheck size={14} />
                        Mark Received
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
