import { useState, useEffect } from 'react';

/**
 * useDebounce — Trì hoãn cập nhật giá trị để tránh gọi API liên tục khi gõ.
 *
 * @param {any}    value - Giá trị cần debounce (thường là input search)
 * @param {number} delay - Thời gian trì hoãn (ms), mặc định 400ms
 * @returns {any} - Giá trị sau khi debounce
 *
 * @example
 * const debouncedSearch = useDebounce(searchInput, 400);
 * useEffect(() => { fetchData(debouncedSearch); }, [debouncedSearch]);
 */
export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
