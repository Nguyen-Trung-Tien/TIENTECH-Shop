import React from "react";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Uncaught UI error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-dark-bg px-4 py-12">
          <div className="max-w-md w-full bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border rounded-3xl p-8 text-center shadow-lg">
            <div className="size-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center mx-auto mb-5">
              <FiAlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Đã xảy ra sự cố hiển thị
            </h1>
            <p className="text-sm text-slate-500 dark:text-dark-text-secondary mb-6 leading-relaxed">
              Trang gặp lỗi không mong muốn. Bạn có thể tải lại trang hoặc quay về trang chủ để tiếp tục mua sắm.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition cursor-pointer"
              >
                <FiRefreshCw size={16} /> Tải lại trang
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-slate-700 dark:text-white text-sm font-bold hover:bg-slate-50 dark:hover:bg-dark-bg transition cursor-pointer"
              >
                <FiHome size={16} /> Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
