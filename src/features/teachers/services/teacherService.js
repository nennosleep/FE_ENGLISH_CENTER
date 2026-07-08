import identityAxios from '../../../core/api/identityApi';

export const getAllTeachers = async () => {
  const response = await identityAxios.get('/teachers');
  return response.data.data || [];
};

export const getTeachers = async (params = {}) => {
  const response = await identityAxios.get('/teachers', { params });
  return response.data.data;
};

export const getActiveTeachers = async () => {
  try {
    const response = await identityAxios.get('/teachers');
    const allTeachers = response.data.data || [];

    return allTeachers.filter((teacher) => teacher.status === 'ACTIVE');
  } catch (error) {
    console.error('Loi khi lay danh sach giao vien:', error);
    throw error;
  }
};

export const getTeachersByCourse = async (courseId) => {
  try {
    const response = await identityAxios.get(
      `/teachers/active-by-course?courseId=${courseId}`
    );

    return response.data.data || [];
  } catch (error) {
    console.error(`Loi khi lay giao vien theo courseId ${courseId}:`, error);
    throw error;
  }
};

export const getTeacherById = async (id) => {
  const response = await identityAxios.get(`/teachers/${id}`);
  return response.data.data;
};

export const createTeacher = async (payload) => {
  const response = await identityAxios.post('/teachers', payload);
  return response.data;
};

export const updateTeacher = async (id, payload) => {
  const response = await identityAxios.put(`/teachers/${id}`, payload);
  return response.data;
};

export const updateTeacherStatus = async (id, status) => {
  const response = await identityAxios.patch(`/teachers/${id}/status`, { status });
  return response.data;
};

export const getColleaguesByTeacherId = async (teacherId) => {
  try {
    const response = await identityAxios.get(`/teachers/${teacherId}/colleagues`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Loi khi lay dong nghiep theo teacherId ${teacherId}:`, error);
    throw error;
  }
};
