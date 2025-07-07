const express = require('express');
const router = express.Router();
const collegeController = require('../Controllers/collegeController');

// ✅ Use local multer-based upload
const createUpload = require('../middlewares/upload'); // ✅ Local image upload (Multer)
// const createUpload = require('../middlewares/cloudinaryUpload'); // ❌ Cloudinary - commented out

// ✅ Create upload middleware for "college" folder
const uploadCollegeImage = createUpload('college');

// ✅ Handle image upload errors
const handleImageUpload = (req, res, next) => {
  uploadCollegeImage(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// ✅ Routes
router.post('/', handleImageUpload, collegeController.createCollege);
router.get('/', collegeController.getColleges);
router.get('/count', collegeController.getCollegeCount);
router.get('/:id', collegeController.getCollegeById);
router.put('/:id', handleImageUpload, collegeController.updateCollege);
router.patch('/:id', collegeController.softDeleteCollege);
router.delete('/:id', collegeController.deleteCollege);

module.exports = router;


// =======================================================================================
// const express = require('express');
// const router = express.Router();
// const collegeController = require('../Controllers/collegeController');
// // const createUpload = require('../middlewares/upload');
// const createUpload = require('../middlewares/cloudinaryUpload');

// // Create upload middleware for college images
// const uploadCollegeImage = createUpload.createUpload('college');

// // Handle image upload middleware
// const handleImageUpload = (req, res, next) => {
//   uploadCollegeImage(req, res, (err) => {
//     if (err) {
//       console.error('Upload error:', err);
//       return res.status(400).json({ error: err.message });
//     }
//     next();
//   });
// };

// // Routes
// router.post('/', handleImageUpload, collegeController.createCollege);
// router.get('/', collegeController.getColleges);
// router.get('/count', collegeController.getCollegeCount);
// router.get('/:id', collegeController.getCollegeById);
// router.put('/:id', handleImageUpload, collegeController.updateCollege);
// router.patch('/:id', collegeController.softDeleteCollege);
// router.delete('/:id', collegeController.deleteCollege);

// module.exports = router;