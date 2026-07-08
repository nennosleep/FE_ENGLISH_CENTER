import { createServiceAxios } from './axiosFactory';

/** Axios instance cho StudentService (Quản lý hồ sơ học viên). */
const studentAxios = createServiceAxios(import.meta.env.VITE_STUDENT_API);

export default studentAxios;
