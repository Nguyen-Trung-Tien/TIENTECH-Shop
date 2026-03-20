import React, { memo, useState } from "react";
import { FaStar } from "react-icons/fa";
import Button from "../UI/Button";

const ReviewForm = ({ newReview, setNewReview, onSubmit, loading }) => {
  const [hover, setHover] = useState(null);
  const disabled = !newReview.comment.trim() || !newReview.rating || loading;

  const handleStarClick = (star) => {
    setNewReview((prev) => ({ ...prev, rating: star }));
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border-2 border-primary/5 shadow-soft mb-12">
      <h3 className="text-xl font-display font-black uppercase tracking-tight mb-8 flex items-center gap-3">
        <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
          <FaStar size={18} />
        </span>
        Viết đánh giá của bạn
      </h3>

      <div className="space-y-8">
        {/* Rating Selection */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Xếp hạng sản phẩm *</p>
          <div className="flex gap-3">
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
                  size={36} 
                  className={`transition-all duration-200 ${
                    star <= (hover || newReview.rating) 
                      ? "text-amber-400 drop-shadow-md scale-110" 
                      : "text-slate-100"
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment Area */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Nội dung đánh giá *</p>
          <textarea
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này để giúp những người mua khác..."
            value={newReview.comment}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, comment: e.target.value }))
            }
            className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] p-6 text-sm font-medium focus:bg-white focus:border-primary/10 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            variant="primary" 
            size="lg"
            onClick={onSubmit} 
            disabled={disabled}
            loading={loading}
            className="h-14 px-12 !rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
          >
            GỬI ĐÁNH GIÁ NGAY
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(ReviewForm);
