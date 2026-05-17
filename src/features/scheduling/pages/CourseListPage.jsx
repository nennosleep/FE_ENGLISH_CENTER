import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';

import { getCourses } from '../../../services/courseService';

export default function CourseListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      console.log(data);
      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Bộ lọc tìm kiếm khóa học
  const filteredCourses = courses.filter(
    (course) =>
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Đã loại bỏ thẻ cha bao gồm Sidebar và Header cũ. 
    // Chỉ giữ lại phần lõi Content để đưa vào <Outlet /> của AdminLayout
    <div className="space-y-6">
      
      {/* TIÊU ĐỀ TRANG CON (Nằm gọn gàng bên dưới Header chính của Layout) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh mục khóa học</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý và thiết lập các chương trình đào tạo của trung tâm.
          </p>
        </div>
      </div>

      {/* KHUNG CHỨA BẢNG VÀ THANH CÔNG CỤ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

        {/* BẢNG ĐIỀU KHIỂN TÌM KIẾM & THÊM MỚI */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* THANH TÌM KIẾM */}
          <div className="relative max-w-md w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hoặc tên khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* NÚT THÊM KHÓA HỌC */}
          <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition shrink-0 shadow-sm shadow-blue-600/10">
            <Plus size={18} />
            Thêm khóa học
          </button>
        </div>

        {/* KHU VỰC BẢNG DỮ LIỆU */}
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
                <tr
                  key={course.id}
                  className="hover:bg-slate-50/50 transition"
                >
                  {/* MÃ KHÓA HỌC */}
                  <td className="py-4 px-6">
                    <span className="text-blue-600 px-2 py-1 rounded-md text-xs font-semibold bg-blue-50">
                      {course.code}
                    </span>
                  </td>

                  {/* TÊN KHÓA HỌC */}
                  <td className="py-4 px-6 text-slate-900 font-bold">
                    {course.name}
                  </td>

                  {/* CHUYÊN MÔN */}
                  <td className="py-4 px-6">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs font-semibold">
                      IELTS
                    </span>
                  </td>

                  {/* TRÌNH ĐỘ */}
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-600 border border-green-200">
                      Cơ bản
                    </span>
                  </td>

                  {/* SỐ GIỜ */}
                  <td className="py-4 px-6 text-slate-500 font-normal">
                    {course.durationHours}h
                  </td>

                  {/* CHUẨN ĐẦU RA */}
                  <td className="py-4 px-6 text-slate-500 font-normal">
                    {course.outputStandard}
                  </td>

                  {/* HÀNH ĐỘNG SỬA / XÓA */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <button className="hover:text-blue-600 transition p-1">
                        <Pencil size={16} />
                      </button>
                      <button className="hover:text-rose-500 transition p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* TRƯỜNG HỢP KHÔNG TÌM THẤY KẾT QUẢ */}
              {filteredCourses.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="py-12 text-center text-slate-400 font-normal bg-slate-50/10"
                  >
                    Không tìm thấy khóa học nào phù hợp với từ khóa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PHẦN DƯỚI CÙNG CỦA BẢNG */}
        <div className="p-4 bg-slate-50/40 border-t border-slate-100 text-xs font-semibold text-slate-400">
          Hiển thị {filteredCourses.length} khóa học hiện có
        </div>
      </div>
    </div>
  );
}