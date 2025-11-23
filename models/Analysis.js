const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  resumeText: String,
  jdText: String,
  skillGaps: [String],
  missingKeywords: [String],
  learningPlan: String,
  roleFitScore: Number,
  meta: Object,
}, { timestamps: true });

module.exports = mongoose.model('Analysis', AnalysisSchema);
