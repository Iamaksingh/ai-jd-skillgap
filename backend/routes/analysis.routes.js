const express = require('express');
const multer = require('multer');
const { analyze } = require('../controllers/analysisController');
const { analysisLimiter } = require('../middleware/analysisLimiter');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Route-level rate limiting here 👇
router.post('/', analysisLimiter, upload.single('file'), analyze);

module.exports = router;
