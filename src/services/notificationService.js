import identityAxios from '../config/identityAxios';

const unwrapPayload = (payload) => payload?.data ?? payload;

const unwrapList = (payload) => {
  const data = unwrapPayload(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

export const getNotifications = async (accountId) => {
  const response = await identityAxios.get(`/notifications`, {
    params: { accountId }
  });
  return unwrapList(response.data);
};

export const markNotificationAsRead = async (id, accountId) => {
  const response = await identityAxios.put(`/notifications/${id}/read`, null, {
    params: { accountId }
  });
  return unwrapPayload(response.data);
};

export const markAllNotificationsAsRead = async (accountId) => {
  const response = await identityAxios.put(`/notifications/read-all`, null, {
    params: { accountId }
  });
  return unwrapPayload(response.data);
};

export const createNotificationForTeacher = async (teacherId, title, message) => {
  const response = await identityAxios.post(`/notifications/teacher/${teacherId}`, null, {
    params: { title, message }
  });
  return unwrapPayload(response.data);
};
