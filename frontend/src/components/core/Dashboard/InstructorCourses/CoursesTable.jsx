import { useDispatch, useSelector } from "react-redux"
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css"
import { useEffect, useState } from "react"
import { FaCheck } from "react-icons/fa"
import { FiEdit2 } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"
import {
  deleteCourse,
  fetchInstructorCourses,
} from "../../../../services/operations/courseDetailsAPI"
import { COURSE_STATUS } from "../../../../utils/constants"
import ConfirmationModal from "../../../common/ConfirmationModal"

export default function CoursesTable({ courses, setCourses }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [loading, setLoading] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const TRUNCATE_LENGTH = 30

  const handleCourseDelete = async (courseId) => {
    setLoading(true)
    await deleteCourse({ courseId: courseId })
    const result = await fetchInstructorCourses(user._id)
    if (result) {
      setCourses(result)
    }
    setConfirmationModal(null)
    setLoading(false)
  }

  // Mobile card layout for small screens
  const MobileCard = ({ course }) => (
    <div className="bg-richblack-800 rounded-lg p-4 mb-4 shadow-md border border-richblack-700">
      {/* Course Image and Basic Info */}
      <div className="flex gap-3 mb-4">
        <img
          src={course?.thumbnail}
          alt={course?.courseName}
          className="h-16 w-20 sm:h-20 sm:w-28 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-richblack-300 mb-1 line-clamp-2">
            {course.courseName}
          </h3>
          <p className="text-xs sm:text-sm text-white/50 line-clamp-2 mb-2">
            {course.courseDescription.split(" ").length > 15
              ? course.courseDescription
                  .split(" ")
                  .slice(0, 15)
                  .join(" ") + "..."
              : course.courseDescription}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        {course.status === COURSE_STATUS.DRAFT ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-richblack-700 px-2 py-1 text-xs font-medium text-pink-400">
            <HiClock size={12} />
            Drafted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-richblack-700 px-2 py-1 text-xs font-medium text-yellow-400">
            <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-yellow-400 text-slate-800">
              <FaCheck size={6} />
            </div>
            Published
          </span>
        )}
      </div>

      {/* Course Details */}
      <div className="flex justify-between items-center text-sm text-richblack-300 mb-3">
        <span>Duration: <span className="font-medium">2hr 30min</span></span>
        <span>Price: <span className="font-medium">₹{course.price}</span></span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
          className="flex-1 flex items-center justify-center gap-2 bg-caribbeangreen-600 hover:bg-caribbeangreen-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
        >
          <FiEdit2 size={16} />
          Edit
        </button>
        <button
          disabled={loading}
          onClick={() => {
            setConfirmationModal({
              text1: "Do you want to delete this course?",
              text2: "All the data related to this course will be deleted",
              btn1Text: !loading ? "Delete" : "Loading...",
              btn2Text: "Cancel",
              btn1Handler: !loading
                ? () => handleCourseDelete(course._id)
                : () => {},
              btn2Handler: !loading
                ? () => setConfirmationModal(null)
                : () => {},
            })
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
        >
          <RiDeleteBin6Line size={16} />
          Delete
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Layout (< 768px) */}
      <div className="block md:hidden">
        {courses?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl font-medium text-richblack-300">
              No courses found
            </p>
          </div>
        ) : (
          <div>
            {courses?.map((course) => (
              <MobileCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop/Tablet Layout (>= 768px) */}
      <div className="hidden md:block">
        <Table className="w-full border border-richblack-700 rounded-lg overflow-hidden shadow-md">
          <Thead className="bg-richblack-800 text-white">
            <Tr className="flex gap-x-6 border-b border-richblack-700 px-4 lg:px-6 py-3">
              <Th className="flex-1 text-left text-sm font-semibold uppercase tracking-wider">
                Courses
              </Th>
              <Th className="text-left text-sm font-semibold uppercase tracking-wider min-w-[80px]">
                Duration
              </Th>
              <Th className="text-left text-sm font-semibold uppercase tracking-wider min-w-[80px]">
                Price
              </Th>
              <Th className="text-left text-sm font-semibold uppercase tracking-wider min-w-[100px]">
                Actions
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {courses?.length === 0 ? (
              <Tr>
                <Td className="py-10 text-center text-xl font-medium text-richblack-300 col-span-4">
                  No courses found
                </Td>
              </Tr>
            ) : (
              courses?.map((course) => (
                <Tr
                  key={course._id}
                  className="flex gap-x-6 border-b border-richblack-800 px-4 lg:px-6 py-6"
                >
                  <Td className="flex flex-1 gap-x-3 lg:gap-x-4 min-w-0">
                    <img
                      src={course?.thumbnail}
                      alt={course?.courseName}
                      className="h-20 w-28 lg:h-24 lg:w-32 xl:h-[148px] xl:w-[220px] rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col justify-between min-w-0 flex-1">
                      <div>
                        <p className="text-sm lg:text-base xl:text-lg font-semibold text-richblack-300 mb-2 line-clamp-2">
                          {course.courseName}
                        </p>
                        <p className="text-xs text-white/50 mb-3 line-clamp-3">
                          {course.courseDescription.split(" ").length > TRUNCATE_LENGTH
                            ? course.courseDescription
                                .split(" ")
                                .slice(0, TRUNCATE_LENGTH)
                                .join(" ") + "..."
                            : course.courseDescription}
                        </p>
                      </div>
                      
                      {/* Status Badge */}
                      <div>
                        {course.status === COURSE_STATUS.DRAFT ? (
                          <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-1 text-xs font-medium text-pink-400">
                            <HiClock size={12} />
                            Drafted
                          </p>
                        ) : (
                          <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-1 text-xs font-medium text-yellow-400">
                            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-400 text-slate-800">
                              <FaCheck size={8} />
                            </div>
                            Published
                          </p>
                        )}
                      </div>
                    </div>
                  </Td>
                  
                  <Td className="text-sm font-medium text-richblack-300 flex items-center min-w-[80px]">
                    2hr 30min
                  </Td>
                  
                  <Td className="text-sm font-medium text-richblack-300 flex items-center min-w-[80px]">
                    ₹{course.price}
                  </Td>
                  
                  <Td className="text-sm font-medium text-richblack-300 flex items-center gap-2 min-w-[100px]">
                    <button
                      disabled={loading}
                      onClick={() => {
                        navigate(`/dashboard/edit-course/${course._id}`)
                      }}
                      title="Edit"
                      className="p-2 transition-all duration-200 hover:scale-110 hover:text-caribbeangreen-300 rounded-full hover:bg-richblack-700"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => {
                        setConfirmationModal({
                          text1: "Do you want to delete this course?",
                          text2: "All the data related to this course will be deleted",
                          btn1Text: !loading ? "Delete" : "Loading...",
                          btn2Text: "Cancel",
                          btn1Handler: !loading
                            ? () => handleCourseDelete(course._id)
                            : () => {},
                          btn2Handler: !loading
                            ? () => setConfirmationModal(null)
                            : () => {},
                        })
                      }}
                      title="Delete"
                      className="p-2 transition-all duration-200 hover:scale-110 hover:text-red-500 rounded-full hover:bg-richblack-700"
                    >
                      <RiDeleteBin6Line size={18} />
                    </button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </div>
      
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}