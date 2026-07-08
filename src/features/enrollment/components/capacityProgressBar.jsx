import React from 'react';

export default function CapacityProgressBar({ occupancy, maxCapacity }) {
  const percentage = Math.round((occupancy / maxCapacity) * 100);
  
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-rose-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getTextColor = () => {
    if (percentage >= 100) return 'text-rose-600 font-bold';
    if (percentage >= 80) return 'text-amber-600 font-semibold';
    return 'text-slate-600';
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className={getTextColor()}>
          Sĩ số: {occupancy}/{maxCapacity} ({percentage}%)
        </span>
        <span>
          {percentage >= 100 ? (
            <span className="text-rose-500 font-extrabold uppercase tracking-wider text-[10px]">Đã đầy (Overbooked Warning)</span>
          ) : percentage >= 80 ? (
            <span className="text-amber-500 uppercase tracking-wider text-[10px]">Gần đầy</span>
          ) : (
            <span className="text-emerald-500 uppercase tracking-wider text-[10px]">Còn trống</span>
          )}
        </span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}
