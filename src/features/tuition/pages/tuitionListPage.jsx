import React, { useState, useEffect } from 'react';
import { getInvoices, makePayment } from '../services/tuitionService';
import OverdueWarningBadge from '../components/overdueWarningBadge';
import PaymentFormModal from '../components/paymentFormModal';
import { Search, CreditCard, Eye, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../components/ui/toast';

export default function TuitionListPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách hóa đơn.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = (invoice) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  const handlePaymentSuccess = async (id, amountPaid) => {
    try {
      const updated = await makePayment(id, amountPaid);
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
      toast.success(`Giao dịch thành công! Đã thanh toán ${amountPaid.toLocaleString()} đ cho hóa đơn ${updated.invoiceCode}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Giao dịch thanh toán học phí thất bại.");
      throw err;
    }
  };

  const filtered = invoices.filter(i => {
    const matchesSearch = i.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý hóa đơn học phí</h1>
        <p className="text-sm text-slate-400">Theo dõi trạng thái hóa đơn, xử lý đóng học phí theo đợt.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên học viên, mã học viên, mã hóa đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PAID">Đã đóng đủ</option>
            <option value="UNPAID">Chưa đóng</option>
            <option value="PARTIALLY_PAID">Đóng một phần</option>
            <option value="OVERDUE">Quá hạn nợ</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            Chưa có thông tin hóa đơn nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Hóa đơn & Học viên</th>
                  <th className="px-6 py-4">Số tiền cần đóng</th>
                  <th className="px-6 py-4">Đã đóng</th>
                  <th className="px-6 py-4">Hạn đóng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.invoiceCode}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.studentName} ({item.studentCode})</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {item.amount.toLocaleString()} đ
                    </td>
                    <td className="px-6 py-4 text-green-600 font-bold">
                      {item.paidAmount.toLocaleString()} đ
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <OverdueWarningBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <Link
                        to={`/crm/tuition/${item.id}`}
                        className="inline-flex p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Chi tiết hóa đơn"
                      >
                        <Eye size={16} />
                      </Link>
                      {item.status !== 'PAID' && (
                        <button
                          onClick={() => handlePay(item)}
                          className="inline-flex p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Thanh toán"
                        >
                          <CreditCard size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        invoice={selectedInvoice}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
