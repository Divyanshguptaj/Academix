import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { HiOutlineCurrencyRupee } from "react-icons/hi"
import { MdNavigateNext } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux"
import { addCourseDetails, editCourseDetails, fetchCourseCategories } from "../../../../../services/operations/courseDetailsAPI"
import { setCourse, setStep } from "../../../../../slices/courseSlice"
import { COURSE_STATUS } from "../../../../../utils/constants"
import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload"
import ChipInput from "./ChipInput"
import RequirementsField from "./RequirementField"

const DRAFT_KEY = "academix_course_draft_step1"

export default function CourseInformationForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.profile)
  const { course, editCourse } = useSelector((state) => state.course)
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [courseCategories, setCourseCategories] = useState([])

  useEffect(() => {
    const getCategories = async () => {
      setCategoriesLoading(true)
      try {
        const categories = await fetchCourseCategories()
        setCourseCategories(categories ?? [])
      } finally {
        setCategoriesLoading(false)
      }
    }

    // if form is in edit mode
    if (editCourse) {
      // Extract course data from either _doc property or direct properties
      const courseData = course._doc || course;
      
      setValue("courseTitle", courseData.courseName)
      setValue("courseShortDesc", courseData.courseDescription)
      setValue("coursePrice", courseData.price)
      setValue("courseTags", courseData.tag)
      setValue("courseBenefits", courseData.whatYouWillLearn)
      setValue("courseCategory", courseData.category?._id ?? courseData.category)
      setValue("courseRequirements", courseData.instructions)
      setValue("courseImage", courseData.thumbnail)
    }
    getCategories()

    // Restore localStorage draft only when creating a brand-new course
    // (skip if editCourse=true, which means the form is populated from the course object above)
    if (!editCourse) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
          const data = JSON.parse(saved)
          if (data.courseTitle)                setValue("courseTitle", data.courseTitle)
          if (data.courseShortDesc)            setValue("courseShortDesc", data.courseShortDesc)
          if (data.coursePrice)                setValue("coursePrice", data.coursePrice)
          if (data.courseBenefits)             setValue("courseBenefits", data.courseBenefits)
          if (data.courseTags?.length)         setValue("courseTags", data.courseTags)
          if (data.courseRequirements?.length) setValue("courseRequirements", data.courseRequirements)
          toast.success("Draft restored", { duration: 2000, icon: "📝" })
        }
      } catch { /* ignore bad JSON */ }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save form values to localStorage (new course only, debounced 800ms)
  const watchedValues = watch()
  useEffect(() => {
    if (editCourse) return
    const t = setTimeout(() => {
      const { courseImage, ...saveable } = watchedValues // skip File objects
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable)) } catch { /* quota full */ }
    }, 800)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues), editCourse])

  const isFormUpdated = () => {
    const currentValues = getValues()
    // Extract course data from either _doc property or direct properties
    const courseData = course._doc || course;
    
    if (
      currentValues.courseTitle !== courseData.courseName ||
      currentValues.courseShortDesc !== courseData.courseDescription ||
      currentValues.coursePrice !== courseData.price ||
      currentValues.courseTags.toString() !== courseData.tag.toString() ||
      currentValues.courseBenefits !== courseData.whatYouWillLearn ||
      currentValues.courseCategory._id !== courseData.category._id ||
      currentValues.courseRequirements.toString() !==
        courseData.instructions.toString() ||
      currentValues.courseImage !== courseData.thumbnail
    ) {
      return true
    }
    return false
  }

  //   handle next button click
  const onSubmit = async (data) => {

    if (editCourse) {
      if (isFormUpdated()) {
        const currentValues = getValues()
        // Extract course data from either _doc property or direct properties
        const courseData = course._doc || course;
        
        const formData = new FormData()
        formData.append("courseId", courseData._id)
        if (currentValues.courseTitle !== courseData.courseName) {
          formData.append("courseName", data.courseTitle)
        }
        if (currentValues.courseShortDesc !== courseData.courseDescription) {
          formData.append("courseDescription", data.courseShortDesc)
        }
        if (currentValues.coursePrice !== courseData.price) {
          formData.append("price", data.coursePrice)
        }
        if (currentValues.courseTags.toString() !== courseData.tag.toString()) {
          formData.append("tag", JSON.stringify(data.courseTags))
        }
        if (currentValues.courseBenefits !== courseData.whatYouWillLearn) {
          formData.append("whatYouWillLearn", data.courseBenefits)
        }
        if (currentValues.courseCategory._id !== courseData.category._id) {
          formData.append("category", data.courseCategory)
        }
        if (
          currentValues.courseRequirements.toString() !==
          courseData.instructions.toString()
        ) {
          formData.append(
            "instructions",
            JSON.stringify(data.courseRequirements)
          )
        }
        if (currentValues.courseImage !== courseData.thumbnail) {
          formData.append("thumbnailImage", data.courseImage)
        }
        formData.append("email", user.email);
        setLoading(true)
        const result = await editCourseDetails(formData)
        setLoading(false)
        if (result) {
          dispatch(setStep(2))
          // Preserve existing sections — editCourse only updates metadata fields
          dispatch(setCourse({
            ...result,
            courseContent: result.courseContent?.length > 0
              ? result.courseContent
              : course?.courseContent ?? [],
          }))
        }
      } else {
        toast.error("No changes made to the form")
      }
      return
    }

    const formData = new FormData()
    formData.append("courseName", data.courseTitle)
    formData.append("courseDescription", data.courseShortDesc)
    formData.append("price", data.coursePrice)
    formData.append("tag", JSON.stringify(data.courseTags))
    formData.append("whatYouWillLearn", data.courseBenefits)
    formData.append("category", data.courseCategory)
    formData.append("status", COURSE_STATUS.DRAFT)
    formData.append("instructions", JSON.stringify(data.courseRequirements))
    formData.append("thumbnailImage", data.courseImage)
    formData.append("email", user.email);
    setLoading(true)
    const result = await addCourseDetails(formData)
    if (result) {
      localStorage.removeItem(DRAFT_KEY)
      dispatch(setStep(2))
      dispatch(setCourse(result))
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-md border-[1px] border-richblack-800 bg-richblack-800 p-4 sm:space-y-8 sm:p-6"
    >
      {/* Course Title */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-300" htmlFor="courseTitle">
          Course Title <sup className="text-pink-200">*</sup>
        </label>
        <input
          id="courseTitle"
          placeholder="Enter Course Title"
          {...register("courseTitle", { required: true })}
          className="form-style w-full bg-richblack-800 rounded-md text-white border border-richblack-600 p-2 text-sm sm:text-base"
        />
        {errors.courseTitle && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course title is required
          </span>
        )}
      </div>
      
      {/* Course Short Description */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-300" htmlFor="courseShortDesc">
          Course Short Description <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseShortDesc"
          placeholder="Enter Description"
          {...register("courseShortDesc", { required: true })}
          className="form-style resize-x-none min-h-[100px] w-full bg-richblack-800 rounded-md text-white border border-richblack-600 p-2 text-sm sm:text-base sm:min-h-[130px]"
        />
        {errors.courseShortDesc && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course Description is required
          </span>
        )}
      </div>
      
      {/* Course Price */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-300" htmlFor="coursePrice">
          Course Price <sup className="text-pink-200">*</sup>
        </label>
        <div className="relative">
          <input
            id="coursePrice"
            placeholder="Enter Course Price"
            {...register("coursePrice", {
              required: true,
              valueAsNumber: true,
              pattern: {
                value: /^(0|[1-9]\d*)(\.\d+)?$/,
              },
            })}
            className="form-style w-full !pl-10 bg-richblack-800 rounded-md text-white border border-richblack-600 p-2 text-sm sm:text-base sm:!pl-12"
          />
          <HiOutlineCurrencyRupee className="absolute left-2 top-1/2 inline-block -translate-y-1/2 text-xl text-richblack-300 sm:left-3 sm:text-2xl" />
        </div>
        {errors.coursePrice && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course Price is required
          </span>
        )}
      </div>
      
      {/* Course Category */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-300" htmlFor="courseCategory">
          Course Category <sup className="text-pink-200">*</sup>
        </label>
        <select
          {...register("courseCategory", { required: true })}
          defaultValue=""
          id="courseCategory"
          disabled={categoriesLoading}
          className="form-style w-full bg-richblack-800 rounded-md text-white border border-richblack-600 p-2 text-sm sm:text-base disabled:opacity-60"
        >
          <option value="" disabled className="bg-richblack-800 text-white">
            {categoriesLoading ? "Loading categories…" : "Choose a Category"}
          </option>
          {courseCategories.map((category, indx) => (
            <option key={indx} value={category?._id} className="bg-richblack-800 text-white">
              {category?.name}
            </option>
          ))}
        </select>
        {errors.courseCategory && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course Category is required
          </span>
        )}
      </div>
      
      {/* Course Tags */}
      <ChipInput
        label="Tags"
        name="courseTags"
        placeholder="Enter Tags and press Enter"
        register={register}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
      />
      
      {/* Course Thumbnail Image */}
      <Upload
        name="courseImage"
        label="Course Thumbnail"
        register={register}
        setValue={setValue}
        errors={errors}
        editData={editCourse ? (course._doc || course)?.thumbnail : null}
      />
      
      {/* Benefits of the course */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-300" htmlFor="courseBenefits">
          Benefits of the course <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseBenefits"
          placeholder="Enter benefits of the course"
          {...register("courseBenefits", { required: true })}
          className="form-style resize-x-none min-h-[100px] w-full bg-richblack-800 rounded-md text-white border border-richblack-600 p-2 text-sm sm:text-base sm:min-h-[130px]"
        />
        {errors.courseBenefits && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Benefits of the course is required
          </span>
        )}
      </div>
      
      {/* Requirements/Instructions */}
      <RequirementsField
        name="courseRequirements"
        label="Requirements/Instructions"
        register={register}
        setValue={setValue}
        errors={errors}
        getValues={getValues}
      />
      
      {/* Next Button */}
      <div className="flex flex-col-reverse gap-3 justify-end sm:flex-row sm:gap-x-2">
        {editCourse && (
          <button
            onClick={() => dispatch(setStep(2))}
            disabled={loading}
            className={`flex cursor-pointer items-center justify-center gap-x-2 rounded-md bg-richblack-300 py-2 px-4 font-semibold text-richblack-900 text-sm sm:text-base sm:py-[8px] sm:px-[20px]`}
          >
            Continue Without Saving
          </button>
        )}
        <IconBtn
          disabled={loading}
          text={!editCourse ? "Next" : "Save Changes"}
          customClasses="w-full sm:w-auto"
        >
          <MdNavigateNext />
        </IconBtn>
      </div>
    </form>
  )
}