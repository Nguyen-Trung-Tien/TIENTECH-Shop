import React, { memo } from "react";
import { FaStar, FaCheckCircle } from "react-icons/fa";
import { FiThumbsUp, FiMessageSquare } from "react-icons/fi";
import ReplyItem from "./ReplyItem";

/**
 * ReviewItem Component - Compact Version
 * Hiển thị từng đánh giá của người dùng theo phong cách gọn gàng, tinh tế.
 */
const ReviewItem = ({ review, user }) => {
  return (
    <div className="py-8 border-b border-slate-50 last:border-0 group">
      <div className="flex gap-5 md:gap-6">
        {/* Avatar Cluster - Smaller */}
        <div className="hidden sm:flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary font-black text-sm shadow-sm border-2 border-white overflow-hidden">
            {review.user?.avatar ? (
               <img src={review.user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
               review.user?.username?.[0].toUpperCase() || "U"
            )}
          </div>
          {review.isVerified && (
            <div className="flex items-center gap-1 text-[7px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
              <FaCheckCircle size={8} /> Đã mua
            </div>
          )}
        </div>

        {/* Content Cluster */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {review.user?.username || "Người dùng ẩn danh"}
                </h4>
                <div className="sm:hidden flex items-center gap-1 text-[7px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase">
                  <FaCheckCircle size={8} />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex text-amber-400 gap-0.5" aria-label={`Đánh giá ${review.rating} sao`}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar key={s} size={10} className={s <= review.rating ? "fill-current" : "text-slate-100"} />
                  ))}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {review.comment}
            </p>
            
            <div className="flex items-center gap-5">
              <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group/btn">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg group-hover/btn:bg-primary/5 transition-all">
                  <FiThumbsUp size={14} />
                </span>
                Hữu ích ({review.likes || 0})
              </button>

              <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group/btn">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg group-hover/btn:bg-primary/5 transition-all">
                  <FiMessageSquare size={14} />
                </span>
                Phản hồi ({review.replies?.length || 0})
              </button>
            </div>
          </div>

          {/* Reply list - Smaller indent */}
          {review.replies?.length > 0 && (
            <div className="mt-6 space-y-3 ps-4 border-l-2 border-slate-50">
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
