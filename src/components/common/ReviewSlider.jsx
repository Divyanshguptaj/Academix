import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"

// Swiper components & modules
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, FreeMode, Pagination } from "swiper/modules"

// Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "../../App.css"

// Icons
import { FaStar } from "react-icons/fa"

// API
import { apiConnector } from "../../services/apiconnector"
import { ratingsEndpoints } from "../../services/apis"

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        )
        if (data?.success) {
          setReviews(data?.data || [])
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      }
    })()
  }, [])

  // Adjust Swiper config dynamically based on review count
  const slidesPerViewConfig =
    reviews.length < 4
      ? reviews.length
      : 4 // limit to max 4 per view

  return (
    <div className="text-white">
      <div className="my-12 max-w-[90%] mx-auto lg:max-w-7xl">
        <Swiper
          slidesPerView={slidesPerViewConfig}
          spaceBetween={16}
          loop={reviews.length > slidesPerViewConfig}
          freeMode={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: Math.min(2, reviews.length), spaceBetween: 20 },
            1024: { slidesPerView: Math.min(3, reviews.length), spaceBetween: 24 },
            1280: { slidesPerView: Math.min(4, reviews.length), spaceBetween: 24 },
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={i}>
              <div className="flex flex-col gap-3 bg-richblack-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={
                      review?.user?.image
                        ? review.user.image
                        : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                    }
                    alt={`${review?.user?.firstName} ${review?.user?.lastName}`}
                    className="h-10 w-10 rounded-full object-cover border border-richblack-700"
                  />
                  <div className="flex flex-col">
                    <h1 className="font-semibold text-richblack-5">
                      {`${review?.user?.firstName} ${review?.user?.lastName}`}
                    </h1>
                    <h2 className="text-xs font-medium text-richblack-400">
                      {review?.course?.courseName}
                    </h2>
                  </div>
                </div>

                {/* Review Text */}
                <p className="font-medium text-richblack-25 text-sm leading-relaxed">
                  {review?.review.split(" ").length > truncateWords
                    ? `${review.review
                        .split(" ")
                        .slice(0, truncateWords)
                        .join(" ")} ...`
                    : review.review}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-auto">
                  <h3 className="font-semibold text-yellow-100 text-sm">
                    {review.rating.toFixed(1)}
                  </h3>
                  <ReactStars
                    count={5}
                    value={review.rating}
                    size={18}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider
