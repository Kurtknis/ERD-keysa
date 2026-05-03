export function Badge({ status }) {
  const normalized = String(status || '').toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`badge badge-${normalized}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

export function Card({ title, subtitle, action, children, footer }) {
  return (
    <section className="card">
      {(title || subtitle || action) && (
        <div className="section-header">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
      {footer ? <div className="section-footer">{footer}</div> : null}
    </section>
  );
}

export function StatCard({ icon: Icon, label, value, helper, tone = 'primary', onClick }) {
  return (
    <article
      className={`stat-card tone-${tone}${onClick ? ' stat-card-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      <div className="stat-topline">
        {Icon ? (
          <span className="stat-icon">
            <Icon size={18} />
          </span>
        ) : null}
        <span className="stat-label">{label}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      {helper && <span className="stat-helper">{helper}</span>}
      {onClick && <span className="stat-cta">Click to view details →</span>}
    </article>
  );
}

export function ActionHint({ title, description }) {
  return (
    <div className="action-hint">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon ? (
        <div className="empty-state-icon">
          <Icon size={22} />
        </div>
      ) : null}
      <strong>{title}</strong>
      <span>{description}</span>
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function DetailModal({ title, fields, onClose }) {
  if (!fields) return null;
  return (
    <Modal title={title} onClose={onClose}>
      <div className="detail-grid">
        {fields.map(({ label, value }) => (
          <div key={label} className="detail-field">
            <label>{label}</label>
            <span>{value ?? '—'}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
