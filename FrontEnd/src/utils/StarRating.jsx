import { FaStar, FaRegStar } from "react-icons/fa";

export const StarRating = ({ rating, onChange, interactive = false }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => interactive && onChange?.(star)}
        className={`transition-all duration-200 ${interactive ? "cursor-pointer hover:scale-125" : "cursor-default"} p-0.5`}
        disabled={!interactive}
      >
        {star <= rating ? (
          <FaStar className="text-amber-400 text-lg" />
        ) : (
          <FaRegStar className="text-surface-300 text-lg group-hover:text-amber-200" />
        )}
      </button>
    ))}
  </div>
);
