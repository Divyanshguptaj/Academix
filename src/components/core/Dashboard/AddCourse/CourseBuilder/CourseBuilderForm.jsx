import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import {
  createSection,
  updateSection,
} from "../../../../../services/operations/courseDetailsAPI"
import {
  setCourse,
  setEditCourse,
  setStep,
} from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import NestedView from "./NestedView"

export default function CourseBuilderForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [editSectionName, setEditSectionName] = useState(null)
  const dispatch = useDispatch()

  // handle form submission
  const onSubmit = async (data) => {
    setLoading(true)

    let result;
    
    if (editSectionName) {
      result = await updateSection(
        {
          sectionName: data.sectionName,
          sectionId: editSectionName,
          courseId: course._id,
        },
        // token
      )
      console.log("edit", result)
    } else {
      result = await createSection(
        {
          sectionName: data.sectionName,
          courseId: course._id,
        },
        // token
      )
      // console.log("result" ,result)
    }
    if (result) {
      dispatch(setCourse(result))
      setEditSectionName(null)
      setValue("sectionName", "")
    }
    setLoading(false)
  }

  // updateSection
  const cancelEdit = () => {
    setEditSectionName(null)
    setValue("sectionName", "")
  }

  const handleChangeEditSectionName = (sectionId, sectionName) => {
    console.log(editSectionName, sectionId, sectionName);
    if (editSectionName === sectionId) {
      cancelEdit()
      return
    }
    setEditSectionName(sectionId)
    setValue("sectionName", sectionName)
  }

  const goToNext = () => {
    console.log("Course Content:", course.courseContent);
    if (course.courseContent.length === 0) {
      toast.error("Please add atleast one section")
      return
    }
    if (course.courseContent.some((section) => section.subSection.length === 0)) {
      toast.error("Please add atleast one lecture in each section")
      return
    }
    dispatch(setStep(3))
  }

  const goBack = () => {
    dispatch(setStep(1))
    dispatch(setEditCourse(true))
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-6 sm:space-y-8 rounded-lg border border-richblack-800 bg-richblack-800 p-4 sm:p-6 lg:p-8 shadow-lg">
        
        {/* Header */}
        <div className="border-b border-richblack-600 pb-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-richblack-300">
            Course Builder
          </h2>
          <p className="text-sm text-white/50 mt-2">
            Create sections and organize your course content
          </p>
        </div>

        {/* Section Creation Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          
          {/* Input Field */}
          <div className="space-y-2">
            <label 
              className="block text-sm font-medium text-richblack-300" 
              htmlFor="sectionName"
            >
              Section Name <sup className="text-pink-200">*</sup>
            </label>
            <input
              id="sectionName"
              disabled={loading}
              placeholder="Add a section to build your course"
              {...register("sectionName", { required: true })}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-richblack-900 border border-richblack-600 rounded-lg text-richblack-300 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            />
            {errors.sectionName && (
              <p className="text-xs sm:text-sm text-pink-200 mt-1 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-pink-200 rounded-full"></span>
                Section name is required
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <IconBtn
                type="submit"
                disabled={loading}
                text={editSectionName ? "Update Section" : "Create Section"}
                outline={true}
                className="w-full sm:w-auto min-w-[140px]"
              >
                <IoAddCircleOutline size={18} className="text-yellow-50" />
              </IconBtn>
            </div>
            
            {editSectionName && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm text-white/50 hover:text-richblack-300 underline transition-colors duration-200 text-center sm:text-left"
                disabled={loading}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Course Content Sections */}
        {course.courseContent.length > 0 && (
          <div className="space-y-4">
            <div className="border-t border-richblack-600 pt-6">
              <h3 className="text-lg font-medium text-richblack-300 mb-4">
                Course Sections ({course.courseContent.length})
              </h3>
              <div className="bg-richblack-900 rounded-lg p-2 sm:p-4">
                <NestedView 
                  handleChangeEditSectionName={handleChangeEditSectionName} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {course.courseContent.length === 0 && (
          <div className="text-center py-8 sm:py-12 border-t border-richblack-600">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-richblack-800 rounded-full flex items-center justify-center">
                <IoAddCircleOutline size={32} className="text-white/50" />
              </div>
              <h3 className="text-lg font-medium text-richblack-300 mb-2">
                No sections yet
              </h3>
              <p className="text-sm text-white/50">
                Create your first section to start building your course content
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="border-t border-richblack-600 pt-6">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-between">
            
            {/* Back Button */}
            <button
              onClick={goBack}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-richblack-600 hover:bg-richblack-500 text-richblack-300 hover:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back to Course Information
            </button>

            {/* Next Button */}
            <div className="w-full sm:w-auto">
              <IconBtn 
                disabled={loading || course.courseContent.length === 0} 
                text="Continue to Publish"
                onclick={goToNext}
                className="w-full sm:w-auto min-w-[160px] justify-center"
              >
                <MdNavigateNext size={20} />
              </IconBtn>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 text-center">
            <p className="text-xs text-white/50">
              {course.courseContent.length > 0 ? (
                <>
                  {course.courseContent.length} section{course.courseContent.length !== 1 ? 's' : ''} created
                  {course.courseContent.some((section) => section.subSection.length === 0) && (
                    <span className="text-pink-200 ml-2">
                      • Add lectures to continue
                    </span>
                  )}
                </>
              ) : (
                "Add at least one section to continue"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}