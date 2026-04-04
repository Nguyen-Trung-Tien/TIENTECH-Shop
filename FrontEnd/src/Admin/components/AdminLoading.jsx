import { motion as Motion } from "framer-motion";

/**
 * AdminTableSkeleton - Giữ chỗ cho bảng dữ liệu admin
 * Ngăn chặn Layout Shift khi load danh sách sản phẩm/đơn hàng
 */
export const AdminTableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 p-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="p-0">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="p-4 text-left">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="p-4">
                    <div
                      className="h-4 animate-pulse rounded bg-slate-100"
                      style={{
                        width: `${Math.floor(Math.random() * (100 - 40 + 1) + 40)}%`,
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
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 rounded-2xl bg-white/50 border border-slate-100/50 backdrop-blur-sm">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-slate-100 border-t-primary" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
      </div>
      <p className="animate-pulse text-xs font-bold uppercase tracking-widest text-slate-400">
        Đang tải phân hệ quản trị...
      </p>
    </div>
  );
};

/**
 * AdminActionLoader - Loading overlay cho các action submit form (Save/Update)
 * Sử dụng Portal để không làm ảnh hưởng Layout DOM
 */
export const AdminActionLoader = ({ message = "Đang xử lý..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
      <Motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-primary" />
        <span className="text-sm font-semibold text-slate-600">{message}</span>
      </Motion.div>
    </div>
  );
};
