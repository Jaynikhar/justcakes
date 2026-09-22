const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

/** Turns a stored image record into a usable <img src>. */
export function imageUrl(image, fallback = '') {
  const url = typeof image === 'string' ? image : image?.url;
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  return `${serverUrl}${url}`;
}

export function firstImage(product) {
  return imageUrl(product?.images?.[0], '');
}

/** Builds a UPI intent string that most Indian payment apps can read. */
export function upiPaymentString({ upiId, payeeName, amount, note }) {
  if (!upiId) return '';
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName || 'Just Cakes',
    am: String(amount || ''),
    cu: 'INR',
    tn: note || 'Just Cakes order',
  });
  return `upi://pay?${params.toString()}`;
}
