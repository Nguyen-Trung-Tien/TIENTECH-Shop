import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { ToastContainer } from "react-toastify";
import { getMeApi } from "./api/userApi";
import { setUser, removeUser, setInitializing } from "./redux/userSlice";

const App = () => {
  const dispatch = useDispatch();
  const { isInitializing } = useSelector((state) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMeApi();
        if (res.errCode === 0) {
          dispatch(setUser(res.data));
        } else {
          dispatch(removeUser());
        }
      } catch (error) {
        console.error("Initial auth check failed:", error);
        dispatch(removeUser());
      } finally {
        dispatch(setInitializing(false));
      }
    };

    checkAuth();
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
...
        <Route path="/admin/*" element={<AdminRoutes />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default App;
