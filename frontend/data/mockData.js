export const generateId = (prefix = 'ID') => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

export const formatCurrency = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const departments = ['IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales'];
export const categories = ['Electronics', 'Office Supplies', 'Hardware', 'Software', 'Services'];
export const units = ['Unit', 'Box', 'Pack', 'Piece', 'Set', 'Bundle'];
export const paymentMethods = ['Bank Transfer', 'Credit Card', 'Cash', 'Check'];

// Mock Data
export const mockEmployees = [
  { id: generateId('E'), nip: '2024001', name: 'Budi Santoso', department: 'IT', position: 'Manager', email: 'budi@company.com', phone: '0812345678', role: 'Manager', status: 'active', joinDate: '2022-01-15' },
  { id: generateId('E'), nip: '2024002', name: 'Siti Nurhaliza', department: 'Finance', position: 'Accountant', email: 'siti@company.com', phone: '0812345679', role: 'Staff', status: 'active', joinDate: '2022-03-20' },
  { id: generateId('E'), nip: '2024003', name: 'Ahmad Wijaya', department: 'Operations', position: 'Supervisor', email: 'ahmad@company.com', phone: '0812345680', role: 'Supervisor', status: 'active', joinDate: '2022-05-10' },
  { id: generateId('E'), nip: '2024004', name: 'Rini Gunawan', department: 'HR', position: 'Recruiter', email: 'rini@company.com', phone: '0812345681', role: 'Staff', status: 'active', joinDate: '2022-07-01' },
  { id: generateId('E'), nip: '2024005', name: 'Hendra Pratama', department: 'IT', position: 'Developer', email: 'hendra@company.com', phone: '0812345682', role: 'Staff', status: 'inactive', joinDate: '2023-01-15' },
];

export const mockProducts = [
  { id: generateId('P'), name: 'Dell Monitor 24"', category: 'Electronics', unit: 'Unit', price: 2500000, stock: 15, supplier: 'PT Elektronik Jaya', status: 'active' },
  { id: generateId('P'), name: 'Printer HP LaserJet', category: 'Hardware', unit: 'Unit', price: 3500000, stock: 8, supplier: 'PT Teknologi Maju', status: 'active' },
  { id: generateId('P'), name: 'Office Chair', category: 'Office Supplies', unit: 'Unit', price: 1200000, stock: 20, supplier: 'PT Furniture Indonesia', status: 'active' },
  { id: generateId('P'), name: 'A4 Paper (500s)', category: 'Office Supplies', unit: 'Box', price: 45000, stock: 100, supplier: 'PT Kertas Putih', status: 'active' },
  { id: generateId('P'), name: 'Microsoft Office License', category: 'Software', unit: 'Unit', price: 1500000, stock: 5, supplier: 'Microsoft Partner', status: 'active' },
];

export const mockPurchaseRequests = [
  { id: generateId('PR'), title: 'Monitor untuk tim IT', requestedBy: mockEmployees[0].id, department: 'IT', priority: 'High', status: 'approved', requestDate: '2024-04-01', neededDate: '2024-04-15', approvedBy: mockEmployees[1].id, approvedDate: '2024-04-02', notes: 'Untuk upgrade workstation', items: [{productId: mockProducts[0].id, productName: mockProducts[0].name, qty: 5, unit: 'Unit', estimatedPrice: 2500000, totalPrice: 12500000}], totalAmount: 12500000 },
  { id: generateId('PR'), title: 'Supplies kantor bulanan', requestedBy: mockEmployees[3].id, department: 'HR', priority: 'Medium', status: 'pending', requestDate: '2024-04-10', neededDate: '2024-04-20', approvedBy: null, approvedDate: null, notes: 'Kebutuhan rutin', items: [{productId: mockProducts[3].id, productName: mockProducts[3].name, qty: 10, unit: 'Box', estimatedPrice: 45000, totalPrice: 450000}], totalAmount: 450000 },
];

export const mockPurchaseOrders = [
  { id: generateId('PO'), prId: mockPurchaseRequests[0].id, vendor: 'PT Elektronik Jaya', vendorAddress: 'Jl. Elektronik No. 123', vendorContact: '0812345678', createdBy: mockEmployees[0].id, createdDate: '2024-04-02', deliveryDate: '2024-04-15', paymentTerms: 'Net 30', status: 'completed', shippingAddress: 'Kantor Pusat', notes: 'Pengiriman tepat waktu', items: [{productId: mockProducts[0].id, productName: mockProducts[0].name, qty: 5, unitPrice: 2500000}], subtotal: 12500000, tax: 1250000, totalAmount: 13750000 },
];

export const mockInvoices = [
  { id: generateId('INV'), poId: mockPurchaseOrders[0].id, vendor: 'PT Elektronik Jaya', invoiceDate: '2024-04-15', amount: 13750000, paymentStatus: 'paid', dueDate: '2024-05-15', paidDate: '2024-05-10' },
];

export const mockGoodsReceipts = [
  { id: generateId('GR'), poId: mockPurchaseOrders[0].id, vendor: 'PT Elektronik Jaya', receiveDate: '2024-04-15', status: 'complete', items: [{productId: mockProducts[0].id, productName: mockProducts[0].name, qtyReceived: 5}], notes: 'Semua barang diterima dengan baik' },
];
