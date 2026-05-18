import schedulingAxios from '../config/schedulingAxios';

/**
 * Lấy lịch học (Sessions) thực tế của một phòng học cụ thể
 */
export const getRoomSchedule = async (roomId) => {
  const response = await schedulingAxios.get(`/schedules/room/${roomId}`);
  return response.data.data; 
};

/**
 * Lưu một buổi học mới được gán từ phòng học xuống Database
 */
export const saveRoomSession = async (sessionPayload) => {
  const response = await schedulingAxios.post('/schedules/session', sessionPayload);
  return response.data;
};