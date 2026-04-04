import React, { memo, useState } from "react";
import { FaStar, FaCamera, FaTimes } from "react-icons/fa";
import Button from "../UI/Button";

/**
 * ReviewForm Component - Compact Version
 * Form gửi đánh giá đã được thu gọn để tối ưu diện tích hiển thị.
 */
const ReviewForm = ({ newReview, setNewReview, onSubmit, loading }) => {
  const [hover, setHover] = useState(null);
  const [previews, setPreviews] = useState([]);
  const disabled = !newReview.comment.trim() || !newReview.rating || loading;

  const handleStarClick = (star) => {
    setNewReview((prev) => ({ ...prev, rating: star }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previews.length > 5) {
      alert("Chỉ được tải lên tối đa 5 ảnh");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result]);
        setNewReview((prev) => ({
          ...prev,
          images: [...(newReview.images || []), reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    setNewReview((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-slate-50/50 dark:bg-dark-bg/50 rounded-3xl p-6 border border-slate-100 dark:border-dark-border mb-10 transition-colors">
      <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2.5 text-slate-800 dark:text-white">
        <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
          <FaStar size={14} />
        </span>
        Viết đánh giá của bạn
      </h3>

      <div className="space-y-6">
        {/* Rating Selection */}
        <div>
          <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mb-3 ml-1">Xếp hạng sản phẩm *</p>
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
                      : "text-slate-200 dark:text-dark-border"
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload Area */}
        <div>
          <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mb-3 ml-1">Hình ảnh thực tế (Tối đa 5)</p>
          <div className="flex flex-wrap gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-sm group">
                <img src={preview} alt="preview" className="w-full h-full object-cover dark:mix-blend-normal" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-dark-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-slate-400 dark:text-dark-text-secondary hover:text-primary dark:hover:text-brand">
                <FaCamera size={20} />
                <span className="text-[8px] font-black uppercase tracking-tighter">Thêm ảnh</span>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Comment Area */}
        <div>
          <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mb-3 ml-1">Nội dung đánh giá *</p>
          <textarea
            rows={3}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            value={newReview.comment}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, comment: e.target.value }))
            }
            className="w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-4 text-sm font-medium focus:border-primary/40 focus:ring-4 focus:ring-primary/5 dark:focus:ring-brand/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
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
