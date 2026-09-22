import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
});

// Token is also kept in localStorage so the API works when third-party
// cookies are blocked. The cookie remains the primary channel.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jc_token');
    }
    return Promise.reject(error);
  },
);

/** Turns any axios failure into a readable sentence. */
export function apiMessage(error, fallback = 'Something went wrong. Try again.') {
  const data = error?.response?.data;
  if (data?.details?.length) return data.details[0].message;
  if (data?.message) return data.message;
  if (error?.code === 'ECONNABORTED') return 'The request took too long. Check your connection.';
  if (error?.message === 'Network Error') return 'Cannot reach the server. Is it running?';
  return fallback;
}

export default api;
