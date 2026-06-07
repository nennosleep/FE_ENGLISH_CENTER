import axios from 'axios';
import { toast } from 'react-hot-toast';
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

schedulingAxios.interceptors.response.use(
  (response) => response, // GIỮ NGUYÊN RESPONSE
  (error) => {
    const apiError = error.response?.data;

    // Có thể toast ở đây
    if (apiError?.message) {
      console.error(apiError.message);
       toast.error(apiError.message);
    }

    return Promise.reject(apiError || error);
  }
);

export default schedulingAxios;