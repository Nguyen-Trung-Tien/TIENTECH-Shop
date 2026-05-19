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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-dark-border pb-8">
        <div>
          <h3 className="text-3xl font-display font-bold text-surface-900 dark:text-white">
            Đánh giá của tôi
          </h3>
          <p className="text-sm text-slate-400 dark:text-dark-text-secondary font-medium mt-2">
            Chia sẻ cảm nhận và đóng góp ý kiến cho các sản phẩm đã mua
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-dark-bg p-1.5 rounded-[20px] w-fit shadow-inner border border-slate-200 dark:border-dark-border transition-colors">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-8 py-3 rounded-[14px] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === "pending"
                ? "bg-white dark:bg-dark-surface text-primary dark:text-brand shadow-lg scale-[1.02]"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
            }`}
          >
            Chờ đánh giá ({pendingProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-8 py-3 rounded-[14px] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === "history"
                ? "bg-white dark:bg-dark-surface text-primary dark:text-brand shadow-lg scale-[1.02]"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
            }`}
          >
            Đã đánh giá
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="size-12 border-4 border-primary dark:border-brand border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-400 dark:text-dark-text-secondary text-[10px] font-black uppercase tracking-[0.3em]">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : activeTab === "pending" ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          {pendingProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-dark-bg/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-dark-border">
              <div className="size-20 bg-white dark:bg-dark-surface rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                <FiClock size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-500 dark:text-dark-text-secondary font-bold text-lg">
                Tuyệt vời! Bạn đã hoàn thành tất cả đánh giá.
              </p>
              <Link
                to="/orders"
                className="text-primary dark:text-brand text-[10px] font-black mt-4 inline-flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-[0.2em] bg-white dark:bg-dark-surface px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-border"
              >
                Khám phá thêm sản phẩm <FiPackage size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-dark-surface p-8 rounded-[32px] border border-slate-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {reviewingProductId === product.id ? (
                    <div className="space-y-8">
                      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-50 dark:border-dark-border">
                        <div className="size-16 rounded-2xl bg-slate-50 dark:bg-dark-bg p-2 border border-slate-100 dark:border-dark-border">
                          <img
                            src={product.image}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                            {product.name}
                          </h4>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Đang viết đánh giá...</p>
                        </div>
                        <button
                          onClick={() => setReviewingProductId(null)}
                          className="ml-auto px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 uppercase tracking-widest transition-all"
                        >
                          Hủy bỏ
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
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="size-24 rounded-[28px] overflow-hidden border border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-3 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-center md:text-left">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg truncate mb-2">
                          {product.name}
                        </h4>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                          <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/20">
                            <FiCheckCircle size={14} /> Đã giao hàng thành công
                          </p>
                          <div className="size-1 bg-slate-200 dark:bg-dark-border rounded-full hidden sm:block"></div>
                          <p className="text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-[0.2em]">
                            Ngày đặt: {new Date().toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="lg"
                        icon={FiEdit3}
                        onClick={() => handleOpenReviewForm(product.id)}
                        className="w-full md:w-auto !rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] px-10 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
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
        <div className="space-y-6 animate-in fade-in duration-500">
          {reviews.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-dark-bg/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-dark-border">
              <div className="size-20 bg-white dark:bg-dark-surface rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                <FiMessageSquare size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-500 dark:text-dark-text-secondary font-bold text-lg">
                Bạn chưa thực hiện đánh giá nào.
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {reviews.map((review) => (
                  <Motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white dark:bg-dark-surface p-8 rounded-[40px] border border-slate-100 dark:border-dark-border shadow-sm hover:shadow-xl transition-all duration-500"
                  >
                    <div className="flex flex-col lg:flex-row gap-10">
                      {/* Product Info */}
                      <div className="lg:w-[300px] lg:border-r border-slate-50 dark:border-dark-border lg:pr-10">
                        <div className="aspect-square bg-slate-50 dark:bg-dark-bg rounded-[32px] overflow-hidden border border-slate-100 dark:border-dark-border p-4 mb-6 group-hover:scale-[1.02] transition-transform duration-500">
                          <img
                            src={
                              review.product?.variants?.[0]?.image ||
                              review.product?.image
                            }
                            alt={review.product?.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 mb-3">
                          {review.product?.name}
                        </h4>
                        <Link
                          to={`/product/${review.product?.id}`}
                          className="inline-flex items-center gap-2 text-[11px] font-black text-primary dark:text-brand uppercase tracking-[0.2em] hover:underline bg-primary/5 dark:bg-brand/10 px-4 py-2 rounded-xl transition-all"
                        >
                          Chi tiết sản phẩm <FiPackage size={12} />
                        </Link>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex flex-wrap items-center gap-6">
                            <div className="flex gap-1 text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-4 py-2 rounded-2xl border border-amber-100 dark:border-amber-900/20 shadow-sm">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar
                                  key={star}
                                  size={18}
                                  className={
                                    star <= review.rating
                                      ? "fill-current"
                                      : "text-slate-100 dark:text-dark-bg"
                                  }
                                />
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 dark:text-dark-text-secondary bg-slate-50 dark:bg-dark-bg px-4 py-2 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm">
                              <FiCalendar size={14} className="text-primary dark:text-brand" />
                              <span className="text-[11px] font-black uppercase tracking-[0.1em]">
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
                            className="size-11 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 border border-slate-100 dark:border-dark-border rounded-2xl transition-all shadow-sm"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>

                        <div className="relative">
                          <span className="absolute -top-4 -left-2 text-6xl text-slate-50 dark:text-dark-bg font-serif select-none">"</span>
                          <p className="relative text-slate-600 dark:text-dark-text-primary text-lg leading-relaxed font-medium italic">
                            {review.comment}
                          </p>
                        </div>

                        {/* Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-8">
                            {review.images.map((img) => (
                              <div
                                key={img.id}
                                className="size-20 rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-dark-border shadow-soft hover:scale-110 transition-transform duration-300 cursor-zoom-in"
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
                          <div className="mt-10 space-y-4">
                            {review.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="bg-slate-50 dark:bg-dark-bg/50 p-6 rounded-[32px] border-l-8 border-primary dark:border-brand shadow-sm"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-primary dark:bg-brand text-white flex items-center justify-center shadow-lg">
                                      <FiMessageSquare size={14} />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary dark:text-brand">
                                      Phản hồi từ Admin
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold bg-white dark:bg-dark-surface px-3 py-1 rounded-full border border-slate-100 dark:border-dark-border">
                                    {new Date(
                                      reply.createdAt,
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-dark-text-secondary leading-relaxed font-medium italic">
                                  "{reply.comment}"
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

              <div className="mt-12 flex justify-center">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={fetchReviews}
                  loading={loading}
                />
              </div>
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
