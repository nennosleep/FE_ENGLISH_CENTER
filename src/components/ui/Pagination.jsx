import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Component phân trang dùng chung
 *
 * @param {number}   currentPage  - Trang hiện tại (bắt đầu từ 1)
 * @param {number}   totalPages   - Tổng số trang
 * @param {number}   totalItems   - Tổng số bản ghi
 * @param {number}   pageSize     - Số bản ghi mỗi trang
 * @param {function} onPageChange - Callback khi đổi trang: (page: number) => void
 */
export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  // Tạo dãy số trang có dấu "..." khi tổng số trang quá nhiều
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50/40 border-t border-slate-100">
      {/* Thống kê */}
      <span className="text-xs font-semibold text-slate-400">
        Hiển thị {from}–{to} / {totalItems} bản ghi
      </span>

      {/* Điều hướng trang */}
      <div className="flex items-center gap-1">
        {/* Nút Trước */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Các nút số trang */}
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[30px] h-[30px] rounded-lg text-xs font-semibold border transition ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Nút Sau */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
