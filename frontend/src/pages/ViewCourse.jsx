import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import { setCompletedLectures, setCourseSectionData, setEntireCourseData, setTotalNoOfLectures } from "../slices/viewCourseSlice"
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
import { Outlet } from "react-router-dom"
export default function ViewCourse() {
  const { courseId } = useParams()
  // const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)

  useEffect(() => {
    ;(async () => {
      console.log("Course ID:", courseId)
      const userId = user._id;
      try {

        const courseData = await getFullDetailsOfCourse(courseId)
        console.log("Course Data here... ", courseData)
        if (courseData) {
          dispatch(setCourseSectionData(courseData.courseContent))
          dispatch(setEntireCourseData(courseData))

          // Prefer compact progress data added by course-service: `studentsProgress`
          const studentsProgress = courseData.studentsProgress || [];
          const progressEntry = studentsProgress.find(p => p.userId.toString() === userId);
          if (progressEntry) {
            dispatch(setCompletedLectures(progressEntry.completedVideos || []));
          } else {
            // Fallback: if studentsProgress not provided, try to find in studentsEnrolled array (legacy)
            const studentsEnrolled = courseData.studentsEnrolled || [];
            const student = studentsEnrolled.find(student => String(student._id) === String(userId));
            if (student && student.courseProgress) {
              const legacyProgress = student.courseProgress.find(p => p.courseID && String(p.courseID) === String(courseData._id));
              if (legacyProgress) {
                dispatch(setCompletedLectures(legacyProgress.completedVideos || []));
              } else {
                dispatch(setCompletedLectures([]));
              }
            } else {
              dispatch(setCompletedLectures([]));
            }
          }

          let lectures = 0
          courseData?.courseContent?.forEach((sec) => {
            lectures += sec.subSection.length
          })
          console.log(lectures)
          dispatch(setTotalNoOfLectures(lectures))
        }
      } catch (error) {
        console.error("Failed to fetch course details", error)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, courseId, user._id])

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)] bg-richblack-900">
        <VideoDetailsSidebar setReviewModal={setReviewModal} />
        <div className="flex-1 overflow-auto">
          <div className="mx-8 sm:mx-6 mt-4 lg:mx-8 sm:px-0">
            <Outlet />
          </div>
        </div>
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}