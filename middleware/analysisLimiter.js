const rateLimit = require("express-rate-limit");

const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 5,                     // 5 requests per minute to this route
  message: {
    status: 429,
    message: "Too many analysis requests. Please wait 1 minute."
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { analysisLimiter };