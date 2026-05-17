import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Bell,
  ChevronDown,
  Users,
  BookOpen,
  Presentation,
  Calendar,
  BarChart3,
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

  // Filter search
  const filteredCourses = courses.filter(
    (course) =>
      course.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      course.code
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* LOGO */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                EC
              </div>

              <div>
                <h1 className="font-bold text-base leading-tight text-blue-900">
                  English Center
                </h1>

                <p className="text-xs text-slate-400">
                  Hệ thống quản lý
                </p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <nav className="p-4 space-y-1">

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition"
            >
              <BarChart3 size={20} />
              Bảng điều khiển
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition"
            >
              <Users size={20} />
              Quản lý giáo viên
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 bg-blue-800 text-white rounded-xl font-medium shadow-sm"
            >
              <BookOpen size={20} />
              Quản lý khóa học
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition"
            >
              <Presentation size={20} />
              Quản lý phòng học
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition"
            >
              <Calendar size={20} />
              Quản lý lịch dạy
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition"
            >
              <BarChart3 size={20} />
              Báo cáo
            </a>

          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 text-center text-slate-400 cursor-pointer hover:text-slate-600">
          ❮
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">

          <h2 className="text-xl font-bold text-slate-800">
            Quản lý khóa học
          </h2>

          <div className="flex items-center gap-6">

            {/* NOTIFICATION */}
            <div className="relative cursor-pointer">
              <Bell size={22} className="text-slate-500" />

              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                2
              </span>
            </div>

            {/* USER */}
            <div className="flex items-center gap-3 cursor-pointer">

              <div className="w-9 h-9 bg-blue-800 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                TV
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Quản Trị Viên
                  </span>

                  <ChevronDown
                    size={14}
                    className="text-slate-400"
                  />
                </div>

                <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                  Nhân viên học vụ
                </span>
              </div>

            </div>

          </div>
        </header>

        {/* CONTENT */}
        <div className="p-8 flex-1 overflow-y-auto">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

            {/* ACTION BAR */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">

              {/* SEARCH */}
              <div className="relative max-w-md w-full">

                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              {/* BUTTON */}
              <button className="bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0 shadow-sm">
                <Plus size={18} />
                Thêm khóa học
              </button>

            </div>

            {/* TABLE */}
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
                    <th className="py-4 px-6 text-center">
                      Hành động
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">

                  {filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-slate-50/50 transition"
                    >

                      {/* CODE */}
                      <td className="py-4 px-6">
                        <span className="text-blue-600 px-2 py-1 rounded-md text-xs font-semibold bg-blue-50">
                          {course.code}
                        </span>
                      </td>

                      {/* NAME */}
                      <td className="py-4 px-6 text-slate-900 font-bold">
                        {course.name}
                      </td>

                      {/* MAJOR */}
                      <td className="py-4 px-6">
                        <span className="bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded text-xs">
                          IELTS
                        </span>
                      </td>

                      {/* LEVEL */}
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-600 border border-green-200">
                          Cơ bản
                        </span>
                      </td>

                      {/* HOURS */}
                      <td className="py-4 px-6 text-slate-500 font-normal">
                        {course.durationHours}h
                      </td>

                      {/* OUTPUT */}
                      <td className="py-4 px-6 text-slate-500 font-normal">
                        {course.outputStandard}
                      </td>

                      {/* ACTION */}
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
                      <td
                        colSpan="7"
                        className="py-10 text-center text-slate-400 font-normal"
                      >
                        Không tìm thấy khóa học nào phù hợp.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>

            </div>

            {/* FOOTER */}
            <div className="p-4 bg-slate-50/30 border-t border-slate-100 text-xs font-semibold text-slate-400">
              {filteredCourses.length} khóa học
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}