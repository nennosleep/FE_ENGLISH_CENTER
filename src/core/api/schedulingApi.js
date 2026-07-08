import { createServiceAxios } from './axiosFactory';

/** Axios instance cho SchedulingService (Lịch học, Phòng, Lớp, Giảng viên) — port 8080. */
const schedulingApi = createServiceAxios(import.meta.env.VITE_SCHEDULING_API);

export default schedulingApi;
