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
          images: [...(prev.images || []), reader.result],
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
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Rating & Content */}
        <div className="space-y-6">
          {/* Rating Selection */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm">
            <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-[0.2em] mb-4">
              Xếp hạng sản phẩm <span className="text-red-500">*</span>
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  className="transition-all duration-300 hover:scale-125 active:scale-95 focus:outline-none"
                  aria-label={`Chấm ${star} sao`}
                >
                  <FaStar 
                    size={32} 
                    className={`transition-all duration-300 ${
                      star <= (hover || newReview.rating) 
                        ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" 
                        : "text-slate-100 dark:text-dark-border"
                    }`} 
                  />
                </button>
              ))}
            </div>
            {newReview.rating > 0 && (
              <p className="text-center md:text-left mt-3 text-[11px] font-bold text-amber-500 uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                {newReview.rating === 1 && "Rất tệ"}
                {newReview.rating === 2 && "Tệ"}
                {newReview.rating === 3 && "Bình thường"}
                {newReview.rating === 4 && "Tốt"}
                {newReview.rating === 5 && "Tuyệt vời"}
              </p>
            )}
          </div>

          {/* Comment Area */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm">
            <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-[0.2em] mb-4">
              Nội dung đánh giá <span className="text-red-500">*</span>
            </p>
            <textarea
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              value={newReview.comment}
              onChange={(e) =>
                setNewReview((prev) => ({ ...prev, comment: e.target.value }))
              }
              className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl p-4 text-sm font-medium focus:border-primary/40 focus:ring-4 focus:ring-primary/5 dark:focus:ring-brand/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Right Side: Images */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm">
          <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-[0.2em] mb-4">
            Hình ảnh thực tế <span className="text-slate-300 dark:text-dark-border ml-1">(Tối đa 5)</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-dark-border group">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="size-8 bg-white/20 hover:bg-red-500 text-white rounded-xl backdrop-blur-md flex items-center justify-center transition-all transform hover:scale-110"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-slate-400 dark:text-dark-text-secondary group">
                <div className="size-10 rounded-full bg-slate-50 dark:bg-dark-bg flex items-center justify-center group-hover:bg-white dark:group-hover:bg-dark-surface transition-colors shadow-sm">
                  <FaCamera size={20} className="group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">Thêm ảnh</span>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>
          <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold leading-relaxed">
              * Hình ảnh chất lượng giúp đánh giá của bạn hữu ích hơn cho người mua khác.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button 
          variant="primary" 
          size="lg"
          onClick={onSubmit} 
          disabled={disabled}
          loading={loading}
          className="w-full md:w-auto h-12 px-12 !rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
        >
          Gửi đánh giá ngay
        </Button>
      </div>
    </div>
  );
};

export default memo(ReviewForm);
