const pdf = require('pdf-parse');

async function extractTextFromBuffer(buffer) {
  const data = await pdf(buffer);
  // data.text contains extracted text
  return data.text || '';
}

module.exports = { extractTextFromBuffer };
