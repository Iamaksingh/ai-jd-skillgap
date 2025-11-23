const express = require("express");
const multer = require("multer");
const { extractTextFromBuffer } = require("../utils/pdfParser");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// POST /api/v1/extract-resume
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Upload a PDF under 'file'" });
    }

    const text = await extractTextFromBuffer(req.file.buffer);

    return res.json({ text });
  } catch (error) {
    console.error("extract-resume error", error);
    res.status(500).json({ error: "Failed to extract resume" });
  }
});

module.exports = router;
