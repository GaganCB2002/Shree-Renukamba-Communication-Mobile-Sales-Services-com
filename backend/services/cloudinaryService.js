const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'fallback_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'fallback_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'fallback_secret',
});

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'mobile_repair_shop',
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Image upload failed');
  }
};

module.exports = {
  uploadImage,
};
