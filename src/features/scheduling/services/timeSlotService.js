import schedulingAxios from '../../../config/schedulingAxios';

/**
 * Lấy cấu hình các ca học cố định (Thay cho slotsConfig)
 */
export const getTimeSlots = async () => {
  const response = await schedulingAxios.get('/time-slots');
  return response.data.data;
};
