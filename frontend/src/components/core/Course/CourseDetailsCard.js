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

  const { thumbnail: ThumbnailImage, price: CurrentPrice, _id: courseId } = course

  const isEnrolled = user && user?.courses?.some((id) => id?.toString() === course?._id?.toString())
  const isInCart = cart?.some((item) => item._id === courseId)
  const isInstructor = user?.accountType === ACCOUNT_TYPE.INSTRUCTOR

  const handleShare = () => {
    copy(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleAddToCart = () => {
    if (isInstructor) { toast.error("Instructors can't purchase courses."); return }
    if (isInCart) { toast.error("Course is already in cart"); return }
    if (token) { dispatch(addToCart(course)); toast.success("Added to cart"); return }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add to cart",
      btn1Text: "Login", btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  return (
    <div className="bg-richblack-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">

      {/* Thumbnail */}
      <div className="relative group cursor-pointer">
        <img
          src={ThumbnailImage}
          alt={course?.courseName || "Course"}
          className="w-full aspect-video object-cover"
        />
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <BsPlayCircleFill className="text-white text-5xl" />
        </div>
      </div>

      <div className="p-4 space-y-3">

        {/* Enrolled banner OR price */}
        {isEnrolled ? (
          <div className="flex items-center gap-2 bg-green-900 border border-green-700 rounded-lg px-3 py-2">
            <FaCheck className="text-green-400 text-xs flex-shrink-0" />
            <p className="text-green-300 font-medium text-sm">You are enrolled</p>
          </div>
        ) : (
          <p className="text-2xl font-bold text-white">₹ {CurrentPrice}</p>
        )}

        {/* Action buttons */}
        {isEnrolled ? (
          <button
            onClick={() => navigate("/dashboard/enrolled-courses")}
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-2.5 rounded-lg transition-colors text-sm"
          >
            Go to Course <FaArrowRight className="text-xs" />
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={isInstructor ? () => toast.error("Instructors can't purchase courses.") : handleBuyCourse}
              disabled={isInstructor}
              className={`w-full font-bold py-2.5 rounded-lg transition-colors text-sm ${
                isInstructor
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-300 text-gray-900"
              }`}
            >
              {isInstructor ? "Instructors can't buy" : "Buy Now"}
            </button>

            {!isInstructor && (
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                  isInCart
                    ? "border-gray-700 text-gray-600 cursor-not-allowed"
                    : "border-gray-600 hover:border-gray-400 text-white hover:bg-gray-800"
                }`}
              >
                <FaShoppingCart className={isInCart ? "text-gray-600" : "text-yellow-400"} />
                {isInCart ? "Already in Cart" : "Add to Cart"}
              </button>
            )}
          </div>
        )}

        {/* Guarantee */}
        {!isEnrolled && (
          <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs">
            <FaShieldAlt className="text-green-500 text-xs" />
            <span>30-Day Money-Back Guarantee</span>
          </div>
        )}

        {/* Course includes */}
        {course?.instructions?.length > 0 && (
          <>
            <div className="border-t border-gray-700 pt-3">
              <p className="text-white font-semibold text-xs uppercase tracking-wide mb-2">
                This course includes
              </p>
              <ul className="space-y-1.5">
                {course.instructions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-400 text-xs">
                    <FaCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Share */}
        <div className="border-t border-gray-700 pt-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-500 hover:text-yellow-400 text-xs transition-colors mx-auto"
          >
            <FaShareAlt /> Share this course
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailsCard
