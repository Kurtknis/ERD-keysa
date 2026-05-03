// Mock export functions - in production, use libraries like xlsx or exceljs
export const exportEmployeesToExcel = (data) => {
  console.log('Exporting employees to Excel:', data);
  const csv = convertToCSV(data);
  downloadCSV(csv, 'employees.csv');
};

export const exportProductsToExcel = (data) => {
  console.log('Exporting products to Excel:', data);
  const csv = convertToCSV(data);
  downloadCSV(csv, 'products.csv');
};

export const exportPRsToExcel = (data) => {
  console.log('Exporting purchase requests to Excel:', data);
  const csv = convertToCSV(data);
  downloadCSV(csv, 'purchase_requests.csv');
};

export const exportPOsToExcel = (data) => {
  console.log('Exporting purchase orders to Excel:', data);
  const csv = convertToCSV(data);
  downloadCSV(csv, 'purchase_orders.csv');
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const keys = Object.keys(data[0]);
  const headers = keys.join(',');
  const rows = data.map((obj) =>
    keys.map((key) => {
      const value = obj[key];
      if (typeof value === 'object') return JSON.stringify(value);
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      return value;
    }).join(',')
  );
  
  return [headers, ...rows].join('\n');
};

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
