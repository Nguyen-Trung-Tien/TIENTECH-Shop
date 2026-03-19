import React, { memo } from "react";
import { StarRating } from "../../utils/StarRating";
import Button from "../UI/Button";

const ReviewForm = ({ newReview, setNewReview, onSubmit, loading }) => {
  const disabled = !newReview.comment.trim() || !newReview.rating || loading;

  return (
    <div className="bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100 mb-12">
      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-black italic">!</span>
        Viết đánh giá của bạn
      </h3>

      <div className="space-y-6">
        {/* Rating Selection */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Chất lượng sản phẩm</p>
          <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm inline-block">
            <StarRating
              rating={newReview.rating}
              onChange={(star) =>
                setNewReview((prev) => ({ ...prev, rating: star }))
              }
              interactive
            />
          </div>
        </div>

        {/* Comment Area */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Nội dung đánh giá</p>
          <textarea
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            value={newReview.comment}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, comment: e.target.value }))
            }
            className="w-full bg-white border border-slate-200 rounded-[2rem] p-6 text-sm font-medium focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            variant="primary" 
            size="lg"
            onClick={onSubmit} 
            disabled={disabled}
            loading={loading}
          >
            GỬI ĐÁNH GIÁ NGAY
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(ReviewForm);
