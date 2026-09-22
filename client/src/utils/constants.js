export const ORDER_FLOW = [
  'ORDER_RECEIVED',
  'BAKING',
  'COMPLETED',
  'OUT_FOR_DELIVERY',
  'PICKED_UP',
];

export const STATUS_LABELS = {
  ORDER_RECEIVED: 'Order received',
  BAKING: 'Payment verified',
  COMPLETED: 'Baking',
  OUT_FOR_DELIVERY: 'Out for taking away',
  PICKED_UP: 'taken away',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_LABELS = {
  PENDING_VERIFICATION: 'Payment under review',
  VERIFIED: 'Payment verified',
  REJECTED: 'Payment rejected',
};

export const REVIEWABLE_STATUSES = ['COMPLETED', 'OUT_FOR_DELIVERY', 'PICKED_UP'];

export const SHOP = {
  name: 'Just Cakes',
  tagline: 'Homemade — just for you!',
  phone: import.meta.env.VITE_SHOP_PHONE || '',
  email: import.meta.env.VITE_SHOP_EMAIL || '',
  address: import.meta.env.VITE_SHOP_ADDRESS || '',
  instagram: import.meta.env.VITE_SHOP_INSTAGRAM || '',
  facebook: import.meta.env.VITE_SHOP_FACEBOOK || '',
  developerName: import.meta.env.VITE_DEVELOPER_NAME || '',
  developerContact: import.meta.env.VITE_DEVELOPER_CONTACT || '',
};
