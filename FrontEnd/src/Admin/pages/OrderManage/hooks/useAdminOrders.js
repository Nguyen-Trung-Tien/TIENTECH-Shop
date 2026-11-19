import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  showErrorToast,
  showSuccessToast,
  showInfoToast,
} from "../../../../utils/toastHelper";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../../../api/orderApi";
import { processReturn } from "../../../../api/orderItemApi";
import { statusMap } from "../../../../utils/StatusMap";

const INITIAL_CONFIRM_MODAL = {
  show: false,
  type: "delete",
  order: null,
  orderId: null,
  orderCode: null,
  reason: "",
};

const INITIAL_STATUS_MODAL = {
  show: false,
  order: null,
  selectedStatus: "",
  reason: "",
};

export const formatOrderCurrency = (v) =>
  v ? `${Number(v).toLocaleString("vi-VN")} ₫` : "0 ₫";

export const formatOrderDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "—";

export const useAdminOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get("search") || "";
  const initialTab = queryParams.get("tab") || "all";

  const [orders, setOrders] = useState([]);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState(null);
  const [confirmModal, setConfirmModal] = useState(INITIAL_CONFIRM_MODAL);
  const [statusModal, setStatusModal] = useState(INITIAL_STATUS_MODAL);

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
      navigate(newSearch ? `/admin/orders?${newSearch}` : "/admin/orders", {
        replace: true,
      });
    },
    [location.search, navigate],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get("tab") || "all";
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
      setPage(1);
    }
  }, [location.search, activeTab]);

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
          const nextOrders = res.data || [];
          setOrders(nextOrders);
          setSelectedDetailOrder((prev) =>
            prev ? nextOrders.find((o) => o.id === prev.id) || prev : null,
          );
          setPage(
            res.pagination?.currentPage || res.pagination?.page || currentPage,
          );
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

  const openStatusModal = useCallback((order) => {
    setStatusModal({
      show: true,
      order,
      selectedStatus: order.status,
      reason: "",
    });
  }, []);

  const closeStatusModal = useCallback(() => {
    setStatusModal(INITIAL_STATUS_MODAL);
  }, []);

  const handleConfirmStatusModal = useCallback(async () => {
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
        setStatusModal(INITIAL_STATUS_MODAL);
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
  }, [statusModal, page, searchTerm, activeTab, fetchOrders]);

  const openConfirmModal = useCallback((type, order) => {
    setConfirmModal({
      show: true,
      type,
      order,
      orderId: order.id,
      orderCode: order.orderCode,
      reason: "",
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal(INITIAL_CONFIRM_MODAL);
  }, []);

  const handleConfirmModalAction = useCallback(
    async (overrideType) => {
      const actionType = overrideType || confirmModal.type;
      const { order, orderId, orderCode, reason } = confirmModal;
      setIsDeleting(true);
      setLoadingId(orderId);
      try {
        if (actionType === "delete") {
          const res = await deleteOrder(orderId);
          if (res?.errCode === 0) {
            showSuccessToast(
              res?.errMessage,
              `Đã xóa đơn ${orderCode || `DH${orderId}`}`,
            );
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
            showSuccessToast(
              `Đã duyệt hủy đơn #${orderCode} và hoàn tồn kho thành công!`,
            );
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
            showSuccessToast(
              `Đã từ chối yêu cầu hủy đơn #${orderCode}! Đơn chuyển về trạng thái Đã xác nhận.`,
            );
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
          const res = await updateOrderStatus(
            orderId,
            "cancelled",
            reason.trim(),
          );
          if (res?.errCode === 0) {
            showSuccessToast(`Đã hủy đơn hàng #${orderCode} thành công!`);
            fetchOrders(page, searchTerm, activeTab);
          } else {
            showErrorToast(res?.errMessage, "Không thể hủy đơn hàng");
          }
        } else if (
          actionType === "approve_return" ||
          actionType === "reject_return"
        ) {
          const requestedItems =
            order?.orderItems?.filter((i) => i.returnStatus === "requested") ||
            [];
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
        setConfirmModal(INITIAL_CONFIRM_MODAL);
      } catch (err) {
        console.error(err);
        showErrorToast(err, "Lỗi xử lý thao tác");
      } finally {
        setIsDeleting(false);
        setLoadingId(null);
      }
    },
    [confirmModal, page, searchTerm, activeTab, fetchOrders],
  );

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

  return {
    orders,
    selectedDetailOrder,
    setSelectedDetailOrder,
    confirmModal,
    setConfirmModal,
    statusModal,
    setStatusModal,
    loading,
    loadingId,
    isUpdating,
    isDeleting,
    page,
    totalPages,
    searchTerm,
    setSearchTerm,
    activeTab,
    summaryStats,
    handleTabChange,
    fetchOrders,
    openStatusModal,
    closeStatusModal,
    handleConfirmStatusModal,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmModalAction,
  };
};
