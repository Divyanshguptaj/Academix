import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { CiClock1 } from "react-icons/ci";
import { BsCartPlus, BsPlayCircle } from "react-icons/bs";
import { FaUsers, FaBookOpen, FaStar, FaCheckCircle } from "react-icons/fa";
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
  const { user }          = useSelector((s) => s.profile);
  const { token }         = useSelector((s) => s.auth);
  const { loading }       = useSelector((s) => s.profile);
  const { paymentLoading }= useSelector((s) => s.course);
  const { cart }          = useSelector((s) => s.cart);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { courseId } = useParams();

  const [response, setResponse]             = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [avgReviewCount, setAvgReviewCount] = useState(0);
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0);
  const [isActive, setIsActive]             = useState([]);

  useEffect(() => {
    (async () => {
      try { setResponse(await fetchCourseDetails(courseId)); }
      catch { console.log("Could not fetch Course Details"); }
    })();
  }, [courseId, user._id]);

  useEffect(() => {
    setAvgReviewCount(
      GetAvgRating(response?.data?.ratingAndReviews || response?.ratingAndReviews)
    );
  }, [response]);

  useEffect(() => {
    let n = 0;
    (response?.data?.courseContent || response?.courseContent)
      ?.forEach((s) => { n += s.subSection.length; });
    setTotalNoOfLectures(n);
  }, [response]);

  const handleActive = (id) =>
    setIsActive(!isActive.includes(id) ? [...isActive, id] : isActive.filter((e) => e !== id));

  const Spinner = () => (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-richblack-900">
      <div className="spinner" />
    </div>
  );

  if (loading || !response) return <Spinner />;
  if (!response.success)    return <Error />;
  if (paymentLoading)       return <Spinner />;

  const {
    _id: course_id, courseName, courseDescription, thumbnail, price,
    whatYouWillLearn, courseContent, ratingAndReviews,
    instructor, studentsEnrolledCount, createdAt,
  } = response.data || response;

  const courseData = response.data || response;

  const isEnrolled = user && user?.courses?.some((id) => id?.toString() === course_id?.toString());
  const isInCart = cart?.some((item) => item._id === course_id);

  const instructorName =
    instructor?.firstName && instructor?.lastName
      ? `${instructor.firstName} ${instructor.lastName}`
      : instructor?._id || "Unknown Instructor";

  const handleBuyCourse = () => {
    if (token) { buyCourse(token, [courseId], user, navigate, dispatch); return; }
    setConfirmationModal({
      text1: "You are not logged in!", text2: "Please login to Purchase Course.",
      btn1Text: "Login", btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };
  const handleAddToCart = () => {
    if (token) { dispatch(addToCart(courseData)); return; }
    setConfirmationModal({
      text1: "You are not logged in!", text2: "Please login to add Course to Cart.",
      btn1Text: "Login", btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  /* ─────────────────────────── reusable section header ─────────────────── */
  const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <span className="w-1 h-5 rounded-full bg-yellow-400 flex-shrink-0" />
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
          {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );

  return (
    <div className="bg-richblack-900 min-h-screen">

      {/* ══════════════════════════════════════════════════════════════
          HERO — full-width dark band, height = left-text only (no card)
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative bg-richblack-800 border-b border-gray-700 overflow-hidden">
        {/* atmospheric blurred bg */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <img src={thumbnail} alt="" className="w-full h-full object-cover blur-2xl scale-110"
               style={{ opacity: 0.12 }} />
          <div className="absolute inset-0 bg-richblack-800" style={{ opacity: 0.9 }} />
        </div>

        {/* top yellow accent strip */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-yellow-400" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

          {/* mobile thumbnail */}
          <div className="relative mb-6 lg:hidden rounded-xl overflow-hidden shadow-lg">
            <img src={thumbnail} alt={courseName} className="w-full object-cover max-h-52" />
            <div className="absolute inset-0 flex items-center justify-center"
                 style={{ background: "rgba(0,0,0,0.3)" }}>
              <BsPlayCircle className="text-white text-5xl" />
            </div>
          </div>

          {/* ── course info ── */}
          <div className="max-w-3xl">
            {/* title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
              {courseName}
            </h1>

            {/* description */}
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-5">
              {courseDescription}
            </p>

            {/* stats row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 text-sm">
              <div className="flex items-center gap-1.5">
                <FaStar className="text-yellow-400" />
                <span className="text-yellow-400 font-bold">{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={13} />
                <span className="text-gray-400 ml-0.5">({ratingAndReviews.length} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <FaUsers className="text-blue-400" />
                <span>{(studentsEnrolledCount || 0).toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <FaBookOpen className="text-green-400" />
                <span>{totalNoOfLectures} lectures</span>
              </div>
            </div>

            {/* instructor */}
            <div className="flex items-center gap-2 mb-2">
              <img
                src={instructor?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${instructor?.firstName || "U"} ${instructor?.lastName || "I"}`}
                alt={instructorName}
                referrerPolicy="no-referrer"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/5.x/initials/svg?seed=${instructor?.firstName || "U"} ${instructor?.lastName || "I"}`; }}
                className="h-6 w-6 rounded-full object-cover border border-gray-600 flex-shrink-0"
              />
              <p className="text-sm text-gray-300">
                Created by{" "}
                <span className="text-yellow-400 font-semibold">{instructorName}</span>
              </p>
            </div>

            {/* date */}
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-5">
              <CiClock1 />
              <span>Last updated {formatDate(createdAt)}</span>
            </div>

            {/* enrolled badge */}
            {isEnrolled && (
              <div className="inline-flex items-center gap-2 bg-green-900 border border-green-700
                              text-green-300 text-xs font-medium px-3 py-1.5 rounded-full">
                <FaCheckCircle className="text-green-400" />
                You are enrolled in this course
              </div>
            )}

            {/* ── mobile CTA card ── */}
            <div className="lg:hidden mt-5 bg-richblack-900 border border-gray-700 rounded-xl p-4">
              {!isEnrolled && (
                <p className="text-2xl font-bold text-white mb-3">₹ {price}</p>
              )}
              {isEnrolled ? (
                <button onClick={() => navigate("/dashboard/enrolled-courses")}
                        className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900
                                   font-bold py-3 rounded-lg transition-colors">
                  Go to Course →
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button onClick={handleBuyCourse}
                          className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900
                                     font-bold py-3 rounded-lg transition-colors">
                    Buy Now
                  </button>
                  <button onClick={handleAddToCart} disabled={isInCart}
                          className="w-full flex items-center justify-center gap-2 border
                                     border-gray-600 hover:border-yellow-400 text-white py-3
                                     rounded-lg transition-colors text-sm
                                     disabled:opacity-40 disabled:cursor-not-allowed">
                    <BsCartPlus />
                    {isInCart ? "Already in Cart" : "Add to Cart"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CONTENT GRID
          • Left column  — sections (determines row height)
          • Right column — sticky card, cell stretches to left height
            giving the "equal height" side-panel effect
      ══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* CSS Grid: flex-col on mobile, two columns on desktop.
            Grid default align-items is stretch → right cell = left cell height */}
        <div className="flex flex-col gap-5 lg:grid lg:gap-8"
             style={{ gridTemplateColumns: "1fr 300px" }}>

          {/* ── LEFT: sections ── */}
          <div className="min-w-0 space-y-4">

            {/* mobile card */}
            <div className="lg:hidden">
              <CourseDetailsCard course={courseData} setConfirmationModal={setConfirmationModal}
                                 handleBuyCourse={handleBuyCourse} />
            </div>

            {/* What You'll Learn */}
            <section className="bg-richblack-800 border border-gray-700 rounded-xl overflow-hidden">
              <SectionHeader title="What you'll learn" />
              <div className="p-5">
                <ReactMarkdown
                  components={{
                    p:      ({ children }) => <p className="text-gray-300 text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                    ul:     ({ children }) => <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">{children}</ul>,
                    ol:     ({ children }) => <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">{children}</ol>,
                    li:     ({ children }) => (
                      <li className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-green-400 font-bold flex-shrink-0 text-xs mt-0.5">✓</span>
                        <span>{children}</span>
                      </li>
                    ),
                    h1:     ({ children }) => <h1 className="text-white text-lg font-bold mb-2">{children}</h1>,
                    h2:     ({ children }) => <h2 className="text-white text-base font-semibold mb-1">{children}</h2>,
                    h3:     ({ children }) => <h3 className="text-gray-200 text-sm font-medium mb-1">{children}</h3>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    em:     ({ children }) => <em className="text-gray-400 italic">{children}</em>,
                  }}
                >
                  {whatYouWillLearn}
                </ReactMarkdown>
              </div>
            </section>

            {/* Course Content */}
            <section className="bg-richblack-800 border border-gray-700 rounded-xl overflow-hidden">
              <SectionHeader
                title="Course Content"
                subtitle={`${courseContent.length} section${courseContent.length !== 1 ? "s" : ""} · ${totalNoOfLectures} lecture${totalNoOfLectures !== 1 ? "s" : ""}`}
                action={
                  <button onClick={() => setIsActive([])}
                          className="text-yellow-400 hover:text-yellow-300 text-xs border
                                     border-gray-700 hover:border-gray-500 rounded-md px-2.5 py-1
                                     transition-colors whitespace-nowrap">
                    Collapse all
                  </button>
                }
              />
              <div className="divide-y divide-gray-700">
                {courseContent?.map((c, i) => (
                  <CourseAccordionBar course={c} key={i} isActive={isActive} handleActive={handleActive} />
                ))}
              </div>
            </section>

            {/* Instructor */}
            <section className="bg-richblack-800 border border-gray-700 rounded-xl overflow-hidden">
              <SectionHeader title="Instructor" />
              <div className="p-5">
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={instructor?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${instructor?.firstName || "U"} ${instructor?.lastName || "I"}`}
                    alt={instructorName}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/5.x/initials/svg?seed=${instructor?.firstName || "U"} ${instructor?.lastName || "I"}`; }}
                    className="h-14 w-14 rounded-full object-cover border-2 border-gray-700 flex-shrink-0"
                  />
                  <div>
                    <p className="text-base font-semibold text-white">{instructorName}</p>
                    <p className="text-xs text-gray-500">Instructor</p>
                  </div>
                </div>
                {instructor?.additionalDetails?.about && (
                  <p className="text-gray-400 text-sm leading-relaxed border-t border-gray-700 pt-3">
                    {instructor.additionalDetails.about}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* ── RIGHT: sticky card inside a full-height cell ── */}
          {/* The grid cell naturally stretches to match the left column height.
              A subtle background fills this cell so the "panel" effect is visible. */}
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-richblack-800 border border-gray-700 rounded-xl"
                 style={{ opacity: 0.3 }} />
            <div className="sticky top-6 z-10 py-2 px-0">
              <CourseDetailsCard
                course={courseData}
                setConfirmationModal={setConfirmationModal}
                handleBuyCourse={handleBuyCourse}
              />
            </div>
          </div>

        </div>
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
}

export default CourseDetails;
