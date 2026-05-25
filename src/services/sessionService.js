import schedulingAxios from '../config/schedulingAxios';

/**
 * Lấy toàn bộ danh sách ca học (Sessions)
 * @returns {Promise<Array>} Danh sách các ca học từ hệ thống
 */
export const getAllSessions = async () => {
  try {
    const response = await schedulingAxios.get('/sessions');
    return response.data.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy toàn bộ ca học:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết ca học theo ID cụ thể
 * @param {string} id - Định dạng UUID
 */
export const getSessionById = async (id) => {
  try {
    const response = await schedulingAxios.get(`/sessions/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error(`Lỗi khi lấy ca học ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách ca học gán cho một lớp học nhất định
 * @param {string} classId - Định dạng UUID
 */
export const getSessionsByClassId = async (classId) => {
  try {
    const response = await schedulingAxios.get(`/sessions/class/${classId}`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Lỗi khi lấy ca học của lớp ${classId}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách ca học của một phòng học theo một ngày cụ thể
 * @param {string} roomId - Định dạng UUID
 * @param {string} date - Định dạng ngày 'YYYY-MM-DD'
 */
export const getSessionsByRoomAndDate = async (roomId, date) => {
  try {
    const response = await schedulingAxios.get(`/sessions/room/${roomId}`, {
      params: { date }
    });
    return response.data.data || [];
  } catch (error) {
    console.error(`Lỗi khi lấy ca học phòng ${roomId} ngày ${date}:`, error);
    throw error;
  }
};

/**
 * Tạo mới một ca học (Xếp lịch vào phòng)
 * @param {object} payload - Chứa dữ liệu tạo lịch { classId, roomId, timeSlotId, sessionDate, isBulkSpread }
 */
export const createSession = async (payload) => {
  const response = await schedulingAxios.post('/sessions', payload);
  return response.data;
};

/**
 * Cập nhật ca học đã tồn tại
 * @param {string} id - Định dạng UUID của ca học cần sửa
 * @param {object} payload - Dữ liệu cập nhật mới
 */
export const updateSession = async (id, payload) => {
  const response = await schedulingAxios.put(`/sessions/${id}`, payload);
  return response.data;
};

/**
 * Xóa một ca học (Hủy lịch)
 * @param {string} id - Định dạng UUID của ca học cần xóa
 */
export const deleteSession = async (id) => {
  const response = await schedulingAxios.delete(`/sessions/${id}`);
  return response.data;
};

/**
 * Khóa hoặc Mở khóa trạng thái một ca học
 * @param {string} id - Định dạng UUID của ca học
 */
export const toggleLockSession = async (id) => {
  const response = await schedulingAxios.patch(`/sessions/${id}/toggle-lock`);
  return response.data;
};

/**
 * Tạo chuỗi lịch học hàng loạt cho khóa học (Bulk Spread)
 * Kết nối trực tiếp tới Endpoint định nghĩa @PostMapping("/bulk") ở Backend
 * @param {object} bulkPayload - Chứa cấu trúc DTO cần rải lịch chuỗi hàng loạt
 * @returns {Promise<object>} Phản hồi kết quả thành công/thất bại từ hệ thống
 */
export const createBulkSession = async (bulkPayload) => {
  try {
    const response = await schedulingAxios.post('/sessions/bulk', bulkPayload);
    return response.data; // Trả về cấu trúc ApiResponse định dạng ở Backend
  } catch (error) {
    console.error("Lỗi xảy ra tại Service khi gọi API tạo chuỗi lịch hàng loạt:", error);
    throw error;
  }
};


/**
 * 🚀 BỔ SUNG: Cập nhật phòng học hàng loạt cho các buổi học tương lai của một lớp
 * Dùng cho tính năng "Đổi phòng toàn bộ các buổi học còn lại"
 * * @param {Object} payload 
 * @param {string} payload.classId - UUID của lớp học
 * @param {string} payload.startDate - Ngày bắt đầu áp dụng (YYYY-MM-DD)
 * @param {string} payload.newRoomId - UUID của phòng học mới
 */
export const batchUpdateRoomForSessions = async (payload) => {
  try {
    const response = await schedulingAxios.patch('/sessions/batch-update-room', payload);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật phòng hàng loạt:", error);
    throw error;
  }
};