import schedulingAxios from '../../../config/schedulingAxios';

/**
 * Đồng bộ hóa phân công cho lớp học (Sync)
 */
export const syncSessionTeacherAssignment = async (classId) => {
  try {
    const response = await schedulingAxios.post(`/session-teachers/sync/${classId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi đồng bộ phân công cho lớp ${classId}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách giáo viên tham gia vào 1 buổi học
 */
export const getTeachersBySessionId = async (sessionId) => {
  try {
    const response = await schedulingAxios.get(`/session-teachers/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách giáo viên cho buổi học ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Tạo phân công giáo viên cho session
 */
export const createSessionTeacher = async (payload) => {
  try {
    const response = await schedulingAxios.post('/session-teachers', payload);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo phân công giáo viên:', error);
    throw error;
  }
};

/**
 * Xóa giáo viên khỏi session
 */
export const deleteSessionTeacher = async (sessionId, teacherId) => {
  try {
    const response = await schedulingAxios.delete(`/session-teachers/${sessionId}/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa giáo viên ${teacherId} khỏi session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách giáo viên rảnh cho một buổi học cụ thể
 */
export const getAvailableColleaguesForSession = async (sessionId) => {
  try {
    const response = await schedulingAxios.get(`/session-teachers/available/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách giáo viên rảnh cho session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách giáo viên rảnh cho toàn bộ lịch trình của lớp
 */
export const getAvailableTeachersForClass = async (classId) => {
  try {
    const response = await schedulingAxios.get(`/session-teachers/available-for-class/${classId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách giáo viên rảnh cho lớp ${classId}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách giáo viên khả dụng để thay thế cho một lớp
 * @param {string} classId - ID của lớp học
 * @param {string} currentTeacherId - ID của giáo viên hiện tại (để không loại trừ người này)
 */
export const getAvailableTeachersForSubstitute = async (classId, currentTeacherId) => {
  try {
    const response = await schedulingAxios.get(`/session-teachers/available-for-substitute/${classId}`, {
      params: { currentTeacherId }
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách giáo viên thay thế cho lớp ${classId}:`, error);
    throw error;
  }
};

