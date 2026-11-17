import axios from 'axios';

const baseURL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mm_token');
        localStorage.removeItem('mm_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);
