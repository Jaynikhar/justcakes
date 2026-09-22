import api from './axios.js';

export const placeOrder = (formData) =>
  api.post('/orders', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const fetchMyOrders = () => api.get('/orders/me');
export const fetchMyOrder = (id) => api.get(`/orders/me/${id}`);
export const fetchAllOrders = (params = {}) => api.get('/orders', { params });
export const fetchOrderForOwner = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, payload) => api.patch(`/orders/${id}/status`, payload);
export const updatePaymentStatus = (id, payload) => api.patch(`/orders/${id}/payment`, payload);
export const paymentScreenshotUrl = (id) =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${id}/payment-screenshot`;
