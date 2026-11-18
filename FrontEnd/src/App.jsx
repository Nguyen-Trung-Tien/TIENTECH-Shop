import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AccountLockedModal from "./components/UI/AccountLockedModal";
import { initUserSocket, disconnectSocket } from "./utils/socket";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMeApi } from "./api/userApi";
import { setUser, removeUser, setInitializing } from "./redux/userSlice";
import { clearCart } from "./redux/cartSlice";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import RouteProgressBar from "./components/Loading/RouteProgressBar";
import ErrorBoundary from "./components/UI/ErrorBoundary";
import { useTheme } from "./context/useTheme";

const App = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user?.id) {
      const socket = initUserSocket(user);
      const handleAccountLocked = (data) => {
        window.dispatchEvent(
          new CustomEvent("tiêntech:account_locked", {
            detail: { reason: data?.reason },
          }),
        );
      };

      socket.on("account_locked", handleAccountLocked);

      return () => {
        socket.off("account_locked", handleAccountLocked);
      };
    } else {
      disconnectSocket();
    }
  }, [user]);

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
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg text-surface-900 dark:text-dark-text-primary transition-colors duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:font-semibold focus:shadow-lg"
      >
        Chuyển đến nội dung chính
      </a>
      <RouteProgressBar />
      <AccountLockedModal />
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation}>
          <ErrorBoundary>
            <Routes>
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="/*" element={<UserRoutes />} />
            </Routes>
          </ErrorBoundary>
        </LazyMotion>
      </MotionConfig>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        limit={3}
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
