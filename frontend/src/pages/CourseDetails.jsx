import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { CiClock1 } from "react-icons/ci";
import { BsCartPlus } from "react-icons/bs";
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

  // Getting courseId from url parameter
  const { courseId } = useParams();
  const [response, setResponse] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchCourseDetails(courseId);
        console.log("Course Details Response: ", res);
        setResponse(res);
      } catch (error) {
        console.log("Could not fetch Course Details");
      }
    };
    fetchData();
  }, [courseId, user._id, dispatch]);

  // Calculating Avg Review count
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

  const [isActive, setIsActive] = useState(Array(0));
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

  // Check if user is enrolled
  const isEnrolled = user && user?.courses?.includes(course_id);
  
  // Check if course is in cart
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

  return (
    <>
      <div className={`relative w-full bg-richblack-800`}>
        {/* Hero Section */}
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
            
            {/* Mobile Course Image */}
            <div className="relative block max-h-[30rem] w-full lg:hidden">
              <div className="absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]"></div>
              <img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-auto w-full rounded-lg"
              />
            </div>

            {/* Course Info */}
            <div className={`z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5`}>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-richblack-300 sm:text-[42px] leading-tight">
                  {courseName}
                </h1>
              </div>
              
              <p className={`text-richblack-200 text-base sm:text-lg leading-relaxed`}>
                {courseDescription}
              </p>
              
              <div className="text-sm sm:text-md flex flex-wrap items-center gap-2">
                <span className="text-yellow-500 font-semibold">{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={20} />
                <span className="text-yellow-400">{`(${ratingAndReviews.length} reviews)`}</span>
                <span className="text-yellow-400">{`${studentsEnrolled.length} students enrolled`}</span>
              </div>
              
              <div>
                <p className="text-white text-sm sm:text-base">
                  Created By : <span className="text-yellow-400 font-medium">
                    {instructor?.firstName && instructor?.lastName 
                      ? `${instructor.firstName} ${instructor.lastName}`
                      : instructor?._id || 'Unknown Instructor'
                    }
                  </span>
                </p>
              </div>
              
              <div className="flex flex-wrap gap-5 text-sm sm:text-lg">
                <p className="flex items-center gap-2 text-white">
                  <CiClock1 className="text-lg" /> 
                  Created at {formatDate(createdAt)}
                </p>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="w-full flex flex-col gap-4 border-y border-y-richblack-600 py-6 lg:hidden">
              <div className="flex items-center justify-between mb-4">
                <p className="text-2xl sm:text-3xl font-bold text-yellow-100">
                  ₹ {price}
                </p>
                {isEnrolled && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Enrolled
                  </span>
                )}
              </div>
              
              {!isEnrolled && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="w-full sm:flex-1 bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
                    onClick={handleBuyCourse}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? "Processing..." : "Buy Now"}
                  </button>
                  
                  <button
                    className="w-full sm:flex-1 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    onClick={handleAddToCart}
                    disabled={isInCart}
                  >
                    <BsCartPlus className="text-lg text-whited" />
                    {isInCart ? "Already in Cart" : "Add to Cart"}
                  </button>
                </div>
              )}
              
              {isEnrolled && (
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  onClick={() => navigate(`/dashboard/enrolled-courses`)}
                >
                  Go to Course
                </button>
              )}
            </div>
          </div>

          {/* Desktop Course Card */}
          <div className="right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute lg:block">
            <CourseDetailsCard
              course={response.data || response}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="mx-auto box-content px-4 text-start text-richblack-300 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          
          {/* What will you learn section */}
          <div className="my-8 border border-richblack-600 p-4 sm:p-6 rounded-lg">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">What you'll learn</h2>
            <div className="mt-4 max-h-[400px] overflow-y-auto">
              <ReactMarkdown
                components={{
                  p: ({children}) => <p className="text-richblack-50 leading-relaxed mb-3 text-sm sm:text-base">{children}</p>,
                  ul: ({children}) => <ul className="text-richblack-50 leading-relaxed list-disc list-inside space-y-2 text-sm sm:text-base">{children}</ul>,
                  ol: ({children}) => <ol className="text-richblack-50 leading-relaxed list-decimal list-inside space-y-2 text-sm sm:text-base">{children}</ol>,
                  li: ({children}) => <li className="text-richblack-50 text-sm sm:text-base">{children}</li>,
                  h1: ({children}) => <h1 className="text-richblack-5 text-xl sm:text-2xl font-bold mb-3">{children}</h1>,
                  h2: ({children}) => <h2 className="text-richblack-5 text-lg sm:text-xl font-semibold mb-2">{children}</h2>,
                  h3: ({children}) => <h3 className="text-richblack-5 text-base sm:text-lg font-medium mb-2">{children}</h3>,
                  strong: ({children}) => <strong className="text-richblack-5 font-semibold">{children}</strong>,
                  em: ({children}) => <em className="text-richblack-100 italic">{children}</em>,
                }}
              >
                {whatYouWillLearn}
              </ReactMarkdown>
            </div>
          </div>

          {/* Course Content Section */}
          <div className="max-w-[830px]">
            <div className="flex flex-col gap-3 mb-6">
              <h2 className="text-2xl sm:text-[28px] font-semibold">Course Content</h2>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex flex-wrap gap-2 text-sm sm:text-base">
                  <span>
                    {courseContent.length} section{courseContent.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-yellow-400 font-medium">|</span>
                  <span>
                    {totalNoOfLectures} lecture{totalNoOfLectures !== 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <button
                    className="text-yellow-400 border border-richblack-600 bg-richblack-800 hover:bg-richblack-700 rounded-md py-1 px-3 text-xs sm:text-sm transition-colors duration-200"
                    onClick={() => setIsActive([])}
                  >
                    Collapse all sections
                  </button>
                </div>
              </div>
            </div>

            {/* Course Details Accordion */}
            <div className="py-4 space-y-2">
              {courseContent?.map((course, index) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>

            {/* Author Details */}
            <div className="mb-12 py-4">
              <h2 className="text-2xl sm:text-[28px] font-semibold mb-4">Author</h2>
              {instructor ? (
                <div className="flex items-center gap-4 py-4">
                  <img
                    src={
                      instructor.image
                        ? instructor.image
                        : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName || 'Unknown'} ${instructor.lastName || 'Instructor'}`
                    }
                    alt="Author"
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-richblack-600"
                  />
                  <div>
                    <p className="text-lg sm:text-xl font-medium text-richblack-5">
                      {instructor.firstName && instructor.lastName 
                        ? `${instructor.firstName} ${instructor.lastName}`
                        : instructor._id || 'Unknown Instructor'
                      }
                    </p>
                    <p className="text-sm text-richblack-300">Instructor</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 py-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-richblack-600 flex items-center justify-center border-2 border-richblack-600">
                    <span className="text-white text-sm font-medium">?</span>
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-medium text-richblack-5">Unknown Instructor</p>
                    <p className="text-sm text-richblack-300">Instructor</p>
                  </div>
                </div>
              )}
              {instructor?.additionalDetails?.about && (
                <p className="text-richblack-100 leading-relaxed mt-4">
                  {instructor.additionalDetails.about}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile - Alternative approach */}
      {!isEnrolled && (
        <div className="fixed bottom-0 left-0 right-0 bg-richblack-900 border-t border-richblack-600 p-4 lg:hidden z-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-yellow-100">₹ {price}</p>
              <p className="text-xs text-richblack-300">Limited time offer</p>
            </div>
            <div className="flex gap-2 flex-1 max-w-xs">
              <button
                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
                onClick={handleBuyCourse}
                disabled={paymentLoading}
              >
                Buy Now
              </button>
              <button
                className="bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-5 font-semibold py-2.5 px-3 rounded-lg transition-colors duration-200"
                onClick={handleAddToCart}
                disabled={isInCart}
              >
                <BsCartPlus className="text-lg text-richblack-200" />
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}

export default CourseDetails;