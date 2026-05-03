export function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function createId(prefix) {
  const seed = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${prefix}-${seed}`.toUpperCase();
}

export function filterByText(items, searchText, valuesGetter) {
  const keyword = searchText.trim().toLowerCase();

  if (!keyword) {
    return items;
  }

  return items.filter((item) =>
    valuesGetter(item).some((value) => String(value ?? '').toLowerCase().includes(keyword)),
  );
}
