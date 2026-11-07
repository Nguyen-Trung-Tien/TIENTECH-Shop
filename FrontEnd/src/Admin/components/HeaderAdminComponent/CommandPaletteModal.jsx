import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiHome, FiBox, FiShoppingCart, FiBarChart2, FiUsers, FiTag, FiLayers, FiSettings, FiDollarSign, FiX, FiArrowRight, FiSun, FiMoon, FiFileText, FiCornerDownLeft, FiPackage, FiUser, FiShoppingBag } from "react-icons/fi";
import { globalSearchApi, exportRevenue } from "../../../api/adminApi";
import { toast } from "react-toastify";
import debounce from "../../../utils/debounce";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);

const NAV_ITEMS = [
  {
    label: "Bảng điều khiển (Dashboard)",
    path: "/admin/dashboard",
    icon: FiHome,
    section: "Điều hướng",
  },
  {
    label: "Tất cả đơn hàng",
    path: "/admin/orders",
    icon: FiShoppingCart,
    section: "Điều hướng",
  },
  {
    label: "Duyệt yêu cầu hủy đơn",
    path: "/admin/orders?tab=cancel_requested",
    icon: FiShoppingCart,
    section: "Điều hướng",
  },
  {
    label: "Duyệt yêu cầu trả hàng",
    path: "/admin/orders?tab=return_requested",
    icon: FiShoppingCart,
    section: "Điều hướng",
  },
  {
    label: "Danh sách sản phẩm",
    path: "/admin/products",
    icon: FiBox,
    section: "Điều hướng",
  },
  {
    label: "Báo cáo doanh thu & Dòng tiền",
    path: "/admin/revenue",
    icon: FiBarChart2,
    section: "Điều hướng",
  },
  {
    label: "Quản lý khách hàng & Tài khoản",
    path: "/admin/users",
    icon: FiUsers,
    section: "Điều hướng",
  },
  {
    label: "Danh mục sản phẩm",
    path: "/admin/categories",
    icon: FiLayers,
    section: "Điều hướng",
  },
  {
    label: "Thương hiệu đối tác",
    path: "/admin/brands",
    icon: FiTag,
    section: "Điều hướng",
  },
  {
    label: "Mã giảm giá (Vouchers)",
    path: "/admin/vouchers",
    icon: FiTag,
    section: "Điều hướng",
  },
  {
    label: "Giao dịch thanh toán",
    path: "/admin/payment",
    icon: FiDollarSign,
    section: "Điều hướng",
  },
  {
    label: "Cài đặt & Vận hành hệ thống",
    path: "/admin/settings",
    icon: FiSettings,
    section: "Điều hướng",
  },
];

const CommandPaletteModal = ({ isOpen, onClose, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    products: [],
    orders: [],
    users: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setQuery("");
      setResults({ products: [], orders: [], users: [] });
      setSelectedIndex(0);
      timer = setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (val) => {
        if (!val.trim()) {
          setResults({ products: [], orders: [], users: [] });
          setIsLoading(false);
          return;
        }
        try {
          const res = await globalSearchApi(val);
          if (res?.errCode === 0) {
            setResults({
              products: res.data?.products || [],
              orders: res.data?.orders || [],
              users: res.data?.users || [],
            });
          }
        } catch (err) {
          console.error("Global search error:", err);
        } finally {
          setIsLoading(false);
        }
      }, 300),
    [],
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setIsLoading(true);
      debouncedSearch(val);
    } else {
      setResults({ products: [], orders: [], users: [] });
      setIsLoading(false);
    }
  };

  const handleSelectNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleExportExcel = async () => {
    try {
      toast.info("Đang tạo file báo cáo doanh thu...");
      const blob = await exportRevenue();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Bao-cao-doanh-thu-${new Date().toLocaleDateString("vi-VN")}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Xuất file báo cáo thành công!");
      onClose();
    } catch {
      toast.error("Lỗi xuất file Excel");
    }
  };

  const filteredNav = useMemo(() => {
    if (!query.trim()) return NAV_ITEMS;
    const lower = query.toLowerCase();
    return NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(lower));
  }, [query]);

  // Keyboard navigation & Esc handling + Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 md:pt-28 px-3 sm:px-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-dark-border flex items-center gap-3 bg-slate-50/70 dark:bg-dark-bg/60">
          <FiSearch className="text-xl text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm tính năng, sản phẩm, đơn hàng, khách hàng... (Esc để đóng)"
            value={query}
            onChange={handleInputChange}
            className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 dark:text-white outline-none border-none shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-slate-400 placeholder:font-normal"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults({ products: [], orders: [], users: [] });
              }}
              className="size-7 rounded-lg bg-slate-200/60 dark:bg-dark-card border border-transparent dark:border-dark-border text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-xs shrink-0 cursor-pointer"
              title="Xóa nội dung tìm kiếm"
            >
              <FiX />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/60 hover:bg-slate-300/80 dark:bg-dark-card dark:hover:bg-slate-800 border border-slate-300/60 dark:border-dark-border text-[11px] font-mono font-extrabold text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Đóng hộp thoại (Esc hoặc Click ra ngoài)"
          >
            <FiX className="text-xs sm:hidden" />
            <span className="hidden sm:inline">ESC</span>
            <span className="sm:hidden">ĐÓNG</span>
          </button>
        </div>

        {/* Command Body */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
          {isLoading && (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <UnifiedSpinner size="sm" variant="primary" />
              <p className="text-xs text-slate-400 italic">
                Đang tra cứu dữ liệu...
              </p>
            </div>
          )}

          {/* Quick Actions (when no query or matches query) */}
          {(!query ||
            query.toLowerCase().includes("thao tác") ||
            query.toLowerCase().includes("sáng") ||
            query.toLowerCase().includes("tối") ||
            query.toLowerCase().includes("xuất")) && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary px-3 mb-1.5">
                Thao tác nhanh
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    toggleTheme();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-dark-bg transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm shrink-0">
                      {theme === "dark" ? <FiSun /> : <FiMoon />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        Chuyển sang giao diện{" "}
                        {theme === "dark" ? "Sáng (Light)" : "Tối (Dark)"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Thay đổi bảng màu hệ thống
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors flex items-center gap-1">
                    Thực hiện <FiArrowRight />
                  </span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-dark-bg transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm shrink-0">
                      <FiFileText />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        Xuất báo cáo doanh thu Excel
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Tải về file thống kê đơn hàng hoàn tất
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors flex items-center gap-1">
                    Tải về <FiArrowRight />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Live Search Results (Products, Orders, Users) */}
          {query.trim() && (
            <>
              {/* Products */}
              {results.products?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary px-3 mb-1.5 flex items-center gap-1.5">
                    <FiPackage className="text-primary" /> Sản phẩm (
                    {results.products.length})
                  </p>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectNav(`/admin/products`)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-dark-bg transition-colors text-left cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            SKU: {p.sku || "N/A"} • Giá:{" "}
                            {formatCurrency(p.basePrice)} • Tồn kho:{" "}
                            {p.totalStock}
                          </p>
                        </div>
                        <FiCornerDownLeft className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders */}
              {results.orders?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary px-3 mb-1.5 flex items-center gap-1.5">
                    <FiShoppingBag className="text-primary" /> Đơn hàng (
                    {results.orders.length})
                  </p>
                  <div className="space-y-1">
                    {results.orders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => handleSelectNav(`/admin/orders`)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-dark-bg transition-colors text-left cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-primary uppercase">
                            #{o.orderCode}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            Khách: {o.receiverName || o.user?.username || "N/A"}{" "}
                            • {formatCurrency(o.totalPrice)} • TT: {o.status}
                          </p>
                        </div>
                        <FiCornerDownLeft className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary px-3 mb-1.5 flex items-center gap-1.5">
                    <FiUser className="text-primary" /> Khách hàng & Người dùng
                    ({results.users.length})
                  </p>
                  <div className="space-y-1">
                    {results.users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSelectNav(`/admin/users`)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-dark-bg transition-colors text-left cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {u.username || u.email}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {u.email} • Quyền: {u.role}
                          </p>
                        </div>
                        <FiCornerDownLeft className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Navigation Items */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary px-3 mb-1.5">
              Tính năng & Phân hệ ({filteredNav.length})
            </p>
            <div className="space-y-1">
              {filteredNav.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleSelectNav(item.path)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-dark-bg transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-lg bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors flex items-center justify-center text-sm shrink-0">
                        <IconComponent />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors flex items-center gap-1 shrink-0">
                      Truy cập <FiArrowRight />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-dark-border bg-slate-50/70 dark:bg-dark-bg/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded text-[9px] font-mono">
                ↑↓
              </kbd>{" "}
              để cuộn
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded text-[9px] font-mono">
                ↵
              </kbd>{" "}
              để chọn
            </span>
          </div>
          <span className="font-mono text-[10px]">TienTech Spotlight</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandPaletteModal;
