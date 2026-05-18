import schedulingAxios from '../config/identityAxios';

/**
 * Lấy danh sách toàn bộ giáo viên từ hệ thống
 * @returns {Promise<Array>} Danh sách giáo viên
 */
export const getAllTeachers = async () => {
  const response = await schedulingAxios.get('/teachers'); // Thay đổi endpoint cho đúng với BE nếu cần
  console.log("All Teachers:", response.data);
  return response.data.data;
};

/**
 * Lấy danh sách giáo viên đang hoạt động (ACTIVE) để phân công vào lớp mới
 * @returns {Promise<Array>} Danh sách giáo viên ACTIVE
 */
export const getActiveTeachers = async () => {
  try {
    const response = await schedulingAxios.get('/teachers');
    const allTeachers = response.data.data || [];
    
    // Lọc chỉ lấy những giáo viên có status là ACTIVE
    const activeTeachers = allTeachers.filter(teacher => teacher.status === 'ACTIVE');
    
    return activeTeachers;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách giáo viên:", error);
    throw error;
  }
};

/**
 * BỔ SUNG MỚI: Lấy danh sách giáo viên ACTIVE theo chuyên môn của khóa học
 * @param {string} courseId - ID dạng UUID của khóa học được chọn
 * @returns {Promise<Array>} Danh sách giáo viên phù hợp chuyên môn
 */
export const getTeachersByCourse = async (courseId) => {
  try {
    // Gọi đúng đến endpoint riêng biệt vừa bổ sung ở Backend kèm theo query parameter
    const response = await schedulingAxios.get(`/teachers/active-by-course?courseId=${courseId}`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách giáo viên theo courseId ${courseId}:`, error);
    throw error;
  }
};