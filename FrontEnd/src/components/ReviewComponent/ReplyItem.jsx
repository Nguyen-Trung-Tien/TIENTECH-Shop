import React, { memo } from "react";

const ReplyItem = ({ reply }) => {
  return (
    <div className="mb-2 text-slate-700 dark:text-dark-text-primary">
      <strong className="text-slate-900 dark:text-white">{reply.user?.username || "User"}:</strong> {reply.comment}
    </div>
  );
};

export default memo(ReplyItem);
