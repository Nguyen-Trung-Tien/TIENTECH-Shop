import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { verifyEmailApi, resendVerificationApi } from "../../api/userApi";
import { toast } from "react-toastify";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
      toast.warning("Vui lòng nhập đủ 6 chữ số");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmailApi(email, otpCode);
      if (res.errCode === 0) {
        toast.success("Xác thực tài khoản thành công!");
        navigate("/login");
      } else {
        toast.error(res.errMessage || "Mã OTP không chính xác");
      }
    } catch (error) {
      toast.error(error.response?.data?.errMessage || "Lỗi hệ thống");
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
        toast.success("Đã gửi mã OTP mới vào email của bạn!");
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
      } else {
        toast.error(res.errMessage);
      }
    } catch (error) {
      toast.error("Lỗi khi gửi lại mã");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-dark-card rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xác thực tài khoản</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Chúng tôi đã gửi mã OTP 6 chữ số đến <br />
            <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-dark-bg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-900 dark:text-white"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "XÁC NHẬN"}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Bạn không nhận được mã?{" "}
            {timer > 0 ? (
              <span className="text-blue-600 font-bold">Gửi lại sau {timer}s</span>
            ) : (
              <button 
                onClick={handleResend}
                disabled={resending}
                className="text-blue-600 font-bold hover:underline disabled:opacity-50"
              >
                {resending ? "Đang gửi..." : "Gửi lại ngay"}
              </button>
            )}
          </p>

          <Link to="/register" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại đăng ký
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
