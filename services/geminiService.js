// services/geminiService.js
const axios = require('axios');

const BASE = "https://generativelanguage.googleapis.com/v1beta/openai/";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY not set — set it in .env");
}

function parseGeminiJSON(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Empty AI content');
  }
  const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

async function analyzeResumeAndJD(resumeText = '', jdText = '') {
  try {
    // small safety: limit extremely long inputs (helps avoid 400 if input too big)
    const MAX_LEN = 12000; // characters — tune as needed
    let rText = resumeText;
    if (rText.length > MAX_LEN) {
      rText = rText.slice(0, MAX_LEN) + "\n\n[TRUNCATED]";
    }

    const prompt = ` You analyze a candidate's resume against a Job Description. Return STRICT JSON ONLY with these keys:
    {
      "skillGaps": string[],
      "missingKeywords": string[],
      "learningPlan": string,
      "roleFitScore": number
    }
    Resume:"""${rText}"""
    Job Description:"""${jdText}"""`;

    const url = `${BASE}chat/completions`;
    const payload = {
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      // you can add max_tokens if you want to limit response size
      // max_tokens: 500
    };
    const resp = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 20000
    });

    if (!resp.data) {
      throw new Error('Empty response from Gemini endpoint');
    }

    const content = resp.data?.choices?.[0]?.message?.content;
    if (!content) {
      // dump the entire response body for debugging
      const dump = JSON.stringify(resp.data, null, 2).slice(0, 8000);
      console.error('Unexpected Gemini response shape:', dump);
      throw new Error('Unexpected Gemini response shape — see server logs');
    }

    const json = parseGeminiJSON(content);

    return {
      ...json,
      meta: {
        model: MODEL,
        rawResponseSummary: {
          // keep a tiny summary, avoid logging whole huge response
          length: content.length,
          // tokensUsed not always provided by Google; keep undefined-safe
          tokensUsed: resp.data?.usage?.total_tokens ?? null,
        }
      }
    };
  } catch (err) {
    // Better error logging: if axios error, show server body if present
    if (err.response) {
      console.error('Gemini HTTP error status:', err.response.status);
      // show body up to 8k chars
      try {
        console.error('Gemini response body (truncated):', JSON.stringify(err.response.data).slice(0, 8000));
      } catch (e) {
        console.error('Could not stringify error response body', e);
      }
    } else {
      console.error('Gemini call error:', err.message || err);
    }
    throw new Error('Gemini AI processing failed');
  }
}

module.exports = { analyzeResumeAndJD };
