import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { verifyEmailApi, resendVerificationApi } from "../../api/userApi";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/toastHelper";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import { AuthShell, Button } from "../../components/UI";

const OTPVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error("Thiếu thông tin email!");
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").trim();
    if (data.length === 6 && /^\d+$/.test(data)) {
      setOtp(data.split(""));
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showWarningToast("Vui lòng nhập đủ 6 chữ số");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmailApi(email, otpCode);
      if (res.errCode === 0) {
        showSuccessToast("Xác thực tài khoản thành công!");
        navigate("/login");
      } else {
        showErrorToast(res.errMessage || "Mã OTP không chính xác");
      }
    } catch (error) {
      showErrorToast(error, "Xác thực mã OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      const res = await resendVerificationApi(email);
      if (res.errCode === 0) {
        showSuccessToast("Đã gửi mã OTP mới vào email của bạn!");
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
      } else {
        showErrorToast(res.errMessage || "Không thể gửi lại mã OTP");
      }
    } catch (error) {
      showErrorToast(error, "Lỗi khi gửi lại mã OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      badge="Xác thực OTP"
      bannerTitle="Bảo mật tài khoản"
      bannerHighlight="TIEN TECH"
      bannerSubtitle="Nhập mã xác thực 6 chữ số đã được gửi tới hộp thư của bạn."
      title="Xác thực tài khoản"
      subtitle={`Mã OTP đã được gửi đến ${email || ""}`}
      backTo="/register"
      backLabel="Quay lại đăng ký"
    >
      <div className="space-y-6">
        <div className="size-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mx-auto">
          <Mail className="size-7 text-primary" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                aria-label={`Mã OTP số ${index + 1}`}
                className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-surface-50 dark:bg-dark-bg border border-surface-200 dark:border-dark-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-surface-900 dark:text-white"
              />
            ))}
          </div>

          <Button type="submit" size="xl" loading={loading} className="w-full">
            XÁC NHẬN
          </Button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-surface-500 dark:text-dark-text-secondary text-sm">
            Bạn không nhận được mã?{" "}
            {timer > 0 ? (
              <span className="text-primary font-bold">
                Gửi lại sau {timer}s
              </span>
            ) : (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleResend}
                loading={resending}
                className="p-0 h-auto font-bold"
              >
                Gửi lại ngay
              </Button>
            )}
          </p>
        </div>
      </div>
    </AuthShell>
  );
};

export default OTPVerification;
