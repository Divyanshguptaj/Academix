import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { CiClock1 } from "react-icons/ci";
import { BsCartPlus, BsPlayCircle } from "react-icons/bs";
import { FaUsers, FaBookOpen, FaStar } from "react-icons/fa";
import ConfirmationModal from "../components/common/ConfirmationModal";
import RatingStars from "../components/common/RatingStars";
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar";
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard";
import { formatDate } from "../services/formatDate";
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI";
import { buyCourse } from "../services/operations/studentFeatureAPI";
import { addToCart } from "../slices/cartSlice";
import GetAvgRating from "../utils/avgRating";
import Error from "./Error";

function CourseDetails() {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.profile);
  const { paymentLoading } = useSelector((state) => state.course);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { courseId } = useParams();
  const [response, setResponse] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchCourseDetails(courseId);
        setResponse(res);
      } catch (error) {
        console.log("Could not fetch Course Details");
      }
    }
    fetchData();
  }, [courseId, user._id, dispatch]);

  const [avgReviewCount, setAvgReviewCount] = useState(0);
  useEffect(() => {
    const count = GetAvgRating(response?.data?.ratingAndReviews || response?.ratingAndReviews);
    setAvgReviewCount(count);
  }, [response]);

  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0);
  useEffect(() => {
    let lectures = 0;
    (response?.data?.courseContent || response?.courseContent)?.forEach((sec) => {
      lectures += sec.subSection.length || 0;
    });
    setTotalNoOfLectures(lectures);
  }, [response]);

  const [isActive, setIsActive] = useState([]);
  const handleActive = (id) => {
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e !== id)
    );
  };

  if (loading || !response) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }
  if (!response.success) {
    return <Error />;
  }

  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
  } = response.data || response;

  const isEnrolled = user && (
    user?.courses?.some(id => id?.toString() === course_id?.toString()) ||
    studentsEnrolled?.some(s => (s?._id || s)?.toString() === user?._id?.toString())
  );

  const isInCart = cart?.some(item => item._id === course_id);

  const handleBuyCourse = () => {
    if (token) {
      buyCourse(token, [courseId], user, navigate, dispatch);
      return;
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  const handleAddToCart = () => {
    if (token) {
      dispatch(addToCart(response.data || response));
      return;
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add Course to Cart.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  if (paymentLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const instructorName = instructor?.firstName && instructor?.lastName
    ? `${instructor.firstName} ${instructor.lastName}`
    : instructor?._id || "Unknown Instructor";

  return (
    <>
      {/* ── Hero Section ── */}
      <div className="relative w-full bg-richblack-900 overflow-hidden">
        {/* Atmospheric blurred thumbnail background */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-cover scale-110 blur-3xl opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-richblack-900 via-richblack-900/85 to-richblack-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-richblack-900 via-transparent to-richblack-900/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">

            {/* ── Left: Course Info ── */}
            <div className="flex-1 min-w-0 py-10 lg:py-16">
              {/* Mobile thumbnail */}
              <div className="relative mb-6 lg:hidden rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={thumbnail}
                  alt="course thumbnail"
                  className="w-full object-cover max-h-64 sm:max-h-72"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <BsPlayCircle className="text-white text-5xl opacity-80" />
                </div>
              </div>

              {/* Course title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                {courseName}
              </h1>

              {/* Description */}
              <p className="text-richblack-200 text-sm sm:text-base leading-relaxed mb-5 max-w-2xl">
                {courseDescription}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {/* Rating */}
                <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span className="text-yellow-400 font-bold text-sm">{avgReviewCount}</span>
                  <RatingStars Review_Count={avgReviewCount} Star_Size={14} />
                  <span className="text-richblack-300 text-xs">({ratingAndReviews.length})</span>
                </div>
                {/* Students */}
                <div className="flex items-center gap-1.5 text-richblack-300 text-sm">
                  <FaUsers className="text-blue-400" />
                  <span>{studentsEnrolled.length.toLocaleString()} students</span>
                </div>
                {/* Lectures */}
                <div className="flex items-center gap-1.5 text-richblack-300 text-sm">
                  <FaBookOpen className="text-green-400" />
                  <span>{totalNoOfLectures} lectures</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={
                    instructor?.image
                      ? instructor.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor?.firstName || "U"} ${instructor?.lastName || "I"}`
                  }
                  alt={instructorName}
                  className="h-8 w-8 rounded-full object-cover border border-richblack-500 flex-shrink-0"
                />
                <p className="text-sm text-richblack-200">
                  Created by{" "}
                  <button
                    onClick={() => {}}
                    className="text-yellow-400 font-medium hover:underline"
                  >
                    {instructorName}
                  </button>
                </p>
              </div>

              {/* Created date */}
              <div className="flex items-center gap-2 text-richblack-400 text-sm mb-6">
                <CiClock1 />
                <span>Last updated {formatDate(createdAt)}</span>
              </div>

              {/* Enrolled badge */}
              {isEnrolled && (
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
                  <span className="text-base">✓</span> You're enrolled in this course
                </div>
              )}

              {/* Mobile action buttons */}
              <div className="lg:hidden">
                <div className="bg-richblack-800/80 backdrop-blur-sm border border-richblack-600 rounded-2xl p-5">
                  {!isEnrolled && (
                    <div className="flex items-baseline gap-2 mb-4">
                      <p className="text-3xl font-bold text-white">₹{price}</p>
                    </div>
                  )}

                  {isEnrolled ? (
                    <button
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-richblack-900 font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/20"
                      onClick={() => navigate("/dashboard/enrolled-courses")}
                    >
                      Go to Course →
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <button
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-richblack-900 font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/20"
                        onClick={handleBuyCourse}
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? "Processing..." : "Buy Now"}
                      </button>
                      <button
                        className="w-full bg-richblack-700 hover:bg-richblack-600 border border-richblack-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddToCart}
                        disabled={isInCart}
                      >
                        <BsCartPlus className="text-lg" />
                        {isInCart ? "Already in Cart" : "Add to Cart"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: Desktop Course Card ── */}
            <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0 py-10 lg:py-16">
              <div className="sticky top-6">
                <CourseDetailsCard
                  course={response.data || response}
                  setConfirmationModal={setConfirmationModal}
                  handleBuyCourse={handleBuyCourse}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Course Content ── */}
      <div className="bg-richblack-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:gap-12">

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* What You'll Learn */}
              <section className="border border-richblack-700 rounded-2xl overflow-hidden">
                <div className="bg-richblack-800 px-6 py-4 border-b border-richblack-700">
                  <h2 className="text-xl font-bold text-white">What you'll learn</h2>
                </div>
                <div className="p-6">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="text-richblack-100 leading-relaxed mb-3 text-sm sm:text-base">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-2 list-decimal list-inside text-richblack-100 text-sm sm:text-base">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="flex items-start gap-2 text-richblack-100 text-sm">
                          <span className="text-green-400 font-bold mt-0.5 flex-shrink-0">✓</span>
                          <span>{children}</span>
                        </li>
                      ),
                      h1: ({ children }) => <h1 className="text-white text-xl font-bold mb-3">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-white text-lg font-semibold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-richblack-50 text-base font-medium mb-2">{children}</h3>,
                      strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="text-richblack-200 italic">{children}</em>,
                    }}
                  >
                    {whatYouWillLearn}
                  </ReactMarkdown>
                </div>
              </section>

              {/* Course Content */}
              <section>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Course Content</h2>
                    <p className="text-richblack-400 text-sm mt-1">
                      {courseContent.length} section{courseContent.length !== 1 ? "s" : ""} &bull;{" "}
                      {totalNoOfLectures} lecture{totalNoOfLectures !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors border border-richblack-600 rounded-lg px-3 py-1.5 hover:border-richblack-500"
                    onClick={() => setIsActive([])}
                  >
                    Collapse all
                  </button>
                </div>

                <div className="border border-richblack-700 rounded-2xl overflow-hidden divide-y divide-richblack-700">
                  {courseContent?.map((course, index) => (
                    <CourseAccordionBar
                      course={course}
                      key={index}
                      isActive={isActive}
                      handleActive={handleActive}
                    />
                  ))}
                </div>
              </section>

              {/* Instructor */}
              <section className="border border-richblack-700 rounded-2xl overflow-hidden">
                <div className="bg-richblack-800 px-6 py-4 border-b border-richblack-700">
                  <h2 className="text-xl font-bold text-white">Your Instructor</h2>
                </div>
                <div className="p-6">
                  {instructor ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={
                            instructor.image
                              ? instructor.image
                              : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName || "U"} ${instructor.lastName || "I"}`
                          }
                          alt={instructorName}
                          className="h-16 w-16 rounded-full object-cover border-2 border-richblack-600 flex-shrink-0"
                        />
                        <div>
                          <p className="text-lg font-semibold text-white">{instructorName}</p>
                          <p className="text-sm text-richblack-400">Instructor</p>
                        </div>
                      </div>
                      {instructor?.additionalDetails?.about && (
                        <p className="text-richblack-200 text-sm leading-relaxed border-t border-richblack-700 pt-4">
                          {instructor.additionalDetails.about}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-richblack-700 flex items-center justify-center border-2 border-richblack-600 flex-shrink-0">
                        <span className="text-white font-medium">?</span>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">Unknown Instructor</p>
                        <p className="text-sm text-richblack-400">Instructor</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Spacer aligns main content with hero left column on desktop */}
            <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0" />
          </div>
        </div>
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}

export default CourseDetails;
