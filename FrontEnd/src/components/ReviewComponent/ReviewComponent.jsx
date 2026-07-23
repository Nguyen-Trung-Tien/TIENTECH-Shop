import React, { useState } from "react";
import { FiStar, FiMessageSquare, FiImage, FiFilter, FiEdit3, FiLock } from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import ReviewItem from "./ReviewItem";
import ReviewForm from "./ReviewForm";
import AppPagination from "../Pagination/Pagination";

const ReviewComponent = ({
  reviews = [],
  reviewsSummary = {
    totalReviews: 0,
    averageRating: 5.0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },
  user,
  pagination = { totalPages: 1, currentPage: 1, totalItems: 0 },
  reviewPage = 1,
  ratingFilter = "",
  hasImageFilter = false,
  onPageChange,
  onFilterChange,
  onSubmitReview,
  submittingReview = false,
}) => {
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    images: [],
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmitReview = async () => {
    if (onSubmitReview) {
      const success = await onSubmitReview(newReview);
      if (success) {
        setNewReview({ rating: 0, comment: "", images: [] });
        setShowForm(false);
      }
    }
  };
  const totalReviews = reviewsSummary?.totalReviews || 0;
  const averageRating =
    reviewsSummary?.averageRating !== undefined &&
    reviewsSummary?.averageRating !== null
      ? Number(reviewsSummary.averageRating).toFixed(1)
      : "5.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviewsSummary?.ratingCounts?.[star] || 0;
    return {
      star,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    };
  });

  const handleSelectFilter = (star, withImage = false) => {
    if (onFilterChange) {
      onFilterChange(star, withImage);
    }
  };

  return (
    <section className="bg-white dark:bg-dark-surface rounded-[40px] border border-slate-100 dark:border-dark-border p-8 md:p-14 shadow-soft transition-all duration-300">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-100 dark:border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Đánh giá & Nhận xét sản phẩm
          </h2>
          <p className="text-xs md:text-sm text-slate-400 dark:text-dark-text-secondary font-medium mt-1">
            Nhận xét thực tế từ những khách hàng đã mua và sử dụng sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-dark-bg px-4 py-2 rounded-2xl border border-slate-100 dark:border-dark-border self-start md:self-auto">
          <FiMessageSquare className="text-primary dark:text-brand" />
          <span className="text-xs font-extrabold text-slate-700 dark:text-white uppercase tracking-wider">
            {totalReviews} đánh giá
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Rating Summary */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-dark-bg dark:to-dark-surface rounded-[32px] p-8 text-center border border-slate-100 dark:border-dark-border shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-all duration-700"></div>
            <p className="text-6xl md:text-7xl font-display font-black text-slate-900 dark:text-white mb-2 tracking-tighter">
              {averageRating}
            </p>
            <div className="flex justify-center gap-1.5 mb-4">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={22}
                  className={`transition-all duration-500 ${
                    i < Math.floor(Number(averageRating))
                      ? "text-amber-400 fill-current drop-shadow-sm"
                      : "text-slate-200 dark:text-dark-border"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-[0.2em]">
              Xếp hạng trung bình ({totalReviews} đánh giá)
            </p>
          </div>

          {/* Rating Bars */}
          <div className="space-y-4 px-2">
            {ratingCounts.map((item) => {
              const isSelected = ratingFilter === String(item.star) && !hasImageFilter;
              return (
                <div
                  key={item.star}
                  onClick={() => handleSelectFilter(String(item.star), false)}
                  className={`flex items-center gap-4 p-2 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border"
                      : "hover:bg-slate-50 dark:hover:bg-dark-bg/50"
                  }`}
                >
                  <span className="w-10 text-[11px] font-black text-slate-600 dark:text-dark-text-secondary flex items-center gap-1 shrink-0 uppercase">
                    {item.star} <FiStar size={13} className="fill-current text-amber-400" />
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-dark-bg rounded-full overflow-hidden shadow-inner">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-sm"
                    />
                  </div>
                  <span className="w-12 text-[10px] font-extrabold text-slate-400 dark:text-dark-text-secondary text-right shrink-0">
                    {item.count} ({Math.round(item.percentage)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List & Filters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-50 dark:bg-dark-bg/60 rounded-2xl border border-slate-100 dark:border-dark-border">
            <span className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest px-3 flex items-center gap-1">
              <FiFilter size={12} /> Lọc:
            </span>
            <button
              onClick={() => handleSelectFilter("", false)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ratingFilter === "" && !hasImageFilter
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-border"
              }`}
            >
              Tất cả ({totalReviews})
            </button>

            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsSummary?.ratingCounts?.[star] || 0;
              const isSelected = ratingFilter === String(star) && !hasImageFilter;
              return (
                <button
                  key={star}
                  onClick={() => handleSelectFilter(String(star), false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-border"
                  }`}
                >
                  <span>{star} Sao</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}

            <button
              onClick={() => handleSelectFilter("", true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                hasImageFilter
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-border"
              }`}
            >
              <FiImage size={13} />
              <span>Có hình ảnh</span>
            </button>
          </div>

          {/* List items */}
          {reviews.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-dark-border">
              {reviews.map((review, idx) => (
                <ReviewItem key={review.id || idx} review={review} user={user} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50/50 dark:bg-dark-bg/30 rounded-[32px] border border-dashed border-slate-200 dark:border-dark-border">
              <div className="size-14 bg-white dark:bg-dark-surface rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-dark-border">
                <FiMessageSquare className="text-slate-300 dark:text-slate-600" size={24} />
              </div>
              <p className="text-slate-500 dark:text-dark-text-secondary font-bold text-base">
                Không tìm thấy đánh giá phù hợp.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Thử chọn bộ lọc khác hoặc là người đầu tiên chia sẻ cảm nhận!
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pt-6">
              <AppPagination
                page={reviewPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Write Review Section */}
      <div className="mt-10 pt-10 border-t border-slate-100 dark:border-dark-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Viết đánh giá của bạn</h3>
            <p className="text-xs text-slate-400 dark:text-dark-text-secondary mt-0.5">
              {user ? "Chia sẻ trải nghiệm thực tế của bạn với sản phẩm này" : "Đăng nhập để gửi đánh giá"}
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                showForm
                  ? "bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300"
                  : "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90"
              }`}
            >
              <FiEdit3 size={14} />
              {showForm ? "Thu gọn" : "Viết đánh giá"}
            </button>
          )}
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-dark-bg/40 rounded-[28px] border border-dashed border-slate-200 dark:border-dark-border">
            <div className="size-14 bg-white dark:bg-dark-surface rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-dark-border">
              <FiLock className="text-slate-300 dark:text-slate-600" size={22} />
            </div>
            <p className="text-slate-500 dark:text-dark-text-secondary font-bold text-sm">Vui lòng đăng nhập để gửi đánh giá</p>
            <a
              href="/login"
              className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition"
            >
              Đăng nhập ngay
            </a>
          </div>
        ) : showForm ? (
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReviewForm
              newReview={newReview}
              setNewReview={setNewReview}
              onSubmit={handleSubmitReview}
              loading={submittingReview}
            />
          </Motion.div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-6 rounded-[28px] border-2 border-dashed border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-secondary text-sm font-semibold hover:border-primary/40 hover:text-primary dark:hover:text-brand hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <FiEdit3 size={16} />
            Nhấn để viết đánh giá của bạn...
          </button>
        )}
      </div>
    </section>
  );
};

export default ReviewComponent;
