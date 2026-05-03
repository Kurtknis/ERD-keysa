import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  mockEmployees,
  mockProducts,
  mockPurchaseRequests,
  mockPurchaseOrders,
  mockInvoices,
  mockGoodsReceipts,
} from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [employees, setEmployees] = useState(mockEmployees);
  const [products, setProducts] = useState(mockProducts);
  const [prs, setPrs] = useState(mockPurchaseRequests);
  const [pos, setPos] = useState(mockPurchaseOrders);
  const [invoices, setInvoices] = useState(mockInvoices);
  const [grs, setGrs] = useState(mockGoodsReceipts);

  const addEmployee = useCallback((emp) => {
    setEmployees((prev) => [...prev, emp]);
  }, []);

  const updateEmployee = useCallback((emp) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
  }, []);

  const deleteEmployee = useCallback((id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addProduct = useCallback((prod) => {
    setProducts((prev) => [...prev, prod]);
  }, []);

  const updateProduct = useCallback((prod) => {
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addPR = useCallback((pr) => {
    setPrs((prev) => [...prev, pr]);
  }, []);

  const updatePR = useCallback((pr) => {
    setPrs((prev) => prev.map((p) => (p.id === pr.id ? pr : p)));
  }, []);

  const approvePR = useCallback((prId, approvedBy, approvedDate) => {
    setPrs((prev) =>
      prev.map((p) =>
        p.id === prId
          ? { ...p, status: 'approved', approvedBy, approvedDate }
          : p
      )
    );
  }, []);

  const rejectPR = useCallback((prId, reason) => {
    setPrs((prev) =>
      prev.map((p) =>
        p.id === prId
          ? { ...p, status: 'rejected', rejectReason: reason }
          : p
      )
    );
  }, []);

  const addPO = useCallback((po) => {
    setPos((prev) => [...prev, po]);
  }, []);

  const updatePO = useCallback((po) => {
    setPos((prev) => prev.map((p) => (p.id === po.id ? po : p)));
  }, []);

  const deletePO = useCallback((id) => {
    setPos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getEmployee = useCallback(
    (id) => employees.find((e) => e.id === id),
    [employees]
  );

  const getProduct = useCallback(
    (id) => products.find((p) => p.id === id),
    [products]
  );

  const value = {
    employees,
    products,
    prs,
    pos,
    invoices,
    grs,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addProduct,
    updateProduct,
    deleteProduct,
    addPR,
    updatePR,
    approvePR,
    rejectPR,
    addPO,
    updatePO,
    deletePO,
    getEmployee,
    getProduct,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
