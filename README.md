<div align="center">
  <h1>CareerOS AI</h1>
  <p><strong>Intelligent Career Navigation & Resume Analysis Platform</strong></p>
</div>

---

## Problem
In today's highly automated recruitment landscape, qualified candidates are frequently overlooked. Job seekers struggle with opaque Applicant Tracking Systems (ATS) that filter resumes based on rigid keyword parsing, making it difficult to understand why they face rejection. Furthermore, professionals often lack visibility into the exact technical skill gaps preventing them from advancing, and they receive generic, non-actionable career advice instead of data-driven roadmaps tailored to their actual experience.

## Solution
CareerOS AI is a full-stack, AI-driven career acceleration platform designed to demystify the hiring process. By combining deterministic scoring algorithms with the contextual intelligence of Google Gemini AI, the platform acts as a personal career strategist. It analyzes resumes to provide transparent ATS scores, identifies precise skill gaps against industry benchmarks, predicts optimal career trajectories with salary estimates, and offers an interactive AI mentor to coach candidates on technical interviews and career growth.

## Structure
The project is architected as a modern, decoupled full-stack monorepo:

```text
CareerOS AI/
├── backend/               # Python Flask REST API
│   ├── app.py             # WSGI application entrypoint
│   ├── models/            # MongoDB Data Access Layer
│   ├── routes/            # API Blueprints (Auth, Resume, Prediction, Chat)
│   ├── services/          # Core Business Logic & LLM Integrations
│   └── utils/             # Document Parsers (PDF/DOCX) & JWT Utilities
└── frontend/              # React Frontend (Vite)
    ├── src/               # React Source Code
    │   ├── components/    # Reusable UI Components
    │   ├── context/       # React Context (Auth State)
    │   ├── pages/         # Dynamic Route Views
    │   └── services/      # API Client Integrations
    ├── public/            # Static Web Assets
    └── package.json       # Frontend dependencies
```

## Features & Technologies

### Key Features
* **Resume Ingestion & Parsing:** Secure, automated extraction of text from PDF, DOCX, and TXT files.
* **Deterministic ATS Evaluator:** Explains resume performance across 8 core categories (Keywords, Section Completeness, Readability, etc.) with a transparent 100-point scoring algorithm.
* **Skill Gap Mapping:** Compares extracted competencies against industry standards using a deterministic tech-synonym mapper to prevent AI hallucinations.
* **Career Prediction & Roadmapping:** Matches profiles to 13 distinct industry trajectories, estimating salary ranges and generating 6-phase developmental timelines.
* **AI Career Mentor:** Context-aware chat interface powered by Gemini AI for personalized interview coaching and technical guidance.

### Technology Stack
* **Frontend:** React, Vite, Tailwind CSS, React Router DOM
* **Backend:** Python 3, Flask, PyJWT, PyMuPDF
* **Database:** MongoDB
* **Artificial Intelligence:** Google Generative AI (Gemini 1.5 Flash)

## Installation/Run

To run CareerOS AI locally, the Backend API and Frontend Development Server must be started simultaneously in separate terminal sessions.

### 1. Backend Setup
Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment, then install dependencies:
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory with the following configuration:
```ini
JWT_SECRET_KEY=your_secure_jwt_secret
MONGO_URI=mongodb://localhost:*****/careeros_db
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the Flask server:
```bash
python app.py
```
*The backend API will initialize on `http://localhost:5000`*

### 2. Frontend Setup
Open a **new** terminal window in the root project directory (`CareerOS AI/`), navigate to the frontend folder, and start the app:

```bash
cd frontend
npm install
npm run dev
```
*The frontend application will initialize on `http://localhost:5173`*
