const express = require('express');
const router = express.Router();
const collegeController = require('../Controllers/collegeController');
const createUpload = require('../middlewares/upload');

const uploadCollegeImage = createUpload('college');

router.post('/', (req, res, next) => {
  uploadCollegeImage(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, collegeController.createCollege);

router.get('/', collegeController.getColleges);
router.get('/:id', collegeController.getCollegeById);

router.put('/:id', (req, res, next) => {
  uploadCollegeImage(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, collegeController.updateCollege);

router.patch('/:id', collegeController.softDeleteCollege);

module.exports = router;
