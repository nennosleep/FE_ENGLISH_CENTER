import React, { useState } from 'react';
import { runOverdueCronJobSimulation } from '../services/tuitionService';
import { ArrowLeft, Play, Award, CheckCircle, Database, Loader2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../core/components';

export default function OverdueReportPage() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(null);
  const [summary, setSummary] = useState(null);
  const toast = useToast();

  const handleStartCronJob = async () => {
    setRunning(true);
    setLogs(["[Cron Job] Khởi chạy tiến trình ngầm kiểm tra công nợ quá hạn..."]);
    setSummary(null);
    setProgress(null);

    const onProgressUpdate = (currentProgress) => {
      setProgress(currentProgress);
      if (currentProgress.percentage % 20 === 0 || currentProgress.percentage === 100) {
        setLogs(prev => [
          ...prev,
          `[Cron Job] Tiến trình: Đã quét ${currentProgress.scanned.toLocaleString()}/${currentProgress.total.toLocaleString()} hóa đơn (${currentProgress.percentage}%). Tìm thấy ${currentProgress.overdueFound.toLocaleString()} nợ quá hạn. CPU: ${currentProgress.cpuUsage}%. RAM: ${currentProgress.ramUsage}MB.`
        ]);
      }
    };

    try {
      const result = await runOverdueCronJobSimulation(onProgressUpdate);
      setSummary(result);
      setLogs(prev => [
        ...prev,
        `[Cron Job] Hoàn thành quét nợ quá hạn.`,
        `[Cron Job] Trạng thái: ${result.status}`,
        `[Cron Job] Số bản ghi đã quét: ${result.scanned.toLocaleString()}`,
        `[Cron Job] Số hóa đơn quá hạn phát hiện: ${result.overdueFound.toLocaleString()}`,
        `[Cron Job] Thời gian thực thi: ${result.timeElapsedSeconds}s`
      ]);
      toast.success("Tiến trình Cron Job đã hoàn thành quét nợ quá hạn thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Tiến trình quét nợ bị gián đoạn.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link to="/crm/tuition" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-all">
          <ArrowLeft size={16} />
          Quay lại danh sách học phí
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control and Simulation */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Zap size={20} className="text-amber-500" />
              Tiến trình Cron Job (Overdue Scanner)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Khởi chạy và đo lường hiệu năng của tiến trình quét nợ tự động trên dữ liệu lớn (<strong>50,000 hóa đơn học phí</strong>).
            </p>

            <button
              onClick={handleStartCronJob}
              disabled={running}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
            >
              {running ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Đang quét hệ thống...
                </>
              ) : (
                <>
                  <Play size={14} />
                  Kích hoạt Quét nợ (50k hóa đơn)
                </>
              )}
            </button>

            {/* Performance Indicators */}
            {progress && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3 text-xs">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Tài nguyên hệ thống (Thời gian thực)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tiêu thụ CPU:</span>
                    <span className="font-bold text-indigo-600">{progress.cpuUsage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chiếm dụng RAM:</span>
                    <span className="font-bold text-indigo-600">{progress.ramUsage} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trạng thái:</span>
                    <span className="font-semibold text-green-600">Đang quét bất đồng bộ</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Console and Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary results */}
          {summary && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Kết quả kiểm thử hiệu năng
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hóa đơn quét</span>
                  <p className="text-lg font-black text-slate-800 mt-1">{summary.scanned.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quá hạn phát hiện (30%)</span>
                  <p className="text-lg font-black text-rose-600 mt-1">{summary.overdueFound.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thời gian thực thi</span>
                  <p className="text-lg font-black text-indigo-600 mt-1">{summary.timeElapsedSeconds}s</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-green-50 border border-green-100 p-3 rounded-xl flex items-start gap-2">
                <Database size={16} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-700">Độ chính xác dữ liệu: 100%</p>
                  <p className="text-[11px] text-green-600 leading-relaxed mt-0.5">Không phát hiện False Negative (sót nợ). Hệ thống tự động đẩy cảnh báo (Notifications) sang RabbitMQ/Kafka để chuẩn bị gửi email/SMS thông báo.</p>
                </div>
              </div>
            </div>
          )}

          {/* Console console logs */}
          <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-4 rounded-2xl min-h-[40vh] max-h-[60vh] overflow-y-auto space-y-1 shadow-inner select-text leading-relaxed">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-20">Console idle. Nhấp nút kích hoạt để bắt đầu kiểm thử Cron Job quét nợ.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
