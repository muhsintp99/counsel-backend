const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function createUpload(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [
        { width: 900, height: 600, crop: 'fill', gravity: 'auto' }
      ]
    }
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }).single('image');
}

async function uploadDefaultImage(localPath, folderName = 'default') {
  const absolutePath = path.resolve(localPath); // ✅ Now it works
  const result = await cloudinary.uploader.upload(absolutePath, {
    folder: folderName,
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  });
  return {
    url: result.secure_url,
    publicId: result.public_id
  };
}

module.exports = {
  createUpload,
  cloudinary,
  uploadDefaultImage
};
