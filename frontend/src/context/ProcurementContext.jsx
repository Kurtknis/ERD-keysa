import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  addEmployee,
  addProduct,
  approvePurchaseRequest,
  createGoodsReceipt,
  createInvoice,
  createPurchaseOrder,
  createPurchaseRequest,
  deleteEmployee,
  deleteProduct,
  markGoodsReceived,
  markInvoicePaid,
} from '../services/procurementService';
import { initialAppData } from '../utils/seedData';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';

const ProcurementContext = createContext(null);

function getInitialState() {
  const storedData = getData(STORAGE_KEYS.appData);

  if (storedData) {
    return storedData;
  }

  setData(STORAGE_KEYS.appData, initialAppData);
  return initialAppData;
}

export function ProcurementProvider({ children }) {
  const [state, setState] = useState(getInitialState);

  useEffect(() => {
    setData(STORAGE_KEYS.appData, state);
  }, [state]);

  const actions = useMemo(
    () => ({
      addProductRecord: (payload) => setState((current) => addProduct(current, payload)),
      deleteProductRecord: (productId) => setState((current) => deleteProduct(current, productId)),
      addEmployeeRecord: (payload) => setState((current) => addEmployee(current, payload)),
      deleteEmployeeRecord: (employeeId) => setState((current) => deleteEmployee(current, employeeId)),
      createPRRecord: (payload) => setState((current) => createPurchaseRequest(current, payload)),
      approvePRRecord: (prId) => setState((current) => approvePurchaseRequest(current, prId)),
      createPORecord: (prId) => setState((current) => createPurchaseOrder(current, prId)),
      createGRRecord: (poId) => setState((current) => createGoodsReceipt(current, poId)),
      markGRReceivedRecord: (grId) => setState((current) => markGoodsReceived(current, grId)),
      createInvoiceRecord: (poId) => setState((current) => createInvoice(current, poId)),
      markInvoicePaidRecord: (invoiceId) => setState((current) => markInvoicePaid(current, invoiceId)),
    }),
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      ...actions,
      getProductById: (id) => state.products.find((item) => item.id === id),
      getEmployeeById: (id) => state.employees.find((item) => item.id === id),
      getPRById: (id) => state.purchaseRequests.find((item) => item.id === id),
      getPOById: (id) => state.purchaseOrders.find((item) => item.id === id),
      getGRById: (id) => state.goodsReceipts.find((item) => item.id === id),
    }),
    [actions, state],
  );

  return <ProcurementContext.Provider value={value}>{children}</ProcurementContext.Provider>;
}

export function useProcurement() {
  const context = useContext(ProcurementContext);

  if (!context) {
    throw new Error('useProcurement must be used inside ProcurementProvider.');
  }

  return context;
}
