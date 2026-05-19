import React, { useEffect, useState, useCallback } from "react";
import { FiEye, FiShoppingBag, FiClock, FiCheckCircle, FiRotateCcw, FiAlertTriangle, FiEdit3 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getOrdersByUserId, updateOrderStatus } from "../../api/orderApi";
import AppPagination from "../../components/Pagination/Pagination";
import { orderStatusMap, paymentStatusMap } from "../../utils/constants";
import { returnStatusMap } from "../../utils/StatusMap";
import { formatCurrency, formatDate } from "../../utils/format";
import { StatusBadge } from "../../utils/StatusBadge";
import ClickableText from "../../components/ClickableText/ClickableText";
import Button from "../../components/UI/Button";
import Badge from "../../components/UI/Badge";
import ReviewModal from "../../components/ReviewComponent/ReviewModal";
import { toast } from "react-toastify";

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getOrdersByUserId(user.id, page, limit);
      if (res?.errCode === 0) {
        setOrders(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openReviewModal = (order) => {
    setSelectedOrderForReview(order);
    setIsReviewModalOpen(true);
  };

  const handleConfirmReceipt = async (orderId) => {
    try {
      setIsSubmitting(true);
      const res = await updateOrderStatus(orderId, "completed");
      if (res.errCode === 0) {
        toast.success("Xác nhận đã nhận hàng thành công!");
        fetchOrders();
      } else {
        toast.error(res.errMessage);
      }
    } catch (error) {
      toast.error("Lỗi khi xác nhận nhận hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg py-12 transition-colors duration-300">
      <div className="container-custom">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-2">
              Lịch sử đơn hàng
            </h1>
            <p className="text-surface-500 dark:text-dark-text-secondary font-medium">
              Quản lý và theo dõi trạng thái các đơn hàng của bạn.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-dark-surface px-4 py-2 rounded-2xl border border-surface-200 dark:border-dark-border shadow-sm">
            <FiClock className="text-primary dark:text-brand" />
            <span className="text-sm font-bold text-surface-700 dark:text-white">
              Tổng số: {orders.length} đơn hàng
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="size-12 border-4 border-primary dark:border-brand border-t-transparent rounded-full animate-spin"></div>
            <p className="text-surface-400 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[11px]">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-surface-200 dark:border-dark-border p-16 text-center shadow-sm">
            <div className="size-20 bg-surface-50 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="text-3xl text-surface-300 dark:text-dark-border" />
            </div>
            <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-surface-500 dark:text-dark-text-secondary mb-8 max-w-sm mx-auto">
              Có vẻ như bạn chưa thực hiện giao dịch nào. Hãy khám phá các sản
              phẩm công nghệ mới nhất của chúng tôi.
            </p>
            <Button onClick={() => navigate("/")}>BẮT ĐẦU MUA SẮM</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((o) => (
              <div
                key={o.id}
                className="group bg-white dark:bg-dark-surface rounded-3xl border border-surface-200 dark:border-dark-border shadow-sm hover:shadow-soft dark:hover:shadow-none hover:border-primary/20 dark:hover:border-brand/20 transition-all duration-300 overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="px-6 py-4 bg-surface-50/50 dark:bg-dark-bg/50 border-b border-surface-100 dark:border-dark-border flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] font-black text-surface-900 dark:text-white uppercase tracking-wider bg-white dark:bg-dark-bg px-3 py-1 rounded-lg border border-surface-200 dark:border-dark-border">
                      #{o.orderCode || o.id}
                    </span>
                    <span className="text-sm text-surface-400 dark:text-dark-text-secondary font-medium">
                      Ngày đặt: {formatDate(o.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge map={orderStatusMap} status={o.status} />
                    <StatusBadge
                      map={paymentStatusMap}
                      status={o.paymentStatus}
                    />
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {o.orderItems?.map((i) => {
                      const p = i.product;
                      return (
                        <div key={i.id} className="flex gap-4 md:gap-6">
                          <div className="size-20 md:w-24 md:h-24 bg-surface-50 dark:bg-dark-bg rounded-2xl border border-surface-100 dark:border-dark-border p-2 flex-shrink-0 group-hover:border-primary/10 dark:group-hover:border-brand/10 transition-colors">
                            <img
                              src={p?.image || "/images/no-image.png"}
                              alt={p?.name || i.productName}
                              className="w-full h-full object-contain dark:mix-blend-normal"
                            />
                          </div>
                          <div className="flex-grow min-w-0 py-1">
                            <ClickableText
                              className="text-base md:text-lg font-bold text-surface-900 dark:text-white line-clamp-1 hover:text-primary dark:hover:text-brand transition-colors cursor-pointer"
                              onClick={() => navigate(`/orders-detail/${o.id}`)}
                            >
                              {p?.name || i.productName}
                            </ClickableText>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-surface-500 dark:text-dark-text-secondary font-medium">
                                Số lượng: {i.quantity}
                              </span>
                              <div className="size-1 bg-surface-300 dark:bg-dark-border rounded-full"></div>
                              <span className="text-sm text-surface-500 dark:text-dark-text-secondary font-medium">
                                Phân loại: {p?.category?.name || "Điện tử"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                              <StatusBadge map={returnStatusMap} status={i.returnStatus} />
                              {["delivered", "completed"].includes(o.status) && (!i.returnStatus || i.returnStatus === "none") && (
                                <button
                                  onClick={() => navigate(`/orders-detail/${o.id}`)}
                                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                >
                                  Yêu cầu trả hàng
                                </button>
                              )}
                            </div>
                            {i.returnStatus !== "none" && i.returnReason && (
                              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
                                <p className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                  <FiRotateCcw size={10} /> Lý do trả hàng
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium italic">
                                  "{i.returnReason}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-8 pt-6 border-t border-surface-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center sm:items-start">
                      <p className="text-[11px] font-black text-surface-400 dark:text-dark-text-secondary uppercase tracking-widest mb-1">
                        Tổng cộng đơn hàng
                      </p>
                      <span className="text-2xl font-black text-primary dark:text-brand tracking-tight">
                        {formatCurrency(o.totalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        size="md"
                        className="flex-1 sm:flex-none !rounded-2xl text-[10px] font-black uppercase tracking-widest px-6"
                        icon={FiEye}
                        onClick={() => navigate(`/orders-detail/${o.id}`)}
                      >
                        CHI TIẾT
                      </Button>
                      {o.status === "delivered" && (
                        <Button
                          variant="primary"
                          size="md"
                          className="flex-1 sm:flex-none !rounded-2xl text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20"
                          icon={FiCheckCircle}
                          onClick={() => handleConfirmReceipt(o.id)}
                          loading={isSubmitting}
                        >
                          XÁC NHẬN
                        </Button>
                      )}
                      {["delivered", "completed"].includes(o.status) && (
                        <Button
                          variant="primary"
                          size="md"
                          className="flex-1 sm:flex-none !rounded-2xl text-[10px] font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-indigo-600 border-none hover:scale-105 transition-transform"
                          icon={FiEdit3}
                          onClick={() => openReviewModal(o)}
                        >
                          ĐÁNH GIÁ
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Cancel Reason Display in List */}
                  {o.cancelReason && (
                    <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl">
                      <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <FiAlertTriangle size={12} /> Lý do hủy đơn
                      </p>
                      <p className="text-sm text-rose-700 dark:text-rose-300 font-medium italic">
                        "{o.cancelReason}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <AppPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              loading={loading}
            />
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        order={selectedOrderForReview}
        onReviewSuccess={fetchOrders}
      />
    </div>
  );
};

export default OrderHistoryPage;
