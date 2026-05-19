import React from "react";
import { FiStar, FiMessageSquare } from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import ReviewItem from "./ReviewItem";

const ReviewComponent = ({ reviews = [], user }) => {
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  return (
    <section className="bg-white dark:bg-dark-surface rounded-[40px] border border-slate-100 dark:border-dark-border p-10 md:p-16 shadow-soft transition-all duration-300">
      <div className="mb-16 pb-8 border-b border-slate-50 dark:border-dark-border flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Đánh giá từ khách hàng
          </h2>
          <p className="text-sm text-slate-400 dark:text-dark-text-secondary font-medium mt-2">
            Xem những gì người mua khác nói về sản phẩm này
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-dark-bg px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-dark-border">
          <FiMessageSquare className="text-primary dark:text-brand" />
          <span className="text-[11px] font-black text-slate-600 dark:text-white uppercase tracking-widest">
            {reviews.length} nhận xét thực tế
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Rating Summary */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-dark-bg dark:to-dark-surface rounded-[32px] p-10 text-center border border-slate-100 dark:border-dark-border shadow-inner transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-all duration-700"></div>
            <p className="text-7xl font-display font-black text-slate-900 dark:text-white mb-3 tracking-tighter">
              {averageRating}
            </p>
            <div className="flex justify-center gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={24}
                  className={`transition-all duration-500 ${i < Math.floor(averageRating) ? "text-amber-400 fill-current drop-shadow-sm" : "text-slate-200 dark:text-dark-border"}`}
                />
              ))}
            </div>
            <p className="text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-[0.3em]">
              Xếp hạng trung bình
            </p>
          </div>

          <div className="space-y-5 px-4">
            {ratingCounts.map((item) => (
              <div key={item.star} className="flex items-center gap-6">
                <span className="w-12 text-[10px] font-black text-slate-400 dark:text-dark-text-secondary flex items-center gap-1.5 shrink-0 uppercase tracking-widest">
                  {item.star} <FiStar size={14} className="fill-current text-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-dark-bg rounded-full overflow-hidden shadow-inner">
                  <Motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 dark:from-brand dark:to-indigo-400 rounded-full shadow-sm"
                  />
                </div>
                <span className="w-12 text-[10px] font-black text-slate-500 dark:text-dark-text-secondary text-right shrink-0 uppercase tracking-widest">
                  {Math.round(item.percentage)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-8 space-y-6">
          {reviews.length > 0 ? (
            <div className="divide-y divide-slate-50 dark:divide-dark-border">
              {reviews.map((review, idx) => (
                <div key={review.id || idx} className="py-6 first:pt-0 last:pb-0">
                  <ReviewItem review={review} user={user} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-slate-50/50 dark:bg-dark-bg/30 rounded-[32px] border border-dashed border-slate-200 dark:border-dark-border">
              <div className="size-16 bg-white dark:bg-dark-surface rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                <FiMessageSquare className="text-slate-200" size={28} />
              </div>
              <p className="text-slate-400 dark:text-dark-text-secondary font-bold text-lg">
                Chưa có đánh giá nào cho sản phẩm này.
              </p>
              <p className="text-sm text-slate-400 mt-2">Hãy là người đầu tiên chia sẻ cảm nhận của bạn!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewComponent;
