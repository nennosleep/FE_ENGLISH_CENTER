import enrollmentAxios from '../../../config/enrollmentAxios';

// Mock data for Class Capacities and Enrollments
let mockClasses = [
  {
    id: "class-1",
    classCode: "IELTS-A1",
    className: "Lớp học IELTS Sơ Cấp A1",
    course: "IELTS",
    maxCapacity: 20,
    currentOccupancy: 18,
    schedule: "Tối Thứ 2-4-6 (19:30 - 21:00)",
    room: "P.101"
  },
  {
    id: "class-2",
    classCode: "TOEIC-A1",
    className: "Lớp học TOEIC Luyện Đề",
    course: "TOEIC",
    maxCapacity: 15,
    currentOccupancy: 15, // Đầy sĩ số
    schedule: "Chiều Thứ 7-CN (14:00 - 15:30)",
    room: "P.102"
  },
  {
    id: "class-3",
    classCode: "COMMUNICATION-B1",
    className: "Lớp Giao Tiếp Cơ Bản B1",
    course: "COMMUNICATION",
    maxCapacity: 25,
    currentOccupancy: 5, // Trống nhiều
    schedule: "Tối Thứ 3-5-7 (18:00 - 19:30)",
    room: "P.103"
  }
];

let mockEnrollments = [
  {
    id: "enroll-1",
    studentId: "student-1",
    studentCode: "ST260001",
    studentName: "Hoàng Văn E",
    classId: "class-3",
    classCode: "COMMUNICATION-B1",
    status: "ENROLLED",
    createdAt: "2026-07-06T08:00:00Z"
  },
  {
    id: "enroll-2",
    studentId: "student-2",
    studentCode: "ST260002",
    studentName: "Trần Thị Lan",
    classId: "class-1",
    classCode: "IELTS-A1",
    status: "ENROLLED",
    createdAt: "2026-06-21T09:00:00Z"
  }
];

export const getClassesWithCapacity = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockClasses]), 200);
  });
  // Khi kết nối thật:
  // const response = await enrollmentAxios.get('/classes/capacity');
  // return response.data.data;
};

export const getEnrollments = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockEnrollments]), 200);
  });
  // Khi kết nối thật:
  // const response = await enrollmentAxios.get('/enrollments');
  // return response.data.data;
};

export const enrollStudent = async (studentId, studentCode, studentName, classId) => {
  return new Promise((resolve, reject) => {
    const classObj = mockClasses.find(c => c.id === classId);
    
    setTimeout(() => {
      if (!classObj) {
        return reject(new Error("Lớp học không tồn tại."));
      }
      
      // Kiểm tra ràng buộc sĩ số tối đa (Max Capacity)
      if (classObj.currentOccupancy >= classObj.maxCapacity) {
        return reject(new Error(`Lớp học ${classObj.classCode} đã đạt sĩ số tối đa (${classObj.maxCapacity}/${classObj.maxCapacity}). Tránh lỗi Overbooking!`));
      }

      // Xếp lớp thành công
      classObj.currentOccupancy += 1;
      
      const newEnrollment = {
        id: `enroll-${Date.now()}`,
        studentId,
        studentCode,
        studentName,
        classId,
        classCode: classObj.classCode,
        status: "ENROLLED",
        createdAt: new Date().toISOString()
      };
      
      mockEnrollments.unshift(newEnrollment);

      // Phát thông điệp qua Message Broker (Kafka) sang TuitionService (giả lập thông báo)
      console.log(`[Kafka] Publish Event 'enrollment.student.enrolled' for student ${studentCode} in class ${classObj.classCode}`);
      
      resolve(newEnrollment);
    }, 300);
  });
  // Khi kết nối thật:
  // const response = await enrollmentAxios.post('/enrollments', { studentId, classId });
  // return response.data.data;
};

export const cancelEnrollment = async (enrollmentId) => {
  return new Promise((resolve, reject) => {
    const index = mockEnrollments.findIndex(e => e.id === enrollmentId);
    if (index === -1) return reject(new Error("Không tìm thấy thông tin xếp lớp."));
    
    const enroll = mockEnrollments[index];
    const classObj = mockClasses.find(c => c.id === enroll.classId);
    if (classObj) {
      classObj.currentOccupancy = Math.max(0, classObj.currentOccupancy - 1);
    }
    
    mockEnrollments.splice(index, 1);
    setTimeout(() => resolve(true), 200);
  });
};
