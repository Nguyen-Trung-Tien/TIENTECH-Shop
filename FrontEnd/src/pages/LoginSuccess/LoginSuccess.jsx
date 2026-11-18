import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showErrorToast, showSuccessToast } from "../../utils/toastHelper";
import { getMeApi } from "../../api/userApi";
import { setUser } from "../../redux/userSlice";
import Loading from "../../components/Loading/Loading";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const target = searchParams.get("target");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getMeApi();
        if (res.errCode === 0 && res.data) {
          const user = res.data;
          const minimalUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            phone: user.phone,
            address: user.address,
            avatar: user.avatar,
            points: user.points,
            rank: user.rank,
          };
          dispatch(setUser({ user: minimalUser }));

          if (target === "admin" || ["admin", "root"].includes(user.role)) {
            if (!["admin", "root"].includes(user.role)) {
              showErrorToast("Bạn không có quyền truy cập trang quản trị!");
              navigate("/admin/login");
              return;
            }
            showSuccessToast("Đăng nhập Quản trị viên thành công!");
            navigate("/admin/dashboard");
            return;
          }

          let postLoginRedirect = "/";
          try {
            const stored = sessionStorage.getItem(
              "tientech_post_login_redirect",
            );
            sessionStorage.removeItem("tientech_post_login_redirect");
            if (
              stored &&
              stored.startsWith("/") &&
              !stored.startsWith("//") &&
              !stored.startsWith("/admin")
            ) {
              postLoginRedirect = stored;
            }
          } catch {
            // Ignore storage errors
          }

          showSuccessToast("Đăng nhập Google thành công!");
          navigate(postLoginRedirect, { replace: true });
        } else {
          showErrorToast(res?.errMessage || "Không thể lấy thông tin người dùng!");
          navigate(target === "admin" ? "/admin/login" : "/login");
        }
      } catch (error) {
        showErrorToast(error, "Đã có lỗi xảy ra khi đăng nhập!");
        navigate(target === "admin" ? "/admin/login" : "/login");
      }
    };

    fetchUserData();
  }, [dispatch, navigate, target]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading />
      <div className="text-center mt-4">
        <p className="text-lg font-medium text-surface-600">Đang hoàn tất đăng nhập...</p>
      </div>
    </div>
  );
};

export default LoginSuccess;
