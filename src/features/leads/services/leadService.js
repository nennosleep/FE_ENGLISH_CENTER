import leadAxios from '../../../config/leadAxios';

// Mock data for Leads
let mockLeads = [
  {
    id: "lead-1",
    fullName: "Nguyễn Văn A",
    dateOfBirth: "2005-08-15",
    gender: "MALE",
    phone: "0909123456",
    email: "nva@gmail.com",
    interestedCourse: "IELTS",
    targetScore: "IELTS 6.5",
    preferredSchedule: "Tối Thứ 2-4-6",
    source: "Landing Page",
    status: "NEW",
    assignedTo: null,
    createdAt: "2026-07-01T10:00:00Z",
    note: "Đăng ký tư vấn khóa học IELTS từ chiến dịch mùa hè."
  },
  {
    id: "lead-2",
    fullName: "Trần Thị B",
    dateOfBirth: "2003-04-20",
    gender: "FEMALE",
    phone: "0912345678",
    email: "ttb@gmail.com",
    interestedCourse: "TOEIC",
    targetScore: "TOEIC 750",
    preferredSchedule: "Sáng Thứ 7-CN",
    source: "Facebook Fanpage",
    status: "WAITING_CONTACT",
    assignedTo: "consultant-1",
    createdAt: "2026-07-02T14:30:00Z",
    note: "Muốn học lớp cấp tốc để ra trường."
  },
  {
    id: "lead-3",
    fullName: "Phạm Văn C",
    dateOfBirth: "1998-11-02",
    gender: "MALE",
    phone: "0987654321",
    email: "pvc@gmail.com",
    interestedCourse: "IELTS",
    targetScore: "IELTS 7.0",
    preferredSchedule: "Tối Thứ 3-5-7",
    source: "Hotline",
    status: "CONSULTING",
    assignedTo: "consultant-1",
    createdAt: "2026-07-03T09:15:00Z",
    note: "Đã tư vấn lộ trình 6.0 lên 7.0. Đang cân nhắc về học phí."
  },
  {
    id: "lead-4",
    fullName: "Lê Thị D",
    dateOfBirth: "2006-09-12",
    gender: "FEMALE",
    phone: "0934567890",
    email: "ltd@gmail.com",
    interestedCourse: "TOEIC",
    targetScore: "TOEIC 650",
    preferredSchedule: "Tối Thứ 2-4-6",
    source: "Landing Page",
    status: "ADMITTED",
    assignedTo: "consultant-2",
    createdAt: "2026-07-04T16:00:00Z",
    note: "Đã cọc 1,000,000đ giữ chỗ lớp TOEIC-A1."
  },
  {
    id: "lead-5",
    fullName: "Hoàng Văn E",
    dateOfBirth: "2000-01-30",
    gender: "MALE",
    phone: "0956789012",
    email: "hve@gmail.com",
    interestedCourse: "COMMUNICATION",
    targetScore: "Fluent",
    preferredSchedule: "Tối Thứ 3-5-7",
    source: "Zalo Oa",
    status: "CONVERTED_SUCCESS",
    assignedTo: "consultant-1",
    createdAt: "2026-07-05T11:20:00Z",
    note: "Đã chuyển đổi thành học viên thành công. Mã học viên: ST260001"
  }
];

export const getLeads = async () => {
  // Trả về mock data cho UI nhanh
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockLeads]), 200);
  });
  // Khi kết nối thật:
  // const response = await leadAxios.get('/leads');
  // return response.data.data;
};

export const getLeadById = async (id) => {
  return new Promise((resolve, reject) => {
    const lead = mockLeads.find(l => l.id === id);
    setTimeout(() => {
      if (lead) resolve({ ...lead });
      else reject(new Error("Không tìm thấy Lead"));
    }, 200);
  });
  // Khi kết nối thật:
  // const response = await leadAxios.get(`/leads/${id}`);
  // return response.data.data;
};

export const createLead = async (leadData) => {
  return new Promise((resolve) => {
    const newLead = {
      id: `lead-${Date.now()}`,
      status: "NEW",
      createdAt: new Date().toISOString(),
      assignedTo: null,
      ...leadData
    };
    mockLeads.unshift(newLead);
    setTimeout(() => resolve(newLead), 200);
  });
  // Khi kết nối thật:
  // const response = await leadAxios.post('/leads', leadData);
  // return response.data.data;
};

export const updateLead = async (id, leadData) => {
  return new Promise((resolve, reject) => {
    const index = mockLeads.findIndex(l => l.id === id);
    if (index !== -1) {
      mockLeads[index] = { ...mockLeads[index], ...leadData };
      setTimeout(() => resolve(mockLeads[index]), 200);
    } else {
      reject(new Error("Không tìm thấy Lead để cập nhật"));
    }
  });
  // Khi kết nối thật:
  // const response = await leadAxios.put(`/leads/${id}`, leadData);
  // return response.data.data;
};

export const deleteLead = async (id) => {
  return new Promise((resolve) => {
    mockLeads = mockLeads.filter(l => l.id !== id);
    setTimeout(() => resolve(true), 200);
  });
  // Khi kết nối thật:
  // const response = await leadAxios.delete(`/leads/${id}`);
  // return response.data;
};

export const assignLead = async (id, consultantId) => {
  return updateLead(id, {
    assignedTo: consultantId,
    status: "WAITING_CONTACT"
  });
  // Khi kết nối thật:
  // const response = await leadAxios.patch(`/leads/${id}/assign`, { consultantId });
  // return response.data.data;
};

export const convertLeadToAdmitted = async (id, note) => {
  return updateLead(id, {
    status: "ADMITTED",
    note: note || "Khách hàng xác nhận đăng ký nhập học."
  });
  // Khi kết nối thật:
  // const response = await leadAxios.patch(`/leads/${id}/admit`, { note });
  // return response.data.data;
};
