import api from './axios.js';

export const fetchProductReviews = (productId, params = {}) =>
  api.get(`/reviews/product/${productId}`, { params });
export const fetchLatestReviews = (limit = 12) => api.get('/reviews/latest', { params: { limit } });
export const fetchAllReviews = () => api.get('/reviews/all');
export const fetchReviewEligibility = (productId) => api.get(`/reviews/eligibility/${productId}`);
export const createReview = (payload) => api.post('/reviews', payload);
export const updateReview = (id, payload) => api.put(`/reviews/${id}`, payload);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
