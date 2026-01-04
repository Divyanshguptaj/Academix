import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa"
import { MdPublish } from "react-icons/md"

import { editCourseDetails } from "../../../../../services/operations/courseDetailsAPI"
import { resetCourseState, setCourse, setStep } from "../../../../../slices/courseSlice"
import { COURSE_STATUS } from "../../../../../utils/constants"
import IconBtn from "../../../../common/IconBtn"
 
export default function PublishCourse() {
  const { register, handleSubmit, setValue, getValues, watch } = useForm()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)
  const [loading, setLoading] = useState(false)

  const watchPublic = watch("public", false)

  useEffect(() => {
    if (course?.status === COURSE_STATUS.PUBLISHED) {
      setValue("public", true)
    }
  }, [course?.status, setValue])

  const goBack = () => {
    dispatch(setStep(2))
  }

  const goToCourses = () => {
    dispatch(resetCourseState())
    navigate("/dashboard/instructor-courses")
  }

  const handleCoursePublish = async () => {
    // check if form has been updated or not
    if (
      (course?.status === COURSE_STATUS.PUBLISHED && getValues("public") === true) ||
      (course?.status === COURSE_STATUS.DRAFT && getValues("public") === false)
    ) {
      // form has not been updated
      // no need to make api call
      goToCourses()
      return
    }
    const formData = new FormData()
    formData.append("courseId", course._id)
    const courseStatus = getValues("public")
      ? COURSE_STATUS.PUBLISHED
      : COURSE_STATUS.DRAFT
    formData.append("status", courseStatus)
    setLoading(true)
    const result = await editCourseDetails(formData)
    console.log(result);
    if (result) {
      dispatch(setCourse(result));
      goToCourses()
    }
    setLoading(false)
  }

  const onSubmit = (data) => {
    handleCoursePublish()
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-6 sm:space-y-8 rounded-lg border border-richblack-700 bg-richblack-800 p-4 sm:p-6 lg:p-8 shadow-lg">
        
        {/* Header Section */}
        <div className="border-b border-richblack-600 pb-4 sm:pb-6">
          <div className="flex items-center gap-3 mb-2">
            <MdPublish className="text-2xl text-yellow-400" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-richblack-300">
              Publish Settings
            </h2>
          </div>
          <p className="text-sm sm:text-base text-white/50">
            Choose whether to make your course public or keep it as a draft
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          
          {/* Course Status Card */}
          <div className="bg-richblack-900 rounded-lg p-4 sm:p-6 border border-richblack-600">
            <h3 className="text-lg font-medium text-richblack-300 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              Course Status
            </h3>
            
            {/* Current Status */}
            <div className="mb-6 p-3 sm:p-4 bg-richblack-700 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-white/50 mb-1">Current Status:</p>
                  <div className="flex items-center gap-2">
                    {course?.status === COURSE_STATUS.PUBLISHED ? (
                      <>
                        <FaEye className="text-green-400" />
                        <span className="font-medium text-green-400">Published</span>
                      </>
                    ) : (
                      <>
                        <FaEyeSlash className="text-yellow-400" />
                        <span className="font-medium text-yellow-400">Draft</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-richblack-500">Course ID:</p>
                  <p className="text-sm text-richblack-300 font-mono">
                    {course?._id?.slice(-8)}
                  </p>
                </div>
              </div>
            </div>

            {/* Publish Option */}
            <div className="space-y-4">
              <label className="flex items-start gap-3 sm:gap-4 cursor-pointer group">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    id="public"
                    {...register("public")}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 bg-richblack-700 border-richblack-500 rounded focus:ring-yellow-500 focus:ring-2 transition-all duration-200"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-base sm:text-lg font-medium text-richblack-300 group-hover:text-yellow-300 transition-colors duration-200">
                    Make this course public
                  </div>
                  <p className="text-sm text-white/50 mt-1">
                    {watchPublic 
                      ? "Your course will be visible to all students and can be purchased." 
                      : "Your course will remain private and won't be visible to students."
                    }
                  </p>
                </div>
              </label>

              {/* Status Preview */}
              <div className={`p-3 rounded-lg border-l-4 transition-all duration-200 ${
                watchPublic 
                  ? "bg-green-900/20 border-green-400 text-green-300" 
                  : "bg-yellow-900/20 border-yellow-400 text-yellow-300"
              }`}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {watchPublic ? <FaEye /> : <FaEyeSlash />}
                  <span>
                    {watchPublic 
                      ? "Course will be published and visible to students" 
                      : "Course will remain as draft"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Summary */}
          <div className="bg-richblack-900 rounded-lg p-4 sm:p-6 border border-richblack-600">
            <h3 className="text-lg font-medium text-richblack-300 mb-4">Course Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/50 mb-1">Course Name:</p>
                <p className="text-richblack-300 font-medium truncate">
                  {course?.courseName || "Untitled Course"}
                </p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Sections:</p>
                <p className="text-richblack-300 font-medium">
                  {course?.courseContent?.length || 0} sections
                </p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Price:</p>
                <p className="text-richblack-300 font-medium">
                  {course?.price ? `₹${course.price}` : "Free"}
                </p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Category:</p>
                <p className="text-richblack-300 font-medium">
                  {course?.category?.name || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-richblack-600 pt-6">
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-between">
              
              {/* Back Button */}
              <button
                disabled={loading}
                type="button"
                onClick={goBack}
                className="w-full sm:w-auto px-6 py-2.5 bg-richblack-600 hover:bg-richblack-500 text-richblack-300 hover:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back to Course Builder
              </button>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={goToCourses}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 border border-richblack-600 hover:border-richblack-500 text-richblack-300 hover:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  Save as Draft
                </button>
                
                <IconBtn 
                  disabled={loading} 
                  text={loading ? "Publishing..." : "Publish Course"}
                  className="w-full sm:w-auto min-w-[140px] justify-center"
                >
                  <MdPublish size={20} />
                </IconBtn>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-4 text-center">
              <p className="text-xs text-white/50">
                {watchPublic 
                  ? "Publishing will make your course available for students to enroll"
                  : "You can publish your course later from the course management page"
                }
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}