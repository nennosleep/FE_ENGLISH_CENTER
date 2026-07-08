import { createServiceAxios } from './axiosFactory';

/** Axios instance cho EnrollmentService (Điều phối xếp lớp). */
const enrollmentAxios = createServiceAxios(import.meta.env.VITE_ENROLLMENT_API);

export default enrollmentAxios;
