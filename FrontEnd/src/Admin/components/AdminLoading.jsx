import { motion as Motion } from "framer-motion";
import UnifiedSpinner from "../../components/Loading/UnifiedSpinner";

/**
 * AdminTableSkeleton - Giữ chỗ cho bảng dữ liệu admin
 * Ngăn chặn Layout Shift khi load danh sách sản phẩm/đơn hàng
 */
export const AdminTableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="p-4 text-left">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="p-4">
                    <div
                      className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
                      style={{
                        width: `${70 + (j % 3) * 10}%`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * AdminPageLoader - Hiệu ứng loading nhẹ nhàng cho Outlet
 * Giúp trải nghiệm chuyển trang trong Admin mượt mà hơn
 */
export const AdminPageLoader = () => {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 backdrop-blur-md p-8">
      <UnifiedSpinner size="lg" variant="primary" />
      <p className="animate-pulse text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Đang tải phân hệ quản trị...
      </p>
    </div>
  );
};

/**
 * AdminActionLoader - Loading overlay cho các action submit form (Save/Update)
 * Đồng bộ hệ thống UnifiedSpinner
 */
export const AdminActionLoader = ({ message = "Đang xử lý..." }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/30 dark:bg-slate-950/60 backdrop-blur-[4px] p-4">
      <Motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        className="flex flex-col items-center gap-4 rounded-3xl bg-white dark:bg-slate-900 p-7 shadow-2xl border border-slate-200/80 dark:border-slate-800 min-w-[200px]"
      >
        <UnifiedSpinner size="lg" variant="primary" />
        <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">{message}</span>
      </Motion.div>
    </div>
  );
};

/**
 * AdminStatSkeleton - Giữ chỗ cho lưới thẻ số liệu thống kê
 */
export const AdminStatSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-2xl bg-slate-100 dark:bg-dark-bg animate-pulse" />
            <div className="h-4 w-12 rounded-full bg-slate-100 dark:bg-dark-bg animate-pulse" />
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-20 rounded bg-slate-100 dark:bg-dark-bg animate-pulse" />
            <div className="h-6 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * AdminCardSkeleton - Giữ chỗ cho Widget hoặc Card biểu đồ
 */
export const AdminCardSkeleton = ({ height = "h-72" }) => {
  return (
    <div
      className={`w-full ${height} rounded-2xl sm:rounded-3xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border p-6 shadow-xs flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-3 w-24 rounded bg-slate-100 dark:bg-dark-bg animate-pulse" />
        </div>
        <div className="h-8 w-24 rounded-xl bg-slate-100 dark:bg-dark-bg animate-pulse" />
      </div>
      <div className="h-32 w-full rounded-2xl bg-slate-50 dark:bg-dark-bg/60 animate-pulse" />
    </div>
  );
};
