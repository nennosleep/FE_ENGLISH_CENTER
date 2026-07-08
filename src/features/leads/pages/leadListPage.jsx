import React, { useState, useEffect } from 'react';
import { getLeads, createLead, updateLead, deleteLead } from '../services/leadService';
import LeadStatusBadge from '../components/leadStatusBadge';
import LeadFormModal from '../components/leadFormModal';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, PhoneCall, Calendar } from 'lucide-react';
import { useToast } from '../../../core/components';

export default function LeadListPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách Lead.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedLead(null);
    setModalOpen(true);
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ nhu cầu này?")) {
      try {
        await deleteLead(id);
        setLeads(prev => prev.filter(l => l.id !== id));
        toast.success("Đã xóa hồ sơ nhu cầu!");
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi xóa.");
      }
    }
  };

  const handleSaveSuccess = async (formData) => {
    try {
      if (selectedLead) {
        const updated = await updateLead(selectedLead.id, formData);
        setLeads(prev => prev.map(l => l.id === selectedLead.id ? updated : l));
        toast.success("Cập nhật hồ sơ nhu cầu thành công!");
      } else {
        const created = await createLead(formData);
        setLeads(prev => [created, ...prev]);
        toast.success("Thêm hồ sơ nhu cầu thành công!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu thông tin.");
    }
  };

  // Filter leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.phone.includes(searchTerm) || 
                          l.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý hồ sơ nhu cầu (Leads)</h1>
          <p className="text-sm text-slate-400">Tiếp nhận, chăm sóc và theo dõi trạng thái tư vấn khách hàng.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10 shrink-0"
        >
          <Plus size={18} />
          Thêm hồ sơ Lead
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, số điện thoại, email..."
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
            <option value="NEW">Mới tiếp nhận</option>
            <option value="WAITING_CONTACT">Chờ liên hệ</option>
            <option value="CONSULTING">Đang tư vấn</option>
            <option value="NO_RESPONSE">Không phản hồi</option>
            <option value="LOST">Không còn nhu cầu</option>
            <option value="ADMITTED">Đồng ý nhập học</option>
            <option value="CONVERTED_SUCCESS">Đã nhập học</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            Không tìm thấy hồ sơ nhu cầu nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Nhu cầu & Khóa học</th>
                  <th className="px-6 py-4">Nguồn</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{lead.fullName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{lead.phone}</span>
                        <span>•</span>
                        <span>{lead.email || "Không có email"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{lead.interestedCourse}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Mục tiêu: {lead.targetScore || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {lead.source}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <Link
                        to={`/crm/leads/${lead.id}`}
                        className="inline-flex p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Chi tiết & Chăm sóc"
                      >
                        <PhoneCall size={16} />
                      </Link>
                      <button
                        onClick={() => handleEdit(lead)}
                        className="inline-flex p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="inline-flex p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <LeadFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lead={selectedLead}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
