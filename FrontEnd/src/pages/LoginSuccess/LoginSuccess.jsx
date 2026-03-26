import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getMeApi } from "../../api/userApi";
import { setUser } from "../../redux/userSlice";
import { getAvatarBase64 } from "../../utils/decodeImage";
import Loading from "../../components/Loading/Loading";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
            avatar: user.avatar?.startsWith("http") ? user.avatar : getAvatarBase64(user.avatar),
            points: user.points,
            rank: user.rank,
          };
          dispatch(setUser({ user: minimalUser }));
          toast.success("Đăng nhập Google thành công!");
          navigate("/");
        } else {
          toast.error("Không thể lấy thông tin người dùng!");
          navigate("/login");
        }
      } catch (error) {
        console.error("Login success fetch error:", error);
        toast.error("Đã có lỗi xảy ra khi đăng nhập!");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [dispatch, navigate]);

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
