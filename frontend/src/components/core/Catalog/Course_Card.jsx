import { useEffect, useState } from "react";
import RatingStars from "../../common/RatingStars";
import GetAvgRating from "../../../utils/avgRating";
import { Link } from "react-router-dom";

const Course_Card = ({ course, Height }) => {
  const [avgReviewCount, setAvgReviewCount] = useState(0);

  useEffect(() => {
    const count = GetAvgRating(course.ratingAndReviews);
    setAvgReviewCount(count);
  }, [course]);

  return (
    <Link to={`/courses/${course._id}`} className="block group h-full">
      <div className="h-full flex flex-col bg-[#1d1d1d] border border-gray-800 rounded-xl overflow-hidden transition-all duration-200 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5">

        {/* Thumbnail */}
        <div className="overflow-hidden flex-shrink-0">
          <img
            src={course?.thumbnail}
            alt={course?.courseName || "Course thumbnail"}
            className={`${Height || "h-[200px]"} w-full object-cover transition-transform duration-300 group-hover:scale-105`}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          <p className="text-white font-semibold text-sm sm:text-base leading-snug line-clamp-2">
            {course?.courseName}
          </p>
          <p className="text-gray-400 text-xs sm:text-sm">
            {course?.instructor?.firstName} {course?.instructor?.lastName}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-yellow-400 font-bold text-sm tabular-nums">
              {avgReviewCount ? avgReviewCount.toFixed(1) : "0.0"}
            </span>
            <RatingStars Review_Count={avgReviewCount} Star_Size={14} />
            <span className="text-gray-500 text-xs">
              ({course?.ratingAndReviews?.length || 0})
            </span>
          </div>
          <p className="text-yellow-400 font-bold text-base mt-auto pt-2">
            ₹ {course?.price?.toLocaleString("en-IN") ?? course?.price}
          </p>
        </div>

      </div>
    </Link>
  );
};

export default Course_Card;
