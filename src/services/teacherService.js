import schedulingAxios from '../config/identityAxios';

/**
 * Lấy toàn bộ giáo viên
 */
export const getAllTeachers = async () => {
  const response = await schedulingAxios.get('/teachers');
  return response.data.data || [];
};

/**
 * Lấy danh sách giáo viên có phân trang / filter
 * @param {object} params
 */
export const getTeachers = async (params = {}) => {
  const response = await schedulingAxios.get('/teachers', { params });
  return response.data.data;
};

/**
 * Lấy giáo viên ACTIVE
 */
export const getActiveTeachers = async () => {
  try {
    const response = await schedulingAxios.get('/teachers');
    const allTeachers = response.data.data || [];

    return allTeachers.filter(
      (teacher) => teacher.status === 'ACTIVE'
    );
  } catch (error) {
    console.error('Lỗi khi lấy danh sách giáo viên:', error);
    throw error;
  }
};

/**
 * Lấy giáo viên theo chuyên môn khóa học
 * @param {string} courseId
 */
export const getTeachersByCourse = async (courseId) => {
  try {
    const response = await schedulingAxios.get(
      `/teachers/active-by-course?courseId=${courseId}`
    );

    return response.data.data || [];
  } catch (error) {
    console.error(
      `Lỗi khi lấy danh sách giáo viên theo courseId ${courseId}:`,
      error
    );
    throw error;
  }
};

/**
 * Lấy chi tiết 1 giáo viên
 * @param {string} id
 */
export const getTeacherById = async (id) => {
  const response = await schedulingAxios.get(`/teachers/${id}`);
  return response.data.data;
};

/**
 * Tạo giáo viên mới
 * @param {object} payload
 */
export const createTeacher = async (payload) => {
  const response = await schedulingAxios.post('/teachers', payload);
  return response.data;
};

/**
 * Cập nhật giáo viên
 * @param {string} id
 * @param {object} payload
 */
export const updateTeacher = async (id, payload) => {
  const response = await schedulingAxios.put(
    `/teachers/${id}`,
    payload
  );

  return response.data;
};

/**
 * Cập nhật trạng thái giáo viên
 * @param {string} id
 * @param {string} status
 */
export const updateTeacherStatus = async (id, status) => {
  const response = await schedulingAxios.patch(
    `/teachers/${id}/status`,
    { status }
  );

  return response.data;
};

/**
 * Xóa giáo viên
 * @param {string} id
 */
export const deleteTeacher = async (id) => {
  const response = await schedulingAxios.delete(`/teachers/${id}`);
  return response.data;
};