export function formatPrice(v?: string | null) {
  if (!v) return 'Price on request';
  const n = Number(v);
  if (Number.isNaN(n)) return 'Price on request';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}
