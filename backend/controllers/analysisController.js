const Analysis = require("../models/Analysis");
const { extractTextFromBuffer } = require("../utils/pdfParser");
const { analyzeResumeAndJD } = require("../services/geminiService");

async function analyze(req, res) {
  try {
    const jdText = req.body.jdText || "";
    let resumeText = "";

    // EXTENSION SUPPORT — directly send resumeText
    if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    // PDF upload support — for Postman / website version
    else if (req.file && req.file.buffer) {
      resumeText = await extractTextFromBuffer(req.file.buffer);
    }

    if (!resumeText) {
      return res.status(400).json({ error: "Resume missing: send resumeText or upload file" });
    }

    if (!jdText) {
      return res.status(400).json({ error: "Job description missing" });
    }

    // Call Gemini
    const aiResult = await analyzeResumeAndJD(resumeText, jdText);

    // Save to DB
    const analysis = await Analysis.create({
      resumeText,
      jdText,
      skillGaps: aiResult.skillGaps,
      missingKeywords: aiResult.missingKeywords,
      learningPlan: aiResult.learningPlan,
      roleFitScore: aiResult.roleFitScore,
      meta: aiResult.meta,
    });

    return res.json({
      id: analysis._id,
      ...aiResult,
    });

  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { analyze };
