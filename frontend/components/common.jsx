import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

/* ─── Badge ────────────────────────────────────────────── */

const STATUS_MAP = {
  active:    'active',
  inactive:  'inactive',
  approved:  'approved',
  rejected:  'rejected',
  pending:   'pending',
  paid:      'paid',
  unpaid:    'unpaid',
  draft:     'draft',
  sent:      'sent',
  partial:   'partial',
  complete:  'complete',
  completed: 'complete',
  cancelled: 'cancelled',
  canceled:  'cancelled',
};

export function Badge({ status, label }) {
  const key   = STATUS_MAP[(status || '').toLowerCase()] || 'draft';
  const text  = label || status;
  return (
    <span className={`badge badge-${key}`}>
      {text}
    </span>
  );
}

/* ─── Modal ────────────────────────────────────────────── */

export function Modal({ title, children, onClose, width = '560px', footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ width }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ─── ConfirmModal ─────────────────────────────────────── */

export function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText  = 'Cancel',
  isDangerous = false,
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-box"
        style={{ width: '420px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isDangerous ? 'var(--red-dim)' : 'var(--yellow-dim)',
            }}>
              <AlertTriangle size={18} color={isDangerous ? 'var(--red)' : 'var(--yellow)'} />
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="modal-close" onClick={onCancel}><X size={16} /></button>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.6, marginBottom: 6 }}>{message}</p>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>{cancelText}</button>
          <button
            className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            style={isDangerous ? { background: 'var(--red)', color: '#fff', borderColor: 'var(--red)' } : {}}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── EmptyState ───────────────────────────────────────── */

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', textAlign: 'center',
    }}>
      {Icon && (
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: 'var(--bg-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <Icon size={24} color="var(--text-3)" />
        </div>
      )}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>{title}</div>
      {desc && <div style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 320 }}>{desc}</div>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

/* ─── DetailItem ───────────────────────────────────────── */

export function DetailItem({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}
