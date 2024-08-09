const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile, getFile } = require('../controllers/Pdfs');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post('/upload', upload.single('file'), uploadFile);
router.get('/:filename', getFile);

module.exports = router;
