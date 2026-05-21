import React, { useState } from 'react';
import { User, Mail, Phone, BookOpen } from 'lucide-react';

export default function TeacherProfilePage() {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'

  const specializations = ['IELTS', 'TOEFL'];
  const inactiveSpecializations = ['TOEIC', 'Giao tiếp', 'Phát âm', 'Ngữ pháp'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner / Header */}
      <div className="bg-[#1b3392] rounded-2xl p-8 flex items-center gap-6 shadow-md text-white relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
        
        <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold backdrop-blur-sm border border-white/30 shrink-0 shadow-inner">
          VA
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">Nguyễn Văn An</h1>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 bg-white/20 text-white text-xs font-semibold rounded-full border border-white/20 backdrop-blur-sm">
              Giảng viên
            </span>
          </div>
          <p className="text-blue-100 text-sm mt-2 flex items-center gap-2">
            <Mail size={14} /> an.nv@englishcenter.vn
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl w-fit shadow-sm border border-slate-100">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'info' 
              ? 'bg-[#1b3392] text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'password' 
              ? 'bg-[#1b3392] text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Thông tin cá nhân */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <User size={20} className="text-blue-600" />
              Thông tin cá nhân
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Mã giáo viên</span>
                <span className="text-sm font-semibold text-slate-800">GV001</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Họ và tên</span>
                <span className="text-sm font-semibold text-slate-800">Nguyễn Văn An</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Tên đăng nhập</span>
                <span className="text-sm font-semibold text-slate-800">an.nv</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500">Ngày tham gia</span>
                <span className="text-sm font-semibold text-slate-800">15/3/2022</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Card: Thông tin liên hệ */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <Mail size={20} className="text-blue-600" />
                Thông tin liên hệ
              </h2>
              
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-slate-800">an.nv@englishcenter.vn</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Số điện thoại</p>
                    <p className="text-sm font-semibold text-slate-800">0901234567</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Chuyên môn */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <BookOpen size={20} className="text-blue-600" />
                Chuyên môn giảng dạy
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, idx) => (
                  <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-100 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    {spec}
                  </span>
                ))}
                {inactiveSpecializations.map((spec, idx) => (
                  <span key={idx} className="px-4 py-2 bg-slate-50 text-slate-400 text-sm font-medium rounded-lg border border-slate-200 border-dashed flex items-center gap-2 opacity-60">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-lg">
           <h2 className="text-lg font-bold text-slate-800 mb-6">Thay đổi mật khẩu</h2>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
               <input type="password" placeholder="Nhập mật khẩu hiện tại" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white text-sm" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu mới</label>
               <input type="password" placeholder="Nhập mật khẩu mới" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white text-sm" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
               <input type="password" placeholder="Nhập lại mật khẩu mới" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white text-sm" />
             </div>
             <button className="w-full py-2.5 bg-[#1b3392] hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors mt-2 shadow-sm">
               Cập nhật mật khẩu
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
