import React, { useState } from 'react';
import { Plus, Search, Download, Edit2, Trash2, Users, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Modal, ConfirmModal, EmptyState } from '../components/common';
import { generateId, departments, formatDate } from '../data/mockData';
import { exportEmployeesToExcel } from '../utils/exportExcel';

const EMPTY = {
  id: '', nip: '', name: '', department: 'IT', position: '',
  email: '', phone: '', role: 'Staff', status: 'active', joinDate: '',
};

// ── Inline warning modal buat relasi conflict ──────────────────────────────
function LinkedWarningModal({ employee, relations, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 28, maxWidth: 420, width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <AlertTriangle size={20} color="var(--warning, #f59e0b)" />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>
            Cannot Delete Employee
          </span>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 10, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-1)' }}>{employee.name}</strong> tidak dapat dihapus
          karena masih terhubung dengan:
        </p>
        <ul style={{ margin: '0 0 16px 18px', padding: 0, fontSize: 13, color: 'var(--text-2)' }}>
          {relations.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
        <p style={{ fontSize: 12.5, color: 'var(--text-3, #6b7280)', marginBottom: 20 }}>
          Hapus atau ubah data terkait terlebih dahulu sebelum menghapus karyawan ini.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>Mengerti</button>
        </div>
      </div>
    </div>
  );
}

export default function Employees() {
  const { employees, prs, pos, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'delete' | 'warn'
  const [form, setForm] = useState(EMPTY);
  const [target, setTarget] = useState(null);
  const [warnRelations, setWarnRelations] = useState([]);
  const [errors, setErrors] = useState({});

  const filtered = (employees || []).filter(e => {
    const q = search.toLowerCase();
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.nip.includes(q);
    const matchD = !deptFilter || e.department === deptFilter;
    const matchSt = !statusFilter || e.status === statusFilter;
    return matchQ && matchD && matchSt;
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.nip.trim()) e.nip = 'NIP is required';
    if (!form.position.trim()) e.position = 'Position is required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email required';
    if (!form.joinDate) e.joinDate = 'Join date is required';
    return e;
  };

  const openAdd = () => {
    const yr = new Date().getFullYear();
    const num = String(employees.length + 1).padStart(4, '0');
    setForm({ ...EMPTY, id: generateId('E'), nip: `${yr}${num}` });
    setErrors({}); setModal('add');
  };
  const openEdit = e => { setForm({ ...e }); setErrors({}); setModal('edit'); };

  const openDelete = e => {
    const linkedPR = (prs || []).filter(
      pr => pr.requestedBy === e.id || pr.approvedBy === e.id
    ).length;
    const linkedPO = (pos || []).filter(
      po => po.createdBy === e.id
    ).length;

    if (linkedPR > 0 || linkedPO > 0) {
      const relations = [];
      if (linkedPR > 0) relations.push(`${linkedPR} Purchase Request`);
      if (linkedPO > 0) relations.push(`${linkedPO} Purchase Order`);
      // ← custom modal, bukan alert()
      setTarget(e);
      setWarnRelations(relations);
      setModal('warn');
      return;
    }

    setTarget(e);
    setModal('delete');
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (modal === 'add') addEmployee(form); else updateEmployee(form);
    setModal(null);
  };

  const handleDelete = () => {
    if (!target) return;
    try {
      deleteEmployee(target.id);
    } catch (err) {
      console.error('Failed to delete employee:', err);
    } finally {
      // Selalu reset state, jadi ga blank page even kalo error
      setTarget(null);
      setModal(null);
    }
  };

  const closeAll = () => {
    setModal(null);
    setTarget(null);
    setWarnRelations([]);
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
      {!employees && (
        <div style={{ padding: 24, color: 'var(--text-2)', fontSize: 14 }}>Data unavailable</div>
      )}
      {employees && (<>

        {/* Header */}
        <div className="card-header mb-20">
          <div>
            <div className="card-title">Employee Records</div>
            <div className="card-subtitle">{employees.length} employees registered in the system</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => exportEmployeesToExcel(employees)}>
              <Download size={14} /> Export Excel
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={14} /> Add Employee
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <Search size={14} />
            <input
              className="search-input"
              placeholder="Search by name, ID, NIP or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
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
                <th>Employee ID</th>
                <th>NIP</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Role</th>
                <th>Email</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <EmptyState
                      icon={Users}
                      title="No employees found"
                      desc="Adjust filters or add a new employee to get started."
                    />
                  </td>
                </tr>
              ) : filtered.map(e => (
                <tr key={e.id}>
                  <td className="td-mono">{e.id}</td>
                  <td className="td-mono">{e.nip}</td>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td style={{ fontSize: 12.5 }}>{e.department}</td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{e.position}</td>
                  <td>
                    <span style={{
                      fontSize: 11.5,
                      padding: '3px 9px',
                      borderRadius: 20,
                      fontWeight: 600,
                      background: (e.role === 'Manager' || e.role === 'Head') ? 'var(--purple-dim)' : 'var(--bg-3)',
                      color: (e.role === 'Manager' || e.role === 'Head') ? 'var(--purple)' : 'var(--text-2)',
                    }}>
                      {e.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{e.email}</td>
                  <td style={{ fontSize: 12.5 }}>{formatDate(e.joinDate)}</td>
                  <td><Badge status={e.status} /></td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(e)}><Edit2 size={13} /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => openDelete(e)}><Trash2 size={13} /></button>
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
            title={modal === 'add' ? 'Add Employee' : 'Edit Employee'}
            onClose={() => setModal(null)}
            width="620px"
            footer={
              <>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>
                  {modal === 'add' ? 'Add Employee' : 'Save Changes'}
                </button>
              </>
            }
          >
            <div className="form-grid form-grid-2">
              <Field label="Employee ID" name="id" required />
              <Field label="NIP" name="nip" required />
              <Field label="Full Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Department" name="department" options={departments} />
              <Field label="Position" name="position" required />
              <Field label="Phone" name="phone" />
              <Field label="Role" name="role" options={['Staff', 'Manager', 'Head', 'Director']} />
              <Field label="Join Date" name="joinDate" type="date" required />
              <Field label="Status" name="status" options={['active', 'inactive']} />
            </div>
          </Modal>
        )}

        {/* Delete Confirm */}
        {modal === 'delete' && target && (
          <ConfirmModal
            title="Delete Employee"
            message={`Are you sure you want to delete "${target.name}" (${target.nip})? This action cannot be undone.`}
            confirmText="Delete"
            isDangerous
            onConfirm={handleDelete}
            onCancel={closeAll}
          />
        )}

        {/* Linked Warning Modal */}
        {modal === 'warn' && target && (
          <LinkedWarningModal
            employee={target}
            relations={warnRelations}
            onClose={closeAll}
          />
        )}
      </>)}
    </div>
  );
}