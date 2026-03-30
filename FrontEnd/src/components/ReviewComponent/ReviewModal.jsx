import React, { useState, useEffect } from "react";
import { Modal, Button } from "../UI";
import ReviewForm from "./ReviewForm";
import { createReviewApi } from "../../api/reviewApi";
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

  useEffect(() => {
    if (isOpen) {
      setReviewingProductId(null);
      setNewReview({ rating: 0, comment: "", images: [] });
    }
  }, [isOpen]);

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
        setReviewedProductIds((prev) => [...prev, reviewingProductId]);
        setReviewingProductId(null);
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
        <p className="text-sm text-slate-500 font-medium">
          Cảm ơn bạn đã mua sắm! Hãy chia sẻ trải nghiệm của bạn về các sản phẩm
          trong đơn hàng này.
        </p>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {order.orderItems?.map((item) => {
            const productId = item.product?.id || item.productId;
            const isReviewed = reviewedProductIds.includes(productId);
            const isCurrent = reviewingProductId === productId;

            return (
              <div
                key={item.id}
                className="bg-slate-50 rounded-[24px] p-5 border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl border border-slate-100 p-1 flex-shrink-0">
                    <img
                      src={item.product?.image || item.image}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Số lượng: {item.quantity}
                    </p>
                  </div>

                  {isReviewed ? (
                    <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
                      <FiCheckCircle size={12} /> Đã đánh giá
                    </div>
                  ) : !isCurrent ? (
                    <Button
                      variant="primary"
                      size="sm"
                      className="!rounded-xl text-[9px] font-black uppercase tracking-widest"
                      onClick={() => handleOpenForm(productId)}
                    >
                      ĐÁNH GIÁ
                    </Button>
                  ) : (
                    <button
                      onClick={() => setReviewingProductId(null)}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest px-2"
                    >
                      Hủy
                    </button>
                  )}
                </div>

                {isCurrent && (
                  <div className="mt-6 pt-6 border-t border-white">
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
          })}
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
