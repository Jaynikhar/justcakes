import api from './axios.js';

export const registerRequest = (payload) => api.post('/auth/register', payload);
export const loginRequest = (payload) => api.post('/auth/login', payload);
export const logoutRequest = () => api.post('/auth/logout');
export const meRequest = () => api.get('/auth/me');
export const updateProfileRequest = (payload) => api.put('/users/me', payload);
export const changePasswordRequest = (payload) => api.put('/users/me/password', payload);
