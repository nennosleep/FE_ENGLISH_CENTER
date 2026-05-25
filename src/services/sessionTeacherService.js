import schedulingAxios from '../config/schedulingAxios';
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
 * @param {string} sessionId - ID của buổi học
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
export const createSessionTeacher = async (
  payload
) => {
  try {
    const response =
      await schedulingAxios.post(
        '/session-teachers',
        payload
      );

    return response.data;
  } catch (error) {
    console.error(
      'Lỗi khi tạo phân công giáo viên:',
      error
    );

    throw error;
  }
};

/**
 * Xóa giáo viên khỏi session
 */
export const deleteSessionTeacher =
  async (sessionId, teacherId) => {
    try {
      const response =
        await schedulingAxios.delete(
          `/session-teachers/${sessionId}/${teacherId}`
        );

      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi xóa giáo viên ${teacherId} khỏi session ${sessionId}:`,
        error
      );

      throw error;
    }
  };
  /**
 * Lấy danh sách giáo viên rảnh cho một buổi học cụ thể
 * @param {string} sessionId - ID của buổi học
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