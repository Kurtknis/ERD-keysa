import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './formatters';

function exportRows(rows, fileName, sheetName) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
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
