import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './formatters';

function exportRows(rows, fileName, sheetName) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}

// Export multiple sheets in one workbook
function exportMultipleSheets(sheets, fileName) {
  const workbook = XLSX.utils.book_new();
  
  sheets.forEach(({ data, sheetName }) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  XLSX.writeFile(workbook, fileName);
}

export function exportProducts(products) {
  exportRows(
    products.map((product) => ({
      ID: product.id,
      Name: product.name,
      Price: Number(product.price),
      PriceFormatted: formatCurrency(product.price),
    })),
    'products.xlsx',
    'Products',
  );
}

export function exportEmployees(employees) {
  exportRows(
    employees.map((employee) => ({
      ID: employee.id,
      Name: employee.name,
      Role: employee.role,
    })),
    'employees.xlsx',
    'Employees',
  );
}

export function exportPurchaseRequests(purchaseRequests, helpers) {
  exportRows(
    purchaseRequests.map((purchaseRequest) => {
      const product = helpers.getProductById(purchaseRequest.productId);
      const employee = helpers.getEmployeeById(purchaseRequest.requestedById);

      return {
        ID: purchaseRequest.id,
        Product: product?.name ?? purchaseRequest.productId,
        Quantity: purchaseRequest.quantity,
        RequestedBy: employee?.name ?? purchaseRequest.requestedById,
        Status: purchaseRequest.status,
        CreatedAt: formatDate(purchaseRequest.createdAt),
      };
    }),
    'purchase-requests.xlsx',
    'Purchase Requests',
  );
}

// Export all data in one Excel file with multiple sheets
export function exportAllData(data, helpers) {
  const sheets = [
    {
      sheetName: 'Products',
      data: data.products.map((product) => ({
        ID: product.id,
        Name: product.name,
        Price: Number(product.price),
        PriceFormatted: formatCurrency(product.price),
      })),
    },
    {
      sheetName: 'Employees',
      data: data.employees.map((employee) => ({
        ID: employee.id,
        Name: employee.name,
        Role: employee.role,
      })),
    },
    {
      sheetName: 'Purchase Requests',
      data: data.purchaseRequests.map((pr) => {
        const product = helpers.getProductById(pr.productId);
        const employee = helpers.getEmployeeById(pr.requestedById);
        const total = (product?.price ?? 0) * pr.quantity;
        
        return {
          ID: pr.id,
          Product: product?.name ?? pr.productId,
          Quantity: pr.quantity,
          'Unit Price': product?.price ?? 0,
          'Total Amount': total,
          'Requested By': employee?.name ?? pr.requestedById,
          'Employee Role': employee?.role ?? '-',
          Status: pr.status,
          'Created At': formatDate(pr.createdAt),
          'Approved At': formatDate(pr.approvedAt),
        };
      }),
    },
    {
      sheetName: 'Purchase Orders',
      data: data.purchaseOrders.map((po) => {
        const pr = helpers.getPRById(po.prId);
        const product = helpers.getProductById(pr?.productId);
        const employee = helpers.getEmployeeById(pr?.requestedById);
        
        return {
          'PO ID': po.id,
          'PR Reference': po.prId,
          Product: product?.name ?? '-',
          Quantity: pr?.quantity ?? '-',
          'Requested By': employee?.name ?? '-',
          'Created At': formatDate(po.createdAt),
          Status: po.status,
        };
      }),
    },
    {
      sheetName: 'Goods Receipts',
      data: data.goodsReceipts.map((gr) => {
        const po = data.purchaseOrders.find((item) => item.id === gr.poId);
        const pr = helpers.getPRById(po?.prId);
        const product = helpers.getProductById(pr?.productId);
        
        return {
          'GR ID': gr.id,
          'PO Reference': gr.poId,
          'PR Reference': po?.prId ?? '-',
          Product: product?.name ?? '-',
          Quantity: pr?.quantity ?? '-',
          Status: gr.status,
          'Created At': formatDate(gr.createdAt),
          'Received At': formatDate(gr.receivedAt),
        };
      }),
    },
    {
      sheetName: 'Invoices',
      data: data.invoices.map((inv) => {
        const pr = helpers.getPRById(inv.prId);
        const product = helpers.getProductById(pr?.productId);
        
        return {
          'Invoice ID': inv.id,
          'PO Reference': inv.poId,
          'PR Reference': inv.prId,
          'GR Reference': inv.grId,
          Product: product?.name ?? '-',
          Quantity: pr?.quantity ?? '-',
          Amount: inv.amount,
          'Amount Formatted': formatCurrency(inv.amount),
          Status: inv.status,
          'Created At': formatDate(inv.createdAt),
          'Paid At': formatDate(inv.paidAt),
        };
      }),
    },
  ];
  
  const timestamp = new Date().toISOString().split('T')[0];
  exportMultipleSheets(sheets, `procurement-data-${timestamp}.xlsx`);
}
