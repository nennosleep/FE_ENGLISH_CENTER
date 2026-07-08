import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

import authCard from '../components/authCard';

import { resetPasswordApi } from '../services/authService';

import { useToast } from '../../../core/components';

/* ───────────────────────────────────────────────────── */

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const toast = useToast();

  const email =
    location.state?.email ||
    sessionStorage.getItem('otp_email') ||
    '';

  const otp =
    location.state?.otp ||
    sessionStorage.getItem('otp_code') ||
    '';

  /* Lưu session đúng cách trong useEffect */
  useEffect(() => {
    if (location.state?.email) {
      sessionStorage.setItem('otp_email', location.state.email);
    }
    if (location.state?.otp) {
      sessionStorage.setItem('otp_code', location.state.otp);
    }
  }, [location.state?.email, location.state?.otp]);

  /* Chặn truy cập trực tiếp khi thiếu email hoặc OTP */
  useEffect(() => {
    if (!email || !otp) {
      navigate('/auth/forgot-password', { replace: true });
    }
  }, [email, otp, navigate]);

  /* States */
  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [done, setDone] =
    useState(false);

  /* ───────────────────────────────────────────────── */

  const getStrength = (pwd) => {
    let score = 0;

    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    return score;
  };

  const strength = getStrength(newPassword);

  const strengthLabel = [
    '',
    'Yếu',
    'Trung bình',
    'Khá',
    'Mạnh',
  ][strength];

  const strengthColor = [
    '',
    'bg-red-400',
    'bg-amber-400',
    'bg-blue-400',
    'bg-green-400',
  ][strength];

  const strengthTextColor = [
    '',
    'text-red-500',
    'text-amber-500',
    'text-blue-500',
    'text-green-500',
  ][strength];

  /* Dịch lỗi Backend sang Tiếng Việt */
  const getViError = (err) => {
    const originalMsg = err?.response?.data?.message;
    const msg = originalMsg?.toLowerCase() || '';
    const status = err?.response?.status;

    if (originalMsg && /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/.test(msg)) {
      return originalMsg;
    }

    if (msg.includes('expired') || msg.includes('hết hạn')) return 'Phiên xác thực đã hết hạn. Vui lòng thực hiện lại từ đầu.';
    if (msg.includes('invalid') && msg.includes('otp')) return 'Mã OTP không hợp lệ. Vui lòng thực hiện lại.';
    if (msg.includes('weak') || msg.includes('password')) return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
    if (msg.includes('same') || msg.includes('match')) return 'Mật khẩu mới không được trùng với mật khẩu cũ.';
    if (status === 400) return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    if (status === 500) return 'Lỗi hệ thống. Vui lòng thử lại sau.';
    if (!err?.response) return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    return originalMsg || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
  };

  /* ───────────────────────────────────────────────── */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      toast.warning('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (newPassword.length < 8) {
      toast.warning('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    if (newPassword.length > 50) {
      toast.warning('Mật khẩu không được vượt quá 50 ký tự.');
      return;
    }

    if (/\s/.test(newPassword)) {
      toast.warning('Mật khẩu không được chứa khoảng trắng.');
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])/.test(newPassword)) {
      toast.warning('Mật khẩu phải chứa ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt.');
      return;
    }

    if (!confirmPassword) {
      toast.warning('Vui lòng nhập lại mật khẩu xác nhận.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordApi(
        email,
        otp,
        newPassword
      );

      sessionStorage.removeItem('otp_email');
      sessionStorage.removeItem('otp_code');

      setDone(true);

      toast.success('Đặt lại mật khẩu thành công.');

      setTimeout(() => {
        navigate('/auth/login', {
          replace: true,
        });
      }, 2500);

    } catch (err) {
      toast.error(getViError(err));

    } finally {
      setIsLoading(false);
    }
  };

  /* ───────────────────────────────────────────────── */

  return (
    <authCard
      title="Đặt lại mật khẩu"
      subtitle="Hệ thống quản lý trung tâm tiếng Anh"
    >
      {done ? (
        /* Success */
        <div
          className="
            auth-fade-in

            flex flex-col
            items-center
            gap-2

            py-2
            text-center
          "
        >
          <CheckCircle2
            size={40}
            className="text-green-500"
          />

          <p
            className="
              m-0

              text-[1.05rem]
              font-bold
              text-green-800
            "
          >
            Đặt lại thành công!
          </p>

          <p
            className="
              m-0

              text-[0.845rem]
              leading-relaxed
              text-slate-500
            "
          >
            Mật khẩu của bạn đã được cập nhật.
            <br />
            Đang chuyển về trang đăng nhập…
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
              border border-[#1b3392]/20
              bg-[#dfe8ff]

              px-3.5 py-2.5

              text-[0.825rem]
              leading-relaxed
              text-slate-700
            "
          >
            Nhập mật khẩu mới cho tài khoản{' '}
            <strong className="text-[#1b3392]">
              {email}
            </strong>.
          </p> */}

          {/* New Password */}
          <div className="flex flex-col gap-1.5">

            <label
              htmlFor="reset-new-pwd"
              className="
                text-[0.825rem]
                font-semibold
                text-slate-700
              "
            >
              Mật khẩu mới
            </label>

            <div className="relative flex items-center">

              <Lock
                size={16}
                className="
                  pointer-events-none
                  absolute left-3
                  text-slate-400
                "
              />

              <input
                id="reset-new-pwd"

                type={
                  showNew
                    ? 'text'
                    : 'password'
                }

                placeholder="Ít nhất 8 ký tự"

                autoComplete="new-password"

                value={newPassword}

                onChange={(e) => {
                  setNewPassword(
                    e.target.value
                  );
                }}

                maxLength={50}
                disabled={isLoading}

                className="
                  h-[42px]
                  w-full

                  rounded-xl
                  border border-slate-200

                  bg-slate-50

                  pl-9 pr-10

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

              <button
                type="button"

                onClick={() =>
                  setShowNew((v) => !v)
                }

                tabIndex={-1}

                aria-label={
                  showNew
                    ? 'Ẩn mật khẩu'
                    : 'Hiện mật khẩu'
                }

                className="
                  absolute right-3

                  text-slate-400
                  transition

                  hover:text-[#1b3392]
                "
              >
                {showNew ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>

            </div>

            {/* Strength */}
            {newPassword && (
              <div
                className="
                  mt-1
                  flex items-center gap-2
                "
              >
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}

                      className={`
                        h-1 flex-1 rounded-full
                        transition-all duration-300

                        ${strength >= s
                          ? strengthColor
                          : 'bg-slate-200'
                        }
                      `}
                    />
                  ))}
                </div>

                <span
                  className={`
                    min-w-[60px]
                    text-right

                    text-[0.75rem]
                    font-semibold

                    ${strengthTextColor}
                  `}
                >
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">

            <label
              htmlFor="reset-confirm-pwd"
              className="
                text-[0.825rem]
                font-semibold
                text-slate-700
              "
            >
              Xác nhận mật khẩu
            </label>

            <div className="relative flex items-center">

              <Lock
                size={16}
                className="
                  pointer-events-none
                  absolute left-3
                  text-slate-400
                "
              />

              <input
                id="reset-confirm-pwd"

                type={
                  showConfirm
                    ? 'text'
                    : 'password'
                }

                placeholder="Nhập lại mật khẩu mới"

                autoComplete="new-password"

                value={confirmPassword}

                onChange={(e) => {
                  setConfirmPassword(
                    e.target.value
                  );
                }}

                maxLength={50}
                disabled={isLoading}

                className="
                  h-[42px]
                  w-full

                  rounded-xl
                  border border-slate-200

                  bg-slate-50

                  pl-9 pr-10

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

              <button
                type="button"

                onClick={() =>
                  setShowConfirm((v) => !v)
                }

                tabIndex={-1}

                aria-label={
                  showConfirm
                    ? 'Ẩn mật khẩu'
                    : 'Hiện mật khẩu'
                }

                className="
                  absolute right-3

                  text-slate-400
                  transition

                  hover:text-[#1b3392]
                "
              >
                {showConfirm ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>

            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"

            disabled={isLoading}

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

                Đang cập nhật…
              </>
            ) : (
              'Đặt lại mật khẩu'
            )}
          </button>

          {/* Back */}
          <Link
            to="/auth/login"

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
            Quay lại đăng nhập
          </Link>

        </form>
      )}
    </authCard>
  );
}
