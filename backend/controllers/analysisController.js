const Analysis = require('../models/Analysis');
const { extractTextFromBuffer } = require('../utils/pdfParser');
const { analyzeResumeAndJD } = require('../services/geminiService');

async function analyze(req, res) {
  try {
    const jdText = req.body.jdText || '';
    let resumeText = '';

    if (req.file && req.file.buffer) {
      resumeText = await extractTextFromBuffer(req.file.buffer);
    }

    // basic validation
    if (!jdText && !resumeText) {
      return res.status(400).json({ error: 'Provide resume PDF or job description text.' });
    }

    // call AI service
    const aiResult = await analyzeResumeAndJD(resumeText, jdText);

    // save to DB
    const analysis = await Analysis.create({
      resumeText,
      jdText,
      skillGaps: aiResult.skillGaps,
      missingKeywords: aiResult.missingKeywords,
      learningPlan: aiResult.learningPlan,
      roleFitScore: aiResult.roleFitScore,
      meta: aiResult.meta || {},
    });

    return res.json({
      id: analysis._id,
      skillGaps: aiResult.skillGaps,
      missingKeywords: aiResult.missingKeywords,
      learningPlan: aiResult.learningPlan,
      roleFitScore: aiResult.roleFitScore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { analyze };
