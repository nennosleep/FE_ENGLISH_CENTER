import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

import AuthCard from '../components/AuthCard';

import {
  verifyOtpApi,
  forgotPasswordApi,
} from '../services/authService';

import { useToast } from '../../../components/ui/Toast';

/* ───────────────────────────────────────────────────── */

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

/* ───────────────────────────────────────────────────── */

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const toast = useToast();

  const email =
    location.state?.email ||
    sessionStorage.getItem('otp_email') ||
    '';

  /* Lưu email vào session khi nhận từ navigate state */
  useEffect(() => {
    if (location.state?.email) {
      sessionStorage.setItem('otp_email', location.state.email);
    }
  }, [location.state?.email]);

  /* Chặn truy cập trực tiếp khi không có email */
  useEffect(() => {
    if (!email) {
      navigate('/auth/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  /* States */
  const [otp, setOtp] = useState(
    Array(OTP_LENGTH).fill('')
  );

  const [isLoading, setIsLoading] =
    useState(false);

  const [countdown, setCountdown] =
    useState(RESEND_SECONDS);

  const [resending, setResending] =
    useState(false);

  const inputRefs = useRef([]);

  /* Countdown */
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  /* Handle input */
  const handleChange = (index, value) => {
    const digit = value
      .replace(/\D/g, '')
      .slice(-1);

    const newOtp = [...otp];

    newOtp[index] = digit;

    setOtp(newOtp);

    if (
      digit &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }

    if (
      newOtp.every((d) => d !== '') &&
      digit
    ) {
      handleVerify(newOtp.join(''));
    }
  };

  /* Backspace */
  const handleKeyDown = (index, e) => {
    if (
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* Paste OTP */
  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const newOtp = Array(OTP_LENGTH).fill('');

    pasted.split('').forEach((d, i) => {
      newOtp[i] = d;
    });

    setOtp(newOtp);

    inputRefs.current[
      Math.min(
        pasted.length,
        OTP_LENGTH - 1
      )
    ]?.focus();

    if (pasted.length === OTP_LENGTH) {
      handleVerify(pasted);
    }
  };

  /* Verify OTP */
  const handleVerify = async (code) => {
    if (code.length < OTP_LENGTH) {
      toast.warning(
        `Vui lòng nhập đủ ${OTP_LENGTH} chữ số.`
      );

      return;
    }

    setIsLoading(true);

    try {
      await verifyOtpApi(email, code);

      toast.success(
        'Xác thực OTP thành công.'
      );

      navigate('/auth/reset-password', {
        state: {
          email,
          otp: code,
        },
      });

    } catch (err) {
      const originalMsg = err?.response?.data?.message;
      const msg = originalMsg?.toLowerCase() || '';
      const status = err?.response?.status;
      let viMsg = 'Mã OTP không hợp lệ hoặc đã hết hạn.';

      if (originalMsg && /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/.test(msg)) {
        viMsg = originalMsg;
      } else {
        if (msg.includes('expired') || msg.includes('hết hạn')) viMsg = 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.';
        else if (msg.includes('invalid') || msg.includes('incorrect')) viMsg = 'Mã OTP không chính xác. Vui lòng kiểm tra lại.';
        else if (msg.includes('not found')) viMsg = 'Không tìm thấy yêu cầu xác thực. Vui lòng thử lại từ đầu.';
        else if (status === 429) viMsg = originalMsg || 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.';
        else if (status === 500) viMsg = 'Lỗi hệ thống. Vui lòng thử lại sau.';
        else if (!err?.response) viMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        else viMsg = originalMsg || viMsg;
      }

      toast.error(viMsg);

      setOtp(
        Array(OTP_LENGTH).fill('')
      );

      inputRefs.current[0]?.focus();

    } finally {
      setIsLoading(false);
    }
  };

  /* Submit */
  const handleSubmit = (e) => {
    e.preventDefault();

    handleVerify(otp.join(''));
  };

  /* Resend OTP */
  const handleResend = async () => {
    setResending(true);

    try {
      await forgotPasswordApi(email);

      toast.success(
        'Đã gửi lại mã OTP.'
      );

      setCountdown(RESEND_SECONDS);

      setOtp(
        Array(OTP_LENGTH).fill('')
      );

      inputRefs.current[0]?.focus();

    } catch {
      toast.error(
        'Gửi lại OTP thất bại. Vui lòng thử lại.'
      );

    } finally {
      setResending(false);
    }
  };

  /* ───────────────────────────────────────────────── */

  return (
    <AuthCard
      title="Nhập mã xác thực"
      subtitle="Hệ thống quản lý trung tâm tiếng Anh"
    >
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
          Mã OTP gồm{' '}
          <strong>
            {OTP_LENGTH} chữ số
          </strong>{' '}
          đã được gửi đến{' '}
          <strong>{email}</strong>.
          Mã có hiệu lực trong{' '}
          <strong>5 phút</strong>.
        </p> */}

        {/* OTP */}
        <div
          className="flex justify-center gap-2.5"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}

              ref={(el) =>
                (inputRefs.current[index] = el)
              }

              type="text"
              inputMode="numeric"
              maxLength={1}

              autoFocus={index === 0}

              autoComplete="one-time-code"

              value={digit}

              onChange={(e) =>
                handleChange(
                  index,
                  e.target.value
                )
              }

              onKeyDown={(e) =>
                handleKeyDown(index, e)
              }

              disabled={isLoading}

              className={[
                `
                  h-14 w-[52px]

                  rounded-xl
                  border-2

                  text-center
                  text-[1.35rem]
                  font-bold
                  text-slate-800

                  outline-none
                  transition-all
                  duration-150

                  disabled:opacity-60
                `,

                digit
                  ? `
                    border-[#1b3392]
                    bg-blue-50
                  `
                  : `
                    border-slate-200
                    bg-slate-50
                  `,

                `
                  focus:border-[#1b3392]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#1b3392]/15
                  focus:scale-105
                `,
              ].join(' ')}
            />
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"

          disabled={
            isLoading ||
            otp.some((d) => d === '')
          }

          className="
            mt-1

            flex h-11 w-full
            items-center justify-center gap-2

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

              Đang xác thực…
            </>
          ) : (
            'Xác nhận OTP'
          )}
        </button>

        {/* Resend */}
        <div
          className="
            flex justify-center

            text-[0.825rem]
            text-slate-500
          "
        >
          {countdown > 0 ? (
            <span>
              Gửi lại mã sau{' '}
              <strong>
                {countdown}s
              </strong>
            </span>
          ) : (
            <button
              type="button"

              onClick={handleResend}

              disabled={resending}

              className="
                flex items-center gap-1.5

                border-none
                bg-transparent
                p-0

                text-[0.825rem]
                font-semibold
                text-[#1b3392]

                transition

                hover:underline
                hover:opacity-90

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={14}
                className={
                  resending
                    ? 'animate-spin'
                    : ''
                }
              />

              {resending
                ? 'Đang gửi lại…'
                : 'Gửi lại mã OTP'}
            </button>
          )}
        </div>

        {/* Back */}
        <Link
          to="/auth/forgot-password"

          className="
            mt-0.5

            flex items-center justify-center gap-1.5

            text-[0.825rem]
            font-medium
            text-slate-500

            no-underline
            transition

            hover:text-[#1b3392]
          "
        >
          <ArrowLeft size={15} />
          Thay đổi email
        </Link>

      </form>
    </AuthCard>
  );
}