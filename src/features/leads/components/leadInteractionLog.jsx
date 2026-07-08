import React, { useState, useEffect } from 'react';
import { getInteractionsByLeadId, createInteraction } from '../services/interactionService';
import { MessageSquare, Phone, Send, Loader2, Calendar } from 'lucide-react';
import { useToast } from '../../../components/ui/toast';

export default function LeadInteractionLog({ leadId }) {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newLog, setNewLog] = useState('');
  const [contactMethod, setContactMethod] = useState('CALL');
  const toast = useToast();

  useEffect(() => {
    fetchInteractions();
  }, [leadId]);

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const data = await getInteractionsByLeadId(leadId);
      setInteractions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLog.trim()) return;

    setSubmitting(true);
    try {
      const added = await createInteraction(leadId, {
        contactMethod,
        content: newLog,
        consultantId: "consultant-1"
      });
      setInteractions(prev => [added, ...prev]);
      setNewLog('');
      toast.success("Đã ghi nhận tương tác chăm sóc!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi ghi tương tác.");
    } finally {
      setSubmitting(false);
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'CALL':
        return <Phone size={14} className="text-amber-500" />;
      default:
        return <MessageSquare size={14} className="text-blue-500" />;
    }
  };

  const getMethodText = (method) => {
    switch (method) {
      case 'CALL': return 'Điện thoại';
      case 'ZALO': return 'Zalo';
      case 'EMAIL': return 'Email';
      case 'FACEBOOK': return 'Facebook';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
        <MessageSquare size={20} className="text-indigo-500" />
        Nhật ký chăm sóc & tương tác
      </h3>

      {/* Form thêm tương tác mới */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hình thức liên lạc:</span>
          <div className="flex gap-2">
            {['CALL', 'ZALO', 'EMAIL', 'FACEBOOK'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setContactMethod(method)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  contactMethod === method
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {getMethodText(method)}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={newLog}
            onChange={(e) => setNewLog(e.target.value)}
            required
            placeholder="Ghi chú chi tiết cuộc trò chuyện (Ví dụ: Khách đồng ý học thử, khách bận không nghe máy...)"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none pr-12"
          />
          <button
            type="submit"
            disabled={submitting || !newLog.trim()}
            className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg transition-all shadow-md shadow-indigo-600/10"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>

      {/* List tương tác */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-indigo-500" />
        </div>
      ) : interactions.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Chưa có cuộc tương tác nào được ghi nhận.
        </div>
      ) : (
        <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6">
          {interactions.map((item) => (
            <div key={item.id} className="relative">
              {/* Timeline dot */}
              <span className="absolute -left-[31px] top-1 bg-white border-2 border-indigo-500 rounded-full w-4.5 h-4.5 flex items-center justify-center">
                {getMethodIcon(item.contactMethod)}
              </span>

              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {getMethodText(item.contactMethod)}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{item.content}</p>
                <div className="text-xs text-slate-400 text-right">
                  Tư vấn viên: <span className="font-medium text-slate-600">Nguyễn Consultant</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
