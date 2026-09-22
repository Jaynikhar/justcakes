import crypto from 'crypto';

export function buildOrderNumber() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `JC-${stamp}-${random}`;
}
