export const initialAppData = {
  products: [
    { id: 'PRD-001', name: 'Business Laptop', price: 1350 },
    { id: 'PRD-002', name: 'Office Chair', price: 220 },
    { id: 'PRD-003', name: 'Printer Toner', price: 85 },
  ],
  employees: [
    { id: 'EMP-001', name: 'Maya Chen', role: 'Procurement Officer' },
    { id: 'EMP-002', name: 'Daniel Brooks', role: 'IT Manager' },
    { id: 'EMP-003', name: 'Sara Lopez', role: 'Finance Analyst' },
  ],
  purchaseRequests: [
    {
      id: 'PR-001',
      productId: 'PRD-001',
      quantity: 2,
      requestedById: 'EMP-002',
      status: 'Approved',
      createdAt: '2026-05-01T09:00:00.000Z',
      approvedAt: '2026-05-01T10:30:00.000Z',
    },
    {
      id: 'PR-002',
      productId: 'PRD-003',
      quantity: 5,
      requestedById: 'EMP-003',
      status: 'Pending',
      createdAt: '2026-05-02T08:45:00.000Z',
      approvedAt: null,
    },
  ],
  purchaseOrders: [
    {
      id: 'PO-001',
      prId: 'PR-001',
      createdAt: '2026-05-01T11:00:00.000Z',
      status: 'Open',
    },
  ],
  goodsReceipts: [
    {
      id: 'GR-001',
      poId: 'PO-001',
      createdAt: '2026-05-02T09:15:00.000Z',
      receivedAt: '2026-05-02T09:45:00.000Z',
      status: 'Received',
    },
  ],
  invoices: [
    {
      id: 'INV-001',
      prId: 'PR-001',
      poId: 'PO-001',
      grId: 'GR-001',
      amount: 2700,
      createdAt: '2026-05-03T08:30:00.000Z',
      paidAt: null,
      status: 'Unpaid',
    },
  ],
};
