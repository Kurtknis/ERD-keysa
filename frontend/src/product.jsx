import React, { useState } from 'react';
import { Plus, Search, Download, Edit2, Trash2, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Modal, ConfirmModal, EmptyState } from '../components/common';
import { formatCurrency, generateId, categories, units } from '../data/mockData';
import { exportProductsToExcel } from '../utils/exportExcel';

const EMPTY = {
  id: '', name: '', category: 'Electronics', unit: 'Unit',
  price: '', stock: '', supplier: '', status: 'active',
};

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [search, setSearch]             = useState('');
  const [catFilter, setCatFilter]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal]               = useState(null);
  const [form, setForm]                 = useState(EMPTY);
  const [target, setTarget]             = useState(null);
  const [errors, setErrors]             = useState({});

  const filtered = products.filter(p => {
    const q       = search.toLowerCase();
    const matchQ  = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q);
    const matchC  = !catFilter    || p.category === catFilter;
    const matchSt = !statusFilter || p.status === statusFilter;
    return matchQ && matchC && matchSt;
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim())                       e.name     = 'Product name is required';
    if (!form.price || Number(form.price) <= 0)  e.price    = 'Valid price required';
    if (form.stock === '' || Number(form.stock) < 0) e.stock = 'Valid stock required';
    if (!form.supplier.trim())                   e.supplier = 'Supplier is required';
    return e;
  };

  const openAdd    = () => { setForm({ ...EMPTY, id: generateId('P') }); setErrors({}); setModal('add'); };
  const openEdit   = p  => { setForm({ ...p }); setErrors({}); setModal('edit'); };
  const openDelete = p  => { setTarget(p); setModal('delete'); };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
    if (modal === 'add') addProduct(data); else updateProduct(data);
    setModal(null);
  };

  const Field = ({ label, name, type = 'text', required, options }) => (
    <div className="form-group">
      <label className={`form-label${required ? ' required' : ''}`}>{label}</label>
      {options ? (
        <select
          className="form-select"
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        >
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          className={`form-input${errors[name] ? ' error' : ''}`}
          type={type}
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="page-content">

      {/* Header */}
      <div className="card-header mb-20">
        <div>
          <div className="card-title">Product Catalog</div>
          <div className="card-subtitle">{products.length} products registered in the system</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => exportProductsToExcel(products)}>
            <Download size={14} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={14} />
          <input
            className="search-input"
            placeholder="Search by name, ID or supplier…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Stock</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState
                    icon={Package}
                    title="No products found"
                    desc="Try adjusting your filters or add a new product."
                  />
                </td>
              </tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td className="td-mono">{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>
                  <span style={{
                    fontSize: 11.5, padding: '3px 9px', borderRadius: 20,
                    background: 'var(--bg-3)', color: 'var(--text-2)', fontWeight: 500,
                  }}>
                    {p.category}
                  </span>
                </td>
                <td style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{p.unit}</td>
                <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>{formatCurrency(p.price)}</td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    color: p.stock < 5 ? 'var(--red)' : 'var(--green)',
                  }}>
                    {p.stock}
                  </span>
                </td>
                <td style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{p.supplier}</td>
                <td><Badge status={p.status} /></td>
                <td>
                  <div className="td-actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}><Edit2 size={13} /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => openDelete(p)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'Add Product' : 'Edit Product'}
          onClose={() => setModal(null)}
          width="580px"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </>
          }
        >
          <div className="form-grid form-grid-2">
            <Field label="Product ID"       name="id"       required />
            <Field label="Product Name"     name="name"     required />
            <Field label="Category"         name="category" options={categories} />
            <Field label="Unit"             name="unit"     options={units} />
            <Field label="Unit Price (IDR)" name="price"    type="number" required />
            <Field label="Current Stock"    name="stock"    type="number" required />
            <Field label="Supplier"         name="supplier" required />
            <Field label="Status"           name="status"   options={['active', 'inactive']} />
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {modal === 'delete' && target && (
        <ConfirmModal
          title="Delete Product"
          message={`Are you sure you want to delete "${target.name}"? This action cannot be undone.`}
          confirmText="Delete"
          isDangerous
          onConfirm={() => { deleteProduct(target.id); setModal(null); }}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}