import axios from 'axios';
import { clearSession, getToken } from '@/lib/session';

const adminApi = axios.create({
  baseURL: '/api/infra-backend',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let signingOut = false;
adminApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !signingOut) {
      signingOut = true;
      clearSession();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default adminApi;
