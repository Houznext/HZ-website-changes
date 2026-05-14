export function formatPrice(amount?: number): string {
  if (amount == null || Number.isNaN(amount)) return '₹—';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(date?: string): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getPropertyGradient(type: string): string {
  const map: Record<string, string> = {
    Apartment: 'linear-gradient(135deg, #e8f1fd, #c7d9f5)',
    Villa: 'linear-gradient(135deg, #fce7f3, #f0d4e8)',
    Land: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    Plot: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
  };
  return map[type] || 'linear-gradient(135deg, #e8f1fd, #c7d9f5)';
}
