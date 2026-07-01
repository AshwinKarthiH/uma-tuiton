import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uma_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('uma_refresh_token');
        if (!refresh) throw new Error('no refresh');
        const res = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
        localStorage.setItem('uma_access_token', res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem('uma_access_token');
        localStorage.removeItem('uma_refresh_token');
        localStorage.removeItem('uma_session');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
