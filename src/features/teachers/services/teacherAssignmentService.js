import schedulingAxios from '../../../core/api/schedulingApi';

/**
 * Lấy danh sách tất cả phân công giáo viên
 */
export const getAllAssignments = async () => {
    const response = await schedulingAxios.get('/teacher-assignments');
    return response.data.data;
};

/**
 * Lấy phân công chi tiết theo ID
 */
export const getAssignmentById = async (id) => {
    const response = await schedulingAxios.get(`/teacher-assignments/${id}`);
    return response.data.data;
};

/**
 * Lấy danh sách phân công theo classId
 */
export const getAssignmentsByClassId = async (classId) => {
    const response = await schedulingAxios.get(`/teacher-assignments/class/${classId}`);
    return response.data.data;
};

/**
 * Lấy danh sách phân công theo teacherId
 */
export const getAssignmentsByTeacherId = async (teacherId) => {
    const response = await schedulingAxios.get(`/teacher-assignments/teacher/${teacherId}`);
    return response.data.data;
};

/**
 * Tạo mới một phân công giáo viên
 * @param {Object} assignmentData - Dữ liệu TeacherAssignmentRequest
 */
export const createAssignment = async (assignmentData) => {
    const response = await schedulingAxios.post('/teacher-assignments', assignmentData);
    return response.data.data;
};

/**
 * Cập nhật thông tin phân công
 * @param {string} id - UUID của bản ghi phân công
 * @param {Object} assignmentData - Dữ liệu TeacherAssignmentRequest
 */
export const updateAssignment = async (id, assignmentData) => {
    const response = await schedulingAxios.put(`/teacher-assignments/${id}`, assignmentData);
    return response.data.data;
};

/**
 * Xóa một phân công giáo viên
 * @param {string} id - UUID của bản ghi phân công
 */
export const deleteAssignment = async (id) => {
    const response = await schedulingAxios.delete(`/teacher-assignments/${id}`);
    return response.data;
};
