import identityAxios from '../config/identityAxios';

/**
 * Gán chuyên môn cho giảng viên (Assign Specialization)
 * @param {object} payload - Chứa { teacherId, specializationId }
 */
export const assignTeacherSpecialization = async (payload) => {
  const response = await identityAxios.post('/teacher-specializations', payload);
  return response.data;
};

/**
 * Lấy danh sách liên kết theo ID giảng viên
 * @param {string} teacherId - Định dạng UUID
 */
export const getSpecializationsByTeacherId = async (teacherId) => {
  try {
    const response = await identityAxios.get(`/teacher-specializations/teacher/${teacherId}`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Lỗi khi lấy chuyên môn của giảng viên ${teacherId}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách liên kết theo ID chuyên môn
 * @param {string} specializationId - Định dạng UUID
 */
export const getTeachersBySpecializationId = async (specializationId) => {
  try {
    const response = await identityAxios.get(`/teacher-specializations/specialization/${specializationId}`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Lỗi khi lấy giảng viên thuộc chuyên môn ${specializationId}:`, error);
    throw error;
  }
};

/**
 * Xóa liên kết chuyên môn của giảng viên
 * @param {string} teacherId - Định dạng UUID
 * @param {string} specializationId - Định dạng UUID
 */
export const removeTeacherSpecialization = async (teacherId, specializationId) => {
  const response = await identityAxios.delete('/teacher-specializations', {
    params: {
      teacherId,
      specializationId
    }
  });
  return response.data;
};
