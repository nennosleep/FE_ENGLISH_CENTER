import leadAxios from '../../../core/api/leadApi';

let mockInteractions = [
  {
    id: "int-1",
    leadId: "lead-3",
    consultantId: "consultant-1",
    contactMethod: "CALL",
    content: "Gọi điện giới thiệu lộ trình học IELTS 7.0. Khách hào hứng nhưng bảo học phí hơi cao, xin thêm thông tin ưu đãi.",
    createdAt: "2026-07-03T10:00:00Z"
  },
  {
    id: "int-2",
    leadId: "lead-3",
    consultantId: "consultant-1",
    contactMethod: "ZALO",
    content: "Gửi ảnh chụp cơ sở vật chất và bảng học phí chi tiết có kèm voucher giảm 10%.",
    createdAt: "2026-07-04T09:30:00Z"
  },
  {
    id: "int-3",
    leadId: "lead-2",
    consultantId: "consultant-1",
    contactMethod: "CALL",
    content: "Gọi điện lần 1: Khách bận không nghe máy, hẹn gọi lại sau.",
    createdAt: "2026-07-02T15:00:00Z"
  }
];

export const getInteractionsByLeadId = async (leadId) => {
  return new Promise((resolve) => {
    const list = mockInteractions.filter(i => i.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setTimeout(() => resolve(list), 200);
  });
  // Khi kết nối thật:
  // const response = await leadAxios.get(`/leads/${leadId}/interactions`);
  // return response.data.data;
};

export const createInteraction = async (leadId, interactionData) => {
  return new Promise((resolve) => {
    const newInt = {
      id: `int-${Date.now()}`,
      leadId,
      createdAt: new Date().toISOString(),
      ...interactionData
    };
    mockInteractions.unshift(newInt);
    setTimeout(() => resolve(newInt), 200);
  });
  // Khi kết nối thật:
  // const response = await leadAxios.post(`/leads/${leadId}/interactions`, interactionData);
  // return response.data.data;
};
