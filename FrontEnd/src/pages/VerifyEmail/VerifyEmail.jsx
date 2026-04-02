import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmailApi, resendVerificationApi } from "../../api/userApi";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  useEffect(() => {
    const verify = async () => {
      if (!email || !token) {
        setStatus("error");
        setMessage(
          "Thiếu thông tin xác thực. Vui lòng kiểm tra lại link trong email.",
        );
        return;
      }

      try {
        const res = await verifyEmailApi(email, token);
        if (res.errCode === 0) {
          setStatus("success");
          setMessage(res.errMessage || "Xác nhận tài khoản thành công!");
          toast.success("Xác nhận tài khoản thành công!");
        } else {
          setStatus("error");
          setMessage(res.errMessage || "Xác nhận tài khoản thất bại.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.errMessage ||
            "Có lỗi xảy ra trong quá trình xác thực.",
        );
      }
    };

    verify();
  }, [email, token]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Không tìm thấy email để gửi lại.");
      return;
    }

    setIsResending(true);
    try {
      const res = await resendVerificationApi(email);
      if (res.errCode === 0) {
        toast.success(
          "Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư của bạn.",
        );
      } else {
        toast.error(res.errMessage || "Gửi lại email thất bại.");
      }
    } catch (error) {
      toast.error(error.response?.data?.errMessage || "Lỗi khi gửi lại email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-width-md w-full bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-6">
          {status === "verifying" && (
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle className="w-16 h-16 text-green-500" />
          )}
          {status === "error" && <XCircle className="w-16 h-16 text-red-500" />}
        </div>

        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {status === "verifying" && "Đang xác thực tài khoản..."}
          {status === "success" && "Xác nhận thành công!"}
          {status === "error" && "Xác nhận thất bại"}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>

        <div className="space-y-4">
          {status === "success" && (
            <Link
              to="/login"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Đăng nhập ngay
            </Link>
          )}

          {status === "error" && (
            <>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isResending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-5 h-5 mr-2" />
                )}
                Gửi lại email xác nhận
              </button>
              <Link
                to="/register"
                className="block w-full text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Quay lại trang đăng ký
              </Link>
            </>
          )}

          {status === "verifying" && (
            <p className="text-sm text-gray-500">
              Vui lòng đợi trong giây lát...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
