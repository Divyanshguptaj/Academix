import { useEffect, useState } from "react"
import { VscAdd } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import IconBtn from "../../common/IconBtn"
import CoursesTable from "./InstructorCourses/CoursesTable"

export default function MyCourses() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])

  useEffect(() => {
    const fetchCourses = async () => {
      const result = await fetchInstructorCourses(user._id)
      if (result) {
        setCourses(result)
      }
    }
    fetchCourses()
  }, [])

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8 sm:mb-12 lg:mb-14">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-richblack-300 leading-tight">
            My Courses
          </h1>
          
          {/* Add Course Button */}
          <div className="flex-shrink-0 self-start sm:self-auto">
            <IconBtn
              text="Add Course"
              onclick={() => navigate("/dashboard/add-courses")}
              className="w-full sm:w-auto min-w-[140px]"
            >
              <VscAdd className="text-lg" />
            </IconBtn>
          </div>
        </div>
      </div>

      {/* Courses Table Section */}
      <div className="w-full">
        {courses && courses.length > 0 ? (
          <div className="overflow-x-auto">
            <CoursesTable courses={courses} setCourses={setCourses} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
            <div className="text-center max-w-md mx-auto">
              <h2 className="text-lg sm:text-xl font-medium text-richblack-300 mb-2">
                No courses found
              </h2>
              <p className="text-sm sm:text-base text-richblack-400 mb-6">
                Start creating your first course to share knowledge with students.
              </p>
              <IconBtn
                text="Create Your First Course"
                onclick={() => navigate("/dashboard/add-courses")}
                className="mx-auto"
              >
                <VscAdd />
              </IconBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}