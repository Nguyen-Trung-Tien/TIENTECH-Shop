import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FiSearch,
  FiCheckCircle,
  FiRefreshCcw,
  FiUser,
  FiCalendar,
  FiInfo,
  FiTrash2,
  FiPackage,
  FiRefreshCw,
  FiShoppingCart,
  FiTruck,
  FiClock,
  FiXCircle,
  FiX,
  FiLock,
  FiCheck,
  FiEye,
  FiShoppingBag,
  FiCreditCard,
  FiChevronDown,
  FiRotateCcw,
  FiSlash,
  FiAlertTriangle,
  FiAlertCircle,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";

import { useNavigate, useLocation } from "react-router-dom";
import {
  showErrorToast,
  showSuccessToast,
  showInfoToast,
} from "../../../utils/toastHelper";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../../api/orderApi";
import { processReturn } from "../../../api/orderItemApi";
import { statusMap } from "../../../utils/StatusMap";
import { StatusBadge } from "../../../utils/StatusBadge";
import AppPagination from "../../../components/Pagination/Pagination";
import { ConfirmModal } from "../../../components/UI/Modal";
import AdminOrderDetailModal from "./AdminOrderDetailModal";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xử lý" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "processing", label: "Đang xử lý" },
  { id: "shipped", label: "Đang giao" },
  { id: "delivered", label: "Đã giao" },
  { id: "completed", label: "Hoàn tất" },
  { id: "cancel_requested", label: "Duyệt hủy đơn" },
  { id: "return_requested", label: "Duyệt trả hàng" },
  { id: "cancelled", label: "Đã hủy" },
];

const STATUS_FLOW = [
  {
    key: "pending",
    label: "Chờ xử lý",
    icon: FiClock,
    desc: "Đơn hàng mới tạo, chờ xác nhận",
  },
  {
    key: "confirmed",
    label: "Đã xác nhận",
    icon: FiCheckCircle,
    desc: "Đã xác nhận thông tin đơn hàng",
  },
  {
    key: "processing",
    label: "Đang xử lý",
    icon: FiPackage,
    desc: "Đang đóng gói và chuẩn bị sản phẩm",
  },
  {
    key: "shipped",
    label: "Đang giao",
    icon: FiTruck,
    desc: "Đang bàn giao cho đơn vị vận chuyển",
  },
  {
    key: "delivered",
    label: "Đã giao",
    icon: FiCheckCircle,
    desc: "Khách hàng đã nhận hàng thành công",
  },
  {
    key: "completed",
    label: "Hoàn tất",
    icon: FiCheckCircle,
    desc: "Đơn hàng hoàn tất giao dịch",
  },
  {
    key: "cancelled",
    label: "Đã hủy",
    icon: FiXCircle,
    desc: "Hủy đơn hàng và hoàn stock",
  },
];

const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
  cancel_requested: ["confirmed", "processing", "shipped", "cancelled"],
};

// Component hiển thị danh sách sản phẩm gọn gàng, rõ ràng
const OrderItemsPreview = ({ items, formatCurrency }) => {
  const [showPopover, setShowPopover] = useState(false);

  if (!items || items.length === 0) {
    return <span className="text-slate-400 text-xs font-medium">Không có sản phẩm</span>;
  }

  const firstItem = items[0];
  const remainingCount = items.length - 1;

  return (
    <div className="relative min-w-[200px] max-w-[260px]">
      <div className="flex items-center gap-2.5 p-1.5 bg-slate-50/80 dark:bg-dark-bg/60 rounded-xl border border-slate-100 dark:border-dark-border/80">
        <div className="size-9 rounded-lg bg-white dark:bg-dark-surface p-0.5 border border-slate-200/80 dark:border-dark-border shrink-0 overflow-hidden">
          <img
            src={firstItem.image}
            alt={firstItem.productName}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight"
            title={firstItem.productName}
          >
            {firstItem.productName}
          </p>
          <p className="text-[10px] font-medium text-slate-400 dark:text-dark-text-secondary mt-0.5">
            SL: <span className="font-black text-primary">x{firstItem.quantity}</span> • {formatCurrency(firstItem.price)}
          </p>
        </div>
      </div>

      {remainingCount > 0 && (
        <div className="mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPopover(!showPopover);
            }}
            className="w-full px-2.5 py-1 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-[10px] font-bold flex items-center justify-between transition-all cursor-pointer border border-primary/20"
          >
            <span>+ {remainingCount} sản phẩm khác</span>
            <span className="text-[9px] underline flex items-center gap-0.5">
              Xem tất cả <FiChevronDown />
            </span>
          </button>

          <AnimatePresence>
            {showPopover && (
              <Motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute left-0 top-full mt-1.5 w-72 bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-border p-3 z-50 space-y-2 max-h-64 overflow-y-auto custom-scrollbar text-left"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-dark-border text-[10px] font-black uppercase text-slate-400">
                  <span>Tất cả sản phẩm ({items.length})</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPopover(false);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <FiX size={14} />
                  </button>
                </div>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-1.5 bg-slate-50 dark:bg-dark-bg rounded-xl border border-slate-100 dark:border-dark-border"
                  >
                    <div className="size-8 rounded-lg bg-white dark:bg-dark-surface p-0.5 border border-slate-200 dark:border-dark-border shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        SL: <span className="font-bold text-primary">x{item.quantity}</span> • {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const OrderManage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get("search") || "";
  const initialTab = queryParams.get("tab") || "all";

  const [orders, setOrders] = useState([]);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: "delete", // "delete" | "approve_cancel" | "reject_cancel" | "admin_cancel" | "process_return"
    order: null,
    orderId: null,
    orderCode: null,
    reason: "",
  });

  const [statusModal, setStatusModal] = useState({
    show: false,
    order: null,
    selectedStatus: "",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState(initialTab);
  const limit = 10;

  const handleTabChange = useCallback(
    (newTab) => {
      setActiveTab(newTab);
      setPage(1);
      const params = new URLSearchParams(location.search);
      if (newTab === "all") {
        params.delete("tab");
      } else {
        params.set("tab", newTab);
      }
      const newSearch = params.toString();
      navigate(newSearch ? `/admin/orders?${newSearch}` : "/admin/orders", { replace: true });
    },
    [location.search, navigate],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get("tab") || "all";
    setActiveTab((prev) => {
      if (tabFromUrl !== prev) {
        setPage(1);
        return tabFromUrl;
      }
      return prev;
    });
  }, [location.search]);

  const fetchOrders = useCallback(
    async (currentPage = 1, search = "", status = "all") => {
      setLoading(true);
      try {
        const filterStatus = status === "all" ? "" : status;
        const isReturn = status === "return_requested";
        const isCancelRequested = status === "cancel_requested";
        const res = await getAllOrders(
          currentPage,
          limit,
          search.trim(),
          isReturn || isCancelRequested ? "" : filterStatus,
          isReturn,
          isCancelRequested,
        );
        if (res?.errCode === 0) {
          setOrders(res.data || []);
          setPage(res.pagination?.currentPage || res.pagination?.page || currentPage);
          setTotalPages(res.pagination?.totalPages || 1);
        } else {
          setOrders([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error(err);
        showErrorToast(err, "Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1, searchTerm, activeTab);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, fetchOrders]);

  const openStatusModal = (order) => {
    setStatusModal({
      show: true,
      order,
      selectedStatus: order.status,
      reason: "",
    });
  };

  const handleConfirmStatusModal = async () => {
    if (!statusModal.order || !statusModal.selectedStatus) return;
    const { id: orderId, orderCode } = statusModal.order;
    const { selectedStatus, reason } = statusModal;

    if (selectedStatus === statusModal.order.status) {
      showInfoToast("Trạng thái đơn hàng không thay đổi.");
      return;
    }

    setIsUpdating(true);
    setLoadingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, selectedStatus, reason);
      if (res?.errCode === 0) {
        showSuccessToast(
          `Đã cập nhật đơn #${orderCode} sang "${statusMap[selectedStatus]?.label || selectedStatus}"`,
        );
        setStatusModal({
          show: false,
          order: null,
          selectedStatus: "",
          reason: "",
        });
        fetchOrders(page, searchTerm, activeTab);
      } else {
        showErrorToast(res?.errMessage, "Lỗi cập nhật trạng thái");
      }
    } catch (err) {
      console.error(err);
      showErrorToast(err, "Lỗi kết nối máy chủ");
    } finally {
      setIsUpdating(false);
      setLoadingId(null);
    }
  };

  const handleApproveCancelRequest = (order) => {
    setConfirmModal({
      show: true,
      type: "approve_cancel",
      order,
      orderId: order.id,
      orderCode: order.orderCode,
      reason: "",
    });
  };

  const handleRejectCancelRequest = (order) => {
    setConfirmModal({
      show: true,
      type: "reject_cancel",
      order,
      orderId: order.id,
      orderCode: order.orderCode,
      reason: "",
    });
  };

  const handleAdminCancelOrder = (order) => {
    setConfirmModal({
      show: true,
      type: "admin_cancel",
      order,
      orderId: order.id,
      orderCode: order.orderCode,
      reason: "",
    });
  };

  const handleProcessReturnModal = (order) => {
    setConfirmModal({
      show: true,
      type: "process_return",
      order,
      orderId: order.id,
      orderCode: order.orderCode,
      reason: "",
    });
  };

  const handleConfirmModalAction = async (overrideType) => {
    const actionType = overrideType || confirmModal.type;
    const { order, orderId, orderCode, reason } = confirmModal;
    setIsDeleting(true);
    setLoadingId(orderId);
    try {
      if (actionType === "delete") {
        const res = await deleteOrder(orderId);
        if (res?.errCode === 0) {
          showSuccessToast(res?.errMessage, `Đã xóa đơn ${orderCode || `DH${orderId}`}`);
          fetchOrders(page, searchTerm, activeTab);
        } else {
          showErrorToast(res?.errMessage, "Lỗi khi xóa đơn hàng");
        }
      } else if (actionType === "approve_cancel") {
        const res = await updateOrderStatus(
          orderId,
          "cancelled",
          reason || "Admin duyệt yêu cầu hủy đơn",
        );
        if (res?.errCode === 0) {
          showSuccessToast(`Đã duyệt hủy đơn #${orderCode} và hoàn tồn kho thành công!`);
          fetchOrders(page, searchTerm, activeTab);
        } else {
          showErrorToast(res?.errMessage, "Không thể duyệt hủy đơn");
        }
      } else if (actionType === "reject_cancel") {
        const res = await updateOrderStatus(
          orderId,
          "confirmed",
          reason || "Admin từ chối yêu cầu hủy đơn",
        );
        if (res?.errCode === 0) {
          showSuccessToast(`Đã từ chối yêu cầu hủy đơn #${orderCode}! Đơn chuyển về trạng thái Đã xác nhận.`);
          fetchOrders(page, searchTerm, activeTab);
        } else {
          showErrorToast(res?.errMessage, "Không thể từ chối yêu cầu hủy");
        }
      } else if (actionType === "admin_cancel") {
        if (!reason || !reason.trim()) {
          showErrorToast("Vui lòng nhập lý do hủy đơn hàng!");
          setIsDeleting(false);
          setLoadingId(null);
          return;
        }
        const res = await updateOrderStatus(orderId, "cancelled", reason.trim());
        if (res?.errCode === 0) {
          showSuccessToast(`Đã hủy đơn hàng #${orderCode} thành công!`);
          fetchOrders(page, searchTerm, activeTab);
        } else {
          showErrorToast(res?.errMessage, "Không thể hủy đơn hàng");
        }
      } else if (actionType === "approve_return" || actionType === "reject_return") {
        const requestedItems =
          order?.orderItems?.filter((i) => i.returnStatus === "requested") || [];
        if (requestedItems.length === 0) {
          showInfoToast("Không tìm thấy sản phẩm nào đang yêu cầu trả hàng.");
        } else {
          const isApprove = actionType === "approve_return";
          const finalStatus = isApprove ? "completed" : "rejected";
          for (const item of requestedItems) {
            await processReturn(item.id, finalStatus);
          }
          showSuccessToast(
            isApprove
              ? `Đã duyệt trả hàng cho đơn #${orderCode} (Kho đã cập nhật)!`
              : `Đã từ chối yêu cầu trả hàng của đơn #${orderCode}!`,
          );
          fetchOrders(page, searchTerm, activeTab);
        }
      }
      setConfirmModal({
        show: false,
        type: "delete",
        order: null,
        orderId: null,
        orderCode: null,
        reason: "",
      });
    } catch (err) {
      console.error(err);
      showErrorToast(err, "Lỗi xử lý thao tác");
    } finally {
      setIsDeleting(false);
      setLoadingId(null);
    }
  };

  const formatCurrency = (v) =>
    v ? Number(v).toLocaleString("vi-VN") + " ₫" : "0 ₫";
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

  // Summary Metrics
  const summaryStats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const shipping = orders.filter((o) =>
      ["confirmed", "processing", "shipped"].includes(o.status),
    ).length;
    const completed = orders.filter((o) =>
      ["delivered", "completed"].includes(o.status),
    ).length;
    return { total, pending, shipping, completed };
  }, [orders]);

  return (
    <div className="space-y-6 p-3 sm:p-6 md:p-8 max-w-[1600px] mx-auto text-slate-800 dark:text-dark-text-primary">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
              <FiShoppingCart />
            </div>
            Quản lý Đơn hàng
          </h1>
          <p className="text-slate-500 dark:text-dark-text-secondary font-medium text-xs mt-1">
            Theo dõi, xử lý và cập nhật trạng thái đơn hàng của hệ thống
          </p>
        </div>

        {/* Search Bar & Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách, SĐT..."
              className="w-full h-10 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl pl-9 pr-3 text-xs font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => fetchOrders(1, searchTerm, activeTab)}
            title="Làm mới dữ liệu"
            className="size-10 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary rounded-xl flex items-center justify-center hover:text-primary hover:border-primary/50 transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <FiRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white dark:bg-dark-surface p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-2xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="size-9 sm:size-10 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 flex items-center justify-center text-base sm:text-lg shrink-0">
            <FiShoppingBag />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider truncate">
              Tổng số trang
            </p>
            <p className="text-sm sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
              {summaryStats.total} <span className="text-[10px] sm:text-xs font-semibold text-slate-400">đơn</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-2xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="size-9 sm:size-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-base sm:text-lg shrink-0">
            <FiClock />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider truncate">
              Chờ xử lý
            </p>
            <p className="text-sm sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 truncate">
              {summaryStats.pending} <span className="text-[10px] sm:text-xs font-semibold text-slate-400">đơn</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-2xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="size-9 sm:size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center text-base sm:text-lg shrink-0">
            <FiTruck />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider truncate">
              Đang xử lý/Giao
            </p>
            <p className="text-sm sm:text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
              {summaryStats.shipping} <span className="text-[10px] sm:text-xs font-semibold text-slate-400">đơn</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-2xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="size-9 sm:size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center text-base sm:text-lg shrink-0">
            <FiCheckCircle />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider truncate">
              Đã giao / Hoàn tất
            </p>
            <p className="text-sm sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              {summaryStats.completed} <span className="text-[10px] sm:text-xs font-semibold text-slate-400">đơn</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Filter Header */}
      <div className="bg-white dark:bg-dark-surface p-2 rounded-2xl border border-slate-100 dark:border-dark-border shadow-2xs overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-500 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content View: Desktop Table View vs Mobile Cards View */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-2xs overflow-hidden">
        {/* DESKTOP TABLE VIEW (hidden on mobile, shown on lg+) */}
        <div className="hidden lg:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-dark-bg/60 border-b border-slate-100 dark:border-dark-border text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
                <th className="px-5 py-4">Mã đơn & Ngày tạo</th>
                <th className="px-5 py-4">Khách hàng</th>
                <th className="px-5 py-4">Sản phẩm</th>
                <th className="px-5 py-4 text-right">Tổng tiền & PTTT</th>
                <th className="px-5 py-4 text-center">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border/60 text-xs">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan="6" className="px-5 py-6 animate-pulse">
                        <div className="h-10 bg-slate-100 dark:bg-dark-bg rounded-xl w-full"></div>
                      </td>
                    </tr>
                  ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-dark-bg/40 transition-colors"
                  >
                    {/* Order Code & Date */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span
                          className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs hover:text-primary transition-colors cursor-pointer"
                          onClick={() => setSelectedDetailOrder(order)}
                        >
                          #{order.orderCode}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-dark-text-secondary mt-0.5 flex items-center gap-1">
                          <FiCalendar className="text-slate-400" /> {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-slate-100 dark:bg-dark-bg flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                          {order.user?.username ? order.user.username.charAt(0).toUpperCase() : <FiUser />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                            {order.user?.username || "Ẩn danh"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">
                            {order.user?.phone || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Products Preview (Clean Card Style) */}
                    <td className="px-5 py-4">
                      <OrderItemsPreview
                        items={order.orderItems}
                        formatCurrency={formatCurrency}
                      />
                    </td>

                    {/* Total & Payment */}
                    <td className="px-5 py-4 text-right">
                      <p className="font-black text-rose-600 dark:text-rose-400">
                        {formatCurrency(order.totalPrice)}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 dark:bg-dark-bg px-1.5 py-0.5 rounded">
                          {order.paymentMethod || "COD"}
                        </span>
                        {order.paymentStatus === "paid" && (
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <FiCheckCircle size={10} /> Đã TT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Order Status */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <StatusBadge
                          map={statusMap}
                          status={order.status}
                          className="text-[10px] px-3 py-1 font-bold rounded-lg"
                        />
                        {order.cancelReason && (
                          <span
                            className="text-[9px] text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded truncate max-w-[120px]"
                            title={order.cancelReason}
                          >
                            Lý do: {order.cancelReason}
                          </span>
                        )}
                        {order.orderItems?.some((i) => i.returnStatus === "requested") && (
                          <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/40 flex items-center gap-1">
                            <FiRotateCcw size={10} /> Y/c trả ({order.orderItems.filter((i) => i.returnStatus === "requested").length})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* 1. Nút Duyệt Hủy / Từ Chối Hủy khi khách gửi yêu cầu */}
                        {order.status === "cancel_requested" && (
                          <>
                            <button
                              onClick={() => handleApproveCancelRequest(order)}
                              title="Duyệt yêu cầu hủy đơn (Hoàn tồn kho)"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-[11px] font-black flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-900/30 shadow-2xs"
                            >
                              <FiCheckCircle size={13} /> Duyệt hủy
                            </button>
                            <button
                              onClick={() => handleRejectCancelRequest(order)}
                              title="Từ chối yêu cầu hủy đơn"
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-[11px] font-black flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/30 shadow-2xs"
                            >
                              <FiXCircle size={13} /> Từ chối
                            </button>
                          </>
                        )}

                        {/* 2. Nút Duyệt / Từ Chối Trả Hàng */}
                        {order.orderItems?.some((i) => i.returnStatus === "requested") && (
                          <button
                            onClick={() => handleProcessReturnModal(order)}
                            title="Xử lý yêu cầu trả hàng từ khách"
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white transition-all text-[11px] font-black flex items-center gap-1 cursor-pointer border border-amber-200 dark:border-amber-900/30 shadow-2xs"
                          >
                            <FiRotateCcw size={13} /> Duyệt trả
                          </button>
                        )}

                        {/* 3. Nút Chi tiết */}
                        <button
                          onClick={() => setSelectedDetailOrder(order)}
                          title="Chi tiết đơn hàng"
                          className="size-8 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary hover:bg-primary hover:text-white transition-all flex items-center justify-center cursor-pointer"
                        >
                          <FiEye size={15} />
                        </button>

                        {/* 4. Nút Cập nhật trạng thái */}
                        <button
                          onClick={() => openStatusModal(order)}
                          title="Cập nhật trạng thái"
                          className="size-8 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary hover:bg-primary hover:text-white transition-all flex items-center justify-center cursor-pointer"
                        >
                          <FiRefreshCcw
                            size={14}
                            className={loadingId === order.id ? "animate-spin" : ""}
                          />
                        </button>

                        {/* 5. Nút Hủy đơn chủ động của Admin */}
                        {["pending", "confirmed", "processing", "shipped"].includes(order.status) && (
                          <button
                            onClick={() => handleAdminCancelOrder(order)}
                            title="Admin hủy đơn hàng"
                            className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                          >
                            <FiSlash size={14} />
                          </button>
                        )}

                        {/* 6. Nút Xóa đơn */}
                        <button
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              type: "delete",
                              order,
                              orderId: order.id,
                              orderCode: order.orderCode,
                              reason: "",
                            })
                          }
                          title="Xóa đơn hàng"
                          className="size-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-20 text-center text-slate-400 font-semibold">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE & TABLET CARDS VIEW (shown on mobile, hidden on lg+) */}
        <div className="block lg:hidden divide-y divide-slate-100 dark:divide-dark-border">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="p-4 animate-pulse space-y-3">
                  <div className="h-6 bg-slate-100 dark:bg-dark-bg rounded-lg w-1/2"></div>
                  <div className="h-10 bg-slate-100 dark:bg-dark-bg rounded-lg w-full"></div>
                </div>
              ))
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="p-4 space-y-3">
                {/* Mobile Card Header */}
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider block truncate">
                      #{order.orderCode}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                      <FiCalendar /> {formatDate(order.createdAt)}
                    </p>
                    {order.cancelReason && (
                      <p className="mt-1 text-[10px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/30 break-words [overflow-wrap:anywhere]">
                        Lý do hủy: {order.cancelReason}
                      </p>
                    )}
                    {order.orderItems?.some((i) => i.returnStatus === "requested") && (
                      <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/30 flex items-center gap-1">
                        <FiRotateCcw size={10} /> Yêu cầu trả ({order.orderItems.filter((i) => i.returnStatus === "requested").length} SP)
                      </p>
                    )}
                  </div>
                  <StatusBadge
                    map={statusMap}
                    status={order.status}
                    className="text-[10px] px-2.5 py-1 font-bold rounded-lg shrink-0"
                  />
                </div>

                {/* Mobile Card Customer & Total */}
                <div className="bg-slate-50 dark:bg-dark-bg/60 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-7 rounded-full bg-slate-200 dark:bg-dark-surface flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">
                      {order.user?.username ? order.user.username.charAt(0).toUpperCase() : <FiUser />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {order.user?.username || "Ẩn danh"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {order.user?.phone || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-rose-600">
                      {formatCurrency(order.totalPrice)}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      {order.paymentMethod || "COD"}
                    </span>
                  </div>
                </div>

                {/* Mobile Card Items List */}
                <div className="space-y-1.5">
                  {order.orderItems?.slice(0, 2).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-dark-bg/60 rounded-xl border border-slate-100 dark:border-dark-border"
                    >
                      <div className="size-8 rounded-lg bg-white dark:bg-dark-surface p-0.5 border border-slate-200 dark:border-dark-border shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.productName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          SL: <span className="text-primary font-black">x{item.quantity}</span> • {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.orderItems?.length > 2 && (
                    <p className="text-[10px] font-bold text-primary text-center pt-0.5">
                      + {order.orderItems.length - 2} sản phẩm khác
                    </p>
                  )}
                </div>

                {/* Mobile Card Action Buttons */}
                <div className="flex items-center justify-end gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-dark-border/60 flex-wrap">
                  {order.status === "cancel_requested" && (
                    <>
                      <button
                        onClick={() => handleApproveCancelRequest(order)}
                        className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer"
                      >
                        <FiCheckCircle size={12} /> Duyệt hủy
                      </button>
                      <button
                        onClick={() => handleRejectCancelRequest(order)}
                        className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer"
                      >
                        <FiXCircle size={12} /> Từ chối
                      </button>
                    </>
                  )}
                  {order.orderItems?.some((i) => i.returnStatus === "requested") && (
                    <button
                      onClick={() => handleProcessReturnModal(order)}
                      className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <FiRotateCcw size={12} /> Duyệt trả
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedDetailOrder(order)}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FiEye size={12} /> Chi tiết
                  </button>
                  <button
                    onClick={() => openStatusModal(order)}
                    className="px-2.5 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FiRefreshCcw size={12} /> Cập nhật TT
                  </button>
                  {["pending", "confirmed", "processing", "shipped"].includes(order.status) && (
                    <button
                      onClick={() => handleAdminCancelOrder(order)}
                      className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FiSlash size={12} /> Hủy đơn
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setConfirmModal({
                        show: true,
                        type: "delete",
                        order,
                        orderId: order.id,
                        orderCode: order.orderCode,
                        reason: "",
                      })
                    }
                    className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-lg text-[10px] cursor-pointer"
                    title="Xóa đơn"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              Không tìm thấy đơn hàng nào
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400 dark:text-dark-text-secondary">
            Trang {page} / {totalPages}
          </p>
          <AppPagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => fetchOrders(p, searchTerm, activeTab)}
          />
        </div>
      </div>

      {/* Modal Cập nhật Trạng thái Đơn hàng (Mobile Bottom-Sheet & Desktop Popup) */}
      <AnimatePresence>
        {statusModal.show && statusModal.order && (
          <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop Overlay */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setStatusModal({
                  show: false,
                  order: null,
                  selectedStatus: "",
                  reason: "",
                })
              }
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            />

            {/* Main Modal Window */}
            <Motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative bg-white dark:bg-dark-surface rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden border border-slate-200/80 dark:border-dark-border transition-colors duration-300 z-10 text-left"
            >
              {/* Mobile Drag Pill */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden bg-slate-50/80 dark:bg-dark-bg/60 shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-dark-border shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-base">
                      <FiRefreshCcw />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Cập nhật trạng thái
                    </h3>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary mt-1">
                    Đơn hàng:{" "}
                    <span className="text-primary font-black uppercase">
                      #{statusModal.order.orderCode}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setStatusModal({
                      show: false,
                      order: null,
                      selectedStatus: "",
                      reason: "",
                    })
                  }
                  className="size-9 bg-slate-100 dark:bg-dark-bg hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-5">
                {/* Order Quick Summary Card */}
                <div className="bg-slate-50 dark:bg-dark-bg/60 p-4 rounded-2xl border border-slate-100 dark:border-dark-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 bg-white dark:bg-dark-surface rounded-xl flex items-center justify-center text-slate-400 dark:text-dark-text-secondary border border-slate-100 dark:border-dark-border shrink-0">
                      <FiUser />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {statusModal.order.user?.username || "Ẩn danh"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {statusModal.order.user?.phone || "Không có SĐT"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-rose-600">
                      {formatCurrency(statusModal.order.totalPrice)}
                    </p>
                    <StatusBadge
                      map={statusMap}
                      status={statusModal.order.status}
                      className="text-[9px] px-2 py-0.5 mt-1"
                    />
                  </div>
                </div>

                {/* Status Selection Cards */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary block mb-3">
                    Chọn trạng thái mới
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {STATUS_FLOW.map((item) => {
                      const isCurrent = statusModal.order.status === item.key;
                      const isValid =
                        ALLOWED_TRANSITIONS[statusModal.order.status]?.includes(
                          item.key,
                        );
                      const isSelected = statusModal.selectedStatus === item.key;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          disabled={isCurrent || !isValid}
                          onClick={() =>
                            setStatusModal((prev) => ({
                              ...prev,
                              selectedStatus: item.key,
                            }))
                          }
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                            isCurrent
                              ? "bg-primary/10 border-primary/30 opacity-90 cursor-default"
                              : isSelected
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.01] cursor-pointer"
                              : isValid
                              ? "bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border hover:border-primary/50 text-slate-700 dark:text-dark-text-secondary cursor-pointer"
                              : "bg-slate-50 dark:bg-dark-bg/30 border-slate-100 dark:border-dark-border/40 text-slate-300 dark:text-slate-600 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`size-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : isCurrent
                                  ? "bg-primary text-white"
                                  : isValid
                                  ? "bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary"
                                  : "bg-slate-100 dark:bg-dark-bg/50 text-slate-300 dark:text-slate-600"
                              }`}
                            >
                              <Icon />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-xs font-black uppercase tracking-wider truncate ${
                                    isSelected
                                      ? "text-white"
                                      : "text-slate-900 dark:text-white"
                                  }`}
                                >
                                  {item.label}
                                </p>
                                {isCurrent && (
                                  <span className="text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-md shrink-0">
                                    Hiện tại
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[10px] font-medium truncate mt-0.5 ${
                                  isSelected
                                    ? "text-white/80"
                                    : "text-slate-400 dark:text-dark-text-secondary"
                                }`}
                              >
                                {isCurrent
                                  ? "Đơn hàng đang ở trạng thái này"
                                  : isValid
                                  ? item.desc
                                  : "Không thể chuyển sang trạng thái này"}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isSelected && !isCurrent ? (
                              <div className="size-6 rounded-full bg-white text-primary flex items-center justify-center text-xs font-black shadow-sm">
                                <FiCheck />
                              </div>
                            ) : !isValid && !isCurrent ? (
                              <FiLock className="text-slate-300 dark:text-slate-600 text-sm" />
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cancel Reason Input if Cancelled is Selected */}
                {statusModal.selectedStatus === "cancelled" && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[11px] font-black uppercase tracking-widest text-rose-500 block">
                      Lý do hủy đơn hàng
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Nhập lý do hủy đơn (ví dụ: Hết hàng, Khách đổi ý...)"
                      value={statusModal.reason}
                      onChange={(e) =>
                        setStatusModal((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 outline-none transition-all dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/40 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setStatusModal({
                      show: false,
                      order: null,
                      selectedStatus: "",
                      reason: "",
                    })
                  }
                  className="flex-1 h-12 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary text-xs font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={
                    isUpdating ||
                    statusModal.selectedStatus === statusModal.order.status
                  }
                  onClick={handleConfirmStatusModal}
                  className={`flex-1 h-12 rounded-2xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                    statusModal.selectedStatus === statusModal.order.status
                      ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none"
                      : statusModal.selectedStatus === "cancelled"
                      ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 cursor-pointer active:scale-95"
                      : "bg-primary hover:bg-primary-hover shadow-primary/20 cursor-pointer active:scale-95"
                  }`}
                >
                  {isUpdating ? (
                    <FiRefreshCw className="animate-spin text-base" />
                  ) : (
                    <>
                      <FiCheckCircle className="text-base" /> Xác nhận chuyển
                    </>
                  )}
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action & Confirm Modals */}
      <ConfirmModal
        isOpen={confirmModal.show && confirmModal.type === "delete"}
        onClose={() =>
          setConfirmModal({
            show: false,
            type: "delete",
            order: null,
            orderId: null,
            orderCode: null,
            reason: "",
          })
        }
        onConfirm={() => handleConfirmModalAction("delete")}
        title="Xác nhận xóa đơn hàng?"
        message={`Hành động này sẽ gỡ bỏ đơn hàng #${confirmModal.orderCode || `DH${confirmModal.orderId}`} vĩnh viễn khỏi hệ thống. Bạn có chắc chắn?`}
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 text-rose-500"
        loading={isDeleting}
      />

      <ConfirmModal
        isOpen={confirmModal.show && confirmModal.type === "approve_cancel"}
        onClose={() =>
          setConfirmModal({
            show: false,
            type: "delete",
            order: null,
            orderId: null,
            orderCode: null,
            reason: "",
          })
        }
        onConfirm={() => handleConfirmModalAction("approve_cancel")}
        title="Duyệt yêu cầu hủy đơn?"
        message={`Bạn có đồng ý chấp nhận hủy đơn hàng #${confirmModal.orderCode}? Hệ thống sẽ hoàn lại số lượng tồn kho cho các sản phẩm trong đơn.`}
        confirmText="Duyệt hủy (Hoàn kho)"
        variant="danger"
        icon={FiCheckCircle}
        loading={isDeleting}
      >
        <div className="w-full bg-slate-50 dark:bg-dark-bg/60 p-3 rounded-xl border border-slate-200 dark:border-dark-border text-left mb-2">
          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-secondary tracking-wider mb-1">
            Lý do từ khách hàng:
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold italic">
            "{confirmModal.order?.cancelReason || "Khách không để lại lý do"}"
          </p>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={confirmModal.show && confirmModal.type === "reject_cancel"}
        onClose={() =>
          setConfirmModal({
            show: false,
            type: "delete",
            order: null,
            orderId: null,
            orderCode: null,
            reason: "",
          })
        }
        onConfirm={() => handleConfirmModalAction("reject_cancel")}
        title="Từ chối yêu cầu hủy đơn?"
        message={`Đơn hàng #${confirmModal.orderCode} sẽ được chuyển về trạng thái "Đã xác nhận" để tiếp tục giao dịch.`}
        confirmText="Xác nhận từ chối"
        variant="primary"
        icon={FiXCircle}
        loading={isDeleting}
      >
        <div className="w-full text-left space-y-1.5 mb-2">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-secondary tracking-wider block">
            Ghi chú / Lý do từ chối:
          </label>
          <input
            type="text"
            placeholder="Nhập lý do gửi đến khách..."
            value={confirmModal.reason || ""}
            onChange={(e) =>
              setConfirmModal((prev) => ({ ...prev, reason: e.target.value }))
            }
            className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={confirmModal.show && confirmModal.type === "admin_cancel"}
        onClose={() =>
          setConfirmModal({
            show: false,
            type: "delete",
            order: null,
            orderId: null,
            orderCode: null,
            reason: "",
          })
        }
        onConfirm={() => handleConfirmModalAction("admin_cancel")}
        title={`Admin hủy đơn #${confirmModal.orderCode}`}
        message="Hành động này sẽ hủy đơn hàng và hoàn lại tồn kho. Vui lòng nhập lý do hủy đơn hàng:"
        confirmText="Xác nhận hủy đơn"
        variant="danger"
        icon={FiSlash}
        loading={isDeleting}
      >
        <div className="w-full text-left space-y-1.5 mb-2">
          <label className="text-[10px] font-black uppercase text-rose-500 tracking-wider block">
            Lý do hủy đơn hàng (bắt buộc):
          </label>
          <textarea
            rows={2}
            placeholder="Ví dụ: Hết hàng, Khách gọi điện yêu cầu hủy, Sai thông tin giá..."
            value={confirmModal.reason || ""}
            onChange={(e) =>
              setConfirmModal((prev) => ({ ...prev, reason: e.target.value }))
            }
            className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
      </ConfirmModal>

      {/* Return Request Process Modal */}
      {confirmModal.show && confirmModal.type === "process_return" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border w-full max-w-lg p-5 sm:p-6 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
                  <FiRotateCcw />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Xử lý trả hàng #{confirmModal.orderCode}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Duyệt nhập kho và hoàn tiền cho khách
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setConfirmModal({
                    show: false,
                    type: "delete",
                    order: null,
                    orderId: null,
                    orderCode: null,
                    reason: "",
                  })
                }
                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="py-4 space-y-2.5 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {confirmModal.order?.orderItems
                ?.filter((item) => item.returnStatus === "requested")
                ?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 dark:bg-dark-bg/60 rounded-2xl border border-slate-100 dark:border-dark-border flex items-start gap-3"
                  >
                    <div className="size-11 bg-white dark:bg-dark-surface rounded-xl p-1 border border-slate-100 dark:border-dark-border shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        SL: <span className="text-primary font-black">x{item.quantity}</span> • {formatCurrency(item.price)}
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium italic mt-1.5 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/30">
                        Lý do: "{item.returnReason || "Khách hàng không nêu lý do"}"
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-dark-border">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleConfirmModalAction("reject_return")}
                className="flex-1 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-600 hover:text-white transition-all text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FiXCircle size={15} /> Từ chối trả
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleConfirmModalAction("approve_return")}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <FiCheckCircle size={15} /> Duyệt trả (Nhập kho)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Order Detail Modal */}
      <AdminOrderDetailModal
        order={selectedDetailOrder}
        isOpen={Boolean(selectedDetailOrder)}
        onClose={() => setSelectedDetailOrder(null)}
        onOrderUpdated={() => fetchOrders(page, searchTerm, activeTab)}
      />
    </div>
  );
};

export default OrderManage;
