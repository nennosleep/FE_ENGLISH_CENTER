import { createServiceAxios } from './axiosFactory';

/** Axios instance cho LeadService (Quản lý nhu cầu tuyển sinh) — port 8083. */
const leadApi = createServiceAxios(import.meta.env.VITE_LEAD_API);

export default leadApi;
