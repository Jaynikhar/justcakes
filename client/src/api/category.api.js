import api from './axios.js';

export const fetchCategories = (params = {}) => api.get('/categories', { params });
export const createCategory = (formData) =>
  api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCategory = (id, formData) =>
  api.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
