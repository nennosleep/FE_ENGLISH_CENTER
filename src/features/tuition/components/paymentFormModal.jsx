import React, { useState, useEffect } from 'react';
import { X, Loader2, CreditCard } from 'lucide-react';
import { useToast } from '../../../components/ui/toast';

export default function PaymentFormModal({ isOpen, onClose, invoice, onPaymentSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (invoice) {
      const remaining = invoice.amount - invoice.paidAmount;
      setAmount(remaining.toString());
    }
  }, [invoice, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    
    if (isNaN(value) || value <= 0) {
      toast.warning("Vui lòng nhập số tiền thanh toán hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      await onPaymentSuccess(invoice.id, value);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Giao dịch thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const remainingAmount = invoice.amount - invoice.paidAmount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Thanh toán học phí</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-500 space-y-1.5">
            <p>Mã hóa đơn: <span className="font-bold text-slate-700">{invoice.invoiceCode}</span></p>
            <p>Học viên: <span className="font-bold text-slate-700">{invoice.studentName} ({invoice.studentCode})</span></p>
            <p>Tổng học phí: <span className="font-bold text-slate-700">{invoice.amount.toLocaleString()} đ</span></p>
            <p>Đã đóng: <span className="font-bold text-green-600">{invoice.paidAmount.toLocaleString()} đ</span></p>
            <p className="border-t border-slate-200 pt-1.5 font-semibold text-slate-600 flex justify-between">
              <span>Còn lại cần đóng:</span>
              <span className="text-indigo-600 font-extrabold">{remainingAmount.toLocaleString()} đ</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Số tiền thanh toán *</label>
            <input
              type="number"
              required
              max={remainingAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phương thức thanh toán *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              <option value="CASH">Tiền mặt tại trung tâm</option>
              <option value="CARD">Quẹt thẻ ngân hàng</option>
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-200 text-slate-500 font-medium rounded-lg text-sm hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Xác nhận đóng tiền
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
