import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getInvoiceById, makePayment } from '../services/tuitionService';
import OverdueWarningBadge from '../components/overdueWarningBadge';
import PaymentFormModal from '../components/paymentFormModal';
import { ChevronLeft, User, Calendar, CreditCard, DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '../../../core/components';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const data = await getInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      console.error(err);
      toast.error("Không tìm thấy hóa đơn học phí.");
      navigate('/crm/tuition');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (id, amountPaid) => {
    try {
      const updated = await makePayment(id, amountPaid);
      setInvoice(updated);
      toast.success(`Đã đóng học phí thành công ${amountPaid.toLocaleString()} đ!`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Thanh toán thất bại.");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const remaining = invoice.amount - invoice.paidAmount;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link to="/crm/tuition" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-all">
          <ChevronLeft size={16} />
          Quay lại danh sách hóa đơn
        </Link>
      </div>

      <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden">
        {/* Header invoice details */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hóa đơn học phí</span>
            <h2 className="text-xl font-bold mt-1">Mã: {invoice.invoiceCode}</h2>
          </div>
          <OverdueWarningBadge status={invoice.status} />
        </div>

        {/* Invoice details body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-2.5">
              <User size={18} className="text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Học viên</span>
                <span className="text-sm font-bold text-slate-800">{invoice.studentName}</span>
                <span className="text-xs text-slate-500 block">Mã học viên: {invoice.studentCode}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Calendar size={18} className="text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Hạn thanh toán</span>
                <span className="text-sm font-bold text-slate-800">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                <span className="text-xs text-slate-500 block">Ngày sinh: 15/08/2005</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Chi tiết giá trị khóa học</h3>
            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 p-3 font-semibold text-slate-500 flex justify-between border-b border-slate-100">
                <span>Mô tả khoản học</span>
                <span>Thành tiền</span>
              </div>
              <div className="p-3 font-medium text-slate-700 flex justify-between border-b border-slate-100">
                <span>Học phí khóa học {invoice.course}</span>
                <span>{invoice.amount.toLocaleString()} đ</span>
              </div>
              <div className="p-3 font-medium text-slate-700 flex justify-between border-b border-slate-100 bg-slate-50/50">
                <span>Đã đóng trước đó</span>
                <span className="text-green-600 font-bold">{invoice.paidAmount.toLocaleString()} đ</span>
              </div>
              <div className="p-3 font-extrabold text-slate-800 flex justify-between bg-indigo-50/30 text-sm">
                <span>Còn lại phải nộp</span>
                <span className="text-indigo-600 font-black">{remaining.toLocaleString()} đ</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          {invoice.status !== 'PAID' && (
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
            >
              <CreditCard size={18} />
              Thanh toán ngay lập tức
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        invoice={invoice}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
