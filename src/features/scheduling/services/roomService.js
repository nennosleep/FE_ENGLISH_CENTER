import schedulingAxios from '../../../config/schedulingAxios'; 

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

/**
 * 🚀 BỔ SUNG: Lấy danh sách các phòng khả dụng (phòng trống)
 * Dùng cho tính năng "Đổi phòng" trong Modal.
 * @param {string} date - Ngày học (định dạng YYYY-MM-DD)
 * @param {string} timeSlotId - UUID của ca học
 */
export const getAvailableRoomsForSession = async (date, timeSlotId) => {
  try {
    const response = await schedulingAxios.get('/rooms/available', {
      params: { 
        date, 
        timeSlotId 
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng trống:", error);
    throw error;
  }
};

/**
 * 🚀 BỔ SUNG: Lấy danh sách các phòng khả dụng cho toàn bộ chuỗi lịch còn lại của lớp
 * Dùng để lọc danh sách phòng trước khi thực hiện batch update, 
 * đảm bảo không chọn phải phòng bị trùng lịch ở bất kỳ buổi nào.
 * * @param {string} classId - UUID của lớp học
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
 */
export const getAvailableRoomsForBatchUpdateSessions = async (classId, startDate) => {
  try {
    const response = await schedulingAxios.get('/rooms/available-for-batch', {
      params: { 
        classId, 
        startDate 
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng khả dụng cho batch:", error);
    throw error;
  }
};

export const deleteRoom = async (roomId) => {
  const response = await schedulingAxios.delete(`/rooms/${roomId}`);
  return response.data;
};


/**
 * 🚀 BỔ SUNG: Chuyển trạng thái phòng sang BẢO TRÌ (MAINTENANCE)
 * Hàm này sẽ thực hiện kiểm tra ràng buộc ở Backend trước khi thay đổi trạng thái.
 * @param {string} roomId - UUID của phòng học cần bảo trì
 */
export const markRoomAsMaintenance = async (roomId) => {
  try {
    // Gọi đến API để thực hiện logic: Kiểm tra lịch trống -> Chuyển status
    const response = await schedulingAxios.patch(`/rooms/${roomId}/maintenance`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi chuyển trạng thái bảo trì phòng:", error);
    throw error; // Ném lỗi để Component bắt và hiển thị thông báo
  }
};
