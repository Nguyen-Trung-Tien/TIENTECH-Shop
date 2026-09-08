import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
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

          if (target === "admin" || user.role === "admin") {
            if (user.role !== "admin") {
              toast.error("Bạn không có quyền truy cập trang quản trị!");
              navigate("/admin/login");
              return;
            }
            toast.success("Đăng nhập Quản trị viên thành công!");
            navigate("/admin/dashboard");
            return;
          }

          toast.success("Đăng nhập Google thành công!");
          navigate("/");
        } else {
          toast.error("Không thể lấy thông tin người dùng!");
          navigate(target === "admin" ? "/admin/login" : "/login");
        }
      } catch (error) {
        console.error("Login success fetch error:", error);
        toast.error("Đã có lỗi xảy ra khi đăng nhập!");
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
