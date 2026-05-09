import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUploadCloud } from "react-icons/fi"
import { useSelector } from "react-redux"
import "video-react/dist/video-react.css"
import { Player } from "video-react"

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
  required = true,
  uploadProgress = null,
}) {
  const { course } = useSelector((state) => state.course)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  )
  const inputRef = useRef(null)

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) handleFileChange(acceptedFiles[0])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: video
      ? { "video/*": [".mp4"] }
      : { "image/*": [".jpeg", ".jpg", ".png"] },
    onDrop,
  })

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => setPreviewSource(reader.result)
  }

  const handleFileChange = (file) => {
    if (file) {
      previewFile(file)
      setSelectedFile(file)
      setValue(name, file)
    }
  }

  useEffect(() => {
    register(name, { required })
  }, [register])

  const isUploading = uploadProgress !== null && uploadProgress > 0 && uploadProgress < 100

  return (
    <div className="max-w-2xl mx-auto p-6 bg-richblack-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-yellow-300 mb-1">{label}</h2>
      {!required && (
        <p className="text-xs text-richblack-400 mb-3">Optional — you can add this later</p>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        accept={video ? "video/mp4" : "image/*"}
        ref={inputRef}
        onChange={(e) => handleFileChange(e.target.files[0])}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`${
          isDragActive ? "bg-richblack-600" : "bg-richblack-700"
        } flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500 p-4`}
        onClick={() => inputRef.current.click()}
      >
        {previewSource ? (
          <div className="flex w-full flex-col p-4">
            {!video ? (
              <img
                src={previewSource}
                alt="Preview"
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <Player aspectRatio="16:9" playsInline src={previewSource} />
            )}
            {!viewData && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewSource("")
                  setSelectedFile(null)
                  setValue(name, null)
                }}
                className="mt-3 text-red-400 underline hover:text-red-500 text-sm"
              >
                Remove File
              </button>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center p-4">
            <div className="grid aspect-square w-16 place-items-center rounded-full bg-gray-900">
              <FiUploadCloud className="text-3xl text-yellow-300" />
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Drag & Drop {!video ? "an image" : "a video"}, or{" "}
              <span className="font-semibold text-yellow-300">Click to Browse</span>
            </p>
            <ul className="mt-3 flex list-disc space-x-8 text-xs text-gray-500">
              <li>Aspect ratio 16:9</li>
              {video ? <li>MP4 format</li> : <li>Recommended: 1024×576</li>}
            </ul>
          </div>
        )}
      </div>

      {/* Upload progress bar */}
      {isUploading && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-richblack-400 mb-1">
            <span>Uploading…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-richblack-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {uploadProgress === 100 && (
        <p className="mt-2 text-xs text-green-400">Upload complete — processing…</p>
      )}

      {/* Error */}
      {errors[name] && (
        <span className="text-xs text-red-400 mt-2 block">{label} is required</span>
      )}
    </div>
  )
}
