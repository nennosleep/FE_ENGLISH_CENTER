import React, { useState } from 'react';
import { 
  Search, Plus, Pencil, Trash2, Bell, ChevronDown, 
  Users, BookOpen, Presentation, Calendar, BarChart3 
} from 'lucide-react';

// Mock Data danh sách khóa học theo đúng ảnh mẫu của bạn
const initialCourses = [
  { id: 'KH001', name: 'IELTS Cơ bản', major: 'IELTS', level: 'Cơ bản', hours: '60h', output: 'Đạt IELTS 5.0 - 6.0' },
  { id: 'KH002', name: 'IELTS Nâng cao', major: 'IELTS', level: 'Nâng cao', hours: '80h', output: 'Đạt IELTS 6.5 - 7.5' },
  { id: 'KH003', name: 'TOEFL Intensive', major: 'TOEFL', level: 'Trung cấp', hours: '70h', output: 'Đạt TOEFL iBT 80+' },
  { id: 'KH004', name: 'Giao tiếp thực hành', major: 'Giao tiếp', level: 'Cơ bản', hours: '40h', output: 'Giao tiếp hàng ngày tự tin' },
  { id: 'KH005', name: 'TOEIC 600+', major: 'TOEIC', level: 'Nâng cao', hours: '50h', output: 'Đạt TOEIC 600 - 700' },
  { id: 'KH006', name: 'Phát âm chuẩn IPA', major: 'Phát âm', level: 'Cơ bản', hours: '30h', output: 'Phát âm chuẩn theo IPA' },
  { id: 'KH007', name: 'Ngữ pháp toàn diện', major: 'Ngữ pháp', level: 'Trung cấp', hours: '45h', output: 'Nắm vững ngữ pháp B2' },
];

export default function CourseListPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Hàm lọc khóa học theo tên hoặc mã khóa học khi gõ vào thanh tìm kiếm
  const filteredCourses = initialCourses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Định nghĩa màu sắc Badge cho từng Trình độ (Level)
  const getLevelStyle = (level) => {
    switch (level) {
      case 'Cơ bản': return 'bg-green-50 text-green-600 border border-green-200';
      case 'Trung cấp': return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'Nâng cao': return 'bg-purple-50 text-purple-600 border border-purple-200';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      
      {/* SIDEBAR TRÁI (Giữ nguyên menu như cũ, active mục Quản lý khóa học) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">EC</div>
              <div>
                <h1 className="font-bold text-base leading-tight text-blue-900">English Center</h1>
                <p className="text-xs text-slate-400">Hệ thống quản lý</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition">
              <BarChart3 size={20} /> Bảng điều khiển
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition">
              <Users size={20} /> Quản lý giáo viên
            </a>
            {/* Active trạng thái ở Quản lý khóa học */}
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-800 text-white rounded-xl font-medium shadow-sm">
              <BookOpen size={20} /> Quản lý khóa học
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition">
              <Presentation size={20} /> Quản lý phòng học
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition">
              <Calendar size={20} /> Quản lý lịch dạy
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition">
              <BarChart3 size={20} /> Báo cáo
            </a>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100 text-center text-slate-400 cursor-pointer hover:text-slate-600">
          ❮
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Quản lý khóa học</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell size={22} className="text-slate-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
            </div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-9 h-9 bg-blue-800 text-white rounded-full flex items-center justify-center font-semibold text-sm">TV</div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-slate-700">Quản Trị Viên</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
                <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">Nhân viên học vụ</span>
              </div>
            </div>
          </div>
        </header>

        {/* VÙNG NỘI DUNG BẢNG */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* THANH THAO TÁC TRÊN (SEARCH & ADD BUTTON) */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm khóa học..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
              
              <button className="bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0 shadow-sm">
                <Plus size={18} /> Thêm khóa học
              </button>
            </div>

            {/* TABLE CHI TIẾT */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                    <th className="py-4 px-6">Mã KH</th>
                    <th className="py-4 px-6">Tên khóa học</th>
                    <th className="py-4 px-6">Chuyên môn</th>
                    <th className="py-4 px-6">Trình độ</th>
                    <th className="py-4 px-6">Số giờ</th>
                    <th className="py-4 px-6">Chuẩn đầu ra</th>
                    <th className="py-4 px-6 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/50 transition">
                      {/* Mã KH */}
                      <td className="py-4 px-6">
                        <span className="bg-blue-5 text-blue-600 px-2 py-1 rounded-md text-xs font-semibold bg-blue-50">
                          {course.id}
                        </span>
                      </td>
                      {/* Tên khóa học */}
                      <td className="py-4 px-6 text-slate-900 font-bold">{course.name}</td>
                      {/* Chuyên môn */}
                      <td className="py-4 px-6">
                        <span className="bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded text-xs">
                          {course.major}
                        </span>
                      </td>
                      {/* Trình độ */}
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-xs ${getLevelStyle(course.level)}`}>
                          {course.level}
                        </span>
                      </td>
                      {/* Số giờ */}
                      <td className="py-4 px-6 text-slate-500 font-normal">{course.hours}</td>
                      {/* Chuẩn đầu ra */}
                      <td className="py-4 px-6 text-slate-500 font-normal">{course.output}</td>
                      {/* Hành động */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-3 text-slate-400">
                          <button className="hover:text-blue-600 transition">
                            <Pencil size={16} />
                          </button>
                          <button className="hover:text-red-500 transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-400 font-normal">
                        Không tìm thấy khóa học nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER BẢNG (Hiển thị số lượng) */}
            <div className="p-4 bg-slate-50/30 border-t border-slate-100 text-xs font-semibold text-slate-400">
              {filteredCourses.length} khóa học
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}