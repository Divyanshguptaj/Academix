import cloudinary from 'cloudinary';

export const uploadImagetoCloudinary = async (file, folder) => {
  const options = { 
    resource_type: "video", 
    folder 
  };

  return await cloudinary.v2.uploader.upload(file.tempFilePath, options);
};
