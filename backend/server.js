require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const analysisRoutes = require('./routes/analysis.routes');
const extractRoutes = require("./routes/extract.routes");
const { limiter } = require('./middleware/rateLimiter');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());
app.use(limiter);

// health
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/v1/extract-resume", extractRoutes);
// routes
app.use('/api/v1/analysis', analysisRoutes);

// start
const PORT = process.env.PORT || 4000;
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();

module.exports = app; // for tests
