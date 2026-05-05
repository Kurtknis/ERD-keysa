import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  addEmployee,
  addProduct,
  approvePurchaseRequest,
  createGoodsReceipt,
  createInvoice,
  createPurchaseOrder,
  createPurchaseRequest,
  deleteEmployee,
  deleteGoodsReceiptCascade,
  deleteInvoice,
  deleteProduct,
  deletePurchaseOrderCascade,
  deletePurchaseRequestCascade,
  markGoodsReceived,
  markInvoicePaid,
  updateEmployee,
  updateProduct,
  updatePurchaseRequest,
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
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    setData(STORAGE_KEYS.appData, state);
  }, [state]);

  const actions = useMemo(
    () => ({
      addProductRecord: (payload) => setState((current) => addProduct(current, payload)),
      updateProductRecord: (productId, payload) => setState((s) => updateProduct(s, productId, payload)),
      deleteProductRecord: (productId) => {
        const current = stateRef.current;
        if (current.purchaseRequests.some((item) => item.productId === productId)) {
          throw new Error('Cannot delete a product that is already used in a purchase request.');
        }
        setState((s) => deleteProduct(s, productId));
      },
      addEmployeeRecord: (payload) => setState((current) => addEmployee(current, payload)),
      updateEmployeeRecord: (employeeId, payload) => setState((s) => updateEmployee(s, employeeId, payload)),
      deleteEmployeeRecord: (employeeId) => {
        const current = stateRef.current;
        if (current.purchaseRequests.some((item) => item.requestedById === employeeId)) {
          throw new Error('Cannot delete an employee who is already linked to a purchase request.');
        }
        setState((s) => deleteEmployee(s, employeeId));
      },
      createPRRecord: (payload) => setState((current) => createPurchaseRequest(current, payload)),
      updatePRRecord: (prId, payload) => setState((s) => updatePurchaseRequest(s, prId, payload)),
      deletePRRecordCascade: (prId) => setState((s) => deletePurchaseRequestCascade(s, prId)),
      approvePRRecord: (prId) => setState((current) => approvePurchaseRequest(current, prId)),
      createPORecord: (prId) => setState((current) => createPurchaseOrder(current, prId)),
      deletePORecordCascade: (poId) => setState((s) => deletePurchaseOrderCascade(s, poId)),
      createGRRecord: (poId) => setState((current) => createGoodsReceipt(current, poId)),
      deleteGRRecordCascade: (grId) => setState((s) => deleteGoodsReceiptCascade(s, grId)),
      markGRReceivedRecord: (grId) => setState((current) => markGoodsReceived(current, grId)),
      createInvoiceRecord: (poId) => setState((current) => createInvoice(current, poId)),
      deleteInvoiceRecord: (invoiceId) => setState((s) => deleteInvoice(s, invoiceId)),
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
