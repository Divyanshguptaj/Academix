import { useEffect, useState, useRef } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import { apiConnector } from "../../../services/apiconnector"
import { studentEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import { FaTimesCircle, FaClock, FaCheckCircle, FaTimes } from "react-icons/fa"

const { REQUEST_REFUND_API, MY_REFUNDS_API } = studentEndpoints

const formatDuration = (totalSeconds) => {
  const s = Math.round(totalSeconds || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  return `${sec}s`;
};

// courseId → "pending" | "approved" | "rejected"
const useMyRefunds = (token) => {
  const [refundMap, setRefundMap] = useState({})

  useEffect(() => {
    if (!token) return
    apiConnector("GET", MY_REFUNDS_API, null, { Authorization: `Bearer ${token}` })
      .then((res) => {
        const map = {}
        ;(res?.data?.data || []).forEach((r) => { map[r.courseId] = r.status })
        setRefundMap(map)
      })
      .catch(() => {})
  }, [token])

  const markPending = (courseId) =>
    setRefundMap((prev) => ({ ...prev, [courseId]: "pending" }))

  return { refundMap, markPending }
}

const REFUND_BADGE = {
  pending:  { label: "Refund Pending",  icon: FaClock,       cls: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" },
  approved: { label: "Refund Approved", icon: FaCheckCircle, cls: "bg-green-500/10 text-green-300 border-green-500/30" },
  rejected: { label: "Refund Rejected", icon: FaTimesCircle, cls: "bg-red-500/10 text-red-300 border-red-500/30" },
}

function RefundModal({ course, onClose, onSuccess }) {
  const { token } = useSelector((state) => state.auth)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) { toast.error("Please provide a reason"); return }
    setLoading(true)
    try {
      const res = await apiConnector(
        "POST",
        REQUEST_REFUND_API,
        { courseId: course._id, reason: reason.trim() },
        { Authorization: `Bearer ${token}` }
      )
      if (!res?.data?.success) throw new Error(res?.data?.message)
      toast.success("Refund request submitted successfully")
      onSuccess(course._id)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit refund request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h3 className="font-semibold text-richblack-5 text-lg">Request Refund</h3>
            <p className="text-sm text-richblack-400 mt-0.5 line-clamp-1">{course.courseName}</p>
          </div>
          <button onClick={onClose} className="text-richblack-400 hover:text-richblack-200 mt-0.5 flex-shrink-0">
            <FaTimes />
          </button>
        </div>

        {/* Info note */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4 text-sm text-yellow-300">
          Your request will be reviewed by our team. Approved refunds are processed within 5–7 business days.
        </div>

        {/* Reason */}
        <label className="block text-sm font-medium text-richblack-300 mb-2">
          Reason <span className="text-richblack-500 font-normal">(max 500 characters)</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Explain why you are requesting a refund…"
          className="w-full bg-richblack-700 border border-richblack-600 rounded-xl px-4 py-3 text-sm text-richblack-5 placeholder:text-richblack-500 focus:outline-none focus:border-yellow-400/50 resize-none"
        />
        <p className="text-xs text-richblack-500 mt-1 text-right">{reason.length}/500</p>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-200 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refundModal, setRefundModal] = useState(null)
  const isFetchingRef = useRef(false)

  const { refundMap, markPending } = useMyRefunds(token)

  const getEnrolledCourses = async () => {
    if (isFetchingRef.current || !user?._id) return
    isFetchingRef.current = true
    setIsLoading(true)
    try {
      const res = await getUserEnrolledCourses(user._id, token)
      setEnrolledCourses(res)
    } catch {
      toast.error("Could Not Get Enrolled Courses")
    } finally {
      isFetchingRef.current = false
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?._id) getEnrolledCourses()
  }, [user?._id, token])

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-medium text-richblack-300 sm:text-3xl">Enrolled Courses</h1>

      {!enrolledCourses ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !enrolledCourses.length ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-300 text-center py-8">
          You have not enrolled in any course yet.
        </p>
      ) : (
        <div className="my-6 text-richblack-300 sm:my-8">
          {/* Table header — desktop only */}
          <div className="hidden md:flex rounded-t-lg bg-richblack-500">
            <p className="w-[40%] px-5 py-3">Course Name</p>
            <p className="w-1/5 px-2 py-3">Duration</p>
            <p className="flex-1 px-2 py-3">Progress</p>
            <p className="w-[160px] px-2 py-3">Refund</p>
          </div>

          {enrolledCourses.map((course, i, arr) => {
            const refundStatus = refundMap[course._id]
            const badge = refundStatus ? REFUND_BADGE[refundStatus] : null

            return (
              <div
                key={i}
                className={`flex flex-col md:flex-row items-start md:items-center border border-richblack-700 rounded-md p-4 ${
                  i === arr.length - 1 ? "" : "mb-4"
                }`}
              >
                {/* Course image + info */}
                <div
                  className="flex w-full md:w-[40%] cursor-pointer items-start gap-4 mb-4 md:mb-0"
                  onClick={() => {
                    const sectionId = course?.firstSectionId || course?.courseContent?.[0]?._id
                    const subSectionId = course?.firstSubSectionId || course?.courseContent?.[0]?.subSection?.[0]?._id
                    if (sectionId && subSectionId) {
                      navigate(`/view-course/${course?._id}/section/${sectionId}/sub-section/${subSectionId}`)
                    } else {
                      navigate(`/view-course/${course?._id}`)
                    }
                  }}
                >
                  <img
                    src={course.thumbnail}
                    alt="course_img"
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-richblack-5 text-sm sm:text-base">{course.courseName}</p>
                    <p className="text-xs text-white/50">
                      {course.courseDescription?.length > 60
                        ? `${course.courseDescription.slice(0, 60)}...`
                        : course.courseDescription}
                    </p>
                  </div>
                </div>

                {/* Duration + Progress + Refund */}
                <div className="flex flex-col sm:flex-row w-full md:w-[60%] gap-4 md:gap-0 items-start sm:items-center">
                  {/* Duration */}
                  <div className="w-full sm:w-1/5 px-0 sm:px-2">
                    <p className="text-xs text-richblack-400 md:hidden">Duration:</p>
                    <p className="text-sm text-white">{formatDuration(course?.totalDurationInSeconds)}</p>
                  </div>

                  {/* Progress */}
                  <div className="w-full sm:flex-1 px-0 sm:px-2">
                    <p className="text-sm mb-1">Progress: {course.progressPercentage || 0}%</p>
                    <ProgressBar
                      completed={course.progressPercentage || 0}
                      height="8px"
                      isLabelVisible={false}
                      className="w-full"
                    />
                  </div>

                  {/* Refund */}
                  <div className="w-full sm:w-[160px] px-0 sm:px-2">
                    <p className="text-xs text-richblack-400 md:hidden mb-1">Refund:</p>
                    {badge ? (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${badge.cls}`}>
                        <badge.icon className="text-[10px]" />
                        {badge.label}
                      </span>
                    ) : (
                      <button
                        onClick={() => setRefundModal(course)}
                        className="text-xs text-richblack-400 hover:text-red-400 border border-richblack-600 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Request Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {refundModal && (
        <RefundModal
          course={refundModal}
          onClose={() => setRefundModal(null)}
          onSuccess={(courseId) => { markPending(courseId); setRefundModal(null) }}
        />
      )}
    </div>
  )
}
