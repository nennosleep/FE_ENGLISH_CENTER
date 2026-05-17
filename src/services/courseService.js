import schedulingAxios from '../config/identityAxios';

export const getCourses = async () => {
  const response = await schedulingAxios.get('/courses');

  console.log(response.data);

  return response.data.data;
};