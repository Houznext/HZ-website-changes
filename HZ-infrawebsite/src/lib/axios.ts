import axios from 'axios';

const baseURL =
  typeof window === 'undefined'
    ? process.env.INFRA_BACKEND_URL || 'http://localhost:4001'
    : '/api/infra-backend';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('infra_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
