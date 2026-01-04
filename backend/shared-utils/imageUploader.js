import cloudinary from "cloudinary";

export const uploadImagetoCloudinary = async (file, folder) => {
  const options = {
    resource_type: "auto", // auto-detects image, video, pdf, etc.
    folder,
  };

  try {
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, options);
    return result;
  } catch (error) {
    throw error;
  }
};
