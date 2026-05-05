import { createId } from '../utils/formatters';

function cloneState(state) {
  return {
    ...state,
    products: [...state.products],
    employees: [...state.employees],
    purchaseRequests: [...state.purchaseRequests],
    purchaseOrders: [...state.purchaseOrders],
    goodsReceipts: [...state.goodsReceipts],
    invoices: [...state.invoices],
  };
}

function requireEntity(entity, message) {
  if (!entity) {
    throw new Error(message);
  }

  return entity;
}

export function addProduct(state, payload) {
  if (!payload.name.trim()) {
    throw new Error('Product name is required.');
  }

  if (Number(payload.price) <= 0) {
    throw new Error('Product price must be greater than zero.');
  }

  const nextState = cloneState(state);

  nextState.products.push({
    id: createId('PRD'),
    name: payload.name.trim(),
    price: Number(payload.price),
  });

  return nextState;
}

export function deleteProduct(state, productId) {
  requireEntity(
    state.products.find((item) => item.id === productId),
    'Product not found.',
  );

  const nextState = cloneState(state);
  nextState.products = nextState.products.filter((item) => item.id !== productId);
  return nextState;
}

export function updateProduct(state, productId, payload) {
  const product = requireEntity(
    state.products.find((item) => item.id === productId),
    'Product not found.',
  );

  if (!payload.name.trim()) {
    throw new Error('Product name is required.');
  }

  if (Number(payload.price) <= 0) {
    throw new Error('Product price must be greater than zero.');
  }

  const nextState = cloneState(state);
  nextState.products = nextState.products.map((item) =>
    item.id === productId
      ? { ...item, name: payload.name.trim(), price: Number(payload.price) }
      : item,
  );

  return nextState;
}

export function addEmployee(state, payload) {
  if (!payload.name.trim()) {
    throw new Error('Employee name is required.');
  }

  if (!payload.role.trim()) {
    throw new Error('Employee role is required.');
  }

  const nextState = cloneState(state);

  nextState.employees.push({
    id: createId('EMP'),
    name: payload.name.trim(),
    role: payload.role.trim(),
  });

  return nextState;
}

export function deleteEmployee(state, employeeId) {
  requireEntity(
    state.employees.find((item) => item.id === employeeId),
    'Employee not found.',
  );

  const nextState = cloneState(state);
  nextState.employees = nextState.employees.filter((item) => item.id !== employeeId);
  return nextState;
}

export function updateEmployee(state, employeeId, payload) {
  const employee = requireEntity(
    state.employees.find((item) => item.id === employeeId),
    'Employee not found.',
  );

  if (!payload.name.trim()) {
    throw new Error('Employee name is required.');
  }

  if (!payload.role.trim()) {
    throw new Error('Employee role is required.');
  }

  const nextState = cloneState(state);
  nextState.employees = nextState.employees.map((item) =>
    item.id === employeeId
      ? { ...item, name: payload.name.trim(), role: payload.role.trim() }
      : item,
  );

  return nextState;
}

export function createPurchaseRequest(state, payload) {
  const product = requireEntity(
    state.products.find((item) => item.id === payload.productId),
    'Please select a valid product.',
  );

  requireEntity(
    state.employees.find((item) => item.id === payload.requestedById),
    'Please select a valid employee.',
  );

  if (Number(payload.quantity) <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }

  const nextState = cloneState(state);

  nextState.purchaseRequests.push({
    id: createId('PR'),
    productId: product.id,
    quantity: Number(payload.quantity),
    requestedById: payload.requestedById,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    approvedAt: null,
  });

  return nextState;
}

export function approvePurchaseRequest(state, prId) {
  const purchaseRequest = requireEntity(
    state.purchaseRequests.find((item) => item.id === prId),
    'Purchase request not found.',
  );

  if (purchaseRequest.status !== 'Pending') {
    throw new Error('Only pending purchase requests can be approved.');
  }

  const nextState = cloneState(state);

  nextState.purchaseRequests = nextState.purchaseRequests.map((item) =>
    item.id === prId
      ? { ...item, status: 'Approved', approvedAt: new Date().toISOString() }
      : item,
  );

  return nextState;
}

export function createPurchaseOrder(state, prId) {
  const purchaseRequest = requireEntity(
    state.purchaseRequests.find((item) => item.id === prId),
    'Purchase request not found.',
  );

  if (purchaseRequest.status !== 'Approved') {
    throw new Error('Cannot create a PO until the PR is approved.');
  }

  if (state.purchaseOrders.some((item) => item.prId === prId)) {
    throw new Error('A purchase order already exists for this PR.');
  }

  const nextState = cloneState(state);

  nextState.purchaseOrders.push({
    id: createId('PO'),
    prId,
    createdAt: new Date().toISOString(),
    status: 'Open',
  });

  return nextState;
}

export function createGoodsReceipt(state, poId) {
  const purchaseOrder = requireEntity(
    state.purchaseOrders.find((item) => item.id === poId),
    'Purchase order not found.',
  );

  requireEntity(
    state.purchaseRequests.find((item) => item.id === purchaseOrder.prId),
    'Cannot create a goods receipt because the linked PR no longer exists.',
  );

  if (state.goodsReceipts.some((item) => item.poId === poId)) {
    throw new Error('A goods receipt already exists for this PO.');
  }

  const nextState = cloneState(state);

  nextState.goodsReceipts.push({
    id: createId('GR'),
    poId,
    createdAt: new Date().toISOString(),
    receivedAt: null,
    status: 'Pending Receipt',
  });

  return nextState;
}

export function markGoodsReceived(state, grId) {
  const goodsReceipt = requireEntity(
    state.goodsReceipts.find((item) => item.id === grId),
    'Goods receipt not found.',
  );

  if (goodsReceipt.status === 'Received') {
    throw new Error('Goods receipt is already marked as received.');
  }

  const nextState = cloneState(state);

  nextState.goodsReceipts = nextState.goodsReceipts.map((item) =>
    item.id === grId
      ? { ...item, status: 'Received', receivedAt: new Date().toISOString() }
      : item,
  );

  return nextState;
}

export function createInvoice(state, poId) {
  const purchaseOrder = requireEntity(
    state.purchaseOrders.find((item) => item.id === poId),
    'Purchase order not found.',
  );

  const purchaseRequest = requireEntity(
    state.purchaseRequests.find((item) => item.id === purchaseOrder.prId),
    'Cannot create an invoice because the linked PR does not exist.',
  );

  const goodsReceipt = state.goodsReceipts.find((item) => item.poId === poId);

  if (!goodsReceipt || goodsReceipt.status !== 'Received') {
    throw new Error('Cannot create an invoice until a goods receipt exists and is marked as received.');
  }

  if (state.invoices.some((item) => item.poId === poId)) {
    throw new Error('An invoice already exists for this PO.');
  }

  const product = requireEntity(
    state.products.find((item) => item.id === purchaseRequest.productId),
    'Cannot create an invoice because the linked product does not exist.',
  );

  const nextState = cloneState(state);

  nextState.invoices.push({
    id: createId('INV'),
    prId: purchaseRequest.id,
    poId,
    grId: goodsReceipt.id,
    amount: Number(product.price) * Number(purchaseRequest.quantity),
    createdAt: new Date().toISOString(),
    paidAt: null,
    status: 'Unpaid',
  });

  return nextState;
}

export function markInvoicePaid(state, invoiceId) {
  const invoice = requireEntity(
    state.invoices.find((item) => item.id === invoiceId),
    'Invoice not found.',
  );

  if (invoice.status === 'Paid') {
    throw new Error('Invoice is already paid.');
  }

  const nextState = cloneState(state);

  nextState.invoices = nextState.invoices.map((item) =>
    item.id === invoiceId
      ? { ...item, status: 'Paid', paidAt: new Date().toISOString() }
      : item,
  );

  return nextState;
}

// CASCADE DELETE FUNCTIONS
export function deletePurchaseRequestCascade(state, prId) {
  const pr = requireEntity(
    state.purchaseRequests.find((item) => item.id === prId),
    'Purchase request not found.',
  );

  const nextState = cloneState(state);

  // Find related PO
  const relatedPO = nextState.purchaseOrders.find((po) => po.prId === prId);
  
  if (relatedPO) {
    // Find related GR
    const relatedGR = nextState.goodsReceipts.find((gr) => gr.poId === relatedPO.id);
    
    // Find related Invoice
    const relatedInvoice = nextState.invoices.find((inv) => inv.poId === relatedPO.id);
    
    // Delete in reverse order: Invoice -> GR -> PO -> PR
    if (relatedInvoice) {
      nextState.invoices = nextState.invoices.filter((item) => item.id !== relatedInvoice.id);
    }
    
    if (relatedGR) {
      nextState.goodsReceipts = nextState.goodsReceipts.filter((item) => item.id !== relatedGR.id);
    }
    
    nextState.purchaseOrders = nextState.purchaseOrders.filter((item) => item.id !== relatedPO.id);
  }

  nextState.purchaseRequests = nextState.purchaseRequests.filter((item) => item.id !== prId);
  
  return nextState;
}

export function deletePurchaseOrderCascade(state, poId) {
  const po = requireEntity(
    state.purchaseOrders.find((item) => item.id === poId),
    'Purchase order not found.',
  );

  const nextState = cloneState(state);

  // Find related GR and Invoice
  const relatedGR = nextState.goodsReceipts.find((gr) => gr.poId === poId);
  const relatedInvoice = nextState.invoices.find((inv) => inv.poId === poId);

  // Delete in reverse order: Invoice -> GR -> PO
  if (relatedInvoice) {
    nextState.invoices = nextState.invoices.filter((item) => item.id !== relatedInvoice.id);
  }

  if (relatedGR) {
    nextState.goodsReceipts = nextState.goodsReceipts.filter((item) => item.id !== relatedGR.id);
  }

  nextState.purchaseOrders = nextState.purchaseOrders.filter((item) => item.id !== poId);

  return nextState;
}

export function deleteGoodsReceiptCascade(state, grId) {
  const gr = requireEntity(
    state.goodsReceipts.find((item) => item.id === grId),
    'Goods receipt not found.',
  );

  const nextState = cloneState(state);

  // Find related Invoice
  const relatedInvoice = nextState.invoices.find((inv) => inv.grId === grId);

  // Delete Invoice first if exists
  if (relatedInvoice) {
    nextState.invoices = nextState.invoices.filter((item) => item.id !== relatedInvoice.id);
  }

  nextState.goodsReceipts = nextState.goodsReceipts.filter((item) => item.id !== grId);

  return nextState;
}

export function deleteInvoice(state, invoiceId) {
  const invoice = requireEntity(
    state.invoices.find((item) => item.id === invoiceId),
    'Invoice not found.',
  );

  const nextState = cloneState(state);
  nextState.invoices = nextState.invoices.filter((item) => item.id !== invoiceId);

  return nextState;
}

// UPDATE FUNCTIONS FOR PR
export function updatePurchaseRequest(state, prId, payload) {
  const pr = requireEntity(
    state.purchaseRequests.find((item) => item.id === prId),
    'Purchase request not found.',
  );

  const product = requireEntity(
    state.products.find((item) => item.id === payload.productId),
    'Please select a valid product.',
  );

  requireEntity(
    state.employees.find((item) => item.id === payload.requestedById),
    'Please select a valid employee.',
  );

  if (Number(payload.quantity) <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }

  const nextState = cloneState(state);
  nextState.purchaseRequests = nextState.purchaseRequests.map((item) =>
    item.id === prId
      ? {
          ...item,
          productId: payload.productId,
          quantity: Number(payload.quantity),
          requestedById: payload.requestedById,
        }
      : item,
  );

  return nextState;
}
