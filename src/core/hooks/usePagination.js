import { useState, useEffect, useMemo } from 'react';

/**
 * usePagination — Hook phân trang dùng chung.
 *
 * @param {Array}  data     - Mảng dữ liệu đầy đủ cần phân trang
 * @param {number} pageSize - Số bản ghi mỗi trang (mặc định: 10)
 * @returns {{ currentPage, totalPages, totalItems, pageSize, paginated, setPage, resetPage }}
 */
export default function usePagination(data = [], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi dữ liệu nguồn thay đổi (search/filter)
  useEffect(() => { setCurrentPage(1); }, [data.length]);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(
    () => data.slice((safePage - 1) * pageSize, safePage * pageSize),
    [data, safePage, pageSize]
  );

  const setPage = (page) => setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  const resetPage = () => setCurrentPage(1);

  return { currentPage: safePage, totalPages, totalItems, pageSize, paginated, setPage, resetPage };
}
