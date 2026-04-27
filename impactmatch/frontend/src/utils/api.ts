import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const msg: string = err.response?.data?.message || '';
      // Only force-logout on auth failures, not business-logic 403s
      if (
        err.response?.status === 401 ||
        msg.toLowerCase().includes('token') ||
        msg.toLowerCase().includes('admin access required') ||
        msg.toLowerCase().includes('volunteer access required')
      ) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
