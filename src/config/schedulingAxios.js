import { createServiceAxios } from './axiosFactory';

/** Axios instance cho SchedulingService (Lịch học, Phòng, Lớp, Giảng viên). */
const schedulingAxios = createServiceAxios(import.meta.env.VITE_SCHEDULING_API);

export default schedulingAxios;
