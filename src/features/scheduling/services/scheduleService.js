import schedulingAxios from '../../../config/schedulingAxios';

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

/**
 * 🚀 BỔ SUNG: Lấy cấu hình các thứ lặp lại hiện tại của một lớp học để hiển thị lên Modal
 * URL thực tế: /class-schedules/class/{classId}
 */
export const getClassSchedulePattern = async (classId) => {
  const response = await schedulingAxios.get(`/class-schedules/class/${classId}`);
  return response.data.data; // Bóc tách .data.data để lấy trực tiếp object ClassResponse
};

/**
 * 🚀 BỔ SUNG: Lưu/Cập nhật cấu hình khung lịch lặp lại (Thứ lặp lại) cho lớp học
 * URL thực tế: /class-schedules/pattern
 * @param {Object} payload - Gói tin gửi đi chứa { classId: string, daysOfWeek: number[] }
 */
export const saveClassSchedulePattern = async (payload) => {
  const response = await schedulingAxios.put('/class-schedules/pattern', payload);
  return response.data; // Trả về ApiResponse tổng thể (chứa code, message, data) giống hàm saveRoomSession
};
