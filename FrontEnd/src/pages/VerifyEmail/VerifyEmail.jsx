import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmailApi, resendVerificationApi } from "../../api/userApi";
import { showErrorToast, showSuccessToast } from "../../utils/toastHelper";

import { CheckCircle, XCircle, Mail } from "lucide-react";
import UnifiedSpinner from "../../components/Loading/UnifiedSpinner";
import { AuthShell, Button } from "../../components/UI";

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
          showSuccessToast("Xác nhận tài khoản thành công!");
        } else {
          setStatus("error");
          setMessage(res.errMessage || "Xác nhận tài khoản thất bại.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.errMessage ||
          error.response?.data?.message ||
          "Có lỗi xảy ra trong quá trình xác thực.",
        );
      }
    };

    verify();
  }, [email, token]);

  const handleResend = async () => {
    if (!email) {
      showErrorToast("Không tìm thấy email để gửi lại.");
      return;
    }

    setIsResending(true);
    try {
      const res = await resendVerificationApi(email);
      if (res.errCode === 0) {
        showSuccessToast(
          "Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư của bạn.",
        );
      } else {
        showErrorToast(res.errMessage || "Gửi lại email thất bại.");
      }
    } catch (error) {
      showErrorToast(error, "Lỗi khi gửi lại email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthShell
      badge="Xác thực Email"
      bannerTitle="Kích hoạt tài khoản"
      bannerHighlight="TIEN TECH"
      bannerSubtitle="Hoàn tất bước xác thực email để mở khóa toàn bộ tính năng mua sắm và ưu đãi."
      title={
        status === "verifying"
          ? "Đang xác thực tài khoản..."
          : status === "success"
          ? "Xác nhận thành công!"
          : "Xác nhận thất bại"
      }
      backTo="/login"
      backLabel="Quay lại đăng nhập"
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          {status === "verifying" && (
            <UnifiedSpinner size="xl" variant="primary" />
          )}
          {status === "success" && (
            <CheckCircle className="size-16 text-emerald-500" />
          )}
          {status === "error" && <XCircle className="size-16 text-rose-500" />}
        </div>

        <p className="text-sm text-surface-600 dark:text-dark-text-secondary break-words [overflow-wrap:anywhere]">
          {message}
        </p>

        <div className="space-y-3">
          {status === "success" && (
            <Link to="/login" className="block">
              <Button size="lg" className="w-full">
                Đăng nhập ngay
              </Button>
            </Link>
          )}

          {status === "error" && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={handleResend}
                loading={isResending}
                className="w-full"
              >
                <Mail className="size-4" />
                Gửi lại email xác nhận
              </Button>
              <Link
                to="/register"
                className="block w-full text-primary dark:text-primary-light hover:underline text-sm font-medium text-center pt-1"
              >
                Quay lại trang đăng ký
              </Link>
            </>
          )}

          {status === "verifying" && (
            <p className="text-xs text-surface-500 dark:text-dark-text-secondary">
              Vui lòng đợi trong giây lát...
            </p>
          )}
        </div>
      </div>
    </AuthShell>
  );
};

export default VerifyEmail;
