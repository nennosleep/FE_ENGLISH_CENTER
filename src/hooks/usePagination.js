import { useState, useEffect, useMemo } from 'react';

/**
 * Hook phân trang dùng chung
 *
 * @param {Array}  data     - Mảng dữ liệu đầy đủ cần phân trang
 * @param {number} pageSize - Số bản ghi mỗi trang (mặc định: 10)
 *
 * @returns {object} {
 *   currentPage,   - Trang hiện tại
 *   totalPages,    - Tổng số trang
 *   totalItems,    - Tổng số bản ghi
 *   pageSize,      - Số bản ghi mỗi trang
 *   paginated,     - Mảng dữ liệu của trang hiện tại (đã cắt)
 *   setPage,       - Hàm chuyển trang
 *   resetPage,     - Hàm reset về trang 1 (dùng khi search/filter thay đổi)
 * }
 */
export default function usePagination(data = [], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi dữ liệu nguồn thay đổi (vd: search/filter)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Đảm bảo currentPage không vượt quá totalPages sau khi dữ liệu thay đổi
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(
    () => data.slice((safePage - 1) * pageSize, safePage * pageSize),
    [data, safePage, pageSize]
  );

  const setPage = (page) => {
    const clamped = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(clamped);
  };

  const resetPage = () => setCurrentPage(1);

  return {
    currentPage: safePage,
    totalPages,
    totalItems,
    pageSize,
    paginated,
    setPage,
    resetPage,
  };
}
