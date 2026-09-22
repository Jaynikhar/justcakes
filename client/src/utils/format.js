export function formatINR(value = 0) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function compactCount(value = 0) {
  const number = Number(value) || 0;
  if (number >= 1000) return `${Math.floor(number / 100) / 10}k+`;
  if (number >= 10) return `${Math.floor(number / 10) * 10}+`;
  return String(number);
}
