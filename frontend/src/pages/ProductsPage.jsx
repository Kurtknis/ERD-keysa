import { AlertTriangle, Edit2, PackagePlus, Search, Sheet, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Card, ConfirmModal, EditModal, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { exportProducts } from '../utils/exportExcel';
import { filterByText, formatCurrency } from '../utils/formatters';

const EMPTY_FORM = { name: '', price: '' };

// Warning modal — no window.alert, pure React state
function LinkedWarningModal({ productName, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface, #1e2533)',
          border: '1px solid var(--border, #2e3a4e)',
          borderRadius: 12, padding: 28, maxWidth: 400, width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={20} color="#f59e0b" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Cannot Delete Product</span>
        </div>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 20, opacity: 0.8 }}>
          <strong>{productName}</strong> tidak dapat dihapus karena sudah digunakan di
          satu atau lebih <strong>Purchase Request</strong>. Hapus PR terkait terlebih dahulu.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="primary-button" onClick={onClose}>Mengerti</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { products, addProductRecord, updateProductRecord, deleteProductRecord } = useProcurement();
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'confirm-delete' | 'warn' | 'edit'
  const [target, setTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '' });

  const filteredProducts = useMemo(
    () => filterByText(products, search, (product) => [product.id, product.name, product.price]),
    [products, search],
  );

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) { window.alert('Product name is required.'); return; }
    if (Number(form.price) <= 0) { window.alert('Product price must be greater than zero.'); return; }
    try {
      addProductRecord(form);
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error('Add product failed:', error);
      window.alert(error.message);
    }
  }

  // Buka confirm modal dulu — jangan langsung delete
  function handleDeleteClick(product) {
    setTarget(product);
    setModal('confirm-delete');
  }

  // Buka edit modal
  function handleEditClick(product) {
    setTarget(product);
    setEditForm({ name: product.name, price: product.price });
    setModal('edit');
  }

  // Save edit
  function handleEditSave() {
    if (!target) return;
    try {
      updateProductRecord(target.id, editForm);
      closeModal();
    } catch (error) {
      console.error('Update product failed:', error);
      window.alert(error.message);
    }
  }

  // Dipanggil setelah user confirm — ini yang actually delete
  function handleDeleteConfirm() {
    if (!target) return;
    try {
      deleteProductRecord(target.id);
      setModal(null);
      setTarget(null);
    } catch (error) {
      // Jangan re-throw — tampilkan warn modal aja
      console.error('Delete product failed:', error);
      setModal('warn'); // target masih ada, nama bisa ditampilkan
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
          title="Add Product"
          subtitle="Register new products so they can be reused throughout the procurement flow."
          action={<span className="section-chip">Master Data</span>}
        >
          <ActionHint
            title="Why this matters"
            description="Products created here become selectable inside Purchase Requests and determine invoice amounts."
          />
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Product Name
              <input
                value={form.name}
                onChange={(e) => setForm(c => ({ ...c, name: e.target.value }))}
                placeholder="Enter product name"
              />
            </label>
            <label>
              Price
              <input
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={(e) => setForm(c => ({ ...c, price: e.target.value }))}
                placeholder="Enter price"
              />
            </label>
            <button className="primary-button" type="submit">
              <PackagePlus size={16} /> Add Product
            </button>
            <p className="form-helper">Creates a new reusable product record and saves it instantly to localStorage.</p>
          </form>
        </Card>

        <Card
          title="Search And Export"
          subtitle="Find products quickly and export the current master list for reporting."
          action={
            <button className="secondary-button" onClick={() => exportProducts(products)} type="button">
              <Sheet size={16} /> Export Excel
            </button>
          }
        >
          <ActionHint
            title="What this button does"
            description="Export Excel downloads the full persisted product list as a spreadsheet using the xlsx library."
          />
          <div className="field-with-icon">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, or price"
            />
          </div>
        </Card>
      </div>

      <Card title="Product List" subtitle={`${filteredProducts.length} product(s) shown`}>
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            title="No products found"
            description="Try a different search or add a new product to populate the master catalog."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Price</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="secondary-button small-button"
                          onClick={(e) => { e.stopPropagation(); handleEditClick(product); }}
                          type="button"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          className="danger-button small-button"
                          onClick={() => handleDeleteClick(product)}
                          type="button"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit modal */}
      {modal === 'edit' && target && (
        <EditModal
          title={`Edit Product — ${target.name}`}
          fields={[
            {
              name: 'name',
              label: 'Product Name',
              value: editForm.name,
              onChange: (e) => setEditForm((c) => ({ ...c, name: e.target.value })),
              required: true,
            },
            {
              name: 'price',
              label: 'Price',
              type: 'number',
              value: editForm.price,
              onChange: (e) => setEditForm((c) => ({ ...c, price: e.target.value })),
              required: true,
              min: '0',
              step: '0.01',
            },
          ]}
          onSave={handleEditSave}
          onClose={closeModal}
        />
      )}

      {/* Confirm delete modal */}
      {modal === 'confirm-delete' && target && (
        <ConfirmModal
          title="Delete Product"
          message={`Hapus "${target.name}"? Aksi ini tidak bisa dibatalkan.\n\nHanya bisa dihapus jika belum dipakai di Purchase Request manapun.`}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
          confirmLabel="Delete"
          danger
        />
      )}

      {/* Linked warning modal */}
      {modal === 'warn' && target && (
        <LinkedWarningModal productName={target.name} onClose={closeModal} />
      )}
    </div>
  );
}