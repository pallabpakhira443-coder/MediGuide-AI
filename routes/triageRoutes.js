const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeTriage, refineTriage } = require('../controllers/triageController');

// Multer memory storage configuration for medical image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Please upload JPG, PNG, WEBP, or PDF.'));
    }
  },
});

// Routes
router.post('/analyze', upload.single('image'), analyzeTriage);
router.post('/refine', refineTriage);

module.exports = router;
