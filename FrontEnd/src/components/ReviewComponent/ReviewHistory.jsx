import React, { useState, useEffect } from "react";
import {
  getReviewsByUserApi,
  deleteReviewApi,
  getPendingReviewsApi,
  createReviewApi,
} from "../../api/reviewApi";
import { toast } from "react-toastify";
import {
  FiStar,
  FiTrash2,
  FiMessageSquare,
  FiPackage,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiEdit3,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Pagination from "../Pagination/Pagination";
import Button from "../UI/Button";
import ReviewForm from "./ReviewForm";
import { ConfirmModal } from "../UI/Modal";

const ReviewHistory = () => {
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "history"
  const [reviews, setReviews] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [reviewingProductId, setReviewingProductId] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    images: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    show: false,
    id: null,
  });

  useEffect(() => {
    if (activeTab === "history") {
      fetchReviews();
    } else {
      fetchPendingProducts();
    }
  }, [activeTab]);

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getReviewsByUserApi(page, 5);
      if (res.errCode === 0) {
        setReviews(res.data);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error("Error fetching review history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const res = await getPendingReviewsApi();
      if (res.errCode === 0) {
        setPendingProducts(res.data);
      }
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const res = await deleteReviewApi(confirmDeleteModal.id);
    if (res.errCode === 0) {
      toast.success("Đã xóa đánh giá");
      fetchReviews(pagination.page);
    } else {
      toast.error(res.errMessage);
    }
    setConfirmDeleteModal({ show: false, id: null });
  };

  const handleOpenReviewForm = (productId) => {
    setReviewingProductId(productId);
    setNewReview({ rating: 0, comment: "", images: [] });
  };

  const onReviewSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await createReviewApi({
        productId: reviewingProductId,
        ...newReview,
      });
      if (res.errCode === 0) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        setReviewingProductId(null);
        fetchPendingProducts();
      } else {
        toast.error(res.errMessage || "Lỗi khi gửi đánh giá");
      }
    } catch (error) {
      toast.error("Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-bold text-surface-900">
            Đánh giá sản phẩm
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Quản lý các đánh giá của bạn về sản phẩm đã mua
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "pending"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Chờ đánh giá ({pendingProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "history"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Lịch sử
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : activeTab === "pending" ? (
        <div className="space-y-6">
          {pendingProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
              <FiClock size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">
                Không có sản phẩm nào chờ đánh giá.
              </p>
              <Link
                to="/orders"
                className="text-primary text-[10px] font-black mt-2 inline-block hover:underline uppercase tracking-widest"
              >
                Xem lịch sử đơn hàng
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm"
                >
                  {reviewingProductId === product.id ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50">
                        <img
                          src={product.image}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <h4 className="font-bold text-sm text-slate-900">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => setReviewingProductId(null)}
                          className="ml-auto text-xs font-bold text-slate-400 hover:text-red-500"
                        >
                          Hủy
                        </button>
                      </div>
                      <ReviewForm
                        newReview={newReview}
                        setNewReview={setNewReview}
                        onSubmit={onReviewSubmit}
                        loading={submitting}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-50 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate mb-1">
                          {product.name}
                        </h4>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                          <FiCheckCircle size={10} /> Đã giao hàng thành công
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={FiEdit3}
                        onClick={() => handleOpenReviewForm(product.id)}
                        className="!rounded-xl text-[10px] font-black uppercase tracking-widest px-6"
                      >
                        Đánh giá ngay
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
              <FiMessageSquare
                size={40}
                className="mx-auto text-slate-200 mb-4"
              />
              <p className="text-slate-500 font-bold">
                Bạn chưa có đánh giá nào.
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {reviews.map((review) => (
                  <Motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Info */}
                      <div className="flex items-center gap-4 md:w-1/3 md:border-r border-slate-50 pr-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                          <img
                            src={
                              review.product?.variants?.[0]?.image ||
                              review.product?.image
                            }
                            alt={review.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate mb-1">
                            {review.product?.name}
                          </h4>
                          <Link
                            to={`/product/${review.product?.id}`}
                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                          >
                            Xem sản phẩm
                          </Link>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar
                                  key={star}
                                  size={14}
                                  className={
                                    star <= review.rating
                                      ? "fill-current"
                                      : "text-slate-100"
                                  }
                                />
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <FiCalendar size={12} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setConfirmDeleteModal({
                                show: true,
                                id: review.id,
                              })
                            }
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                        <p className="text-slate-600 text-sm italic leading-relaxed">
                          "{review.comment}"
                        </p>

                        {/* Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-4">
                            {review.images.map((img) => (
                              <div
                                key={img.id}
                                className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100"
                              >
                                <img
                                  src={img.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Admin Replies */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {review.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="bg-slate-50 p-4 rounded-2xl border-l-4 border-primary/30"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                    Phản hồi từ Admin
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-bold">
                                    {new Date(
                                      reply.createdAt,
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium">
                                  {reply.comment}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </AnimatePresence>

              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={fetchReviews}
                loading={loading}
                className="justify-center"
              />
            </>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteModal.show}
        onClose={() => setConfirmDeleteModal({ show: false, id: null })}
        onConfirm={handleDelete}
        title="Xóa đánh giá?"
        message="Bạn có chắc chắn muốn gỡ bỏ đánh giá này không?"
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 text-rose-500"
      />
    </div>
  );
};

export default ReviewHistory;
