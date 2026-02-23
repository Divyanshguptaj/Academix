import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaStar, FaChevronLeft, FaChevronRight, FaQuoteLeft } from "react-icons/fa";
import { apiConnector } from "../../services/apiconnector";
import { ratingsEndpoints } from "../../services/apis";

const AUTOPLAY_DELAY = 5000;

const ReviewCard = ({ review }) => {
  const truncate = (text, wordLimit = 28) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "…"
      : text;
  };

  const seed = `${review?.user?.firstName ?? ""} ${review?.user?.lastName ?? ""}`.trim();
  const fallbackSrc = `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(seed)}`;

  return (
    <div className="rs-card flex flex-col gap-4 h-full bg-[#1d1d1d] rounded-2xl p-6 border border-gray-800 transition-colors duration-300 select-none">
      {/* Quote icon */}
      <FaQuoteLeft className="text-yellow-400 text-xl opacity-50" />

      {/* Review body */}
      <p className="text-gray-300 text-sm leading-relaxed flex-grow min-h-[80px]">
        {truncate(review?.review)}
      </p>

      {/* Divider */}
      <div className="border-t border-gray-800" />

      {/* Footer: avatar + name + rating */}
      <div className="flex items-center gap-3">
        <img
          src={review?.user?.image || fallbackSrc}
          alt={seed || "Reviewer"}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackSrc;
          }}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-yellow-400/30 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate leading-tight">
            {review?.user?.firstName} {review?.user?.lastName}
          </p>
          <p className="text-yellow-400 text-xs truncate mt-0.5 leading-tight">
            {review?.course?.courseName}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-yellow-400 font-bold text-sm tabular-nums">
            {review?.rating?.toFixed(1)}
          </span>
          <FaStar className="text-yellow-400 text-xs" />
        </div>
      </div>
    </div>
  );
};

function ReviewSlider() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        );
        if (data?.success) setReviews(data?.data || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    })();
  }, []);

  return (
    <section className="bg-[#121220] py-16 lg:py-24">
      {/* Scoped slide styles — active card gets yellow border tint, inactive dims */}
      <style>{`
        .rs-swiper .swiper-slide {
          transition: transform 0.4s ease, opacity 0.4s ease;
          opacity: 0.5;
          transform: scale(0.88);
          height: auto;
        }
        .rs-swiper .swiper-slide-active {
          opacity: 1;
          transform: scale(1);
        }
        .rs-swiper .swiper-slide-active .rs-card {
          border-color: rgba(250, 204, 21, 0.25);
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-yellow-400 text-xs font-semibold uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            Reviews from learners
          </h2>
          <p className="text-gray-400 mt-3 text-sm sm:text-base">
            See what our students are saying about their experience.
          </p>
        </div>

        {/* Slider */}
        {reviews.length === 0 ? (
          <div className="flex justify-center items-center h-56">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
          </div>
        ) : (
          <div className="relative">
            {/* Nav buttons */}
            <button
              className="rs-nav-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-10 bg-[#1d1d1d] hover:bg-gray-700 border border-gray-700 hover:border-yellow-400/40 rounded-full p-2.5 transition-all duration-200 shadow-lg"
              aria-label="Previous review"
            >
              <FaChevronLeft className="text-yellow-400 w-4 h-4" />
            </button>
            <button
              className="rs-nav-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-10 bg-[#1d1d1d] hover:bg-gray-700 border border-gray-700 hover:border-yellow-400/40 rounded-full p-2.5 transition-all duration-200 shadow-lg"
              aria-label="Next review"
            >
              <FaChevronRight className="text-yellow-400 w-4 h-4" />
            </button>

            <Swiper
              className="rs-swiper"
              modules={[Autoplay, Navigation]}
              grabCursor
              centeredSlides
              loop={reviews.length > 2}
              autoplay={{
                delay: AUTOPLAY_DELAY,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                prevEl: ".rs-nav-prev",
                nextEl: ".rs-nav-next",
              }}
              breakpoints={{
                320: { slidesPerView: 1, spaceBetween: 16 },
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
              }}
            >
              {reviews.map((review, i) => (
                <SwiperSlide key={i}>
                  <ReviewCard review={review} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}

export default ReviewSlider;
