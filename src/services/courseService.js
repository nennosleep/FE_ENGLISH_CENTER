import schedulingAxios from '../config/identityAxios';

// 1. Lấy tất cả khóa học
export const getCourses = async () => {
  const response = await schedulingAxios.get('/courses');
  console.log(response.data);
  return response.data.data;
};

// 2. Lấy khóa học theo ID (UUID)
export const getCourseById = async (id) => {
  const response = await schedulingAxios.get(`/courses/${id}`);
  console.log(response.data);
  return response.data.data;
};

// 3. Lấy khóa học theo mã code
export const getCourseByCode = async (code) => {
  const response = await schedulingAxios.get(`/courses/code/${code}`);
  console.log(response.data);
  return response.data.data;
};

// 4. Tạo mới khóa học
export const createCourse = async (courseData) => {
  const response = await schedulingAxios.post('/courses', courseData);
  console.log(response.data);
  return response.data.data;
};

// 5. Cập nhật khóa học theo ID
export const updateCourse = async (id, courseData) => {
  const response = await schedulingAxios.put(`/courses/${id}`, courseData);
  console.log(response.data);
  return response.data.data;
};

// 6. Xóa khóa học theo ID
export const deleteCourse = async (id) => {
  const response = await schedulingAxios.delete(`/courses/${id}`);
  console.log(response.data);
  return response.data; // Thường delete trả về thông báo message, không có object data bên trong
};