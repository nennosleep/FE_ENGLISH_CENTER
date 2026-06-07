import axios from 'axios';

const schedulingAxios = axios.create({
  baseURL: import.meta.env.VITE_SCHEDULING_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

schedulingAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default schedulingAxios;