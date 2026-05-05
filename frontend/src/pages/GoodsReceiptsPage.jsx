import { CheckCheck, PackageCheck, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Badge, Card, ConfirmModal, DetailModal, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { filterByText, formatDate } from '../utils/formatters';

export default function GoodsReceiptsPage() {
  const {
    purchaseOrders,
    goodsReceipts,
    createGRRecord,
    deleteGRRecordCascade,
    markGRReceivedRecord,
    getPRById,
    getProductById,
  } = useProcurement();

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modal, setModal] = useState(null);
  const [target, setTarget] = useState(null);

  const filteredReceipts = useMemo(
    () => filterByText(goodsReceipts, search, (goodsReceipt) => [goodsReceipt.id, goodsReceipt.poId, goodsReceipt.status]),
    [goodsReceipts, search],
  );

  function handleCreate(poId) {
    if (!poId) {
      window.alert('Invalid purchase order.');
      return;
    }

    try {
      createGRRecord(poId);
    } catch (error) {
      console.error('Create GR failed:', error);
      window.alert(error.message);
    }
  }

  function handleMarkReceived(grId) {
    if (!grId) {
      window.alert('Invalid goods receipt.');
      return;
    }

    try {
      markGRReceivedRecord(grId);
    } catch (error) {
      console.error('Mark GR received failed:', error);
      window.alert(error.message);
    }
  }

  function handleDeleteClick(gr) {
    setTarget(gr);
    setModal('confirm-delete');
  }

  function handleDeleteConfirm() {
    if (!target) return;
    try {
      deleteGRRecordCascade(target.id);
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
        title="Create Goods Receipt From PO"
        subtitle="Receiving records start from real purchase orders so stock and invoice steps stay traceable."
        action={<span className="section-chip">Receiving</span>}
      >
        <ActionHint
          title="What this button does"
          description="Create GR opens a receiving document for a PO, and Mark Received confirms that the goods physically arrived."
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
          )}
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((goodsReceipt) => {
                  const po = purchaseOrders.find((item) => item.id === goodsReceipt.poId);
                  const pr = getPRById(po?.prId);
                  const product = getProductById(pr?.productId);
                  return (
                    <tr
                      key={goodsReceipt.id}
                      className="row-clickable"
                      onClick={() => setSelectedItem({ gr: goodsReceipt, po, pr, product })}
                      title="Click to view details"
                    >
                      <td>{goodsReceipt.id}</td>
                      <td>{goodsReceipt.poId}</td>
                      <td>{formatDate(goodsReceipt.createdAt)}</td>
                      <td>{formatDate(goodsReceipt.receivedAt)}</td>
                      <td><Badge status={goodsReceipt.status} /></td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="secondary-button small-button"
                            disabled={goodsReceipt.status === 'Received'}
                            onClick={(e) => { e.stopPropagation(); handleMarkReceived(goodsReceipt.id); }}
                            type="button"
                          >
                            <CheckCheck size={14} /> Mark Received
                          </button>
                          <button
                            className="danger-button small-button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(goodsReceipt); }}
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
          title={`Goods Receipt — ${selectedItem.gr.id}`}
          onClose={() => setSelectedItem(null)}
          fields={[
            { label: 'GR ID', value: selectedItem.gr.id },
            { label: 'PO Reference', value: selectedItem.gr.poId },
            { label: 'PR Reference', value: selectedItem.po?.prId ?? '—' },
            { label: 'Product', value: selectedItem.product?.name ?? '—' },
            { label: 'Quantity', value: selectedItem.pr?.quantity ?? '—' },
            { label: 'Status', value: selectedItem.gr.status },
            { label: 'Created At', value: formatDate(selectedItem.gr.createdAt) },
            { label: 'Received At', value: formatDate(selectedItem.gr.receivedAt) },
          ]}
        />
      )}

      {modal === 'confirm-delete' && target && (
        <ConfirmModal
          title="Delete Goods Receipt (Cascade)"
          message={`Delete GR "${target.id}" and ALL related records?\n\nThis will also delete:\n- Related Invoice (if exists)\n\nThis action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
          confirmLabel="Delete All"
          danger
        />
      )}
    </div>
  );
}
