import { createServiceAxios } from './axiosFactory';

/** Axios instance cho EnrollmentService (Điều phối xếp lớp) — port 8085. */
const enrollmentApi = createServiceAxios(import.meta.env.VITE_ENROLLMENT_API);

export default enrollmentApi;
