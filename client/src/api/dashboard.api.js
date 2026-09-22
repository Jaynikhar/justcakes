import api from './axios.js';

export const fetchSummary = () => api.get('/dashboard/summary');
export const fetchSales = (params = {}) => api.get('/dashboard/sales', { params });
export const fetchPublicStats = () => api.get('/stats/public');
export const fetchPaymentConfig = () => api.get('/config/payment');
