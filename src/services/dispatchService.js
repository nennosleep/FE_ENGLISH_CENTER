import schedulingAxios from '../config/schedulingAxios'; 

/**
 * 🚀 BỔ SUNG 1: Lấy danh sách giáo viên TRỐNG LỊCH hoàn toàn vào một ca cụ thể
 * Endpoint khớp chính xác với Backend: GET /api/v1/scheduling/dispatch/teachers/available
 * 
 * @param {string} date - Ngày cần kiểm tra (Format: 'YYYY-MM-DD')
 * @param {string} timeSlotId - UUID của ca học cần kiểm tra
 * @returns {Promise<Array>} Danh sách các giáo viên có thể nhận lịch
 */
export const getAvailableTeachersForSession = async (date, timeSlotId) => {
  const response = await schedulingAxios.get('/v1/scheduling/dispatch/teachers/available', {
    params: {
      date,
      timeSlotId // Gửi chuỗi UUID của ca học lên backend (@RequestParam)
    }
  });
  return response.data.data;
};

/**
 * 🚀 BỔ SUNG 2: Đổi phòng học đột xuất cho một Buổi học (Session)
 * Endpoint khớp chính xác với Backend: PUT /api/v1/scheduling/dispatch/sessions/{sessionId}/change-room
 * 
 * @param {string} sessionId - UUID của buổi học cần đổi phòng
 * @param {string} newRoomId - UUID của phòng học mới trống lịch
 */
export const changeSessionRoom = async (sessionId, newRoomId) => {
  const response = await schedulingAxios.put(`/v1/scheduling/dispatch/sessions/${sessionId}/change-room`, {
    roomId: newRoomId // Khớp với Map<String, UUID> requestBody phía Backend
  });
  return response.data.data;
};

/**
 * 🚀 BỔ SUNG 3: Điều phối Giáo viên dạy thay / Đổi giáo viên cho buổi học cụ thể
 * Endpoint khớp chính xác với Backend: POST /api/v1/scheduling/dispatch/sessions/{sessionId}/substitute
 * 
 * @param {string} sessionId - UUID của buổi học
 * @param {string} currentTeacherId - ID giáo viên hiện tại (để xóa nếu là đổi người)
 * @param {string} newTeacherId - ID giáo viên mới sẽ vào dạy thay
 * @param {string} role - Vai trò đứng lớp, nhận các giá trị từ ENUM assignmentType ('MAIN', 'ASSISTANT', 'SUBSTITUTE')
 */
export const assignSubstituteTeacher = async (sessionId, currentTeacherId, newTeacherId, role = 'SUBSTITUTE') => {
  const response = await schedulingAxios.post(`/v1/scheduling/dispatch/sessions/${sessionId}/substitute`, {
    currentTeacherId, // Khớp với Map<String, String> requestBody phía Backend
    newTeacherId,     
    role              
  });
  return response.data.data;
};