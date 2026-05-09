import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {
  createSubSection,
  updateSubSection,
  uploadVideoToCloudinary,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload"

export default function SubSectionModal({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm()

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const { course } = useSelector((state) => state.course)

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title)
      setValue("lectureDesc", modalData.description)
      setValue("lectureVideo", modalData.videoURL)
    }
  }, [])

  const isFormUpdated = () => {
    const cur = getValues()
    return (
      cur.lectureTitle !== modalData.title ||
      cur.lectureDesc !== modalData.description ||
      cur.lectureVideo !== modalData.videoURL
    )
  }

  const handleEditSubsection = async () => {
    const cur = getValues()
    setLoading(true)

    let videoURL = undefined
    let timeDuration = undefined

    if (cur.lectureVideo instanceof File) {
      setUploadProgress(0)
      try {
        const uploaded = await uploadVideoToCloudinary(cur.lectureVideo, setUploadProgress)
        videoURL = uploaded.videoURL
        timeDuration = uploaded.timeDuration
      } catch (err) {
        toast.error(err.message || "Video upload failed — please try again")
        setLoading(false)
        setUploadProgress(null)
        return
      }
    }

    const payload = {
      subSectionId: modalData._id,
      sectionId: modalData.sectionId,
      courseId: course._id,
    }
    if (cur.lectureTitle !== modalData.title) payload.title = cur.lectureTitle
    if (cur.lectureDesc !== modalData.description) payload.description = cur.lectureDesc
    if (videoURL !== undefined) {
      payload.videoURL = videoURL
      payload.timeDuration = timeDuration
    }

    const result = await updateSubSection(payload)
    if (result) dispatch(setCourse(result))
    setModalData(null)
    setLoading(false)
  }

  const onSubmit = async (data) => {
    if (view) return

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form")
      } else {
        handleEditSubsection()
      }
      return
    }

    if (!data.lectureTitle) {
      toast.error("Lecture title is required")
      return
    }

    setLoading(true)

    let videoURL = null
    let timeDuration = 0

    if (data.lectureVideo instanceof File) {
      setUploadProgress(0)
      try {
        const uploaded = await uploadVideoToCloudinary(data.lectureVideo, setUploadProgress)
        videoURL = uploaded.videoURL
        timeDuration = uploaded.timeDuration
      } catch (err) {
        toast.error(err.message || "Video upload failed — please try again")
        setLoading(false)
        setUploadProgress(null)
        return
      }
    }

    const result = await createSubSection({
      sectionId: modalData,
      title: data.lectureTitle,
      description: data.lectureDesc || "",
      courseId: course._id,
      videoURL,
      timeDuration,
    })

    if (result) dispatch(setCourse(result))
    setModalData(null)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-300 bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-slate-900 p-5">
          <p className="text-xl font-semibold text-richblack-300">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-8 py-10">
          {/* Lecture Title */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-300" htmlFor="lectureTitle">
              Lecture Title <sup className="text-pink-200">*</sup>
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register("lectureTitle", { required: true })}
              className="form-style w-full bg-slate-900 rounded-md text-white border border-gray-300 p-2"
            />
            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture title is required
              </span>
            )}
          </div>

          {/* Lecture Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-300" htmlFor="lectureDesc">
              Lecture Description
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register("lectureDesc")}
              className="form-style resize-x-none min-h-[130px] w-full bg-slate-900 rounded-md text-white border border-gray-300 p-2"
            />
          </div>

          {/* Video upload — optional */}
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? modalData.videoURL : null}
            editData={edit ? modalData.videoURL : null}
            required={false}
            uploadProgress={uploadProgress}
          />

          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={loading ? "Saving…" : edit ? "Save Changes" : "Save"}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
