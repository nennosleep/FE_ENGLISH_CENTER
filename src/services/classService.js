import schedulingAxios from '../config/schedulingAxios';

/**
 * Lấy danh sách các lớp học đang mở để gán lịch trong Modal
 */
export const getAvailableClasses = async () => {
  const response = await schedulingAxios.get('/classes');
  return response.data.data;
};

/**
 * Lấy danh sách lớp phân loại theo trạng thái: Chưa có lịch và Đã có lịch (Session)
 */
export const getClassScheduleStatus = async () => {
  const response = await schedulingAxios.get('/classes/schedule-status');
  return response.data.data;
}