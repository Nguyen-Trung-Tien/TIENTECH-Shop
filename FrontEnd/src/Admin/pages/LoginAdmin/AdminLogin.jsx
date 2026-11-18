import React, { useState, useEffect } from "react";
import {
  FiLock,
  FiMail,
  FiCheckCircle,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showErrorToast, showSuccessToast } from "../../../utils/toastHelper";
import { loginUser } from "../../../api/userApi";
import { setUser } from "../../../redux/userSlice";
import { AuthShell, Button, Input } from "../../../components/UI";
import ForgotPasswordModal from "../../../components/ForgotPasswordModal/ForgotPasswordModal";
import { appConfig } from "../../../config/runtimeConfig";

const AdminLogin = () => {
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("tientech_admin_remember_me") === "true";
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("tientech_admin_remember_email") || "";
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Handle errors redirected from Google OAuth callback
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      if (error === "not_admin") {
        showErrorToast("Tài khoản Google này không có quyền quản trị viên!");
      } else if (error === "account_locked") {
        showErrorToast("Tài khoản của bạn đã bị khóa!");
      } else if (error === "auth_failed") {
        showErrorToast("Đăng nhập Google thất bại!");
      } else if (error === "server_error") {
        showErrorToast("Đã xảy ra lỗi máy chủ khi đăng nhập Google!");
      }
      navigate("/admin/login", { replace: true });
    }
  }, [searchParams, navigate]);

  // Security: Proactively purge legacy stored plaintext passwords
  useEffect(() => {
    localStorage.removeItem("tientech_admin_remember_password");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.errCode === 0 && res.data) {
        const { user } = res.data;
        if (user.role !== "admin") {
          showErrorToast("Bạn không có quyền quản trị viên!");
          setLoading(false);
          return;
        }

        // Save or Clear Admin Saved Login Info (Only email, NEVER password)
        if (rememberMe) {
          localStorage.setItem("tientech_admin_remember_me", "true");
          localStorage.setItem("tientech_admin_remember_email", email);
        } else {
          localStorage.removeItem("tientech_admin_remember_me");
          localStorage.removeItem("tientech_admin_remember_email");
        }
        localStorage.removeItem("tientech_admin_remember_password");

        const minimalUser = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          address: user.address,
        };
        dispatch(setUser({ user: minimalUser }));
        showSuccessToast("Đăng nhập Admin thành công!");
        navigate("/admin/dashboard");
      } else {
        showErrorToast(res.errMessage, "Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error("Login error:", err);
      showErrorToast(err, "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthShell
        variant="admin"
        badge="Admin Portal"
        bannerTitle="Quản Trị"
        bannerHighlight="Hệ Thống"
        bannerSubtitle="Cổng điều khiển trung tâm và phân tích dữ liệu TienTech Admin."
        title="Chào mừng trở lại!"
        subtitle="Nhập thông tin quản trị viên để truy cập Dashboard."
        formMaxWidth="max-w-md"
        maxWidth="max-w-5xl"
        backTo="/"
        backLabel="Về Cổng Mua Sắm"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="email"
                name="email"
                type="email"
                label="Địa chỉ Email Admin"
                autoComplete="email"
                placeholder="admin@tientech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={FiMail}
                required
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Mật Khẩu An Ninh"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={FiLock}
                required
              />

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="size-4.5 border-2 border-slate-300 dark:border-slate-600 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                    <FiCheckCircle className="absolute size-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  loading={loading}
                  loadingText="Đang xác thực..."
                  className="w-full"
                >
                  TRUY CẬP DASHBOARD
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-dark-border"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="px-3 bg-white dark:bg-dark-surface text-slate-400 font-extrabold uppercase tracking-wider">
                      Hoặc tiếp tục với
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    window.location.href = `${appConfig.apiUrl}/user/auth/google?from=admin`;
                  }}
                  className="w-full h-12 rounded-2xl gap-2 text-xs font-bold normal-case tracking-normal"
                >
                  <FcGoogle size={18} />
                  <span>Đăng nhập với Google</span>
                </Button>
              </div>
            </form>
      </AuthShell>
      <ForgotPasswordModal
        show={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </>
  );
};

export default AdminLogin;
