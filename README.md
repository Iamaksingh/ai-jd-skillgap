# SkillGapBreacher - JD Skill Gap Analyzer

A full-stack application that intelligently analyzes job descriptions against your resume to identify skill gaps, missing keywords, and provides a personalized learning plan. Built with a Chrome extension for seamless integration and an AI-powered backend.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack & Implementation Details](#tech-stack--implementation-details)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

SkillGapBreacher bridges the gap between job seekers and job requirements. When you encounter a job description online, simply use the Chrome extension to upload your resume and let the AI analyze how well you match the role. You'll get:

- A **role fit score** (0-100)
- Identified **skill gaps**
- **Missing keywords** from the JD
- A **personalized learning plan** to close those gaps

This solves the problem of job seekers spending hours manually comparing their resume against job requirements—the app automates this with AI intelligence.

---

## ✨ Features

### 1. **Resume Extraction & Storage**
- **What**: Extract text from PDF resumes and store them locally in the browser
- **Why**: Users upload once, analyze multiple JDs without re-uploading
- **Implementation**: 
  - Backend extracts PDF text via `pdf-parse` library
  - Browser stores resume in Chrome's `chrome.storage.local` API
  - Persistent across browser sessions

### 2. **AI-Powered Analysis**
- **What**: Compare resume against job descriptions using Google Gemini AI
- **Why**: 
  - Gemini provides accurate, context-aware skill gap analysis
  - Free tier sufficient for MVP
  - Excellent for understanding intent (validates if pasted text is actually a JD)
  
- **Implementation**:
  - Prompt engineering with clear scoring rubric (0-100 scale)
  - AI validates input (detects non-JD content like blogs or random text)
  - Structured JSON output parsing for consistency
  - Temperature set to 0.2 for deterministic, focused responses
  - Input truncation to 12,000 chars to prevent API failures

### 3. **Skill Gap Detection**
- **What**: Identifies missing technical/soft skills and keywords
- **Why**: Clear gaps help users prioritize learning
- **Implementation**: Gemini analyzes skill count matching:
  - How many technical skills from JD appear in resume
  - How many soft skills match
  - How much direct experience aligns
  - Generates objective scores rather than "gut feeling" estimates

### 4. **Personalized Learning Plan**
- **What**: AI-generated roadmap to upskill for the target role
- **Why**: Transforms analysis into actionable next steps
- **Implementation**: Gemini creates focused, role-specific learning recommendations stored in database

### 5. **Role Fit Scoring**
- **What**: Single metric (0-100) indicating candidate-to-JD match
- **Why**: Quick assessment without reading full analysis
- **Implementation**:
  - Strict scoring rubric enforced in prompt
  - 0-20: Very poor, 21-40: Weak, 41-60: Moderate, 61-80: Strong, 81-100: Excellent
  - Avoids neutral mid-range scores unless truly justified
  - Score justification required by prompt design

### 6. **Analysis Persistence**
- **What**: All analyses saved to MongoDB for future reference
- **Why**: 
  - Track career progress over time
  - Reference past analyses
  - Enable future features (analytics, trending skills)
- **Implementation**: Mongoose schema stores resume, JD, results, and metadata

### 7. **Rate Limiting**
- **What**: Two-tier rate limiting strategy
- **Why**: 
  - Prevent API abuse (Gemini costs money)
  - Protect backend infrastructure
- **Implementation**:
  - Global limiter: 30 requests/minute per IP (all endpoints)
  - Analysis limiter: 5 requests/minute per IP (intensive endpoint)
  - Using `express-rate-limit` middleware

### 8. **Chrome Extension Interface**
- **What**: Browser extension for in-context job analysis
- **Why**: 
  - Eliminate tab switching
  - Direct integration with job boards
  - Access saved resume without re-uploading
- **Implementation**:
  - Manifest V3 (latest Chrome security standard)
  - Popup UI for upload and analysis
  - Local storage for resume persistence
  - Connects to backend via CORS-enabled HTTP/HTTPS

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Chrome Extension (Frontend)                │
│  ┌────────────────┐                    ┌──────────────────┐ │
│  │  popup.html    │                    │  popup.js        │ │
│  │  styles.css    │◄───────────────────┤  (UI Logic)      │ │
│  │                │                    │                  │ │
│  └────────────────┘                    └────────┬─────────┘ │
└───────────────────────────────────────────────────┼──────────┘
                                                    │
                                      ┌─────────────▼─────────────┐
                                      │   Backend API (Node.js)   │
                                      │                           │
                    ┌─────────────────┼─────────────┬───────────┐ │
                    │                 │             │           │ │
              ┌─────▼─────┐   ┌──────▼─────┐  ┌───▼────┐ ┌────▼──┐
              │  Express   │   │  Mongoose  │  │Gemini  │ │ pdf   │
              │  Server    │───│  MongoDB   │  │API     │ │parse  │
              │            │   │            │  │        │ │       │
              └────────────┘   └────────────┘  └────────┘ └───────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼────┐ ┌───▼────┐ ┌───▼────┐
    │Analysis │ │Extract │ │Health  │
    │Routes   │ │Routes  │ │Check   │
    └────┬────┘ └────┬────┘ └────────┘
         │           │
    ┌────▼───────────▼────┐
    │  Middleware Layer   │
    ├─────────────────────┤
    │ Rate Limiters       │
    │ Analysis Limiter    │
    │ Global Limiter      │
    └─────────────────────┘
```

---

## 🛠️ Tech Stack & Implementation Details

### **Backend: Node.js + Express**
**Why Chosen:**
- Lightweight and perfect for API-driven applications
- Excellent async/await support for handling multiple Gemini API calls
- Rich npm ecosystem (all libraries needed are mature)
- Single language for full stack (JavaScript)

**Implementation:**
- Express 5.1.0: Modern HTTP framework with middleware support
- Rate limiting built into middleware stack for performance
- RESTful API design with clear separation of concerns

### **Database: MongoDB + Mongoose**
**Why Chosen:**
- NoSQL flexibility: Analysis schema may evolve (adding new fields is seamless)
- Mongoose provides schema validation and hooks
- Free tier on MongoDB Atlas sufficient for MVP
- Document-based storage matches our nested response structure from Gemini

**Implementation:**
- Mongoose schema defines strict structure for Analysis documents
- Timestamps automatically track when analyses were created/updated
- Stores entire request/response for audit trails

### **AI Engine: Google Gemini 2.0 Flash**
**Why Chosen:**
- **Cost-effective**: Free tier allows thousands of requests
- **Speed**: Flash model optimized for speed (important for UX)
- **Accuracy**: State-of-the-art for understanding job descriptions and resumes
- **Input validation**: Naturally detects if pasted text is actually a JD
- **Structured output**: Gemini reliably returns JSON, less hallucination than older models

**Implementation:**
- Uses OpenAI-compatible endpoint: `https://generativelanguage.googleapis.com/v1beta/openai/`
- Careful prompt engineering with:
  - Clear scoring rubric to avoid mid-range defaults
  - Safety checks for malformed input
  - Temperature 0.2 for consistency (not creativity)
  - Input truncation to prevent 400 errors on very long resumes
- Response parsing with cleanup (removes markdown code blocks)

### **PDF Processing: pdf-parse**
**Why Chosen:**
- Simple, reliable PDF text extraction
- No external service dependency (runs locally)
- Fast extraction from binary buffer
- Handles most PDF formats

**Implementation:**
- Multer stores uploaded files in memory buffer
- pdf-parse extracts text synchronously
- Extracted text sent directly to client or used for analysis

### **Rate Limiting: express-rate-limit**
**Why Chosen:**
- Industry-standard middleware for Express
- Configurable per-route or globally
- IP-based tracking built-in
- Low overhead

**Implementation:**
- Global limiter: Protects all routes (30/min per IP)
- Analysis limiter: Stricter protection (5/min per IP) for expensive Gemini calls
- Prevents API quota exhaustion and infrastructure abuse

### **Chrome Extension: Manifest V3**
**Why Chosen:**
- Manifest V3 is required for all new Chrome extensions (V2 deprecated)
- Modern security model with sandboxed content scripts
- Cleaner permissions model

**Implementation:**
- Local storage for resume persistence (survives browser restart)
- Popup-based UI triggered by extension icon
- Direct fetch calls to backend (CORS handled on backend)
- Single source of truth: backend API (no duplicate logic)

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js 16+ 
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (free from [Google AI Studio](https://aistudio.google.com/))
- Chrome browser for extension testing

### **Backend Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Iamaksingh/ai-jd-skillgap.git
   cd SkillGapBreacher/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   PORT=4000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillgapbreacher
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development (with hot reload via nodemon)
   npm run dev
   
   # Production
   npm start
   ```

   Server runs on `http://localhost:4000`

### **Extension Setup**

1. **Load the extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `extension/` folder

2. **Update backend URL in `extension/popup.js`** (if running locally)
   ```javascript
   const BACKEND = "http://localhost:4000"; // Change from production URL
   ```

3. **Test the extension**
   - Click the extension icon in Chrome toolbar
   - Upload your resume PDF
   - Visit any job posting, paste the JD, and analyze

---

## 💡 Usage

### **Via Chrome Extension (Recommended)**

1. **Upload Resume** (one-time)
   - Click extension icon → Select PDF → Upload
   - Resume stored locally, no re-upload needed

2. **Analyze a Job**
   - On any job posting, copy the job description text
   - Paste into extension popup
   - Click "Analyze"
   - View skill gaps, missing keywords, fit score, and learning plan

### **Via API (Postman/cURL)**

**Endpoint 1: Extract Resume Text**
```bash
POST http://localhost:4000/api/v1/extract-resume
Content-Type: multipart/form-data

Body: file=[path_to_resume.pdf]

Response:
{
  "text": "John Doe\nSoftware Engineer\n..."
}
```

**Endpoint 2: Analyze Resume vs JD**
```bash
POST http://localhost:4000/api/v1/analysis
Content-Type: application/json

Body:
{
  "resumeText": "John Doe, 5 years JavaScript...",
  "jdText": "Senior JavaScript Developer needed..."
}

Response:
{
  "id": "507f1f77bcf86cd799439011",
  "isJD": true,
  "skillGaps": ["TypeScript", "Kubernetes", "GraphQL"],
  "missingKeywords": ["docker", "CI/CD", "testing"],
  "roleFitScore": 72,
  "learningPlan": "1. Learn TypeScript in 2 weeks...",
  "meta": {
    "model": "gemini-2.0-flash",
    "rawResponseSummary": { ... }
  }
}
```

**Health Check**
```bash
GET http://localhost:4000/health

Response:
{
  "ok": true,
  "ts": 1670000000000
}
```

---

## 📊 API Documentation

### **Analysis Endpoint**

**POST** `/api/v1/analysis`

**Rate Limit**: 5 requests/minute per IP

**Request**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resumeText` | string | Yes | Extracted resume text (min 50 chars) |
| `jdText` | string | Yes | Job description text |

**Response** (200 OK)
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | MongoDB document ID |
| `isJD` | boolean | Whether input is a valid JD |
| `roleFitScore` | number | 0-100 match percentage |
| `skillGaps` | array | Missing technical/soft skills |
| `missingKeywords` | array | Keywords from JD not in resume |
| `learningPlan` | string | AI-generated upskilling roadmap |
| `meta` | object | Model info and token usage |

**Error Responses**
- `400`: Missing resume or JD text
- `429`: Rate limit exceeded
- `500`: Gemini API error or server issue

---

## ✅ Testing

Run the test suite:
```bash
npm test
```

**Test Coverage**
- `tests/analysis.test.js`: 
  - Tests analysis controller with mock Gemini responses
  - Validates skill gap parsing
  - Tests error handling

Tests use Jest and Supertest for HTTP assertions.

---

## 📁 Project Structure

```
SkillGapBreacher/
├── backend/
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   ├── controllers/
│   │   └── analysisController.js      # Analysis logic
│   ├── middleware/
│   │   ├── rateLimiter.js             # Global rate limit (30/min)
│   │   └── analysisLimiter.js         # Route-specific limit (5/min)
│   ├── models/
│   │   └── Analysis.js                # Mongoose schema
│   ├── routes/
│   │   ├── analysis.routes.js         # POST /api/v1/analysis
│   │   └── extract.routes.js          # POST /api/v1/extract-resume
│   ├── services/
│   │   └── geminiService.js           # Gemini API integration
│   ├── utils/
│   │   └── pdfParser.js               # PDF text extraction
│   ├── tests/
│   │   └── analysis.test.js           # Jest tests
│   ├── server.js                      # Express app entry point
│   ├── package.json                   # Dependencies
│   └── jest.config.js                 # Test configuration
│
└── extension/
    ├── manifest.json                  # Extension metadata (V3)
    ├── popup.html                     # Extension UI
    ├── popup.js                       # UI logic & backend calls
    ├── styles.css                     # Popup styling
    └── icons/                         # Extension icons
```

---

## 🔮 Future Enhancements

### **Phase 2: Analytics Dashboard**
- Track multiple analyses over time
- Visualize skill improvement
- Trending skills in job market

### **Phase 3: AI-Powered Recommendations**
- Suggest courses/resources for gaps
- Recommend similar roles with lower gaps
- Integrate with LinkedIn learning

### **Phase 4: Real-time JD Parsing**
- Automatically detect JD on job boards
- One-click analysis without copy-paste
- Content script integration with LinkedIn, Indeed, etc.

### **Phase 5: Collaborative Features**
- Share analyses with mentors
- Feedback on learning plans
- Community skill gap trends

### **Phase 6: Advanced Scoring**
- Weight skills by importance
- Factor in experience level requirements
- Salary gap vs. skill gap correlation

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the maintainer.

---

**Built with ❤️ to help job seekers bridge skill gaps**
