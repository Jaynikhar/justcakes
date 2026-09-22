import api from './axios.js';

export const fetchProducts = (params = {}) => api.get('/products', { params });
export const fetchProduct = (idOrSlug) => api.get(`/products/${idOrSlug}`);
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);
