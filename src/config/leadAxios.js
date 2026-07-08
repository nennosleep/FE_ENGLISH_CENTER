import { createServiceAxios } from './axiosFactory';

/** Axios instance cho LeadService (Quản lý nhu cầu tuyển sinh). */
const leadAxios = createServiceAxios(import.meta.env.VITE_LEAD_API);

export default leadAxios;
