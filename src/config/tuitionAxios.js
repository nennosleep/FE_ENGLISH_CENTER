import { createServiceAxios } from './axiosFactory';

/** Axios instance cho TuitionService (Quản lý học phí & công nợ). */
const tuitionAxios = createServiceAxios(import.meta.env.VITE_TUITION_API);

export default tuitionAxios;
