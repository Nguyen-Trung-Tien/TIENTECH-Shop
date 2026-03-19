import React from 'react';
import { FiStar, FiUser, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ReviewComponent = ({ reviews = [] }) => {
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1) 
    : "5.0";

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  return (
    <section className="bg-white rounded-[2.5rem] border border-neutral-100 p-10 md:p-16 shadow-soft">
      <div className="mb-12 pb-6 border-b border-neutral-50 flex items-center justify-between">
        <h2 className="text-xl font-display font-black text-neutral-900 uppercase tracking-widest">
          Đánh giá từ khách hàng
        </h2>
        <span className="text-xs-ui font-black text-neutral-400 uppercase tracking-widest">
          {reviews.length} nhận xét
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Rating Summary */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-neutral-50 rounded-3xl p-8 text-center border border-neutral-100">
            <p className="text-6xl font-display font-black text-neutral-900 mb-2">{averageRating}</p>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={`text-xl ${i < Math.floor(averageRating) ? 'text-amber-500 fill-current' : 'text-neutral-200'}`} />
              ))}
            </div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Xếp hạng trung bình</p>
          </div>

          <div className="space-y-4">
            {ratingCounts.map((item) => (
              <div key={item.star} className="flex items-center gap-4">
                <span className="w-12 text-xs font-black text-neutral-400 flex items-center gap-1 shrink-0">
                  {item.star} <FiStar className="fill-current text-amber-500" />
                </span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-brand-500 rounded-full"
                  />
                </div>
                <span className="w-10 text-xs font-bold text-neutral-500 text-right shrink-0">
                  {Math.round(item.percentage)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-8 space-y-10">
          {reviews.length > 0 ? (
            reviews.map((review, idx) => (
              <motion.div 
                key={review.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="pb-10 border-b border-neutral-50 last:border-0"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 border border-brand-100">
                      <FiUser size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                        {review.user?.username || 'Khách hàng ẩn danh'}
                        <FiCheckCircle className="text-emerald-500 text-sm" title="Đã mua hàng" />
                      </h4>
                      <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={`text-sm ${i < review.rating ? 'text-amber-500 fill-current' : 'text-neutral-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-neutral-600 text-sm-ui leading-relaxed font-medium pl-16">
                  {review.comment}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
              <p className="text-neutral-400 font-bold italic">Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewComponent;
