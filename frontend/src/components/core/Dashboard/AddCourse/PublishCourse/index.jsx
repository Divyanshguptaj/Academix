import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa"
import { MdPublish } from "react-icons/md"

import { editCourseDetails } from "../../../../../services/operations/courseDetailsAPI"
import { resetCourseState, setCourse, setStep } from "../../../../../slices/courseSlice"
import { COURSE_STATUS } from "../../../../../utils/constants"
import IconBtn from "../../../../common/IconBtn"
import { COURSE_WIP_KEY } from "../index"

export default function PublishCourse() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { course } = useSelector((state) => state.course)
  const [loading, setLoading] = useState(false)

  const goBack = () => dispatch(setStep(2))

  const goToCourses = () => {
    sessionStorage.removeItem(COURSE_WIP_KEY)
    dispatch(resetCourseState())
    navigate("/dashboard/instructor-courses")
  }

  const handleSave = async (targetStatus) => {
    // No-op if the course is already at the desired status
    if (course?.status === targetStatus) {
      goToCourses()
      return
    }
    const formData = new FormData()
    formData.append("courseId", course._id)
    formData.append("status", targetStatus)
    setLoading(true)
    const result = await editCourseDetails(formData)
    if (result) {
      dispatch(setCourse(result))
      goToCourses()
    }
    setLoading(false)
  }

  const sections = course?.courseContent ?? []
  const totalLectures = sections.reduce((n, s) => n + (s.subSection?.length ?? 0), 0)
  const withVideo = sections.reduce(
    (n, s) => n + (s.subSection?.filter((l) => l.videoURL)?.length ?? 0), 0
  )
  const missingVideo = totalLectures - withVideo
  const isPublished = course?.status === COURSE_STATUS.PUBLISHED

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-6 sm:space-y-8 rounded-lg border border-richblack-700 bg-richblack-800 p-4 sm:p-6 lg:p-8 shadow-lg">

        {/* Header */}
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

        <div className="space-y-6 sm:space-y-8">

          {/* Course Status Card */}
          <div className="bg-richblack-900 rounded-lg p-4 sm:p-6 border border-richblack-600">
            <h3 className="text-lg font-medium text-richblack-300 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              Course Status
            </h3>

            <div className="p-3 sm:p-4 bg-richblack-700 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-white/50 mb-1">Current Status:</p>
                  <div className="flex items-center gap-2">
                    {isPublished ? (
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
                  <p className="text-sm text-richblack-300 font-mono">{course?._id?.slice(-8)}</p>
                </div>
              </div>
            </div>

            {/* Visibility explainer */}
            <div className={`mt-4 p-3 rounded-lg border-l-4 text-sm font-medium flex items-center gap-2 ${
              isPublished
                ? "bg-green-900/20 border-green-400 text-green-300"
                : "bg-yellow-900/20 border-yellow-400 text-yellow-300"
            }`}>
              {isPublished ? <FaEye /> : <FaEyeSlash />}
              <span>
                {isPublished
                  ? "Your course is live and visible to students"
                  : "Your course is private — students cannot see it yet"}
              </span>
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
                  {sections.length} section{sections.length !== 1 ? "s" : ""}
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
              <div className="sm:col-span-2">
                <p className="text-white/50 mb-2">Lecture Readiness:</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 text-green-400 bg-green-900/20 border border-green-700/30 px-2.5 py-1 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    {withVideo} with video
                  </span>
                  {missingVideo > 0 ? (
                    <span className="flex items-center gap-1.5 text-yellow-400 bg-yellow-900/20 border border-yellow-700/30 px-2.5 py-1 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                      {missingVideo} without video
                    </span>
                  ) : totalLectures > 0 ? (
                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                      All lectures have videos ✓
                    </span>
                  ) : null}
                  {totalLectures === 0 && (
                    <span className="text-xs text-richblack-400">
                      No lectures yet — you can add them after publishing
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-richblack-600 pt-6">
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-between">
              <button
                disabled={loading}
                type="button"
                onClick={goBack}
                className="w-full sm:w-auto px-6 py-2.5 bg-richblack-600 hover:bg-richblack-500 text-richblack-300 hover:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back to Course Builder
              </button>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave(COURSE_STATUS.DRAFT)}
                  className="w-full sm:w-auto px-6 py-2.5 border border-richblack-600 hover:border-richblack-500 text-richblack-300 hover:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Save as Draft"}
                </button>

                <IconBtn
                  disabled={loading}
                  text={loading ? "Publishing…" : isPublished ? "Update Course" : "Publish Course"}
                  onclick={() => handleSave(COURSE_STATUS.PUBLISHED)}
                  className="w-full sm:w-auto min-w-[140px] justify-center"
                >
                  <MdPublish size={20} />
                </IconBtn>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-white/50">
                {isPublished
                  ? "Your course is live — students can enroll right now"
                  : "Publishing makes your course available for students to find and enroll"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
