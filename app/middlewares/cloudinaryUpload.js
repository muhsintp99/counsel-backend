const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
dotenv.config();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function createCloudinaryUpload(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }]  // optional resize
    }
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
  }).single('image');
}

module.exports = createCloudinaryUpload;
