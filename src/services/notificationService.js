import identityAxios from '../config/identityAxios';

export const getNotifications = async (accountId) => {
  const response = await identityAxios.get(`/notifications`, {
    params: { accountId }
  });
  return response.data;
};

export const markNotificationAsRead = async (id, accountId) => {
  const response = await identityAxios.put(`/notifications/${id}/read`, null, {
    params: { accountId }
  });
  return response.data;
};

export const markAllNotificationsAsRead = async (accountId) => {
  const response = await identityAxios.put(`/notifications/read-all`, null, {
    params: { accountId }
  });
  return response.data;
};

export const createNotificationForTeacher = async (teacherId, title, message) => {
  const response = await identityAxios.post(`/notifications/teacher/${teacherId}`, null, {
    params: { title, message }
  });
  return response.data;
};
