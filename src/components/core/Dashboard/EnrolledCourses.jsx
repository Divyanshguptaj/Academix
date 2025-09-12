import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"

export default function EnrolledCourses(){
  const { token } = useSelector((state) => state.auth)  
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)

  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(user._id, token);
      console.log(res);
      setEnrolledCourses(res);
    } catch (error) {
      console.log("Could not fetch enrolled courses.")
    }
  };

  useEffect(() => {
    getEnrolledCourses();
  }, [])

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
          {/* Headings - Hidden on mobile, shown on medium screens and up */}
          <div className="hidden md:flex rounded-t-lg bg-richblack-500">
            <p className="w-[45%] px-5 py-3">Course Name</p>
            <p className="w-1/4 px-2 py-3">Duration</p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>
          
          {/* Course Cards */}
          {enrolledCourses.map((course, i, arr) => (
            <div
              className={`flex flex-col md:flex-row items-start md:items-center border border-richblack-700 rounded-md p-4 mb-4 ${
                i === arr.length - 1 ? "mb-0" : "mb-4"
              }`}
              key={i}
            >
              {/* Course Image and Info */}
              <div
                className="flex w-full md:w-[45%] cursor-pointer items-start gap-4 mb-4 md:mb-0"
                onClick={() => {
                  navigate(
                    `/view-course/${course?._id}/section/${course.courseContent?.[0]._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                  )
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
                    {course.courseDescription.length > 60
                      ? `${course.courseDescription.slice(0, 60)}...`
                      : course.courseDescription}
                  </p>
                </div>
              </div>
              
              {/* Duration and Progress - Stacked on mobile, inline on desktop */}
              <div className="flex flex-col sm:flex-row w-full md:w-[55%] gap-4 md:gap-0">
                {/* Duration */}
                <div className="w-full sm:w-1/4 px-0 sm:px-2 py-1 sm:py-3">
                  <p className="text-xs text-richblack-400 md:hidden">Duration:</p>
                  <p className="text-sm sm:text-base text-white">{course?.totalDurationInMinutes} min</p>
                </div>
                
                {/* Progress */}
                <div className="w-full sm:flex-1 px-0 sm:px-2 py-1 sm:py-3">
                  <p className="text-sm sm:text-base mb-1">Progress: {course.progressPercentage || 0}%</p>
                  <ProgressBar
                    completed={course.progressPercentage || 0}
                    height="8px"
                    isLabelVisible={false}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}