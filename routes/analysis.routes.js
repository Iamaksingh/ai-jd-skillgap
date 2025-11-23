const express = require('express');
const multer = require('multer');
const { analyze } = require('../controllers/analysisController');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// POST /api/v1/analysis
// form-data: file -> resume PDF, jdText -> job description text
router.post('/', upload.single('file'), analyze);

module.exports = router;
