import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2, CheckCircle2, XCircle, Layers, ChevronRight, Bookmark } from 'lucide-react';
import SpecializationFormModal from '../components/SpecializationFormModal';

// MOCK DATA CHUẨN ĐÚNG THEO QUAN HỆ BẢNG CỦA DATABASE
const MOCK_SPECIALIZATIONS = [
  { 
    id: "spec-1", 
    code: "ENG-IELTS", 
    name: "IELTS Academic", 
    description: "Luyện thi chứng chỉ Cambridge đủ 4 kỹ năng nghe, nói, đọc, viết chuyên sâu dành cho học sinh du học và xét tuyển đại học toàn quốc.", 
    isActive: true,
    levels: [
      { id: "lvl-1", code: "IELTS-FOUND", name: "IELTS Foundation (0 - 4.0)", levelOrder: 1, description: "Xây dựng gốc ngữ pháp và từ vựng cơ bản", isActive: true },
      { id: "lvl-2", code: "IELTS-INT", name: "IELTS Intermediate (4.0 - 5.5)", levelOrder: 2, description: "Làm quen cấu trúc đề thi chi tiết", isActive: true },
      { id: "lvl-3", code: "IELTS-ADV", name: "IELTS Advanced (5.5 - 7.0+)", levelOrder: 3, description: "Mẹo nâng band và luyện đề chuyên sâu", isActive: true }
    ]
  },
  { 
    id: "spec-2", 
    code: "ENG-TOEIC", 
    name: "TOEIC 2 Kỹ năng", 
    description: "Tập trung ôn luyện Listening & Reading cho sinh viên tốt nghiệp và người đi làm khối ngành kinh tế.", 
    isActive: true,
    levels: [
      { id: "lvl-4", code: "TOEIC-450", name: "Mục tiêu 450+", levelOrder: 1, description: "Lấy lại nền tảng", isActive: true },
      { id: "lvl-5", code: "TOEIC-650", name: "Mục tiêu 650+", levelOrder: 2, description: "Luyện kỹ năng giải đề nhanh", isActive: true }
    ]
  },
  { 
    id: "spec-3", 
    code: "ENG-COMM", 
    name: "Tiếng Anh giao tiếp", 
    description: "Khóa học tập trung vào kỹ năng nghe và nói phản xạ đời sống.", 
    isActive: true,
    levels: []
  }
];

export default function SpecializationListPage() {
  const [specs, setSpecs] = useState(MOCK_SPECIALIZATIONS);
  const [selectedSpecId, setSelectedSpecId] = useState(MOCK_SPECIALIZATIONS[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  
  /* Modal States */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('SPEC_ADD'); 
  const [editTarget, setEditTarget] = useState(null);
  const [parentSpecId, setParentSpecId] = useState(null); 
  const [loading, setLoading] = useState(false);

  const currentSpec = specs.find(s => s.id === selectedSpecId);

  const filteredSpecs = specs.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteSpec = (item) => {
    if (window.confirm(`Xóa chuyên môn gốc "${item.name}" sẽ xóa TOÀN BỘ các tầng mức trực thuộc!\nBạn vẫn muốn xóa?`)) {
      setSpecs(prev => prev.filter(s => s.id !== item.id));
      if (selectedSpecId === item.id) setSelectedSpecId(null);
    }
  };

  const handleDeleteLevel = (levelItem) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tầng mức "${levelItem.name}"?`)) {
      setSpecs(prev => prev.map(s => {
        if (s.id === selectedSpecId) {
          return { ...s, levels: s.levels.filter(l => l.id !== levelItem.id) };
        }
        return s;
      }));
    }
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 150)); 

    if (modalMode === 'SPEC_ADD') {
      const newSpec = { id: `spec-${Date.now()}`, ...formData, levels: [] };
      setSpecs(prev => [newSpec, ...prev]);
      setSelectedSpecId(newSpec.id);
    } 
    else if (modalMode === 'SPEC_EDIT') {
      setSpecs(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...formData } : s));
    } 
    else if (modalMode === 'LEVEL_ADD') {
      const newLvl = { id: `lvl-${Date.now()}`, ...formData };
      setSpecs(prev => prev.map(s => {
        if (s.id === parentSpecId) {
          return { ...s, levels: [...s.levels, newLvl].sort((a, b) => a.levelOrder - b.levelOrder) };
        }
        return s;
      }));
    } 
    else if (modalMode === 'LEVEL_EDIT') {
      setSpecs(prev => prev.map(s => {
        if (s.id === parentSpecId) {
          const updatedLevels = s.levels.map(l => l.id === editTarget.id ? { ...l, ...formData } : l)
                                         .sort((a, b) => a.levelOrder - b.levelOrder);
          return { ...s, levels: updatedLevels };
        }
        return s;
      }));
    }

    setModalOpen(false);
    setLoading(false);
  };

  return (
    <div className="flex flex-col space-y-4 h-[calc(100vh-110px)] overflow-hidden">
      {/* 1. Tiêu đề nhỏ gọn */}
      <div className="shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Danh mục cấu trúc Chuyên môn</h1>
        <p className="text-xs text-slate-500">Quản lý chuyên môn gốc và phân tầng mức độ học vụ cố định hệ thống.</p>
      </div>

      {/* 2. Khu vực chia 2 khối hộp ghim cứng chiều cao */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-5 min-h-0 overflow-hidden pb-2">
        
        {/* CỘT TRÁI (2/5 Tỷ lệ): CHUYÊN MÔN GỐC - CỐ ĐỊNH KHUNG */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
          {/* Header Cột Trái */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Tìm chuyên môn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => { setModalMode('SPEC_ADD'); setEditTarget(null); setModalOpen(true); }}
              className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition hover:opacity-90 bg-[#1b3392] shrink-0"
            >
              <Plus size={14} /> Chuyên môn
            </button>
          </div>

          {/* Vùng cuộn danh sách */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0 custom-scrollbar">
            {filteredSpecs.map((spec) => {
              const isSelected = spec.id === selectedSpecId;
              return (
                <div
                  key={spec.id}
                  onClick={() => setSelectedSpecId(spec.id)}
                  className={`p-3.5 flex items-start justify-between cursor-pointer transition select-none ${
                    isSelected ? 'bg-blue-50/70 border-r-4 border-blue-600' : 'hover:bg-slate-50/40'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded text-slate-600 uppercase shrink-0">
                        {spec.code}
                      </span>
                      <h3 className="text-xs font-bold text-slate-800 truncate">{spec.name}</h3>
                    </div>
                    {/* Giới hạn text 1 dòng duy nhất chống phình chiều cao */}
                    <p className="text-[11px] text-slate-400 truncate w-full">{spec.description || 'Chưa có mô tả'}</p>
                    <div className="text-[10px] font-bold text-blue-600 bg-blue-100/60 w-max px-2 py-0.5 rounded-md">
                      {spec.levels?.length || 0} tầng mức
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-slate-400 pt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setModalMode('SPEC_EDIT'); setEditTarget(spec); setModalOpen(true); }} className="hover:text-blue-600 p-1">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDeleteSpec(spec)} className="hover:text-rose-500 p-1">
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={15} className={`text-slate-300 transition ${isSelected ? 'translate-x-0.5 text-blue-500' : ''}`} />
                  </div>
                </div>
              );
            })}
            
            {filteredSpecs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 italic">Không có dữ liệu phù hợp.</div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI (3/5 Tỷ lệ): CHI TIẾT TẦNG MỨC LEVEL - CỐ ĐỊNH KHUNG */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
          {currentSpec ? (
            <>
              {/* Header Cột Phải */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
                <div className="min-w-0 pr-2">
                  <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers size={14} className="text-blue-600 shrink-0" />
                    Cấu trúc tầng: <span className="text-blue-600 font-extrabold truncate">{currentSpec.name}</span>
                  </h2>
                </div>

                <button
                  onClick={() => { setModalMode('LEVEL_ADD'); setParentSpecId(currentSpec.id); setEditTarget(null); setModalOpen(true); }}
                  className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition hover:opacity-90 bg-emerald-600 shrink-0"
                >
                  <Plus size={14} /> Thêm mức (Level)
                </button>
              </div>

              {/* Vùng chứa bảng dữ liệu - Cuộn độc lập nội bộ */}
              <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
                <table className="w-full text-left table-fixed border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-[75px] text-center">Bậc</th>
                      <th className="py-2.5 px-3 w-[120px]">Mã Level</th>
                      <th className="py-2.5 px-3">Tên tầng & Mục tiêu mô tả</th>
                      <th className="py-2.5 px-3 w-[80px] text-center">T.Thái</th>
                      <th className="py-2.5 px-4 w-[90px] text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                    {currentSpec.levels.length > 0 ? (
                      currentSpec.levels.map((lvl) => (
                        <tr key={lvl.id} className="hover:bg-slate-50/40 transition">
                          {/* Thứ tự bậc */}
                          <td className="py-2.5 px-4 text-center">
                            <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-[10px] mx-auto">
                              {lvl.levelOrder}
                            </span>
                          </td>
                          {/* Mã Level */}
                          <td className="py-2.5 px-3 truncate">
                            <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-100">
                              {lvl.code}
                            </span>
                          </td>
                          {/* Tên & Mô tả giới hạn */}
                          <td className="py-2.5 px-3 min-w-0">
                            <div className="font-bold text-slate-800 truncate">{lvl.name}</div>
                            <div className="text-[10px] font-normal text-slate-400 truncate mt-0.5" title={lvl.description}>
                              {lvl.description || 'Chưa cấu hình mô tả tầng này'}
                            </div>
                          </td>
                          {/* Trạng thái ngắn */}
                          <td className="py-2.5 px-3 text-center">
                            {lvl.isActive ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Mở</span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Khóa</span>
                            )}
                          </td>
                          {/* Thao tác */}
                          <td className="py-2.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                              <button onClick={() => { setModalMode('LEVEL_EDIT'); setParentSpecId(currentSpec.id); setEditTarget(lvl); setModalOpen(true); }} className="hover:text-blue-600 p-0.5">
                                <Pencil size={13} />
                              </button>
                              <button onClick={() => handleDeleteLevel(lvl)} className="hover:text-rose-500 p-0.5">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-400 italic font-normal">
                          Chuyên môn này chưa được cấu hình phân tầng mức độ (`specializationLevels`).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="m-auto text-center text-xs text-slate-400 italic">Vui lòng chọn hoặc thêm chuyên môn gốc ở danh sách bên trái.</div>
          )}
        </div>

      </div>

      {/* POPUP MODAL NHẬP LIỆU */}
      <SpecializationFormModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        loading={loading}
      />
    </div>
  );
}