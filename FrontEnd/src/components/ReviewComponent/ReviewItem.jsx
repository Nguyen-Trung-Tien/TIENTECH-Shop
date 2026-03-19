import React, { memo } from "react";
import { FiStar, FiCalendar, FiUser } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import ReplyItem from "./ReplyItem";

const ReviewItem = ({ review, user }) => {
  return (
    <div className="card-modern p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
           <FiUser size={20} />
        </div>
        <div>
           <p className="text-sm font-bold text-slate-900">{review.user?.username || "Người dùng ẩn danh"}</p>
           <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex items-center text-amber-400 text-[10px]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar key={s} className={s <= review.rating ? "text-amber-400" : "text-slate-200"} />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                 <FiCalendar /> {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </span>
           </div>
        </div>
      </div>

      {/* Comment */}
      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
        {review.comment}
      </p>

      {/* Reply list */}
      {review.replies?.length > 0 && (
        <div className="mt-6 space-y-4 ps-6 border-l-2 border-slate-100">
          {review.replies.map((rep) => (
            <ReplyItem key={rep.id} reply={rep} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(ReviewItem);
