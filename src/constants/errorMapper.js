// constants/errorMapper.js
export const ERROR_MESSAGES = {
    // 2000s - Room
    2001: "Phòng này đã tồn tại trong hệ thống.",
    2002: "Không tìm thấy phòng học.",
    2003: "Không thể bảo trì: Phòng vẫn còn lịch học trong tương lai.",
    
    // 3000s - TimeSlot
    3001: "Mã ca học đã tồn tại.",
    3002: "Ca học không tồn tại.",
    3003: "Lỗi thời gian: Giờ bắt đầu phải nhỏ hơn giờ kết thúc.",

    // 4000s - Scheduling
    4001: "Lỗi ngày học: Ngày bắt đầu phải trước ngày kết thúc.",
    4002: "Lịch học trong tuần bị trùng lặp, vui lòng kiểm tra lại.",

    // 5000s - Teacher
    5001: "Giáo viên không tồn tại.",
    5002: "Giáo viên này đã được phân công.",
    5003: "Giáo viên này đã được phân công vào buổi học này rồi.",

    // 6000s - Class & Course
    6002: "Lớp học không tồn tại.",
    6003: "Mã lớp học đã tồn tại.",
    6101: "Khóa học không tồn tại trên hệ thống.",

    // 7000s - Session
    7001: "Buổi học không tồn tại.",
    7002: "Phòng học đã có lịch xếp cho ca này trong ngày.",
    7003: "Lớp học đã có buổi học khác vào ca này trong ngày.",
    7004: "Buổi học đã bị khóa, không thể chỉnh sửa.",
    7005: "Không thể xóa buổi học đã bị khóa.",

    // General
    9999: "Đã xảy ra lỗi không xác định, vui lòng liên hệ admin.",
    5000: "Lỗi hệ thống nội bộ, vui lòng thử lại sau."
};