import { STATUS_LABELS, PAYMENT_LABELS } from '../../utils/constants.js';

const STATUS_TONE = {
  ORDER_RECEIVED: 'badge',
  BAKING: 'badge badge--warning',
  COMPLETED: 'badge',
  OUT_FOR_DELIVERY: 'badge badge--warning',
  PICKED_UP: 'badge badge--success',
  CANCELLED: 'badge badge--danger',
};

export function StatusBadge({ status }) {
  return <span className={STATUS_TONE[status] || 'badge'}>{STATUS_LABELS[status] || status}</span>;
}

const PAYMENT_TONE = {
  PENDING_VERIFICATION: 'badge badge--warning',
  VERIFIED: 'badge badge--success',
  REJECTED: 'badge badge--danger',
};

export function PaymentBadge({ status }) {
  return <span className={PAYMENT_TONE[status] || 'badge'}>{PAYMENT_LABELS[status] || status}</span>;
}

export default StatusBadge;
