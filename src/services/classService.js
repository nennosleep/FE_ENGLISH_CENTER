import schedulingAxios from '../config/schedulingAxios';

export const getAllClasses = async () => {
  const response = await schedulingAxios.get('/classes');
  return response.data.data;
};
/**
 * Lấy chi tiết thông tin khóa học của một lớp cụ thể
 * @param {string} classId - UUID của lớp học
 */
export const getCourseByClassId = async (classId) => {
  const response = await schedulingAxios.get(`/classes/${classId}/course`);
  return response.data.data;
};
/**
 * Lấy danh sách các lớp học đang mở để gán lịch trong Modal
 */
export const getAvailableClasses = async () => {
  const response = await schedulingAxios.get('/classes');
  return response.data.data;
};

/**
 * Lấy danh sách lớp phân loại theo trạng thái: Chưa có lịch và Đã có lịch (Session)
 */
export const getClassScheduleStatus = async () => {
  const response = await schedulingAxios.get('/classes/schedule-status');
  return response.data.data;
};

/* ─── BỔ SUNG: SERVICE TẠO MỚI LỚP HỌC ─── */
/**
 * Tạo mới một lớp học và khung lịch đi kèm
 * @param {Object} classData - Dữ liệu ClassRequest (bao gồm tên lớp, khung giờ, ngày học...)
 */
export const createClass = async (classData) => {
  const response = await schedulingAxios.post('/classes', classData);
  return response.data.data;
};

/* ─── BỔ SUNG: SERVICE CẬP NHẬT LỚP HỌC ─── */
/**
 * Cập nhật thông tin lớp học theo ID
 * @param {string} id - UUID của lớp học cần chỉnh sửa
 * @param {Object} classData - Dữ liệu ClassRequest chứa thông tin mới
 */
export const updateClass = async (id, classData) => {
  const response = await schedulingAxios.put(`/classes/${id}`, classData);
  return response.data.data;
};

/**
 * 🚀 TẠO MỚI khung thời gian lặp lại (các Thứ trong tuần) cho một lớp học
 * @param {string} classId - ID của lớp học cần cấu hình
 * @param {number[]} daysOfWeek - Mảng các Thứ được chọn (Ví dụ: [2, 4, 6])
 */
export const createClassSchedulePattern = async (classId, daysOfWeek) => {
  const payload = {
    classId: classId,
    daysOfWeek: daysOfWeek
  };
  
  // Gửi lệnh PUT lên backend để xóa lịch cũ (nếu có) và tạo mới loạt bản ghi Thứ vừa chọn
  const response = await schedulingAxios.put('/class-schedules/pattern', payload);
  return response.data; // Trả về ApiResponse tổng thể (chứa code: 1000, message: "Success")
};


export const getClassesWithoutTeacher = async () => {
    const response = await schedulingAxios.get('/classes/unassignedTeacher-classes');
    return response.data.data; // Trả về mảng danh sách lớp gọn gàng
};

/**
 * Lấy danh sách các lớp học hiện chưa được cấu hình lịch (classSchedules)
 */
export const getClassesWithoutSchedule = async () => {
  const response = await schedulingAxios.get('/classes/without-schedule');
  return response.data.data;
};