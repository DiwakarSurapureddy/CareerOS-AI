# CareerOS AI

## Problem
Modern job seekers struggle to navigate automated Applicant Tracking Systems (ATS), identify critical skill gaps relative to industry demands, and visualize a realistic career trajectory based on their current experience. Standard resume builders often lack intelligent, personalized insights and actionable roadmaps.

## Solution
CareerOS AI is a comprehensive, full-stack AI-powered career assistant. It bridges the gap between candidate competencies and industry expectations by providing:
* **Deterministic ATS Scoring**: Evaluates resumes against target roles with a transparent 100-point scoring algorithm.
* **Skill Gap Analysis**: Identifies required and preferred skills, generating personalized AI learning roadmaps.
* **Career Prediction**: Matches profiles to 13 industry-standard career trajectories, estimating salary ranges and transition difficulty.
* **AI Career Mentor**: Offers an interactive, context-aware Google Gemini AI chat mentor to coach candidates on resume optimization and interview preparation.

## Structure
The repository is structured as a full-stack monorepo:

```text
CareerOS AI/
├── backend/               # Python Flask REST API
│   ├── app.py             # Core application entrypoint
│   ├── models/            # MongoDB schemas (User, Resume, ATS)
│   ├── routes/            # API Blueprints (auth, resume, ats, skill-gap, career, chat)
│   ├── services/          # Business logic & Google Gemini AI integration
│   └── utils/             # PDF/DOCX parsers and JWT auth utilities
├── src/                   # React Frontend
│   ├── components/        # Reusable UI components (Sidebar, Header, DocumentViewer)
│   ├── context/           # React Context (AuthContext)
│   ├── pages/             # Route views (Dashboard, Import Resume, ATS Score, etc.)
│   └── services/          # Axios API client integrations
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

## Features & Technologies

### Key Features
* **Resume Document Processing**: Secure ingestion and parsing of PDF, DOCX, and TXT resumes using PyMuPDF and python-docx.
* **ATS Score Analyzer**: Transparent breakdown across 8 core resume categories (Keyword Match, Section Completeness, etc.).
* **Skill Gap Analyzer**: Uses a deterministic tech synonym mapper before consulting Gemini AI to prevent hallucinations.
* **6-Phase Career Roadmaps**: Generates achievable developmental timelines.
* **Stateless Authentication**: Secure JWT-based authorization and bcrypt password hashing.

### Technologies
* **Frontend**: React, Vite, Tailwind CSS, React Router
* **Backend**: Python 3, Flask, PyMongo, PyJWT, PyMuPDF
* **Database**: MongoDB
* **AI Integration**: Google Generative AI (Gemini 1.5 Flash) SDK

## Installation/Run

### 1. Backend Setup
Navigate to the backend directory, install the Python dependencies, and run the Flask server.
```bash
cd backend
# Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
```

**Configuration**: Create a `.env` file in the `backend/` directory with your secrets:
```ini
JWT_SECRET_KEY=your_secure_jwt_secret
MONGO_URI=mongodb://localhost:27017/careeros_db
GEMINI_API_KEY=your_gemini_api_key
```

**Run Server**:
```bash
python app.py
```
*The backend API will run on http://localhost:5000*

### 2. Frontend Setup
Open a new terminal, navigate to the root directory, install the Node packages, and start the Vite dev server.
```bash
npm install
npm run dev
```
*The frontend will run on http://localhost:5173*
