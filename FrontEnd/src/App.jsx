import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMeApi } from "./api/userApi";
import { setUser, removeUser, setInitializing } from "./redux/userSlice";
import { clearCart } from "./redux/cartSlice";
import { LazyMotion, domAnimation } from "framer-motion";
import RouteProgressBar from "./components/Loading/RouteProgressBar";
import { useTheme } from "./context/ThemeContext";

const App = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMeApi();
        if (res.errCode === 0) {
          dispatch(setUser(res.data));
        } else {
          dispatch(removeUser());
          dispatch(clearCart());
        }
      } catch {
        console.error("Initial auth check failed:");
        dispatch(removeUser());
        dispatch(clearCart());
      } finally {
        dispatch(setInitializing(false));
      }
    };

    checkAuth();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary transition-colors duration-300">
      <RouteProgressBar />
      <LazyMotion features={domAnimation}>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<UserRoutes />} />
        </Routes>
      </LazyMotion>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
        toastClassName="tientech-toast"
      />
    </div>
  );
};

export default App;
