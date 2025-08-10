import { useCallback, useEffect, useRef, useState } from "react"
import { FiUpload, FiX, FiRotateCw } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { updateDisplayPicture } from "../../../../services/operations/settingsAPI"
import IconBtn from "../../../common/IconBtn"

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

  const handleFileUpload = () => {
    try {
      console.log("uploading...")
      setLoading(true)
      const formData = new FormData()
      
      // Use cropped image if available, otherwise use original
      const fileToUpload = croppedImageBlob || imageFile
      formData.append("displayPicture", fileToUpload, "profile-picture.jpg")
      
      dispatch(updateDisplayPicture(user.email, token, formData)).then(() => {
        setLoading(false)
        // Clean up after successful upload
        setCroppedImageUrl(null)
        setCroppedImageBlob(null)
        setImageFile(null)
      })
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
      <div className="flex items-center justify-between rounded-md border-[1px] border-richblack-300 bg-richblack-800 p-8 px-12 text-richblack-5">
        <div className="flex items-center gap-x-4">
          <img
            src={croppedImageUrl || user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[78px] rounded-full object-cover border-2 border-richblack-600"
          />
          <div className="space-y-2 text-white">
            <p>Change Profile Picture</p>
            <div className="flex flex-row gap-3">
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
                className="cursor-pointer rounded-md bg-slate-700 py-2 px-5 font-semibold text-richblack-300 hover:bg-slate-600 transition-colors duration-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-richblack-800 rounded-lg p-6 w-[95vw] h-[95vh] max-w-6xl flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold text-white">Crop Your Profile Picture</h2>
              <button
                onClick={handleCropCancel}
                className="text-richblack-300 hover:text-white p-2"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="text-richblack-300 text-sm mb-4 flex-shrink-0">
              <p>Drag to adjust the crop area. Use the controls below to zoom and rotate if needed.</p>
            </div>

            {/* Image Controls */}
            <div className="flex items-center gap-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <label className="text-richblack-300 text-sm">Zoom:</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-richblack-300 text-xs w-8">{scale.toFixed(1)}x</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-richblack-300 text-sm">Rotate:</label>
                <button
                  onClick={() => setRotate((prev) => (prev + 90) % 360)}
                  className="p-1 bg-richblack-700 rounded hover:bg-richblack-600 text-richblack-300"
                  title="Rotate 90°"
                >
                  <FiRotateCw size={16} />
                </button>
                <span className="text-richblack-300 text-xs w-8">{rotate}°</span>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg mb-4 bg-richblack-900">
              <div className="w-full h-full flex items-center justify-center p-4">
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
                      maxWidth: '90vw',
                      maxHeight: '60vh',
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

            <div className="flex gap-4 justify-end flex-shrink-0">
              <button
                onClick={handleCropCancel}
                className="px-6 py-2 bg-richblack-700 text-richblack-300 rounded-md hover:bg-richblack-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={!completedCrop?.width || !completedCrop?.height}
                className="px-6 py-2 bg-yellow-500 text-richblack-900 rounded-md hover:bg-yellow-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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