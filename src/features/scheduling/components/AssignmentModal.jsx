// Component con dùng trong Trang 2
function AssignmentModal({ isOpen, onClose, sessionData }) {
  if (!isOpen) return null;

  // Giả định danh sách giáo viên hiện tại của buổi học này
  const currentStaff = [
    { id: '1', name: 'Nguyễn Văn A', role: 'MAIN', roleText: 'Giáo viên chính' },
    { id: '2', name: 'Trần Thị B', role: 'ASSISTANT', roleText: 'Trợ giảng' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Phân công lịch dạy chi tiết</h3>
            <p className="text-xs text-slate-400 mt-1">Buổi học ngày: {sessionData?.date} - Ca {sessionData?.slot}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* DANH SÁCH NHÂN SỰ HIỆN TẠI */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Nhân sự hiện tại</label>
            <div className="space-y-2">
              {currentStaff.map((staff) => (
                <div key={staff.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                      {staff.name.split(' ').pop().substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{staff.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        staff.role === 'MAIN' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-500'
                      }`}>
                        {staff.roleText}
                      </span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50/50 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* FORM THÊM MỚI NHÂN SỰ */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Thêm nhân sự mới</label>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Chọn giáo viên</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition">
                <option value="">-- Chọn giáo viên từ danh sách --</option>
                <option value="GV01">Thầy Trần Văn C</option>
                <option value="GV02">Cô Lê Thị D</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Vai trò (Role)</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition">
                <option value="MAIN">MAIN - Giáo viên chính</option>
                <option value="ASSISTANT">ASSISTANT - Trợ giảng</option>
                <option value="SUBSTITUTE">SUBSTITUTE - Giáo viên dạy thay</option>
              </select>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition">
            Hủy bỏ
          </button>
          <button className="bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition">
            Lưu thay đổi
          </button>
        </div>

      </div>
    </div>
  );
}