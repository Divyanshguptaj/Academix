import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Course_Card from "./Course_Card";

const CourseSlider = ({ Courses }) => {
  if (!Courses?.length) {
    return <p className="text-gray-400 text-base">No courses found.</p>;
  }

  return (
    <div className="relative px-6 sm:px-8">
      {/* Prev button */}
      <button
        className="cs-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#1d1d1d] hover:bg-gray-700 border border-gray-700 hover:border-yellow-400/40 rounded-full p-2.5 transition-all duration-200 shadow-lg"
        aria-label="Previous"
      >
        <FaChevronLeft className="text-yellow-400 w-4 h-4" />
      </button>

      {/* Next button */}
      <button
        className="cs-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#1d1d1d] hover:bg-gray-700 border border-gray-700 hover:border-yellow-400/40 rounded-full p-2.5 transition-all duration-200 shadow-lg"
        aria-label="Next"
      >
        <FaChevronRight className="text-yellow-400 w-4 h-4" />
      </button>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        grabCursor
        loop={Courses.length > 2}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{ prevEl: ".cs-prev", nextEl: ".cs-next" }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="!overflow-visible"
      >
        {Courses.map((course, i) => (
          <SwiperSlide key={i} className="h-auto">
            <Course_Card course={course} Height="h-[200px]" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CourseSlider;
