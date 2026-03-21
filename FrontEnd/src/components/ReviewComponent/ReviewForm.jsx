import React, { memo, useState } from "react";
import { FaStar } from "react-icons/fa";
import Button from "../UI/Button";

/**
 * ReviewForm Component - Compact Version
 * Form gửi đánh giá đã được thu gọn để tối ưu diện tích hiển thị.
 */
const ReviewForm = ({ newReview, setNewReview, onSubmit, loading }) => {
  const [hover, setHover] = useState(null);
  const disabled = !newReview.comment.trim() || !newReview.rating || loading;

  const handleStarClick = (star) => {
    setNewReview((prev) => ({ ...prev, rating: star }));
  };

  return (
    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 mb-10">
      <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2.5 text-slate-800">
        <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
          <FaStar size={14} />
        </span>
        Viết đánh giá của bạn
      </h3>

      <div className="space-y-6">
        {/* Rating Selection */}
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Xếp hạng sản phẩm *</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(null)}
                className="transition-transform active:scale-90 focus:outline-none"
                aria-label={`Chấm ${star} sao`}
              >
                <FaStar 
                  size={24} 
                  className={`transition-all duration-200 ${
                    star <= (hover || newReview.rating) 
                      ? "text-amber-400 drop-shadow-sm scale-110" 
                      : "text-slate-200"
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment Area */}
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nội dung đánh giá *</p>
          <textarea
            rows={3}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            value={newReview.comment}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, comment: e.target.value }))
            }
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button 
            variant="primary" 
            size="md"
            onClick={onSubmit} 
            disabled={disabled}
            loading={loading}
            className="h-11 px-8 !rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 active:scale-[0.98]"
          >
            GỬI ĐÁNH GIÁ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(ReviewForm);
