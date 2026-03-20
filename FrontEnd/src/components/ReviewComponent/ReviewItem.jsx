import React, { memo } from "react";
import { FaStar, FaCheckCircle } from "react-icons/fa";
import { FiThumbsUp, FiMessageSquare } from "react-icons/fi";
import ReplyItem from "./ReplyItem";

const ReviewItem = ({ review, user }) => {
  return (
    <div className="py-10 border-b border-slate-100 last:border-0 group">
      <div className="flex gap-6 md:gap-8">
        {/* Avatar Cluster */}
        <div className="hidden sm:flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-[2rem] bg-slate-100 flex items-center justify-center text-primary font-black text-xl shadow-inner border-2 border-white overflow-hidden">
            {review.user?.avatar ? (
               <img src={review.user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
               review.user?.username?.[0].toUpperCase() || "U"
            )}
          </div>
          {review.isVerified && (
            <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-tighter">
              <FaCheckCircle /> Đã mua
            </div>
          )}
        </div>

        {/* Content Cluster */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-slate-900 dark:text-white truncate">
                  {review.user?.username || "Người dùng ẩn danh"}
                </h4>
                <div className="sm:hidden flex items-center gap-1 text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  <FaCheckCircle />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex text-amber-400 gap-0.5" aria-label={`Đánh giá ${review.rating} sao`}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar key={s} size={12} className={s <= review.rating ? "fill-current" : "text-slate-100 dark:text-slate-800"} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              {review.comment}
            </p>
            
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group/btn">
                <span className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-xl group-hover/btn:bg-primary/5 transition-all">
                  <FiThumbsUp size={16} />
                </span>
                Hữu ích ({review.likes || 0})
              </button>

              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group/btn">
                <span className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-xl group-hover/btn:bg-primary/5 transition-all">
                  <FiMessageSquare size={16} />
                </span>
                Phản hồi ({review.replies?.length || 0})
              </button>
            </div>
          </div>

          {/* Reply list */}
          {review.replies?.length > 0 && (
            <div className="mt-8 space-y-4 ps-6 border-l-2 border-slate-100/60">
              {review.replies.map((rep) => (
                <ReplyItem key={rep.id} reply={rep} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ReviewItem);
