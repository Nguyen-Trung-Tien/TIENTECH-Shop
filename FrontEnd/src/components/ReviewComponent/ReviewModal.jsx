import React, { useState, useEffect } from "react";
import { Modal, Button } from "../UI";
import ReviewForm from "./ReviewForm";
import { createReviewApi, getPendingReviewsApi } from "../../api/reviewApi";
import { toast } from "react-toastify";
import { FiCheckCircle, FiPackage } from "react-icons/fi";

const ReviewModal = ({ isOpen, onClose, order, onReviewSuccess }) => {
  const [reviewingProductId, setReviewingProductId] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    images: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [reviewedProductIds, setReviewedProductIds] = useState([]);
  const [pendingProductIds, setPendingProductIds] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReviewingProductId(null);
      setNewReview({ rating: 0, comment: "", images: [] });
      fetchPendingProducts();
    }
  }, [isOpen]);

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const res = await getPendingReviewsApi();
      if (res.errCode === 0) {
        setPendingProductIds(res.data.map((p) => String(p.id)));
      }
    } catch (error) {
      console.error("Error fetching pending products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (productId) => {
    setReviewingProductId(productId);
    setNewReview({ rating: 0, comment: "", images: [] });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await createReviewApi({
        productId: reviewingProductId,
        ...newReview,
      });
      if (res.errCode === 0) {
        toast.success("Đánh giá sản phẩm thành công!");
        setReviewedProductIds((prev) => [...prev, String(reviewingProductId)]);
        setReviewingProductId(null);
        // Refresh pending list
        fetchPendingProducts();
        if (onReviewSuccess) onReviewSuccess();
      } else {
        toast.error(res.errMessage || "Lỗi khi gửi đánh giá");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error(
        error?.response?.data?.errMessage || "Không thể gửi đánh giá",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Đánh giá đơn hàng #${order.orderCode || order.id}`}
      size="lg"
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-500 dark:text-dark-text-secondary font-medium">
          Cảm ơn bạn đã mua sắm! Hãy chia sẻ trải nghiệm của bạn về các sản phẩm
          trong đơn hàng này.
        </p>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {loading && (pendingProductIds === null) ? (
            <div className="py-10 text-center">
              <div className="size-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : (
            order.orderItems?.map((item) => {
              const productId = String(item.product?.id || item.productId);
              
              // Đã đánh giá nếu:
              // 1. Vừa đánh giá trong modal này (reviewedProductIds)
              // 2. Không nằm trong danh sách "chưa đánh giá" (pendingProductIds)
              const isReviewed =
                reviewedProductIds.includes(productId) ||
                (pendingProductIds !== null &&
                  !pendingProductIds.includes(productId));

              const isCurrent = reviewingProductId === item.product?.id || reviewingProductId === item.productId;

            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-dark-surface rounded-[32px] p-6 border border-slate-100 dark:border-dark-border hover:border-primary/20 dark:hover:border-brand/20 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-6">
                  <div className="size-20 bg-slate-50 dark:bg-dark-bg rounded-[24px] border border-slate-100 dark:border-dark-border p-2 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={item.product?.image || item.image}
                      alt=""
                      className="w-full h-full object-contain dark:mix-blend-normal"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base truncate mb-1">
                      {item.productName}
                    </h4>
                    <div className="flex items-center gap-3">
                      <p className="text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                        Số lượng: {item.quantity}
                      </p>
                      <div className="size-1 bg-slate-200 dark:bg-dark-border rounded-full"></div>
                      <p className="text-[11px] font-black text-primary dark:text-brand uppercase tracking-widest">
                        Đã giao thành công
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isReviewed ? (
                      <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                        <FiCheckCircle size={14} /> Đã đánh giá
                      </div>
                    ) : !isCurrent ? (
                      <Button
                        variant="primary"
                        size="md"
                        className="!rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] px-6 shadow-lg shadow-primary/10"
                        onClick={() => handleOpenForm(productId)}
                      >
                        ĐÁNH GIÁ
                      </Button>
                    ) : (
                      <button
                        onClick={() => setReviewingProductId(null)}
                        className="px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 dark:text-dark-text-secondary hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 uppercase tracking-[0.2em] transition-all"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>

                {isCurrent && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-dark-border animate-in fade-in slide-in-from-top-4 duration-500">
                    <ReviewForm
                      newReview={newReview}
                      setNewReview={setNewReview}
                      onSubmit={handleSubmit}
                      loading={submitting}
                    />
                  </div>
                )}
              </div>
            );
          }))}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>
            ĐÓNG
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewModal;
