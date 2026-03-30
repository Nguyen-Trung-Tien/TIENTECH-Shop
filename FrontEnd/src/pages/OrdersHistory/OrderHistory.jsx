import React, { useEffect, useState, useCallback } from "react";
import { FiEye, FiShoppingBag, FiClock, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getOrdersByUserId } from "../../api/orderApi";
import AppPagination from "../../components/Pagination/Pagination";
import { orderStatusMap, paymentStatusMap } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/format";
import { StatusBadge } from "../../utils/StatusBadge";
import ClickableText from "../../components/ClickableText/ClickableText";
import Button from "../../components/UI/Button";
import Badge from "../../components/UI/Badge";
import ReviewModal from "../../components/ReviewComponent/ReviewModal";

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

  return (
    <div className="min-h-screen bg-surface-50 py-12">
      <div className="container-custom">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">
              Lịch sử đơn hàng
            </h1>
            <p className="text-surface-500 font-medium">
              Quản lý và theo dõi trạng thái các đơn hàng của bạn.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-surface-200 shadow-sm">
            <FiClock className="text-primary" />
            <span className="text-sm font-bold text-surface-700">
              Tổng số: {orders.length} đơn hàng
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-surface-400 font-bold uppercase tracking-widest text-[11px]">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-surface-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="text-3xl text-surface-300" />
            </div>
            <h3 className="text-xl font-bold text-surface-900 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-surface-500 mb-8 max-w-sm mx-auto">
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
                className="group bg-white rounded-3xl border border-surface-200 shadow-sm hover:shadow-soft hover:border-primary/20 transition-all duration-300 overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="px-6 py-4 bg-surface-50/50 border-b border-surface-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] font-black text-surface-900 uppercase tracking-wider bg-white px-3 py-1 rounded-lg border border-surface-200">
                      #{o.orderCode || o.id}
                    </span>
                    <span className="text-sm text-surface-400 font-medium">
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
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-surface-50 rounded-2xl border border-surface-100 p-2 flex-shrink-0 group-hover:border-primary/10 transition-colors">
                            <img
                              src={p?.image || "/images/no-image.png"}
                              alt={p?.name || i.productName}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div className="flex-grow min-w-0 py-1">
                            <ClickableText
                              className="text-base md:text-lg font-bold text-surface-900 line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                              onClick={() => navigate(`/orders-detail/${o.id}`)}
                            >
                              {p?.name || i.productName}
                            </ClickableText>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-surface-500 font-medium">
                                Số lượng: {i.quantity}
                              </span>
                              <div className="w-1 h-1 bg-surface-300 rounded-full"></div>
                              <span className="text-sm text-surface-500 font-medium">
                                Phân loại: {p?.category?.name || "Điện tử"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {p?.discount > 0 && (
                                <span className="text-sm text-surface-400 line-through">
                                  {formatCurrency(p.price)}
                                </span>
                              )}
                              <span className="text-lg font-black text-surface-900">
                                {formatCurrency(i.price)}
                              </span>
                              {p?.discount > 0 && (
                                <Badge
                                  variant="danger"
                                  className="scale-90 origin-left"
                                >
                                  -{p.discount}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-8 pt-6 border-t border-surface-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center sm:items-start">
                      <p className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-1">
                        Tổng cộng đơn hàng
                      </p>
                      <span className="text-2xl font-black text-primary tracking-tight">
                        {formatCurrency(o.totalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        size="md"
                        className="flex-1 sm:flex-none"
                        icon={FiEye}
                        onClick={() => navigate(`/orders-detail/${o.id}`)}
                      >
                        CHI TIẾT
                      </Button>
                      {o.status === "delivered" && (
                        <Button
                          variant="primary"
                          size="md"
                          className="flex-1 sm:flex-none"
                          icon={FiCheckCircle}
                          onClick={() => openReviewModal(o)}
                        >
                          ĐÁNH GIÁ
                        </Button>
                      )}
                    </div>
                  </div>
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
