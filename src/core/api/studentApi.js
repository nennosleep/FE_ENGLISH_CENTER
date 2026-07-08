import { createServiceAxios } from './axiosFactory';

/** Axios instance cho StudentService (Quản lý hồ sơ học viên) — port 8084. */
const studentApi = createServiceAxios(import.meta.env.VITE_STUDENT_API);

export default studentApi;
