import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiUser,
  FiCheckCircle,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";

import { loginUser } from "../../api/userApi";
import { setUser } from "../../redux/userSlice";
import ForgotPasswordModal from "../../components/ForgotPasswordModal/ForgotPasswordModal";
import { AuthShell, Button, Input } from "../../components/UI";
import { appConfig } from "../../config/runtimeConfig";
import { showErrorToast, showSuccessToast } from "../../utils/toastHelper";

const LoginPage = () => {
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("tientech_remember_me") === "true";
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("tientech_remember_email") || "";
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Security: Purge legacy stored passwords
  useEffect(() => {
    localStorage.removeItem("tientech_remember_password");
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser(email, password);

      if (res.errCode === 0 && res.data) {
        // Save or Clear Saved Login Credentials (Only email, NEVER password)
        if (rememberMe) {
          localStorage.setItem("tientech_remember_me", "true");
          localStorage.setItem("tientech_remember_email", email);
        } else {
          localStorage.removeItem("tientech_remember_me");
          localStorage.removeItem("tientech_remember_email");
        }
        localStorage.removeItem("tientech_remember_password");

        const { user } = res.data;
        const minimalUser = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
        };
        dispatch(setUser({ user: minimalUser }));
        showSuccessToast(res.errMessage || "Đăng nhập thành công!");
        navigate("/");
      } else {
        showErrorToast(res.errMessage || "Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error("Login error:", err);
      showErrorToast(err, "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthShell
        variant="user"
        bannerTitle="Chào mừng"
        bannerHighlight="quay lại"
        bannerSubtitle="Hệ thống mua sắm thiết bị công nghệ hàng đầu TienTech Shop."
        title="Đăng Nhập"
        subtitle="Vui lòng nhập email & mật khẩu để truy cập tài khoản."
        formMaxWidth="max-w-[360px]"
      >
        <form onSubmit={handleSubmit} className="space-y-1">
              <div className="space-y-4 mb-4">
                <Input
                  id="email"
                  type="email"
                  label="Địa chỉ Email"
                  placeholder="email@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={FiMail}
                  required
                />

                <Input
                  id="password"
                  type="password"
                  label="Mật khẩu"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={FiLock}
                  required
                />
              </div>

              <div className="flex items-center justify-between mb-6 py-1">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="size-4 border-2 border-slate-300 dark:border-slate-600 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                    <FiCheckCircle className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
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

              <Button
                type="submit"
                variant="primary"
                size="xl"
                loading={loading}
                loadingText="ĐANG XÁC THỰC..."
                icon={FiUser}
                className="w-full"
              >
                ĐĂNG NHẬP NGAY
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-extrabold uppercase tracking-wider">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  window.location.href = `${appConfig.apiUrl}/user/auth/google`;
                }}
                className="w-full h-12 rounded-2xl gap-2 text-xs font-bold normal-case tracking-normal"
              >
                <FcGoogle size={18} />
                <span>Đăng nhập với Google</span>
              </Button>
            </form>

            <p className="text-center mt-6 text-slate-500 dark:text-slate-400 text-xs font-medium">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline underline-offset-4"
              >
                Đăng ký ngay
              </Link>
            </p>
      </AuthShell>

      <ForgotPasswordModal
        show={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </>
  );
};

export default LoginPage;
