import React, { useState, useEffect } from "react";
import { Modal, Button } from "../UI";
import ReviewForm from "./ReviewForm";
import { createReviewApi, getPendingReviewsApi } from "../../api/reviewApi";
import { toast } from "react-toastify";
import { FiCheckCircle, FiPackage } from "react-icons/fi";
import UnifiedSpinner from "../Loading/UnifiedSpinner";

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
      loading={submitting}
      loadingMessage="Đang gửi đánh giá..."
    >
      <div className="space-y-4 sm:space-y-6">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-text-secondary font-medium">
          Cảm ơn bạn đã mua sắm! Hãy chia sẻ trải nghiệm của bạn về các sản phẩm
          trong đơn hàng này.
        </p>

        <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
          {loading && (pendingProductIds === null) ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
              <UnifiedSpinner size="md" variant="primary" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Đang tải sản phẩm chờ đánh giá...
              </p>
            </div>
          ) : (
            order.orderItems?.map((item) => {
              const rawProductId = item.productId || item.product?.id;
              const productId = rawProductId ? String(rawProductId) : null;
              
              const isReviewed = productId
                ? (reviewedProductIds.includes(productId) ||
                   (pendingProductIds !== null &&
                    !pendingProductIds.includes(productId)))
                : true;

              const isCurrent = reviewingProductId !== null && productId !== null && String(reviewingProductId) === productId;

            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[32px] p-4 sm:p-6 border border-slate-100 dark:border-dark-border hover:border-primary/20 dark:hover:border-brand/20 transition-all duration-300 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-6 min-w-0 w-full sm:w-auto flex-1">
                    <div className="size-16 sm:size-20 bg-slate-50 dark:bg-dark-bg rounded-2xl sm:rounded-[24px] border border-slate-100 dark:border-dark-border p-2 flex-shrink-0">
                      <img
                        src={item.product?.image || item.image}
                        alt=""
                        className="w-full h-full object-contain dark:mix-blend-normal"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate mb-1">
                        {item.productName}
                      </h4>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <p className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                          Số lượng: {item.quantity}
                        </p>
                        <div className="size-1 bg-slate-200 dark:bg-dark-border rounded-full hidden sm:block"></div>
                        <p className="text-[10px] sm:text-[11px] font-black text-primary dark:text-brand uppercase tracking-widest">
                          Đã giao thành công
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-dark-border">
                    {isReviewed ? (
                      <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                        <FiCheckCircle size={14} /> Đã đánh giá
                      </div>
                    ) : !isCurrent ? (
                      <Button
                        variant="primary"
                        size="md"
                        className="!rounded-2xl text-xs font-bold uppercase tracking-wider px-5 shadow-lg shadow-primary/10"
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
