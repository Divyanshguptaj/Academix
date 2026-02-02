import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import { fetchFullCourseDetails, setCompletedLectures, setCourseSectionData, setEntireCourseData, setTotalNoOfLectures } from "../slices/viewCourseSlice"
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
        const courseData = await dispatch(fetchFullCourseDetails(courseId)).unwrap()
        console.log("Course Data here... ", courseData)
        if (courseData) {
          dispatch(setCourseSectionData(courseData._doc.courseContent))
          dispatch(setEntireCourseData(courseData._doc))

          const studentsEnrolled = courseData._doc.studentsEnrolled;
          const student = studentsEnrolled.find(student => student._id.toString() === userId);
          console.log("printing Student", student)
          if (student) {
            const courseProgress = student.courseProgress;
            const progressEntry = courseProgress.find(progress => progress.courseID.toString() === courseData._doc._id.toString());

            if (progressEntry) {
              console.log("printing progressEntry", progressEntry);
              dispatch(setCompletedLectures(progressEntry.completedVideos));
            } else {
              console.warn("No progress entry found for this course.");
              dispatch(setCompletedLectures([])); 
            }
          } else {
            console.warn("User is not enrolled in this course.");
            dispatch(setCompletedLectures([]));
          }

          let lectures = 0
          courseData?._doc?.courseContent?.forEach((sec) => {
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