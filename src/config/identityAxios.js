import axios from 'axios';

const identityAxios = axios.create({
  baseURL: import.meta.env.VITE_IDENTITY_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

identityAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default identityAxios;