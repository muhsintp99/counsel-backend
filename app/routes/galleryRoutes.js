const express = require('express');
const router = express.Router();
const galleryController = require('../Controllers/galleryController');
const createUpload = require('../middlewares/upload');

// Upload middleware for "gallery" folder
const uploadGalleryImage = createUpload('gallery');

// Routes
router.post('/', (req, res, next) => {
  uploadGalleryImage(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, galleryController.createGallery);

router.get('/', galleryController.getAllGallery);
router.get('/:id', galleryController.getGalleryById);

router.put('/:id', (req, res, next) => {
  uploadGalleryImage(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, galleryController.updateGallery);


router.delete('/:id', galleryController.deleteGallery);

router.delete('/:id', galleryController.hardDeleteGallery);

module.exports = router;
