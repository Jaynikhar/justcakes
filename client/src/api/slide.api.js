import api from './axios.js';

export const fetchActiveSlides = () => api.get('/slides');
export const fetchAllSlides = () => api.get('/slides/all');
export const createSlide = (formData) =>
  api.post('/slides', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateSlide = (id, formData) =>
  api.put(`/slides/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const reorderSlides = (order) => api.patch('/slides/reorder', { order });
export const deleteSlide = (id) => api.delete(`/slides/${id}`);
