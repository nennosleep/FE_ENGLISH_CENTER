import schedulingAxios from '../config/schedulingAxios';

/**
 * Lấy danh sách các lớp học đang mở để gán lịch trong Modal
 */
export const getAvailableClasses = async () => {
  const response = await schedulingAxios.get('/classes');
  return response.data.data;
};