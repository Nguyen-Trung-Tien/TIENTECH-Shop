import React, { memo, useState } from "react";
import { FaStar, FaCheckCircle, FaThumbsUp } from "react-icons/fa";
import { FiThumbsUp, FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import ReplyItem from "./ReplyItem";
import { toggleLikeReviewApi } from "../../api/reviewApi";
import { createReplyApi } from "../../api/reviewReplyApi";
import { toast } from "react-toastify";

/**
 * ReviewItem Component - Enhanced Version
 * Hiển thị từng đánh giá của người dùng với tính năng xem ảnh phóng to, thích và phản hồi.
 */
const ReviewItem = ({ review, user }) => {
  const [likes, setLikes] = useState(review.likes || 0);
  const [isLiked, setIsLiked] = useState(review.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(review.replies || []);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleLike = async () => {
    if (!user) {
      return toast.warn("Vui lòng đăng nhập để thích đánh giá!");
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await toggleLikeReviewApi(review.id);
      if (res.errCode === 0) {
        setLikes(res.data.likes);
        setIsLiked(res.data.isLiked);
      } else {
        toast.error(res.errMessage || "Không thể thực hiện thao tác");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi kết nối đến server");
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!user) return toast.warn("Vui lòng đăng nhập để phản hồi!");
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await createReplyApi({
        reviewId: review.id,
        comment: replyText.trim(),
      });
      if (res.errCode === 0) {
        setReplies((prev) => [...prev, res.data]);
        setReplyText("");
        toast.success("Đã gửi phản hồi!");
      } else {
        toast.error(res.errMessage || "Lỗi khi gửi phản hồi");
      }
    } catch (error) {
      console.error("Error creating reply:", error);
      toast.error("Không thể gửi phản hồi lúc này");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="py-8 border-b border-slate-50 dark:border-dark-border last:border-0 group transition-colors">
      <div className="flex gap-5 md:gap-6">
        {/* Avatar Cluster */}
        <div className="hidden sm:flex flex-col items-center gap-2">
          <div className="size-12 rounded-2xl bg-slate-100 dark:bg-dark-bg flex items-center justify-center text-primary font-black text-sm shadow-sm border-2 border-white dark:border-dark-border overflow-hidden">
            {review.user?.avatar ? (
              <img
                src={review.user.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              review.user?.username?.[0].toUpperCase() || "U"
            )}
          </div>
          {review.isVerified && (
            <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full uppercase tracking-tight border border-emerald-200/50">
              <FaCheckCircle size={9} /> Đã mua
            </div>
          )}
        </div>

        {/* Content Cluster */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {review.user?.username || "Người dùng ẩn danh"}
                </h4>
                {review.isVerified && (
                  <div className="sm:hidden flex items-center gap-1 text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full uppercase border border-emerald-200/50">
                    <FaCheckCircle size={9} /> Đã mua
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="flex text-amber-400 gap-0.5"
                  aria-label={`Đánh giá ${review.rating} sao`}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar
                      key={s}
                      size={11}
                      className={
                        s <= review.rating
                          ? "fill-current"
                          : "text-slate-200 dark:text-dark-border"
                      }
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <p className="text-sm text-slate-700 dark:text-dark-text-primary leading-relaxed mb-4 font-normal">
              {review.comment}
            </p>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-6">
                {review.images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className="size-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-sm cursor-zoom-in hover:scale-105 hover:shadow-md transition-all duration-300 relative group/img"
                  >
                    <img
                      src={img.imageUrl}
                      alt="review attachment"
                      className="w-full h-full object-cover dark:mix-blend-normal"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      🔍
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-5">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest transition-colors group/btn disabled:opacity-50 cursor-pointer ${
                  isLiked
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-dark-text-secondary hover:text-primary dark:hover:text-brand"
                }`}
              >
                <span
                  className={`size-8 flex items-center justify-center rounded-xl transition-all ${
                    isLiked
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                      : "bg-slate-50 dark:bg-dark-bg group-hover/btn:bg-primary/5 dark:group-hover/btn:bg-brand/10"
                  }`}
                >
                  {isLiked ? (
                    <FaThumbsUp
                      size={14}
                      className={isLiking ? "animate-bounce" : ""}
                    />
                  ) : (
                    <FiThumbsUp
                      size={14}
                      className={isLiking ? "animate-bounce" : ""}
                    />
                  )}
                </span>
                Hữu ích ({likes})
              </button>

              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary hover:text-primary dark:hover:text-brand transition-colors group/btn cursor-pointer"
              >
                <span className="size-8 flex items-center justify-center bg-slate-50 dark:bg-dark-bg rounded-xl group-hover/btn:bg-primary/5 dark:group-hover/btn:bg-brand/10 transition-all">
                  <FiMessageSquare size={14} />
                </span>
                Phản hồi ({replies.length})
              </button>
            </div>
          </div>

          {/* Reply Section */}
          {(showReplies || replies.length > 0) && (
            <div className="mt-5 space-y-3 ps-4 border-l-2 border-slate-100 dark:border-dark-border">
              {replies.map((rep) => (
                <ReplyItem key={rep.id} reply={rep} user={user} />
              ))}

              {showReplies && (
                <form
                  onSubmit={handleAddReply}
                  className="pt-2 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Viết phản hồi..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 h-10 px-4 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-primary/50 transition"
                  />
                  <button
                    type="submit"
                    disabled={submittingReply || !replyText.trim()}
                    className="h-10 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <FiSend size={12} />
                    <span>Gửi</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Review Image */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-transparent rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 size-10 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-lg cursor-pointer"
            >
              <FiX size={20} />
            </button>
            <img
              src={selectedImage}
              alt="Review Full Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ReviewItem);
