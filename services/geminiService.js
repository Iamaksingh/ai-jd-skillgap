// Placeholder service that would call Gemini 2.0 via OpenAI SDK.
// Right now it returns mock results so you can develop flow & DB/save.

async function analyzeResumeAndJD(resumeText, jdText) {
  // TODO: replace this with OpenAI SDK call to Gemini 2.0
  // Return shape:
  return {
    skillGaps: ['Example: lacks "react hooks" experience', 'Example: limited SQL exposure'],
    missingKeywords: ['react', 'node.js', 'mongodb'],
    learningPlan: '1) Learn JS fundamentals. 2) Complete React project. 3) Practice SQL queries.',
    roleFitScore: 67,
    meta: {
      tokensUsed: 0,
      model: 'gemini-2.0 (placeholder)',
    },
  };
}

module.exports = { analyzeResumeAndJD };
