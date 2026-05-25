import schedulingAxios from '../config/schedulingAxios'; 

/**
 * Lấy danh sách toàn bộ phòng học (Đổ vào bảng quản lý tổng quan)
 */
export const getRooms = async () => {
  const response = await schedulingAxios.get('/rooms');
  return response.data.data;
};

/**
 * 🚀 BỔ SUNG: Lấy danh sách phòng học đang ở trạng thái ACTIVE 
 * Thường dùng để đổ vào các ô Dropdown/Select khi xếp lịch học mới, tránh chọn phải phòng đang bảo trì
 */
export const getActiveRooms = async () => {
  const response = await schedulingAxios.get('/rooms/active');
  return response.data.data;
};

/**
 * 🚀 BỔ SUNG: Lấy chi tiết trạng thái trưng dụng dài hạn & phân rã lịch học theo tuần của phòng học
 * @param {string} roomId - UUID của phòng học cần xem
 * @param {string|Date} weekStartDate - Ngày đầu tuần (Thứ Hai) dưới dạng chuỗi 'YYYY-MM-DD' hoặc đối tượng Date
 */
export const getRoomUtilization = async (roomId, weekStartDate) => {
  // Dự phòng trường hợp truyền vào đối tượng Date của JS, tự động format về chuỗi YYYY-MM-DD
  const formattedDate = weekStartDate instanceof Date 
    ? weekStartDate.toISOString().split('T')[0] 
    : weekStartDate;

  const response = await schedulingAxios.get(`/rooms/${roomId}/utilization`, {
    params: {
      weekStartDate: formattedDate
    }
  });
  
  // Trả về thẳng object RoomUtilizationResponse (gồm longTermClasses, weeklySessions, utilizationRate,...)
  return response.data.data;
};

export const createRoom = async (roomData) => {
  const response = await schedulingAxios.post('/rooms', roomData);
  return response.data.data;
};

export const updateRoom = async (id, roomData) => {
  const response = await schedulingAxios.put(`/rooms/${id}`, roomData);
  return response.data.data;
};