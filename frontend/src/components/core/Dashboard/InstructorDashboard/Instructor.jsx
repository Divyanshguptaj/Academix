import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { fetchInstructorCourses } from "../../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../../services/operations/profileAPI"
import InstructorChart from "./InstructorChart"
import { Link } from "react-router-dom"

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

      if (instructorApiData && instructorApiData.courses) {
        setInstructorData(instructorApiData)
      }

      if (Array.isArray(result)) {
        setCourses(result)
      }

      setLoading(false)
    }

    if (user?._id && token) fetchData()
  }, [token, user])

  useEffect(() => {
    if (instructorData?.courses?.length > 0) {
      const totalStudents = instructorData.courses.reduce(
        (acc, course) => acc + (course.studentsEnrolled?.length || 0),
        0
      )

      const totalAmount = instructorData.courses.reduce(
        (acc, course) =>
          acc + course.price * (course.studentsEnrolled?.length || 0),
        0
      )

      setTotalStudents(totalStudents)
      setTotalAmount(totalAmount)
    } else {
      setTotalStudents(0)
      setTotalAmount(0)
    }
  }, [instructorData])

  return (
    <div className="px-4 md:px-0">
      {/* Header Section */}
      <div className="space-y-2 mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-richblack-300">
          Hi {user?.firstName || "Instructor"} 👋
        </h1>
        <p className="text-sm md:text-base font-medium text-gray-300">
          Let's start something new
        </p>
      </div>

      {loading ? (
        <div className="spinner mt-10"></div>
      ) : courses.length > 0 ? (
        <div className="space-y-6">
          {/* Chart + Stats Section */}
          <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
            {/* Chart Section */}
            <div className="flex-1 min-h-[300px] md:min-h-[400px] xl:min-h-[450px]">
              {totalAmount > 0 || totalStudents > 0 ? (
                <InstructorChart courses={courses} />
              ) : (
                <div className="h-full rounded-md bg-richblack-800 p-4 md:p-6 flex flex-col justify-center">
                  <p className="text-base md:text-lg font-bold text-white">Visualize</p>
                  <p className="mt-4 text-lg md:text-xl font-medium text-slate-300">
                    Not Enough Data To Visualize
                  </p>
                </div>
              )}
            </div>

            {/* Stats Panel */}
            <div className="w-full xl:min-w-[250px] xl:max-w-[300px] rounded-md bg-richblack-800 p-4 md:p-6">
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-richblack-300 mb-4">
                Statistics
              </p>
              <div className="grid grid-cols-3 xl:grid-cols-1 gap-4 xl:space-y-4 xl:gap-0">
                <div className="text-center xl:text-left">
                  <p className="text-sm md:text-base lg:text-lg text-white">Total Courses</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-300">
                    {courses.length}
                  </p>
                </div>
                <div className="text-center xl:text-left">
                  <p className="text-sm md:text-base lg:text-lg text-white">Total Students</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-300">
                    {totalStudents}
                  </p>
                </div>
                <div className="text-center xl:text-left">
                  <p className="text-sm md:text-base lg:text-lg text-white">Total Income</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-300">
                    ₹ {totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Courses Section */}
          <div className="rounded-md bg-richblack-800 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
              <p className="text-lg md:text-xl font-bold text-richblack-300">
                Your Recent 3 Courses
              </p>
              <Link 
                to="/dashboard/instructor-courses"
                className="self-start sm:self-auto"
              >
                <p className="text-xs md:text-sm font-semibold text-yellow-50 hover:text-yellow-100 transition-colors">
                  View All
                </p>
              </Link>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course._id}
                  className="rounded-md bg-slate-700 p-3 md:p-4 hover:bg-slate-600 transition-colors duration-200"
                >
                  <div className="aspect-video w-full mb-3">
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-full w-full rounded-md object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm md:text-base font-medium text-richblack-300 line-clamp-2">
                      {course.courseName}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs md:text-sm">
                      <span className="font-medium text-richblack-300">
                        {course.studentsEnrolled.length} student{course.studentsEnrolled.length !== 1 ? 's' : ''}
                      </span>
                      <span className="hidden sm:inline text-richblack-300">|</span>
                      <span className="font-medium text-richblack-300">
                        ₹ {course.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show message if less than 3 courses */}
            {courses.length < 3 && (
              <div className="mt-6 p-4 bg-richblack-700 rounded-md">
                <p className="text-center text-sm md:text-base text-richblack-300">
                  Create more courses to fill up your dashboard
                </p>
                <Link to="/dashboard/add-course">
                  <p className="text-center text-sm md:text-base font-semibold text-yellow-50 hover:text-yellow-100 transition-colors mt-2">
                    Add New Course
                  </p>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No Courses State */
        <div className="mt-12 md:mt-20 rounded-md bg-richblack-800 p-6 md:p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-xl md:text-2xl font-bold text-richblack-300">
              You have not created any courses yet
            </p>
            <p className="text-sm md:text-base text-gray-400">
              Start your teaching journey by creating your first course
            </p>
            <Link to="/dashboard/add-course">
              <button className="mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-richblack-900 font-semibold rounded-md transition-colors duration-200">
                Create Your First Course
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}