import React, { useEffect, useState, useCallback } from "react";
import {
  FiTrash2,
  FiUser,
  FiCalendar,
  FiCornerDownRight,
  FiSend,
  FiFilter,
  FiRefreshCw,
  FiMessageSquare,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { deleteReviewApi, getAllReviewsApi } from "../../../api/reviewApi";
import {
  getRepliesByReviewApi,
  createReplyApi,
  deleteReplyApi,
} from "../../../api/reviewReplyApi";
import { toast } from "react-toastify";
import AppPagination from "../../../components/Pagination/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmModal } from "../../../components/UI/Modal";

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [replies, setReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});

  const [filters, setFilters] = useState({ rating: "", status: "" });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllReviewsApi(
        pagination.page,
        pagination.limit,
        filters.rating,
        filters.status,
      );

      setReviews(res.data || []);
      setPagination((prev) => res.pagination || prev);

      const newReplies = {};
      for (let r of res.data) {
        const rep = await getRepliesByReviewApi(r.id);
        if (rep.errCode === 0) newReplies[r.id] = rep.data;
      }
      setReplies(newReplies);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async () => {
    try {
      await deleteReviewApi(selectedReview.id);
      setShowDeleteModal(false);
      fetchReviews();
      toast.success("Đã xóa bình luận");
    } catch (e) {
      toast.error("Xóa thất bại");
    }
  };

  const handleCreateReply = async (reviewId) => {
    const content = replyInputs[reviewId]?.trim();
    if (!content) return;
    try {
      const res = await createReplyApi({ reviewId, comment: content });
      if (res.errCode === 0) {
        setReplies((prev) => ({
          ...prev,
          [reviewId]: [...(prev[reviewId] || []), res.data],
        }));
        setReplyInputs((p) => ({ ...p, [reviewId]: "" }));
      }
      toast.success("Đã phản hồi");
    } catch (e) {
      toast.error("Phản hồi thất bại");
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    try {
      const res = await deleteReplyApi(replyId);
      if (res.errCode === 0) {
        setReplies((prev) => ({
          ...prev,
          [reviewId]: prev[reviewId].filter((x) => x.id !== replyId),
        }));
        toast.success("Đã xóa phản hồi");
      }
    } catch {
      toast.error("Xóa phản hồi thất bại");
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <FiMessageSquare />
            </div>
            Quản lý đánh giá
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-15">
            Lắng nghe khách hàng & Phản hồi cộng đồng
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-soft flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-4 h-12 bg-slate-50 border border-slate-100 rounded-2xl">
          <FiFilter className="text-slate-400" />
          <select
            className="bg-transparent border-none text-xs font-black uppercase tracking-widest outline-none appearance-none pr-6"
            value={filters.rating}
            onChange={(e) =>
              setFilters((p) => ({ ...p, rating: e.target.value }))
            }
          >
            <option value="">Lọc theo sao</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Sao
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 px-4 h-12 bg-slate-50 border border-slate-100 rounded-2xl">
          <select
            className="bg-transparent border-none text-xs font-black uppercase tracking-widest outline-none appearance-none pr-6"
            value={filters.status}
            onChange={(e) =>
              setFilters((p) => ({ ...p, status: e.target.value }))
            }
          >
            <option value="">Trạng thái</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
          </select>
        </div>

        <button
          onClick={() => setFilters({ rating: "", status: "" })}
          className="h-12 px-6 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          Reset
        </button>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <FiRefreshCw className="text-4xl text-primary/20 animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Đang tải đánh giá...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-soft">
            <p className="text-slate-400 font-bold">
              Chưa có đánh giá nào phù hợp với bộ lọc.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={review.id}
              className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden group"
            >
              <div className="p-8">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 transition-colors">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 leading-tight mb-1">
                        {review.user?.username || "Unknown User"}
                      </h4>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                        {review.product?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < review.rating
                              ? "text-amber-400"
                              : "text-slate-200"
                          }
                          size={14}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowDeleteModal(true);
                      }}
                      className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mb-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed">
                  {review.comment}
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
                  <FiCalendar />
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </div>

                {/* Replies Area */}
                <div className="space-y-4 ml-6 border-l-2 border-slate-100 pl-6">
                  {(replies[review.id] || []).map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-slate-50/30 p-4 rounded-2xl relative group/reply"
                    >
                      <FiCornerDownRight className="absolute -left-8 top-5 text-slate-200" />
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-sm text-slate-600">
                          <span className="font-black text-slate-900 mr-2 uppercase text-[10px] tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                            Admin
                          </span>
                          {rep.comment}
                        </p>
                        <button
                          onClick={() => handleDeleteReply(review.id, rep.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Reply Input */}
                  <div className="relative pt-2">
                    <input
                      type="text"
                      placeholder="Nhập phản hồi hệ thống..."
                      value={replyInputs[review.id] || ""}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({
                          ...prev,
                          [review.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateReply(review.id)
                      }
                      className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-4 pr-12 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    />
                    <button
                      onClick={() => handleCreateReply(review.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-md"
                    >
                      <FiSend size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center pt-8">
        <AppPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          loading={loading}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteReview}
        title="Xóa đánh giá?"
        message="Hành động này không thể hoàn tác. Toàn bộ nội dung đánh giá và phản hồi sẽ biến mất."
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 text-rose-500"
      />
    </div>
  );
};

export default ReviewPage;
