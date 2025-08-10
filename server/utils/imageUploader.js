import cloudinary from "cloudinary";

export const uploadImagetoCloudinary = async (file, folder) => {
  const fileType = file.mimetype.split("/")[0].toLowerCase();

  const allowedTypes = ["image", "video"];
  if (!allowedTypes.includes(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  const options = {
    resource_type: fileType, 
    folder,
  };

  return await cloudinary.v2.uploader.upload(file.tempFilePath, options);
};
