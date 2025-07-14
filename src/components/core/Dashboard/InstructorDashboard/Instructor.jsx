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
    <div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-richblack-300">
          Hi {user?.firstName || "Instructor"} 👋
        </h1>
        <p className="font-medium text-gray-300">Let's start something new</p>
      </div>

      {loading ? (
        <div className="spinner mt-10"></div>
      ) : courses.length > 0 ? (
        <div>
          {/* Chart + Stats */}
          <div className="my-4 flex h-[450px] space-x-4">
            {totalAmount > 0 || totalStudents > 0 ? (
              <InstructorChart courses={courses} />
            ) : (
              <div className="flex-1 rounded-md bg-richblack-800 p-6">
                <p className="text-lg font-bold text-white">Visualize</p>
                <p className="mt-4 text-xl font-medium text-slate-300">
                  Not Enough Data To Visualize
                </p>
              </div>
            )}

            {/* Stats Panel */}
            <div className="flex min-w-[250px] flex-col rounded-md bg-richblack-800 p-6">
              <p className="text-2xl font-bold text-richblack-300">Statistics</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-lg text-white">Total Courses</p>
                  <p className="text-3xl font-semibold text-slate-300">
                    {courses.length}
                  </p>
                </div>
                <div>
                  <p className="text-lg text-white">Total Students</p>
                  <p className="text-3xl font-semibold text-slate-300">
                    {totalStudents}
                  </p>
                </div>
                <div>
                  <p className="text-lg text-white">Total Income</p>
                  <p className="text-3xl font-semibold text-slate-300">
                    ₹ {totalAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top 3 Courses */}
          <div className="rounded-md bg-richblack-800 p-6">
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-richblack-300">Your Recent 3 Courses</p>
              <Link to="/dashboard/instructor-courses">
                <p className="text-xs font-semibold text-yellow-50">View All</p>
              </Link>
            </div>
            <div className="my-4 flex items-start space-x-6">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course._id}
                  className="w-1/3 rounded-md bg-slate-700 p-3"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-[201px] w-full rounded-md object-cover"
                  />
                  <div className="mt-3 w-full">
                    <p className="text-md font-medium text-richblack-300">
                      {course.courseName}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-xs font-medium text-richblack-300">
                        {course.studentsEnrolled.length} students
                      </p>
                      <p className="text-xs font-medium text-richblack-300">|</p>
                      <p className="text-xs font-medium text-richblack-300">
                        ₹ {course.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-20 rounded-md bg-richblack-800 p-6 py-20">
          <p className="text-center text-2xl font-bold text-richblack-300">
            You have not created any courses yet
          </p>
          <Link to="/dashboard/add-course">
            <p className="mt-1 text-center text-lg font-semibold text-yellow-50">
              Create a course
            </p>
          </Link>
        </div>
      )}
    </div>
  )
}
