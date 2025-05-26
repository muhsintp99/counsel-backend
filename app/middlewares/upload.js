const multer = require('multer');
const path = require('path');

function createUpload(folderName) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `./public/${folderName}`);
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
            cb(null, `${Date.now()}_${base}${ext}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const isValidMime = allowedTypes.test(file.mimetype);
        const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (isValidMime && isValidExt) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)!'), false);
        }
    };

    return multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter
    }).single('image'); // field name = image
}

module.exports = createUpload;
