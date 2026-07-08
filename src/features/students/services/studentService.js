import studentAxios from '../../../config/studentAxios';

// Mock data for Students
let mockStudents = [
  {
    id: "student-1",
    studentCode: "ST260001",
    fullName: "Hoàng Văn E",
    dateOfBirth: "2000-01-30",
    gender: "MALE",
    phone: "0956789012",
    email: "hve@gmail.com",
    course: "COMMUNICATION",
    status: "STUDYING",
    createdAt: "2026-07-05T11:20:00Z",
    leadId: "lead-5"
  },
  {
    id: "student-2",
    studentCode: "ST260002",
    fullName: "Trần Thị Lan",
    dateOfBirth: "2001-12-05",
    gender: "FEMALE",
    phone: "0967890123",
    email: "lan.tt@gmail.com",
    course: "IELTS",
    status: "STUDYING",
    createdAt: "2026-06-20T08:00:00Z",
    leadId: "lead-old-1"
  },
  {
    id: "student-3",
    studentCode: "ST260003",
    fullName: "Nguyễn Tuấn Anh",
    dateOfBirth: "1999-07-15",
    gender: "MALE",
    phone: "0978901234",
    email: "anh.nt@gmail.com",
    course: "TOEIC",
    status: "COMPLETED",
    createdAt: "2026-03-01T09:00:00Z",
    leadId: "lead-old-2"
  },
  {
    id: "student-4",
    studentCode: "ST260004",
    fullName: "Vũ Hoàng Nam",
    dateOfBirth: "2004-02-18",
    gender: "MALE",
    phone: "0989012345",
    email: "nam.vh@gmail.com",
    course: "IELTS",
    status: "RESERVED",
    createdAt: "2026-05-10T14:00:00Z",
    leadId: "lead-old-3"
  }
];

export const getStudents = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockStudents]), 200);
  });
  // Khi kết nối thật:
  // const response = await studentAxios.get('/students');
  // return response.data.data;
};

export const getStudentById = async (id) => {
  return new Promise((resolve, reject) => {
    const student = mockStudents.find(s => s.id === id);
    setTimeout(() => {
      if (student) resolve({ ...student });
      else reject(new Error("Không tìm thấy học viên"));
    }, 200);
  });
  // Khi kết nối thật:
  // const response = await studentAxios.get(`/students/${id}`);
  // return response.data.data;
};

export const updateStudent = async (id, studentData) => {
  return new Promise((resolve, reject) => {
    const index = mockStudents.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStudents[index] = { ...mockStudents[index], ...studentData };
      setTimeout(() => resolve(mockStudents[index]), 200);
    } else {
      reject(new Error("Không tìm thấy học viên để cập nhật"));
    }
  });
  // Khi kết nối thật:
  // const response = await studentAxios.put(`/students/${id}`, studentData);
  // return response.data.data;
};

export const createStudentFromLead = async (studentData) => {
  return new Promise((resolve) => {
    const newStudent = {
      id: `student-${Date.now()}`,
      studentCode: `ST2600${mockStudents.length + 1}`,
      status: "STUDYING",
      createdAt: new Date().toISOString(),
      ...studentData
    };
    mockStudents.push(newStudent);
    setTimeout(() => resolve(newStudent), 200);
  });
  // Khi kết nối thật:
  // const response = await studentAxios.post('/students', studentData);
  // return response.data.data;
};
