import { FaStar } from "react-icons/fa"
import { RiDeleteBin6Line } from "react-icons/ri"
import ReactStars from "react-rating-stars-component"
import { useDispatch, useSelector } from "react-redux"
import { removeFromCart } from "../../../../slices/cartSlice"

export default function RenderCartCourses() {
  const { cart } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  
  return (
    <div className="flex flex-1 flex-col">
      {cart.map((course, indx) => (
        <div
          key={course._id}
          className={`flex flex-col sm:flex-row w-full gap-4 sm:gap-6 ${
            indx !== cart.length - 1 && "border-b border-b-richblack-400 pb-6"
          } ${indx !== 0 && "mt-6"}`}
        >
          {/* Course Image and Details */}
          <div className="flex flex-col sm:flex-row flex-1 gap-4">
            {/* Course Thumbnail */}
            <div className="flex-shrink-0">
              <img
                src={course?.thumbnail}
                alt={course?.courseName}
                className="h-32 sm:h-36 lg:h-[148px] w-full sm:w-48 lg:w-[220px] rounded-lg object-cover"
              />
            </div>
            
            {/* Course Info */}
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-medium text-richblack-300 line-clamp-2">
                  {course?.courseName}
                </h3>
                <p className="text-sm text-richblack-300">
                  {course?.category?.name}
                </p>
                
                {/* Rating */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-yellow-500 text-sm">4.5</span>
                  <ReactStars
                    count={5}
                    value={course?.ratingAndReviews?.length}
                    size={16}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                  <span className="text-yellow-300 text-sm">
                    {course?.ratingAndReviews?.length} Rating{course?.ratingAndReviews?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2 sm:gap-4 flex-shrink-0">
            {/* Price */}
            <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-yellow-100 order-2 sm:order-1">
              ₹ {course?.price}
            </p>
            
            {/* Remove Button */}
            <button
              onClick={() => dispatch(removeFromCart(course._id))}
              className="flex items-center gap-x-1 rounded-md border border-richblack-600 bg-richblack-700 py-2 sm:py-3 px-3 sm:px-[12px] text-pink-200 text-sm hover:bg-richblack-600 transition-colors order-1 sm:order-2"
            >
              <RiDeleteBin6Line className="text-base" />
              <span className="hidden sm:inline">Remove</span>
              <span className="sm:hidden">Remove</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}