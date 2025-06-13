const express = require('express');
const router = express.Router();
const createCloudinaryUpload = require('../middlewares/upload');

const upload = createCloudinaryUpload('test-folder'); // you can change folder name

router.post('/upload', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({
      message: "Image uploaded successfully",
      url: req.file.path,
      public_id: req.file.filename
    });
  });
});

module.exports = router;
