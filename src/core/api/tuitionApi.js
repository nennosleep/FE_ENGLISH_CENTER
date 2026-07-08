import { createServiceAxios } from './axiosFactory';

/** Axios instance cho TuitionService (Quản lý học phí & công nợ) — port 8086. */
const tuitionApi = createServiceAxios(import.meta.env.VITE_TUITION_API);

export default tuitionApi;
