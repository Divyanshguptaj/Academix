import React from "react"
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course

  // Check if user is enrolled in the course
  const isEnrolled = user && course?.studentsEnrolled?.some(
    (student) => student._id === user._id
  )

  const handleShare = () => {
    copy(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    if (token) {
      dispatch(addToCart(course))
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  const handleGoToCourse = () => {
    // Navigate to enrolled courses or specific course view
    navigate("/dashboard/enrolled-courses")
  }

  return (
    <>
      <div
        className={`flex flex-col gap-4 rounded-xl bg-slate-700 p-4 text-richblack-300`}
      >
        {/* Course Image */}
        <img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full"
        />

        <div className="px-4">
          {/* Show price only if user is not enrolled */}
          {!isEnrolled && (
            <div className="space-x-3 pb-4 text-3xl font-semibold">
              Rs. {CurrentPrice}
            </div>
          )}

          {/* Enrollment Status Banner */}
          {isEnrolled && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded-lg">
              <p className="text-green-400 font-semibold text-center text-sm">
                ✅ You are enrolled in this course
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {isEnrolled ? (
              // Show "Go To Course" button for enrolled students
              <button
                className="yellowButton bg-yellow-500 p-3 text-white rounded-md font-medium hover:bg-yellow-600 transition-colors duration-200"
                onClick={handleGoToCourse}
              >
                Go To Course
              </button>
            ) : (
              // Show purchase options for non-enrolled users
              <>
                <button
                  className="yellowButton bg-yellow-500 p-3 text-white rounded-md font-medium hover:bg-yellow-600 transition-colors duration-200"
                  onClick={
                    user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR
                      ? () => toast.error("You are an Instructor. You can't buy a course.")
                      : handleBuyCourse
                  }
                >
                  {user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR
                    ? "You are an Instructor"
                    : "Buy Now"}
                </button>

                {/* Show Add to Cart only for non-instructors and non-enrolled users */}
                {(!user || user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR) && (
                  <button 
                    onClick={handleAddToCart} 
                    className="blackButton bg-black p-3 text-white rounded-md font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                )}
              </>
            )}
          </div>

          {/* Course Instructions - Show only for non-enrolled users or always show */}
          <div className={``}>
            <p className={`my-5 text-xl font-semibold `}>
              This Course Includes :
            </p>
            <div className="flex flex-col gap-3 text-sm text-green-200 justify-center">
              {course?.instructions?.map((item, i) => {
                return (
                  <p className={`flex gap-2 items-center`} key={i}>
                    <BsFillCaretRightFill />
                    <span>{item}</span>
                  </p>
                )
              })}
            </div>
          </div>

          {/* Share Button */}
          <div className="text-center">
            <button
              className="mx-auto flex items-center gap-2 py-6 text-yellow-200 hover:text-yellow-300 transition-colors duration-200"
              onClick={handleShare}
            >
              <FaShareSquare size={15} /> Share
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseDetailsCard