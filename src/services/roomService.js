import schedulingAxios from '../config/schedulingAxios'; 
// Lưu ý: Bạn kiểm tra lại xem file identityAxios nằm ở đâu nhé. 
// Nếu identityAxios nằm ở src/config/identityAxios.js thì sửa thành: import schedulingAxios from '../config/identityAxios';

/**
 * Lấy danh sách toàn bộ phòng học (Đổ vào Dropdown chọn phòng)
 */
export const getRooms = async () => {
  const response = await schedulingAxios.get('/rooms');
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