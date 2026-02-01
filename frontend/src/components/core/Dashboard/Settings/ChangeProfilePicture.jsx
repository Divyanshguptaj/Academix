import { useCallback, useEffect, useRef, useState } from "react"
import { FiUpload, FiX, FiRotateCw } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { updateDisplayPicture } from "../../../../services/operations/settingsAPI"
import { fetchUserDetails } from "../../../../services/operations/profileAPI"
import IconBtn from "../../../common/IconBtn"
import { getUserImage, createImageErrorHandler } from "../../../../utils/imageUtils"

// Helper function to create initial crop
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [croppedImageBlob, setCroppedImageBlob] = useState(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState(null)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)

  const fileInputRef = useRef(null)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        setPreviewSource(reader.result)
        setShowCropModal(true)
        setCroppedImageUrl(null)
        setCroppedImageBlob(null)
        setScale(1)
        setRotate(0)
      }
    }
  }

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1)) // 1:1 aspect ratio for square crop
  }, [])

  const getCroppedImg = useCallback(() => {
    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = completedCrop

    if (!image || !canvas || !crop) {
      return
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')

    // Calculate the size considering scale and rotation
    const cropWidth = crop.width * scale
    const cropHeight = crop.height * scale

    canvas.width = cropWidth
    canvas.height = cropHeight

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Apply transformations
    ctx.save()
    ctx.translate(cropWidth / 2, cropHeight / 2)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(-cropWidth / 2, -cropHeight / 2)

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      cropWidth,
      cropHeight
    )

    ctx.restore()

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedImageUrl = URL.createObjectURL(blob)
            setCroppedImageUrl(croppedImageUrl)
            setCroppedImageBlob(blob)
            resolve({ blob, url: croppedImageUrl })
          }
        },
        'image/jpeg',
        0.95
      )
    })
  }, [completedCrop, scale, rotate])

  const handleCropComplete = () => {
    getCroppedImg().then(() => {
      setShowCropModal(false)
    })
  }

  const handleCropCancel = () => {
    setShowCropModal(false)
    setPreviewSource(null)
    setImageFile(null)
    setCroppedImageUrl(null)
    setCroppedImageBlob(null)
  }

  const handleFileUpload = async () => {
    try {
      console.log("uploading...")
      setLoading(true)
      const formData = new FormData()
      
      // Use cropped image if available, otherwise use original
      const fileToUpload = croppedImageBlob || imageFile
      formData.append("displayPicture", fileToUpload, "profile-picture.jpg")
      
      // Wait for the upload to complete
      await dispatch(updateDisplayPicture(user.email, token, formData))
      
      // After successful upload, fetch updated user details to refresh Redux state
      await dispatch(fetchUserDetails(user.email))
      
      setLoading(false)
      // Clean up after successful upload
      setCroppedImageUrl(null)
      setCroppedImageBlob(null)
      setImageFile(null)
      
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
      setLoading(false)
    }
  }

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl)
      }
    }
  }, [croppedImageUrl])
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-md border-[1px] border-richblack-300 bg-richblack-800 p-4 md:p-8 md:px-12 text-richblack-5 mx-4 md:mx-0">
        <div className="flex items-center gap-x-4">
          <img
            src={croppedImageUrl || getUserImage(user)}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[60px] sm:w-[78px] rounded-full object-cover border-2 border-richblack-600 flex-shrink-0"
            onError={createImageErrorHandler(user)}
            loading="lazy"
          />
          <div className="space-y-2 text-white min-w-0">
            <p className="text-sm sm:text-base">Change Profile Picture</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/gif, image/jpeg, image/webp"
              />
              <button
                onClick={handleClick}
                disabled={loading}
                className="cursor-pointer rounded-md bg-slate-700 py-2 px-4 sm:px-5 font-semibold text-richblack-300 hover:bg-slate-600 transition-colors duration-200 text-sm sm:text-base"
              >
                Select
              </button>
              <IconBtn
                text={loading ? "Uploading..." : "Upload"}
                onclick={handleFileUpload}
                disabled={loading || (!croppedImageBlob && !imageFile)}
              >
                {!loading && (
                  <FiUpload className="text-lg text-richblack-900" />
                )}
              </IconBtn>
            </div>
            {croppedImageBlob && (
              <p className="text-xs text-green-400">✓ Image cropped and ready to upload</p>
            )}
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-richblack-800 rounded-lg p-3 sm:p-6 w-[98vw] h-[98vh] sm:w-[95vw] sm:h-[95vh] max-w-6xl flex flex-col">
            <div className="flex justify-between items-center mb-3 sm:mb-4 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Crop Your Profile Picture</h2>
              <button
                onClick={handleCropCancel}
                className="text-richblack-300 hover:text-white p-1 sm:p-2"
              >
                <FiX size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="text-richblack-300 text-xs sm:text-sm mb-3 sm:mb-4 flex-shrink-0">
              <p>Drag to adjust the crop area. Use the controls below to zoom and rotate if needed.</p>
            </div>

            {/* Image Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4 flex-shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-richblack-300 text-xs sm:text-sm flex-shrink-0">Zoom:</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="flex-1 sm:w-24"
                />
                <span className="text-richblack-300 text-xs w-8 text-center">{scale.toFixed(1)}x</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-richblack-300 text-xs sm:text-sm flex-shrink-0">Rotate:</label>
                <button
                  onClick={() => setRotate((prev) => (prev + 90) % 360)}
                  className="p-1 bg-richblack-700 rounded hover:bg-richblack-600 text-richblack-300 flex-shrink-0"
                  title="Rotate 90°"
                >
                  <FiRotateCw size={14} className="sm:w-4 sm:h-4" />
                </button>
                <span className="text-richblack-300 text-xs w-8 text-center">{rotate}°</span>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg mb-3 sm:mb-4 bg-richblack-900 min-h-0">
              <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1} // Square crop
                  minWidth={50}
                  minHeight={50}
                  circularCrop={false}
                  className="max-w-full max-h-full"
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={previewSource}
                    onLoad={onImageLoad}
                    style={{
                      maxWidth: '85vw',
                      maxHeight: '50vh',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      transformOrigin: 'center',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </ReactCrop>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-4 justify-end flex-shrink-0">
              <button
                onClick={handleCropCancel}
                className="px-4 sm:px-6 py-2 bg-richblack-700 text-richblack-300 rounded-md hover:bg-richblack-600 transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={!completedCrop?.width || !completedCrop?.height}
                className="px-4 sm:px-6 py-2 bg-yellow-500 text-richblack-900 rounded-md hover:bg-yellow-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for crop processing */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </>
  )
}