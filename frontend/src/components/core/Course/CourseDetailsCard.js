import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { FaCheck, FaShieldAlt, FaShareAlt, FaShoppingCart, FaArrowRight } from "react-icons/fa"
import { BsPlayCircleFill } from "react-icons/bs"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { cart } = useSelector((state) => state.cart)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course

  const isEnrolled = user && (
    user?.courses?.some(id => id?.toString() === course?._id?.toString()) ||
    course?.studentsEnrolled?.some(
      (student) => (student?._id || student)?.toString() === user?._id?.toString()
    )
  )

  const isInCart = cart?.some(item => item._id === courseId)
  const isInstructor = user?.accountType === ACCOUNT_TYPE.INSTRUCTOR

  const handleShare = () => {
    copy(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleAddToCart = () => {
    if (isInstructor) {
      toast.error("Instructors can't purchase courses.")
      return
    }
    if (isInCart) {
      toast.error("Course is already in cart")
      return
    }
    if (token) {
      dispatch(addToCart(course))
      toast.success("Course added to cart")
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add to cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  return (
    <div className="bg-richblack-800 border border-richblack-600 rounded-2xl shadow-2xl overflow-hidden">
      {/* Thumbnail with play overlay */}
      <div className="relative group cursor-pointer">
        <img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="w-full aspect-video object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <BsPlayCircleFill className="text-white text-5xl drop-shadow-lg" />
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Price / Enrolled status */}
        {isEnrolled ? (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
            <FaCheck className="text-green-400 flex-shrink-0" />
            <p className="text-green-400 font-semibold text-sm">You are enrolled in this course</p>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">₹{CurrentPrice}</span>
          </div>
        )}

        {/* Action buttons */}
        {isEnrolled ? (
          <button
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-richblack-900 font-bold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/20"
            onClick={() => navigate("/dashboard/enrolled-courses")}
          >
            Go to Course <FaArrowRight className="text-sm" />
          </button>
        ) : (
          <div className="space-y-3">
            <button
              className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-5 rounded-xl transition-all duration-200 ${
                isInstructor
                  ? "bg-richblack-600 text-richblack-300 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-400 text-richblack-900 shadow-lg shadow-yellow-500/20"
              }`}
              onClick={
                isInstructor
                  ? () => toast.error("Instructors can't purchase courses.")
                  : handleBuyCourse
              }
              disabled={isInstructor}
            >
              {isInstructor ? "Instructors can't buy" : "Buy Now"}
            </button>

            {!isInstructor && (
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`w-full flex items-center justify-center gap-2 font-semibold py-3 px-5 rounded-xl border transition-all duration-200 ${
                  isInCart
                    ? "bg-richblack-700 text-richblack-400 border-richblack-600 cursor-not-allowed"
                    : "bg-transparent hover:bg-richblack-700 text-white border-richblack-500 hover:border-richblack-400"
                }`}
              >
                <FaShoppingCart className={isInCart ? "text-richblack-500" : "text-yellow-400"} />
                {isInCart ? "Already in Cart" : "Add to Cart"}
              </button>
            )}
          </div>
        )}

        {/* Money-back guarantee */}
        {!isEnrolled && (
          <div className="flex items-center justify-center gap-2 text-richblack-400 text-xs">
            <FaShieldAlt className="text-green-500" />
            <span>30-Day Money-Back Guarantee</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-richblack-700" />

        {/* Course includes */}
        {course?.instructions?.length > 0 && (
          <div>
            <p className="text-white font-semibold text-sm mb-3">This course includes:</p>
            <ul className="space-y-2">
              {course.instructions.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-richblack-300 text-sm">
                  <FaCheck className="text-green-400 mt-0.5 flex-shrink-0 text-xs" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Share */}
        <div className="border-t border-richblack-700 pt-3">
          <button
            className="flex items-center gap-2 text-richblack-400 hover:text-yellow-400 text-sm transition-colors duration-200 mx-auto"
            onClick={handleShare}
          >
            <FaShareAlt className="text-sm" /> Share this course
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailsCard
