import React, { memo } from "react";
import ReviewItem from "./ReviewItem";
import AppPagination from "../Pagination/Pagination";

const ReviewList = ({ reviews, page, pagination, onPageChange, ...rest }) => {
  if (reviews.length === 0) return (
    <div className="py-20 text-center bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
      <p className="text-slate-400 font-medium">Chưa có đánh giá nào cho sản phẩm này.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="divide-y divide-slate-100">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} {...rest} />
        ))}
      </div>

      {/* Pagination */}
      <AppPagination
        page={page}
        totalPages={pagination?.totalPages || 1}
        onPageChange={onPageChange}
        className="mt-12 flex items-center justify-center gap-2"
      />
    </div>
  );
};

export default memo(ReviewList);
