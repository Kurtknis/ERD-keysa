import React from 'react';
import {
  Package, Users, FileText, ShoppingCart, Receipt, Truck,
  AlertTriangle, Bell, ArrowRight, CheckCircle2, Clock, Scale
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../data/mockData';
import { Badge } from '../components/common';

export default function Dashboard({ onNav }) {
  const { products, employees, prs, pos, invoices, grs } = useApp();

  const totalPRValue    = prs.reduce((s, p) => s + p.totalAmount, 0);
  const totalPOValue    = pos.reduce((s, p) => s + p.totalAmount, 0);
  const totalInvoiced   = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid       = invoices.filter(i => i.paymentStatus === 'paid').reduce((s, i) => s + i.amount, 0);
  const pendingPR       = prs.filter(p => p.status === 'pending').length;
  const unpaidInv       = invoices.filter(i => i.paymentStatus === 'unpaid').length;

  const stats = [
    {
      label: 'Total Products',     value: products.length,
      icon: Package,               color: 'var(--accent)',  bg: 'var(--accent-dim)',
      sub: `${products.filter(p => p.status === 'active').length} active`,
      page: 'products',
    },
    {
      label: 'Employees',          value: employees.length,
      icon: Users,                 color: 'var(--green)',   bg: 'var(--green-dim)',
      sub: `${employees.filter(e => e.status === 'active').length} active`,
      page: 'employees',
    },
    {
      label: 'Purchase Requests',  value: prs.length,
      icon: FileText,              color: 'var(--yellow)',  bg: 'var(--yellow-dim)',
      sub: `${pendingPR} pending approval`,
      page: 'purchaserequest',
    },
    {
      label: 'Purchase Orders',    value: pos.length,
      icon: ShoppingCart,          color: 'var(--purple)',  bg: 'var(--purple-dim)',
      sub: formatCurrency(totalPOValue),
      page: 'purchaseorder',
    },
    {
      label: 'Invoices',           value: invoices.length,
      icon: Receipt,               color: 'var(--orange)',  bg: 'var(--orange-dim)',
      sub: `${unpaidInv} unpaid`,
      page: 'invoice',
    },
    {
      label: 'Goods Receipts',     value: grs.length,
      icon: Truck,                 color: 'var(--cyan)',    bg: 'var(--cyan-dim)',
      sub: `${grs.filter(g => g.status === 'complete').length} complete`,
      page: 'gr',
    },
  ];

  const financialStats = [
    { label: 'Total PR Value',  value: formatCurrency(totalPRValue),   color: 'var(--yellow)' },
    { label: 'Total PO Value',  value: formatCurrency(totalPOValue),   color: 'var(--purple)' },
    { label: 'Total Invoiced',  value: formatCurrency(totalInvoiced),  color: 'var(--orange)' },
    { label: 'Total Paid',      value: formatCurrency(totalPaid),      color: 'var(--green)'  },
  ];

  const recentPRs      = [...prs].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)).slice(0, 5);
  const recentInvoices = [...invoices].sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)).slice(0, 4);

  const prStatusData = [
    { label: 'Pending',  count: prs.filter(p => p.status === 'pending').length,  color: 'var(--yellow)' },
    { label: 'Approved', count: prs.filter(p => p.status === 'approved').length, color: 'var(--green)'  },
    { label: 'Rejected', count: prs.filter(p => p.status === 'rejected').length, color: 'var(--red)'    },
  ];

  const businessRules = [
    {
      icon: FileText,
      title: 'Invoice Linkage',
      desc: 'Every invoice must be linked to a valid Purchase Request and Purchase Order.',
    },
    {
      icon: CheckCircle2,
      title: 'Goods Receipt Required',
      desc: 'A goods receipt must be recorded before invoice payment can be processed.',
    },
    {
      icon: Scale,
      title: 'PR Approval Workflow',
      desc: 'Purchase Requests require manager approval before a Purchase Order can be created.',
    },
  ];

  return (
    <div className="page-content">

      {/* ── Alerts ── */}
      {pendingPR > 0 && (
        <div
          className="alert alert-warning"
          style={{ cursor: 'pointer' }}
          onClick={() => onNav('purchaserequest')}
        >
          <AlertTriangle size={14} />
          <span>
            <strong>{pendingPR} Purchase Request{pendingPR > 1 ? 's' : ''}</strong> awaiting approval.
          </span>
          <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
        </div>
      )}
      {unpaidInv > 0 && (
        <div
          className="alert alert-info"
          style={{ cursor: 'pointer' }}
          onClick={() => onNav('invoice')}
        >
          <Bell size={14} />
          <span>
            <strong>{unpaidInv} Invoice{unpaidInv > 1 ? 's' : ''}</strong> unpaid and awaiting payment.
          </span>
          <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="stats-grid">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => onNav(s.page)}
            >
              <div className="stat-icon" style={{ background: s.bg }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-sub" style={{ color: s.color }}>{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Financial Overview ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Financial Overview</div>
            <div className="card-subtitle">Procurement spend summary across all modules</div>
          </div>
        </div>
        <div className="fin-grid">
          {financialStats.map(f => (
            <div key={f.label} className="fin-cell">
              <div className="fin-value" style={{ color: f.color }}>{f.value}</div>
              <div className="fin-label">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Recent PRs */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Recent Purchase Requests</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => onNav('purchaserequest')}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentPRs.map(pr => (
              <div key={pr.id} className="list-item">
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{pr.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 3 }}>
                    {pr.id} &middot; {pr.department} &middot; {formatDate(pr.requestDate)}
                  </div>
                </div>
                <Badge status={pr.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* PR Status Breakdown */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title mb-16">PR Status Breakdown</div>
            {prStatusData.map(d => (
              <div key={d.label} className="progress-row">
                <div className="progress-header">
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{d.label}</span>
                  <span style={{ fontWeight: 700, color: d.color }}>{d.count}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${prs.length ? (d.count / prs.length) * 100 : 0}%`,
                      background: d.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Invoices */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title mb-16">Recent Invoices</div>
            {recentInvoices.map(inv => (
              <div key={inv.id} className="detail-row">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{inv.id}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{inv.vendor}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                    {formatCurrency(inv.amount)}
                  </div>
                  <Badge status={inv.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Business Rules ── */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Business Rules Enforced</div>
            <div className="card-subtitle">Core procurement compliance policies</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {businessRules.map(r => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="rule-card">
                <div className="rule-icon">
                  <Icon size={16} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>{r.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}