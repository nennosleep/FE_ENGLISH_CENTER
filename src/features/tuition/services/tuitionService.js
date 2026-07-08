import tuitionAxios from '../../../config/tuitionAxios';

// Mock data for Invoices
let mockInvoices = [
  {
    id: "inv-1",
    invoiceCode: "HD0001",
    studentCode: "ST260001",
    studentName: "Hoàng Văn E",
    course: "COMMUNICATION",
    amount: 4500000,
    paidAmount: 4500000,
    status: "PAID",
    dueDate: "2026-07-10",
    createdAt: "2026-07-06T08:00:00Z"
  },
  {
    id: "inv-2",
    invoiceCode: "HD0002",
    studentCode: "ST260002",
    studentName: "Trần Thị Lan",
    course: "IELTS",
    amount: 9500000,
    paidAmount: 3000000, // Đóng một phần
    status: "PARTIALLY_PAID",
    dueDate: "2026-07-05", // Quá hạn đóng phần còn lại
    createdAt: "2026-06-21T09:00:00Z"
  },
  {
    id: "inv-3",
    invoiceCode: "HD0003",
    studentCode: "ST260003",
    studentName: "Nguyễn Tuấn Anh",
    course: "TOEIC",
    amount: 3500000,
    paidAmount: 0,
    status: "OVERDUE", // Đã quá hạn
    dueDate: "2026-06-15",
    createdAt: "2026-03-01T09:00:00Z"
  },
  {
    id: "inv-4",
    invoiceCode: "HD0004",
    studentCode: "ST260004",
    studentName: "Vũ Hoàng Nam",
    course: "IELTS",
    amount: 9500000,
    paidAmount: 0,
    status: "UNPAID", // Chưa đóng nhưng chưa quá hạn
    dueDate: "2026-07-20",
    createdAt: "2026-05-10T14:00:00Z"
  }
];

export const getInvoices = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockInvoices]), 200);
  });
  // Khi kết nối thật:
  // const response = await tuitionAxios.get('/invoices');
  // return response.data.data;
};

export const getInvoiceById = async (id) => {
  return new Promise((resolve, reject) => {
    const inv = mockInvoices.find(i => i.id === id);
    setTimeout(() => {
      if (inv) resolve({ ...inv });
      else reject(new Error("Không tìm thấy hóa đơn"));
    }, 200);
  });
  // Khi kết nối thật:
  // const response = await tuitionAxios.get(`/invoices/${id}`);
  // return response.data.data;
};

export const makePayment = async (id, amountPaid) => {
  return new Promise((resolve, reject) => {
    const index = mockInvoices.findIndex(i => i.id === id);
    if (index === -1) return reject(new Error("Hóa đơn không tồn tại"));
    
    const inv = mockInvoices[index];
    const totalPaid = inv.paidAmount + amountPaid;
    
    if (totalPaid > inv.amount) {
      return reject(new Error("Số tiền thanh toán vượt quá số tiền còn lại của hóa đơn."));
    }

    inv.paidAmount = totalPaid;
    if (totalPaid === inv.amount) {
      inv.status = "PAID";
    } else {
      inv.status = "PARTIALLY_PAID";
    }
    
    setTimeout(() => resolve({ ...inv }), 200);
  });
  // Khi kết nối thật:
  // const response = await tuitionAxios.post(`/invoices/${id}/payments`, { amount: amountPaid });
  // return response.data.data;
};

// Giả lập Cron Job quét nợ quá hạn trên 50.000 bản ghi
export const runOverdueCronJobSimulation = async (onProgress) => {
  return new Promise((resolve) => {
    const totalRecords = 50000;
    const batchSize = 5000;
    let scanned = 0;
    let overdueFound = 0;
    let step = 0;

    const interval = setInterval(() => {
      scanned += batchSize;
      overdueFound += Math.round(batchSize * 0.3); // Giả lập 30% quá hạn như trong báo cáo
      step++;

      const progress = {
        scanned,
        total: totalRecords,
        overdueFound,
        percentage: Math.round((scanned / totalRecords) * 100),
        cpuUsage: Math.floor(Math.random() * 25) + 5, // 5% -> 30% CPU
        ramUsage: Math.floor(Math.random() * 100) + 150 // 150MB -> 250MB
      };

      onProgress(progress);

      if (scanned >= totalRecords) {
        clearInterval(interval);
        
        // Cập nhật ngẫu nhiên hóa đơn mock chưa đóng mà quá hạn sang OVERDUE
        mockInvoices.forEach(inv => {
          if (inv.status === 'UNPAID' && new Date(inv.dueDate) < new Date()) {
            inv.status = 'OVERDUE';
          }
        });

        resolve({
          scanned: totalRecords,
          overdueFound,
          timeElapsedSeconds: 1.5,
          status: "SUCCESS"
        });
      }
    }, 150);
  });
};
