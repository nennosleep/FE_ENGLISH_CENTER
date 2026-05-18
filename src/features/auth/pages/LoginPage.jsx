import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Loader2 } from 'lucide-react';
import AuthCard from '../components/AuthCard';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.warning('Vui lòng điền đầy đủ thông tin đăng nhập.');
      return;
    }

    try {
      await login(username.trim(), password);
      toast.success('Đăng nhập thành công!');
    } catch {
      toast.error('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  return (
    <AuthCard title="Đăng nhập" subtitle="Hệ thống quản lý trung tâm tiếng Anh">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-username" className="text-[0.825rem] font-semibold text-slate-700">
            Tên đăng nhập
          </label>
          <div className="relative flex items-center">
            <User size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              id="login-username"
              type="text"
              className="w-full h-[42px] pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-[0.875rem] text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-300"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-[0.825rem] font-semibold text-slate-700">
              Mật khẩu
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-[0.775rem] text-[#1b3392] font-medium hover:opacity-80 hover:underline transition"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative flex items-center">
            <Lock size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="w-full h-[42px] pl-9 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-[0.875rem] text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-300"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 text-slate-400 hover:text-[#1b3392] transition-colors duration-200"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2 text-[0.825rem] text-slate-500 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-[15px] h-[15px] accent-[#1b3392] cursor-pointer"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
          <span>Ghi nhớ đăng nhập</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-11 mt-1 flex items-center justify-center gap-2 text-white text-[0.9rem] font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
          style={{ background: '#1b3392' }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>

      </form>
    </AuthCard>
  );
}
