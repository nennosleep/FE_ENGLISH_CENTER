import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

import authCard from '../components/authCard';
import { forgotPasswordApi } from '../services/authService';
import { useToast } from '../../../core/components';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const isFromProfile = location.state?.fromProfile === true;

  /* Dịch lỗi backend sang Tiếng Việt */
  const getViError = (err) => {
    const originalMsg = err?.response?.data?.message;
    const msg = originalMsg?.toLowerCase() || '';
    const status = err?.response?.status;
    
    // Nếu BE gửi lỗi trực tiếp bằng Tiếng Việt, hiển thị luôn thay vì fallback
    if (originalMsg && /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/.test(msg)) {
      return originalMsg;
    }

    if (msg.includes('not found') || msg.includes('not exist')) return 'Không tìm thấy tài khoản với email này.';
    if (msg.includes('invalid') && msg.includes('email')) return 'Địa chỉ email không hợp lệ.';
    if (msg.includes('too many') || msg.includes('rate limit')) return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.';
    if (status === 429) return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.';
    if (status === 500) return 'Lỗi hệ thống. Vui lòng thử lại sau.';
    if (!err?.response) return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    return originalMsg || 'Không tìm thấy tài khoản với email này.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast.warning('Vui lòng nhập địa chỉ email.');
      return;
    }

    if (/\s/.test(email)) {
      toast.warning('Email không được chứa khoảng trắng.');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(trimmedEmail)) {
      toast.warning('Email phải đúng định dạng và có đuôi @gmail.com.');
      return;
    }

    if (/\.{2,}/.test(trimmedEmail.split('@')[0])) {
      toast.warning('Email không được chứa hai dấu chấm liên tiếp.');
      return;
    }

    setIsLoading(true);

    try {
      await forgotPasswordApi(trimmedEmail);

      setSent(true);

      toast.success(
        'Đã gửi mã OTP! Vui lòng kiểm tra hộp thư.'
      );

      setTimeout(() => {
        navigate('/auth/verify-otp', {
          state: { email: trimmedEmail },
        });
      }, 2000);

    } catch (err) {
      toast.error(getViError(err));

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <authCard
      title="Quên mật khẩu"
      subtitle="Hệ thống quản lý trung tâm tiếng Anh"
    >
      {sent ? (
        /* Success state */
        <div className="flex flex-col items-center text-center gap-2 py-2 auth-fade-in">

          <CheckCircle2
            size={40}
            className="text-green-500"
          />

          <p className="m-0 text-[1.05rem] font-bold text-green-800">
            Đã gửi mã OTP!
          </p>

          <p className="m-0 text-[0.845rem] leading-relaxed text-slate-500">
            Vui lòng kiểm tra hộp thư{' '}
            <strong>{email}</strong>.
            <br />
            Đang chuyển đến trang xác thực…
          </p>

        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {/* Hint
          <p
            className="
              m-0
              rounded-xl
              border border-slate-200
              bg-slate-50

              px-3.5 py-2.5

              text-[0.825rem]
              leading-relaxed
              text-slate-500
            "
          >
            Nhập địa chỉ email đã đăng ký.
            Chúng tôi sẽ gửi mã xác thực (OTP)
            để đặt lại mật khẩu.
          </p> */}

          {/* Email */}
          <div className="flex flex-col gap-1.5">

            <label
              htmlFor="forgot-email"
              className="text-[0.825rem] font-semibold text-slate-700"
            >
              Địa chỉ Email
            </label>

            <div className="relative flex items-center">

              <Mail
                size={16}
                className="pointer-events-none absolute left-3 text-slate-400"
              />

              <input
                id="forgot-email"
                type="email"
                placeholder="example@gmail.com"
                autoComplete="email"

                value={email}
                onChange={(e) => setEmail(e.target.value)}

                disabled={isLoading}

                className="
                  w-full h-[42px]

                  rounded-xl
                  border border-slate-200

                  bg-slate-50

                  pl-9 pr-3

                  text-[0.875rem]
                  text-slate-800

                  placeholder:text-slate-300

                  outline-none
                  transition

                  focus:border-[#1b3392]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#1b3392]/10

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}

            className="
              mt-1
              flex h-11 w-full items-center justify-center gap-2

              rounded-xl

              text-[0.9rem]
              font-semibold
              text-white

              transition

              hover:opacity-90

              disabled:cursor-not-allowed
              disabled:opacity-60
            "

            style={{
              background: '#1b3392',
            }}
          >
            {isLoading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Đang gửi mã OTP…
              </>
            ) : (
              'Gửi mã OTP'
            )}
          </button>

          {/* Back */}
          {isFromProfile ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-0.5 flex items-center justify-center gap-1.5 text-[0.825rem] font-medium text-slate-500 hover:text-[#1b3392]"
            >
              <ArrowLeft size={15} />
              Quay lại Hồ sơ
            </button>
          ) : (
            <Link
              to="/auth/login"
              className="mt-0.5 flex items-center justify-center gap-1.5 text-[0.825rem] font-medium text-slate-500 no-underline transition hover:text-[#1b3392]"
            >
              <ArrowLeft size={15} />
              Quay lại đăng nhập
            </Link>
          )}

        </form>
      )}
    </authCard>
  );
}
