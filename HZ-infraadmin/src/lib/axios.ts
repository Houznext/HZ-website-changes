import axios from 'axios';

const baseURL =
  typeof window === 'undefined'
    ? process.env.INFRA_BACKEND_URL || 'http://localhost:4001'
    : '/api/infra-backend';

const adminApi = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('infra_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      sessionStorage.removeItem('infra_admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default adminApi;
