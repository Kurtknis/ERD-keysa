import React, { useState } from 'react';
import { Plus, Search, Download, Eye, CheckCircle, XCircle, FileText, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Modal, EmptyState, DetailItem } from '../components/common';
import { formatCurrency, formatDate, generateId, departments, units } from '../data/mockData';
import { exportPRsToExcel } from '../utils/exportExcel';

const EMPTY_ITEM = { productId: '', productName: '', qty: 1, unit: 'Unit', estimatedPrice: 0, totalPrice: 0 };
const EMPTY_PR = {
  id: '', title: '', requestedBy: '', department: 'IT', priority: 'Medium',
  status: 'pending', requestDate: new Date().toISOString().slice(0, 10),
  neededDate: '', approvedBy: null, approvedDate: null, notes: '', items: [], totalAmount: 0,
};
const P_COLOR = { Low: 'var(--cyan)', Medium: 'var(--yellow)', High: 'var(--orange)', Critical: 'var(--red)' };
const P_BG    = { Low: 'var(--cyan-dim)', Medium: 'var(--yellow-dim)', High: 'var(--orange-dim)', Critical: 'var(--red-dim)' };

export default function PurchaseRequests() {
  const { prs, employees, products, addPR, updatePR, approvePR, rejectPR } = useApp();
  const [search, setSearch]         = useState('');
  const [statusF, setStatusF]       = useState('');
  const [deptF, setDeptF]           = useState('');
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(EMPTY_PR);
  const [items, setItems]           = useState([]);
  const [target, setTarget]         = useState(null);
  const [approveM, setApproveM]     = useState(null);
  const [rejectM, setRejectM]       = useState(null);
  const [approver, setApprover]     = useState('');
  const [rejectR, setRejectR]       = useState('');
  const [errors, setErrors]         = useState({});

  const filtered = prs.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.id.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.department.toLowerCase().includes(q))
      && (!statusF || p.status === statusF)
      && (!deptF   || p.department === deptF);
  });

  const name = id => employees.find(e => e.id === id)?.name || id || '—';
  const total = its => its.reduce((s, i) => s + Number(i.qty) * Number(i.estimatedPrice), 0);

  const openAdd  = () => { setForm({ ...EMPTY_PR, id: generateId('PR') }); setItems([{ ...EMPTY_ITEM }]); setErrors({}); setModal('add'); };
  const openEdit = pr => { setForm({ ...pr }); setItems(pr.items.map(i => ({ ...i }))); setErrors({}); setModal('edit'); };
  const openView = pr => { setTarget(pr); setModal('view'); };

  const changeItem = (idx, field, val) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === 'productId') {
        const p = products.find(p => p.id === val);
        if (p) { next[idx].productName = p.name; next[idx].unit = p.unit; next[idx].estimatedPrice = p.price; }
      }
      next[idx].totalPrice = Number(next[idx].qty) * Number(next[idx].estimatedPrice);
      return next;
    });
  };

  const addItem    = ()  => setItems(p => [...p, { ...EMPTY_ITEM }]);
  const delItem    = idx => setItems(p => p.filter((_, i) => i !== idx));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.requestedBy)  e.requestedBy = 'Requester required';
    if (!form.neededDate)   e.neededDate  = 'Needed date required';
    if (!items.length)      e.items = 'At least one item required';
    items.forEach((it, i) => {
      if (!it.productName.trim())                         e[`n${i}`] = `Item ${i+1}: name required`;
      if (!it.qty || Number(it.qty) <= 0)                 e[`q${i}`] = `Item ${i+1}: qty invalid`;
      if (!it.estimatedPrice || Number(it.estimatedPrice) <= 0) e[`p${i}`] = `Item ${i+1}: price invalid`;
    });
    return e;
  };

  const save = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const pr = { ...form, items: items.map(it => ({ ...it, qty: +it.qty, estimatedPrice: +it.estimatedPrice, totalPrice: +it.qty * +it.estimatedPrice })), totalAmount: total(items) };
    modal === 'add' ? addPR(pr) : updatePR(pr);
    setModal(null);
  };

  const doApprove = () => { if (!approver) return; approvePR(approveM.id, approver, employees); setApproveM(null); setApprover(''); };
  const doReject  = () => { if (!rejectR.trim()) return; rejectPR(rejectM.id, rejectR); setRejectM(null); setRejectR(''); };

  const managers = employees.filter(e => ['Manager','Head','Director'].includes(e.role) && e.status === 'active');

  return (
    <div className="page-content">
      <div className="card-header mb-20">
        <div>
          <div className="card-title">Purchase Requests</div>
          <div className="card-subtitle">{prs.length} total &middot; {prs.filter(p => p.status === 'pending').length} pending</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" onClick={() => exportPRsToExcel(prs, employees)}><Download size={14}/> Export</button>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14}/> New Request</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <Search size={14}/>
          <input className="search-input" placeholder="Search by ID, title or department…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="filter-select" value={deptF} onChange={e => setDeptF(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>PR ID</th><th>Title</th><th>Department</th><th>Requested By</th>
            <th>Priority</th><th>Request Date</th><th>Needed By</th>
            <th>Total Amount</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {!filtered.length ? (
              <tr><td colSpan={10}><EmptyState icon={FileText} title="No purchase requests" desc="Create a new PR to get started."/></td></tr>
            ) : filtered.map(pr => (
              <tr key={pr.id}>
                <td className="td-mono">{pr.id}</td>
                <td style={{ fontWeight:600, maxWidth:200 }}>{pr.title}</td>
                <td style={{ fontSize:12.5 }}>{pr.department}</td>
                <td style={{ fontSize:12.5 }}>{name(pr.requestedBy)}</td>
                <td>
                  <span style={{ fontSize:11.5, fontWeight:700, padding:'3px 9px', borderRadius:20, color: P_COLOR[pr.priority]||'var(--text-2)', background: P_BG[pr.priority]||'var(--bg-3)' }}>
                    {pr.priority}
                  </span>
                </td>
                <td style={{ fontSize:12.5 }}>{formatDate(pr.requestDate)}</td>
                <td style={{ fontSize:12.5 }}>{formatDate(pr.neededDate)}</td>
                <td style={{ fontWeight:700 }}>{formatCurrency(pr.totalAmount)}</td>
                <td><Badge status={pr.status}/></td>
                <td>
                  <div className="td-actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => openView(pr)}><Eye size={13}/></button>
                    {pr.status === 'pending' && <>
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(pr)}><Edit2 size={13}/></button>
                      <button className="btn btn-sm" style={{ background:'var(--green-dim)', color:'var(--green)', border:'1px solid rgba(34,197,94,0.2)' }} onClick={() => setApproveM(pr)}><CheckCircle size={13}/></button>
                      <button className="btn btn-sm btn-danger" onClick={() => setRejectM(pr)}><XCircle size={13}/></button>
                    </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'New Purchase Request' : 'Edit Purchase Request'} onClose={() => setModal(null)} width="780px"
          footer={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'add' ? 'Submit Request' : 'Save Changes'}</button></>}>
          <div className="form-grid form-grid-2" style={{ marginBottom:20 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label required">PR Title</label>
              <input className={`form-input${errors.title?' error':''}`} value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} placeholder="e.g. IT Equipment Q2 2025"/>
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label className="form-label required">Requested By</label>
              <select className={`form-select${errors.requestedBy?' error':''}`} value={form.requestedBy} onChange={e => setForm(f => ({ ...f, requestedBy:e.target.value }))}>
                <option value="">— Select Employee —</option>
                {employees.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
              </select>
              {errors.requestedBy && <span className="form-error">{errors.requestedBy}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={form.department} onChange={e => setForm(f => ({ ...f, department:e.target.value }))}>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority:e.target.value }))}>
                {['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">Needed By Date</label>
              <input type="date" className={`form-input${errors.neededDate?' error':''}`} value={form.neededDate} onChange={e => setForm(f => ({ ...f, neededDate:e.target.value }))}/>
              {errors.neededDate && <span className="form-error">{errors.neededDate}</span>}
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Notes / Justification</label>
              <textarea className="form-select" style={{ height:72, resize:'vertical', padding:'9px 12px' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} placeholder="Business justification…"/>
            </div>
          </div>

          <div style={{ borderTop:'1px solid var(--border)', paddingTop:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Requested Items</div>
              <button className="btn btn-sm btn-secondary" onClick={addItem}><Plus size={13}/> Add Item</button>
            </div>
            {errors.items && <div className="alert alert-warning" style={{ marginBottom:10 }}><span>{errors.items}</span></div>}
            <div className="table-wrap" style={{ marginBottom:0 }}>
              <table>
                <thead><tr><th>Product</th><th style={{width:80}}>Qty</th><th style={{width:90}}>Unit</th><th style={{width:150}}>Est. Price/Unit</th><th style={{width:140}}>Total</th><th style={{width:40}}></th></tr></thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <select className="form-select" style={{ fontSize:12 }} value={it.productId} onChange={e => changeItem(idx,'productId',e.target.value)}>
                          <option value="">— Select product —</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {!it.productId && <input className="form-input" style={{ fontSize:12, marginTop:5 }} value={it.productName} onChange={e => changeItem(idx,'productName',e.target.value)} placeholder="Or type manually"/>}
                      </td>
                      <td><input type="number" min={1} className="form-input" style={{ fontSize:12 }} value={it.qty} onChange={e => changeItem(idx,'qty',e.target.value)}/></td>
                      <td><select className="form-select" style={{ fontSize:12 }} value={it.unit} onChange={e => changeItem(idx,'unit',e.target.value)}>{units.map(u => <option key={u}>{u}</option>)}</select></td>
                      <td><input type="number" min={0} className="form-input" style={{ fontSize:12 }} value={it.estimatedPrice} onChange={e => changeItem(idx,'estimatedPrice',e.target.value)}/></td>
                      <td style={{ fontWeight:700, fontSize:13 }}>{formatCurrency(it.qty * it.estimatedPrice)}</td>
                      <td>{items.length > 1 && <button className="btn btn-sm btn-danger" onClick={() => delItem(idx)}><Trash2 size={12}/></button>}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr>
                  <td colSpan={4} style={{ textAlign:'right', padding:'12px 16px', fontWeight:700, color:'var(--text-2)', fontSize:12 }}>Total Estimated Amount</td>
                  <td style={{ fontWeight:800, fontSize:15, color:'var(--accent)' }}>{formatCurrency(total(items))}</td>
                  <td/>
                </tr></tfoot>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* View */}
      {modal === 'view' && target && (
        <Modal title={target.id} onClose={() => setModal(null)} width="720px"
          footer={<>
            {target.status === 'pending' && <>
              <button className="btn" style={{ background:'var(--green-dim)', color:'var(--green)', border:'1px solid rgba(34,197,94,0.2)' }} onClick={() => { setModal(null); setApproveM(target); }}><CheckCircle size={14}/> Approve</button>
              <button className="btn btn-danger" onClick={() => { setModal(null); setRejectM(target); }}><XCircle size={14}/> Reject</button>
            </>}
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
          </>}>
          <div style={{ marginBottom:16 }}>
            <DetailItem label="PR ID" value={target.id}/>
            <DetailItem label="Title" value={target.title}/>
            <DetailItem label="Department" value={target.department}/>
            <DetailItem label="Priority" value={<span style={{ color:P_COLOR[target.priority], fontWeight:700 }}>{target.priority}</span>}/>
            <DetailItem label="Requested By" value={name(target.requestedBy)}/>
            <DetailItem label="Request Date" value={formatDate(target.requestDate)}/>
            <DetailItem label="Needed By" value={formatDate(target.neededDate)}/>
            <DetailItem label="Status" value={<Badge status={target.status}/>}/>
            {target.approvedBy    && <DetailItem label="Approved By"   value={name(target.approvedBy)}/>}
            {target.approvedDate  && <DetailItem label="Approved Date" value={formatDate(target.approvedDate)}/>}
            {target.rejectedReason && <DetailItem label="Rejection Reason" value={target.rejectedReason}/>}
          </div>
          {target.notes && <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 14px', marginBottom:16, fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>{target.notes}</div>}
          <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Requested Items</div>
          <div className="table-wrap" style={{ marginBottom:0 }}>
            <table>
              <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Unit</th><th>Est. Price/Unit</th><th>Total</th></tr></thead>
              <tbody>
                {target.items.map((it, i) => (
                  <tr key={i}>
                    <td className="td-mono">{i+1}</td>
                    <td style={{ fontWeight:600 }}>{it.productName}</td>
                    <td>{it.qty}</td>
                    <td style={{ color:'var(--text-2)' }}>{it.unit}</td>
                    <td>{formatCurrency(it.estimatedPrice)}</td>
                    <td style={{ fontWeight:700 }}>{formatCurrency(it.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr>
                <td colSpan={5} style={{ textAlign:'right', padding:'12px 16px', fontWeight:700 }}>Grand Total</td>
                <td style={{ fontWeight:800, color:'var(--accent)', fontSize:15 }}>{formatCurrency(target.totalAmount)}</td>
              </tr></tfoot>
            </table>
          </div>
        </Modal>
      )}

      {/* Approve */}
      {approveM && (
        <Modal title="Approve Purchase Request" onClose={() => setApproveM(null)} width="460px"
          footer={<><button className="btn btn-ghost" onClick={() => setApproveM(null)}>Cancel</button><button className="btn" style={{ background:'var(--green)', color:'#fff', borderColor:'var(--green)' }} onClick={doApprove} disabled={!approver}><CheckCircle size={14}/> Approve</button></>}>
          <div className="alert alert-info" style={{ marginBottom:20 }}><span>Approving <strong>{approveM.id}</strong> — {approveM.title}</span></div>
          <div className="form-group">
            <label className="form-label required">Approved By</label>
            <select className="form-select" value={approver} onChange={e => setApprover(e.target.value)}>
              <option value="">— Select Approver —</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name} — {m.position}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {/* Reject */}
      {rejectM && (
        <Modal title="Reject Purchase Request" onClose={() => setRejectM(null)} width="460px"
          footer={<><button className="btn btn-ghost" onClick={() => setRejectM(null)}>Cancel</button><button className="btn btn-danger" style={{ background:'var(--red)', color:'#fff', borderColor:'var(--red)' }} onClick={doReject} disabled={!rejectR.trim()}><XCircle size={14}/> Reject</button></>}>
          <div className="alert alert-warning" style={{ marginBottom:20 }}><span>Rejecting <strong>{rejectM.id}</strong> — {rejectM.title}</span></div>
          <div className="form-group">
            <label className="form-label required">Rejection Reason</label>
            <textarea className="form-select" style={{ height:96, resize:'vertical', padding:'9px 12px' }} value={rejectR} onChange={e => setRejectR(e.target.value)} placeholder="Provide a clear reason…"/>
          </div>
        </Modal>
      )}
    </div>
  );
}