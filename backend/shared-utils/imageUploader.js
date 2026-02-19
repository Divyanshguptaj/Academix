import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

// Upload image to Cloudinary
export const uploadImagetoCloudinary = async (file, folder, height, quality) => {
  try {
    const options = { folder }

    if (height) {
      options.height = height
    }

    if (quality) {
      options.quality = quality
    }

    options.resource_type = 'auto'

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, options)

    return result
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw error
  }
}

// Delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw error
  }
}

export default cloudinary
