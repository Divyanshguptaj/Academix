import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { fetchInstructorCourses } from "../../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../../services/operations/profileAPI"
import InstructorChart from "./InstructorChart"
import { FaBook, FaUsers, FaRupeeSign, FaChartPie, FaArrowRight, FaPlusCircle } from "react-icons/fa"

export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const instructorApiData = await getInstructorData(token, user._id)
      const result = await fetchInstructorCourses(user._id)
      if (instructorApiData?.courses) setInstructorData(instructorApiData)
      if (Array.isArray(result)) setCourses(result)
      setLoading(false)
    }
    if (user?._id && token) fetchData()
  }, [token, user])

  useEffect(() => {
    if (courses.length > 0) {
      setTotalStudents(courses.reduce((acc, c) => acc + (c.studentsEnrolled?.length || 0), 0))
      setTotalAmount(courses.reduce((acc, c) => acc + (c.price || 0) * (c.studentsEnrolled?.length || 0), 0))
    } else {
      setTotalStudents(0)
      setTotalAmount(0)
    }
  }, [courses])

  const publishedCount = courses.filter((c) => c.status === "Published").length
  const avgStudents = courses.length > 0 ? (totalStudents / courses.length).toFixed(1) : "0"
  const avgIncome = courses.length > 0 ? Math.round(totalAmount / courses.length) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-4 border-richblack-600 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">
            Hi, {user?.firstName || "Instructor"} 👋
          </h1>
          <p className="text-sm text-richblack-400 mt-0.5">Here's what's happening with your courses</p>
        </div>
        <Link to="/dashboard/add-courses">
          <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors">
            <FaPlusCircle className="text-sm" />
            New Course
          </button>
        </Link>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-6">
          {/* Chart + Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Chart — takes 2 cols */}
            <div className="xl:col-span-2" style={{ minHeight: 380 }}>
              {totalAmount > 0 || totalStudents > 0 ? (
                <InstructorChart courses={courses} />
              ) : (
                <div className="h-full rounded-xl bg-richblack-800 border border-richblack-700 p-6 flex flex-col items-center justify-center gap-3 text-center">
                  <FaChartPie className="text-4xl text-richblack-500" />
                  <p className="text-base font-semibold text-richblack-300">Not enough data to visualize</p>
                  <p className="text-sm text-richblack-500">Enroll students to see your charts</p>
                </div>
              )}
            </div>

            {/* Stats Panel */}
            <div className="flex flex-col gap-3">
              {/* Total Courses */}
              <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaBook className="text-blue-400 text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-richblack-400 font-medium uppercase tracking-wide">Total Courses</p>
                  <p className="text-2xl font-bold text-richblack-5">{courses.length}</p>
                  <p className="text-xs text-richblack-500 mt-0.5">{publishedCount} published</p>
                </div>
              </div>

              {/* Total Students */}
              <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaUsers className="text-green-400 text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-richblack-400 font-medium uppercase tracking-wide">Total Students</p>
                  <p className="text-2xl font-bold text-richblack-5">{totalStudents.toLocaleString()}</p>
                  <p className="text-xs text-richblack-500 mt-0.5">{avgStudents} avg per course</p>
                </div>
              </div>

              {/* Total Income */}
              <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaRupeeSign className="text-yellow-400 text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-richblack-400 font-medium uppercase tracking-wide">Total Income</p>
                  <p className="text-2xl font-bold text-richblack-5">₹{totalAmount.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-richblack-500 mt-0.5">₹{avgIncome.toLocaleString("en-IN")} avg per course</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Courses */}
          <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-richblack-200 uppercase tracking-wide">Recent Courses</p>
              <Link
                to="/dashboard/instructor-courses"
                className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
              >
                View All <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course._id}
                  className="bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 rounded-xl overflow-hidden transition-colors"
                >
                  <div className="aspect-video w-full">
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm font-semibold text-richblack-100 line-clamp-2 leading-snug">
                      {course.courseName}
                    </p>
                    <div className="flex items-center justify-between text-xs text-richblack-400">
                      <span className="flex items-center gap-1">
                        <FaUsers className="text-[10px]" />
                        {course.studentsEnrolled?.length || 0} students
                      </span>
                      <span className="flex items-center gap-1">
                        <FaRupeeSign className="text-[10px]" />
                        {(course.price || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      course.status === "Published"
                        ? "bg-green-500/15 text-green-400"
                        : "bg-richblack-600 text-richblack-400"
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {courses.length < 3 && (
              <div className="mt-4 p-4 bg-richblack-700/50 border border-dashed border-richblack-600 rounded-xl text-center">
                <p className="text-sm text-richblack-400 mb-2">Create more courses to fill up your dashboard</p>
                <Link to="/dashboard/add-course" className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">
                  + Add New Course
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 text-center">
          <div className="w-20 h-20 bg-richblack-700 rounded-2xl flex items-center justify-center">
            <FaBook className="text-4xl text-richblack-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-richblack-200">No courses yet</p>
            <p className="text-sm text-richblack-500 mt-1">Start your teaching journey by creating your first course</p>
          </div>
          <Link to="/dashboard/add-course">
            <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold px-6 py-3 rounded-lg transition-colors">
              <FaPlusCircle />
              Create Your First Course
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
