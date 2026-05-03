import React, { useState } from 'react';
import { Plus, Search, Download, Eye, ShoppingCart, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Modal, EmptyState, DetailItem } from '../components/common';
import { formatCurrency, formatDate, generateId, units } from '../data/mockData';
import { exportPOsToExcel } from '../utils/exportExcel';

const EMPTY_PO = {
  id: '', prId: '', vendor: '', vendorAddress: '', vendorContact: '',
  createdBy: '', createdDate: new Date().toISOString().slice(0, 10),
  deliveryDate: '', paymentTerms: 'Net 30', status: 'open',
  shippingAddress: '', notes: '', items: [],
  subtotal: 0, tax: 0, totalAmount: 0,
};

export default function PurchaseOrders() {
  const { pos, prs, employees, products, addPO } = useApp();
  const [search, setSearch]         = useState('');
  const [statusF, setStatusF]       = useState('');
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(EMPTY_PO);
  const [items, setItems]           = useState([]);
  const [target, setTarget]         = useState(null);
  const [errors, setErrors]         = useState({});

  const filtered = pos.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.id.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q) || p.prId.toLowerCase().includes(q))
      && (!statusF || p.status === statusF);
  });

  const approvedPRs = prs.filter(p => p.status === 'approved');
  const empName     = id => employees.find(e => e.id === id)?.name || id || '—';

  const calcAmounts = (its) => {
    const sub = its.reduce((s, i) => s + Number(i.qty) * Number(i.unitPrice), 0);
    const tax  = Math.round(sub * 0.1);
    return { subtotal: sub, tax, totalAmount: sub + tax };
  };

  const openAdd  = () => { setForm({ ...EMPTY_PO, id: generateId('PO') }); setItems([{ productId:'', productName:'', qty:1, unit:'Unit', unitPrice:0, totalPrice:0 }]); setErrors({}); setModal('add'); };
  const openView = po => { setTarget(po); setModal('view'); };

  const selectPR = prId => {
    const pr = prs.find(p => p.id === prId);
    if (!pr) return;
    const its = pr.items.map(i => ({ ...i, unitPrice: i.estimatedPrice, totalPrice: i.qty * i.estimatedPrice }));
    setItems(its);
    setForm(f => ({ ...f, prId }));
  };

  const changeItem = (idx, field, val) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === 'productId') {
        const p = products.find(p => p.id === val);
        if (p) { next[idx].productName = p.name; next[idx].unit = p.unit; next[idx].unitPrice = p.price; }
      }
      next[idx].totalPrice = Number(next[idx].qty) * Number(next[idx].unitPrice);
      return next;
    });
  };

  const addItem    = ()  => setItems(p => [...p, { productId:'', productName:'', qty:1, unit:'Unit', unitPrice:0, totalPrice:0 }]);
  const delItem    = idx => setItems(p => p.filter((_, i) => i !== idx));

  const validate = () => {
    const e = {};
    if (!form.prId)            e.prId        = 'Must link to an approved PR';
    if (!form.vendor.trim())   e.vendor      = 'Vendor name required';
    if (!form.createdBy)       e.createdBy   = 'Created by required';
    if (!form.deliveryDate)    e.deliveryDate = 'Delivery date required';
    if (!items.length)         e.items       = 'At least one item required';
    return e;
  };

  const save = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const amounts = calcAmounts(items);
    addPO({ ...form, items: items.map(it => ({ ...it, qty: +it.qty, unitPrice: +it.unitPrice, totalPrice: +it.qty * +it.unitPrice })), ...amounts });
    setModal(null);
  };

  return (
    <div className="page-content">
      <div className="card-header mb-20">
        <div>
          <div className="card-title">Purchase Orders</div>
          <div className="card-subtitle">{pos.length} total orders issued</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" onClick={() => exportPOsToExcel(pos)}><Download size={14}/> Export</button>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14}/> Create PO</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <Search size={14}/>
          <input className="search-input" placeholder="Search by PO ID, vendor or PR reference…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>PO ID</th><th>PR Reference</th><th>Vendor</th><th>Created Date</th>
            <th>Delivery Date</th><th>Payment Terms</th><th>Status</th><th>Total Amount</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {!filtered.length ? (
              <tr><td colSpan={9}><EmptyState icon={ShoppingCart} title="No purchase orders" desc="Create a PO from an approved Purchase Request."/></td></tr>
            ) : filtered.map(po => (
              <tr key={po.id}>
                <td className="td-mono">{po.id}</td>
                <td className="td-mono">{po.prId}</td>
                <td style={{ fontWeight:600 }}>{po.vendor}</td>
                <td style={{ fontSize:12.5 }}>{formatDate(po.createdDate)}</td>
                <td style={{ fontSize:12.5 }}>{formatDate(po.deliveryDate)}</td>
                <td style={{ fontSize:12.5, color:'var(--text-2)' }}>{po.paymentTerms}</td>
                <td><Badge status={po.status}/></td>
                <td style={{ fontWeight:700 }}>{formatCurrency(po.totalAmount)}</td>
                <td><div className="td-actions"><button className="btn btn-sm btn-ghost" onClick={() => openView(po)}><Eye size={13}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create PO Modal */}
      {modal === 'add' && (
        <Modal title="Create Purchase Order" onClose={() => setModal(null)} width="800px"
          footer={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Create PO</button></>}>
          <div className="alert alert-info" style={{ marginBottom:18 }}>
            <span>A Purchase Order must be linked to an <strong>approved Purchase Request</strong>.</span>
          </div>
          <div className="form-grid form-grid-2" style={{ marginBottom:20 }}>
            <div className="form-group">
              <label className="form-label required">Link to Approved PR</label>
              <select className={`form-select${errors.prId?' error':''}`} value={form.prId} onChange={e => { setForm(f => ({ ...f, prId:e.target.value })); selectPR(e.target.value); }}>
                <option value="">— Select Approved PR —</option>
                {approvedPRs.map(pr => <option key={pr.id} value={pr.id}>{pr.id} — {pr.title}</option>)}
              </select>
              {errors.prId && <span className="form-error">{errors.prId}</span>}
            </div>
            <div className="form-group">
              <label className="form-label required">Created By</label>
              <select className={`form-select${errors.createdBy?' error':''}`} value={form.createdBy} onChange={e => setForm(f => ({ ...f, createdBy:e.target.value }))}>
                <option value="">— Select Employee —</option>
                {employees.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              {errors.createdBy && <span className="form-error">{errors.createdBy}</span>}
            </div>
            <div className="form-group">
              <label className="form-label required">Vendor Name</label>
              <input className={`form-input${errors.vendor?' error':''}`} value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor:e.target.value }))} placeholder="PT / CV Vendor Name"/>
              {errors.vendor && <span className="form-error">{errors.vendor}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Contact</label>
              <input className="form-input" value={form.vendorContact} onChange={e => setForm(f => ({ ...f, vendorContact:e.target.value }))} placeholder="021-xxxxxxx"/>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Vendor Address</label>
              <input className="form-input" value={form.vendorAddress} onChange={e => setForm(f => ({ ...f, vendorAddress:e.target.value }))} placeholder="Full vendor address"/>
            </div>
            <div className="form-group">
              <label className="form-label required">Expected Delivery Date</label>
              <input type="date" className={`form-input${errors.deliveryDate?' error':''}`} value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate:e.target.value }))}/>
              {errors.deliveryDate && <span className="form-error">{errors.deliveryDate}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <select className="form-select" value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms:e.target.value }))}>
                {['Net 30','Net 14','Net 7','COD','Down Payment 50%'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Shipping Address</label>
              <input className="form-input" value={form.shippingAddress} onChange={e => setForm(f => ({ ...f, shippingAddress:e.target.value }))} placeholder="Delivery destination address"/>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Notes</label>
              <textarea className="form-select" style={{ height:68, resize:'vertical', padding:'9px 12px' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} placeholder="Special instructions or delivery notes…"/>
            </div>
          </div>

          <div style={{ borderTop:'1px solid var(--border)', paddingTop:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Order Items <span style={{ fontWeight:400, color:'var(--text-2)', fontSize:12 }}>(PPN 10% applied)</span></div>
              <button className="btn btn-sm btn-secondary" onClick={addItem}><Plus size={13}/> Add Item</button>
            </div>
            <div className="table-wrap" style={{ marginBottom:0 }}>
              <table>
                <thead><tr><th>Product</th><th style={{width:80}}>Qty</th><th style={{width:90}}>Unit</th><th style={{width:150}}>Unit Price</th><th style={{width:140}}>Total</th><th style={{width:40}}></th></tr></thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <select className="form-select" style={{ fontSize:12 }} value={it.productId} onChange={e => changeItem(idx,'productId',e.target.value)}>
                          <option value="">— Select —</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {it.productName && !it.productId && <div style={{ fontSize:11, color:'var(--text-2)', marginTop:3 }}>{it.productName}</div>}
                      </td>
                      <td><input type="number" min={1} className="form-input" style={{ fontSize:12 }} value={it.qty} onChange={e => changeItem(idx,'qty',e.target.value)}/></td>
                      <td><select className="form-select" style={{ fontSize:12 }} value={it.unit} onChange={e => changeItem(idx,'unit',e.target.value)}>{units.map(u => <option key={u}>{u}</option>)}</select></td>
                      <td><input type="number" min={0} className="form-input" style={{ fontSize:12 }} value={it.unitPrice} onChange={e => changeItem(idx,'unitPrice',e.target.value)}/></td>
                      <td style={{ fontWeight:700, fontSize:13 }}>{formatCurrency(it.qty * it.unitPrice)}</td>
                      <td>{items.length > 1 && <button className="btn btn-sm btn-danger" onClick={() => delItem(idx)}><Trash2 size={12}/></button>}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {(() => { const a = calcAmounts(items); return (<>
                    <tr><td colSpan={4} style={{ textAlign:'right', padding:'10px 16px', color:'var(--text-2)', fontSize:12 }}>Subtotal</td><td style={{ fontWeight:600 }}>{formatCurrency(a.subtotal)}</td><td/></tr>
                    <tr><td colSpan={4} style={{ textAlign:'right', padding:'4px 16px', color:'var(--text-2)', fontSize:12 }}>PPN 10%</td><td style={{ fontWeight:600 }}>{formatCurrency(a.tax)}</td><td/></tr>
                    <tr><td colSpan={4} style={{ textAlign:'right', padding:'10px 16px', fontWeight:700 }}>Total Amount</td><td style={{ fontWeight:800, color:'var(--accent)', fontSize:15 }}>{formatCurrency(a.totalAmount)}</td><td/></tr>
                  </>); })()}
                </tfoot>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* View PO Modal */}
      {modal === 'view' && target && (
        <Modal title={target.id} onClose={() => setModal(null)} width="720px"
          footer={<button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>}>
          <div style={{ marginBottom:18 }}>
            <DetailItem label="PO ID"           value={target.id}/>
            <DetailItem label="PR Reference"    value={target.prId}/>
            <DetailItem label="Vendor"          value={target.vendor}/>
            <DetailItem label="Vendor Contact"  value={target.vendorContact}/>
            <DetailItem label="Created By"      value={empName(target.createdBy)}/>
            <DetailItem label="Created Date"    value={formatDate(target.createdDate)}/>
            <DetailItem label="Delivery Date"   value={formatDate(target.deliveryDate)}/>
            <DetailItem label="Payment Terms"   value={target.paymentTerms}/>
            <DetailItem label="Status"          value={<Badge status={target.status}/>}/>
            {target.shippingAddress && <DetailItem label="Shipping Address" value={target.shippingAddress}/>}
          </div>
          {target.notes && (
            <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 14px', marginBottom:16, fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>{target.notes}</div>
          )}
          <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Order Items</div>
          <div className="table-wrap" style={{ marginBottom:0 }}>
            <table>
              <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>Total</th></tr></thead>
              <tbody>
                {target.items.map((it, i) => (
                  <tr key={i}>
                    <td className="td-mono">{i+1}</td>
                    <td style={{ fontWeight:600 }}>{it.productName}</td>
                    <td>{it.qty}</td>
                    <td style={{ color:'var(--text-2)' }}>{it.unit}</td>
                    <td>{formatCurrency(it.unitPrice)}</td>
                    <td style={{ fontWeight:700 }}>{formatCurrency(it.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={5} style={{ textAlign:'right', padding:'10px 16px', color:'var(--text-2)', fontSize:12 }}>Subtotal</td><td style={{ fontWeight:600 }}>{formatCurrency(target.subtotal)}</td></tr>
                <tr><td colSpan={5} style={{ textAlign:'right', padding:'4px 16px', color:'var(--text-2)', fontSize:12 }}>PPN 10%</td><td style={{ fontWeight:600 }}>{formatCurrency(target.tax)}</td></tr>
                <tr><td colSpan={5} style={{ textAlign:'right', padding:'10px 16px', fontWeight:700 }}>Total Amount</td><td style={{ fontWeight:800, color:'var(--accent)', fontSize:15 }}>{formatCurrency(target.totalAmount)}</td></tr>
              </tfoot>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}