# CareerOS AI - Student Career & Skill Gap Analyzer
## Backend API Service - Modules 1, 2, 3, & 4 (ATS Score Analyzer)

This repository houses the enterprise Python Flask backend for **CareerOS AI**. Built with modular Application Factory Blueprints, secure **bcrypt** authentication, stateless **JWT authorization**, robust **PyMongo** connectivity, document extraction for PDF/DOCX/TXT resumes, and a deterministic, transparent **ATS (Applicant Tracking System) Score Analyzer**.

---

### 1. Project & Folder Structure

```text
backend/
│── app.py                 # Core Flask app entrypoint & WSGI application factory
│── config.py              # Environment configuration (JWT settings, 16MB upload limit, CORS)
│── database.py            # Singleton PyMongo database manager with reconnection logic
│── requirements.txt       # Dependencies (Flask, PyMongo, bcrypt, PyJWT, PyMuPDF, python-docx)
│── .env.example           # Configuration template
│── .env                   # Local active runtime configuration secrets
│── README.md              # Complete API reference, scoring architecture, and Postman guides
│── uploads/               # Secure disk storage for ingested resume documents (.gitkeep protected)
│── models/                # MongoDB Data Access Layer
│   ├── __init__.py        # Package initializer
│   ├── user.py            # MongoDB User model with unique email index & bcrypt hashing
│   ├── resume.py          # Resume document schema & safe server-path redaction
│   └── ats.py             # ATS Analysis report storage schema & user isolation queries
│── routes/                # REST API Blueprints
│   ├── __init__.py        # Blueprint registration helper
│   ├── main_routes.py     # Root navigation (GET /)
│   ├── api_routes.py      # Diagnostics endpoints (GET /api/health, GET /api/version)
│   ├── auth.py            # Account endpoints (Signup, Login, Profile, Logout)
│   ├── resume.py          # Resume ingestion (Upload, List, Get Details, Delete)
│   └── ats.py             # ATS evaluation (Analyze Resume, Get Analysis, Resume ATS History)
│── services/              # Domain Engines & Document Processing Business Logic
│   ├── __init__.py        # Services package export initializer
│   ├── resume_parser.py   # Rule-based section detection and entity extractor (Regex & Keywords)
│   ├── resume_service.py  # Upload validation, secure filename generation, & processing flow
│   ├── role_keywords.py   # Target-Role Competency Dictionary & Technology Synonym mapper
│   └── ats_service.py     # Deterministic 100-point weighted ATS evaluation scoring algorithm
│── utils/                 # Cross-cutting enterprise utilities
│   ├── __init__.py        # Utility export helper
│   ├── logger.py          # Rotating file & interactive console loggers
│   ├── error_handlers.py  # Standardized global JSON HTTP exception handlers
│   ├── auth.py            # JWT utilities & `@token_required` route decorator
│   ├── pdf_parser.py      # PyMuPDF (fitz) page-by-page extractor with OCR warning triggers
│   ├── docx_parser.py     # python-docx paragraph and table row text extractor
│   └── txt_parser.py      # Multi-encoding (UTF-8, Latin-1, CP1252) file reader
│── static/                # Static asset serving directory
└── logs/                  # Storage folder for rotating application log files
```

---

### 2. ATS Score Analyzer Overview & Methodology

The **ATS Score Analyzer** evaluates resume text against target career roles using a **deterministic, transparent, and explainable** algorithm. It calculates a score strictly between **0 and 100**, backed by an explicit point-by-point breakdown across 8 core resume categories:

| Category | Maximum Points | Evaluation Method |
| :--- | :---: | :--- |
| **A. Keyword Match** | **30** | Measures ratio of target role vocabulary found in document text after normalizing tech aliases. |
| **B. Skills Match** | **25** | Analyzes candidate skills against *Required* (17 pts) and *Preferred* (8 pts) role competencies. |
| **C. Section Completeness** | **15** | Assesses presence of Contact Info (3), Summary (2), Skills (3), Education (3), Experience (2), Projects (1), Certifications (1). |
| **D. Experience Relevance** | **10** | Evaluates whether employment bullet points actively incorporate role-specific domain technologies. |
| **E. Education Relevance** | **5** | Checks for academic degree certifications in engineering, science, or computational domains. |
| **F. Projects** | **5** | Verifies practical implementation of role keywords inside technical project descriptions. |
| **G. Certifications** | **5** | Identifies domain credentials, specialized licenses, or industry cloud training certificates. |
| **H. Formatting / Readability** | **5** | Validates text cleanliness (<15% special symbols), standard section headings, and readable paragraph blocks. |
| **Total Overall Score** | **100** | **Exact mathematical sum of all 8 categorical criteria.** |

---

### 3. Supported Target Career Roles & Competencies

Our modular keyword system (`services/role_keywords.py`) comes pre-configured with comprehensive competency profiles for leading industry roles, complete with automatic synonym normalization (e.g., matching `"React.js"` to `"React"`, `"Node.js"` to `"Node"`, or `"MongoDB"` to `"Mongo DB"`):
* **Python Developer**
* **Full Stack Developer**
* **Frontend Developer**
* **Backend Developer**
* **Data Analyst**
* **Data Scientist**
* **Machine Learning Engineer**
* **AI Engineer**
* **React Developer**
* **Java Developer**
* **Software Engineer** (Also serves as an intelligent generalized fallback for custom user-submitted roles!)

---

### 4. Complete ATS API Reference

All ATS REST endpoints strictly demand user authentication via an HTTP header:
```http
Authorization: Bearer <JWT_TOKEN>
```

#### 1. Perform ATS Analysis (`POST /api/ats/analyze`)
Analyzes an uploaded resume owned by the user against a specific career role and records the evaluation report in MongoDB.
* **Headers:** `Authorization: Bearer <JWT_TOKEN>` | `Content-Type: application/json`
* **Request Body Example:**
  ```json
  {
    "resume_id": "6a678120fa2c4b9d0e19a4b2",
    "target_role": "Python Developer"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "ATS analysis completed successfully",
    "data": {
      "analysis_id": "6a6792341b2c3d4e5f607182",
      "resume_id": "6a678120fa2c4b9d0e19a4b2",
      "target_role": "Python Developer",
      "overall_score": 82,
      "score_breakdown": {
        "keyword_match": 26,
        "skills_match": 22,
        "section_completeness": 14,
        "experience_relevance": 8,
        "education": 5,
        "projects": 4,
        "certifications": 0,
        "formatting": 3
      },
      "matched_keywords": ["api", "backend", "django", "docker", "fastapi", "git", "python", "sql"],
      "missing_keywords": ["celery", "kubernetes", "linux", "pydantic"],
      "keyword_match_percentage": 86,
      "matched_skills": ["Docker", "FastAPI", "Git", "PostgreSQL", "Python", "REST APIs", "SQL"],
      "missing_skills": ["AWS", "Django", "Flask", "Unit Testing"],
      "skills_match_percentage": 64,
      "strengths": [
        "Strong keyword coverage (86%) aligning well with Python Developer job requirements.",
        "Possesses most core technical skills required for a Python Developer.",
        "Demonstrates relevant professional work experience aligned with target role keywords.",
        "Complete education section with academic degree qualification present."
      ],
      "weaknesses": [
        "Missing desirable preferred skills: Django, Flask, AWS, Unit Testing.",
        "No professional certifications or continuous learning credentials found."
      ],
      "suggestions": [
        "Integrate relevant industry keywords naturally into your experience bullet points (e.g., celery, kubernetes, linux).",
        "Consider completing and expanding your resume with recognized domain certifications relevant to Python Developer."
      ],
      "created_at": "2026-07-28T06:08:00.000000+00:00"
    }
  }
  ```

#### 2. Get Specific ATS Analysis Report (`GET /api/ats/<analysis_id>`)
Retrieves an existing analysis report by ID. Enforces ownership isolation (users cannot access reports created by other users).
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):** Returns standardized JSON representation containing full score breakdowns and actionable suggestions.
* **Error Response (404 Not Found - Access Denied):**
  ```json
  {
    "success": false,
    "message": "ATS analysis record not found or access denied."
  }
  ```

#### 3. Get ATS Analysis History for Resume (`GET /api/ats/resume/<resume_id>`)
Retrieves all chronological ATS evaluation reports performed against a single uploaded resume document.
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "ATS analysis history retrieved successfully",
    "data": {
      "resume_id": "6a678120fa2c4b9d0e19a4b2",
      "history": [
        {
          "analysis_id": "6a6792341b2c3d4e5f607182",
          "target_role": "Python Developer",
          "overall_score": 82,
          "created_at": "2026-07-28T06:08:00.000000+00:00"
        },
        {
          "analysis_id": "6a6791001b2c3d4e5f607150",
          "target_role": "Full Stack Developer",
          "overall_score": 68,
          "created_at": "2026-07-28T06:05:00.000000+00:00"
        }
      ],
      "count": 2
    }
  }
  ```

---

### 5. Module 5: Skill Gap Analyzer & Gemini AI Integration

#### Overview
Module 5 bridges candidate competency identification with Google Gemini AI to deliver personalized career readiness roadmaps, project recommendations, and curated learning resources without hallucinating skills or guaranteeing employment.

#### A. Gemini AI Setup & Environment Variables
The application uses the official `google-generativeai` Python SDK to communicate with Google Gemini LLMs securely from the server backend. API keys are never leaked to logs, stack traces, or frontend client responses.
Configure the following secrets in your `.env` file:
```ini
GEMINI_API_KEY=AIzaSy...your_real_api_key...
GEMINI_MODEL=gemini-1.5-flash
```

#### B. Supported Career Roles & Unified Registry
Competency benchmarks are managed centrally in `services/career_roles.py`, sharing single-source-of-truth definitions with Module 4 ATS Analyzer. The following standard roles are fully supported with explicit Core, Required, Preferred, Tool, Framework, Database, and Cloud skills:
1. **Python Developer** | 2. **Full Stack Developer** | 3. **Frontend Developer** | 4. **Backend Developer**
5. **Data Analyst** | 6. **Data Scientist** | 7. **Machine Learning Engineer** | 8. **AI Engineer**
9. **React Developer** | 10. **Java Developer** | 11. **Software Engineer** (Fallback default)

#### C. Deterministic Skill Matching & Synonym Normalization
Before calling Gemini AI, `SkillGapService.analyze_skill_gap` calculates deterministic competency gaps:
* **Synonym Normalization:** Applies `TECH_SYNONYMS` alias tables (e.g., `"React.js"` $\to$ `"React"`, `"Node.js"` $\to$ `"Node.js"`, `"Mongo DB"` $\to$ `"MongoDB"`).
* **Mathematical Calculation:** Calculates verifiable exact percentages for `skill_match_percentage` (overall target profile alignment), `required_skill_match_percentage`, and `preferred_skill_match_percentage`, segmenting skills into `matched_skills` and `missing_skills`.

#### D. Gemini AI Analysis Process & Safe Validation
* **Structured Prompts:** Transmits verified resume text summaries, parsed experience, education, projects, certifications, ATS scores, and deterministic missing/matched skills to Gemini with explicit constraints against employment/salary guarantees or unverified resource URL fabrication.
* **Safe JSON Parsing & Retries:** `GeminiService._parse_and_validate_json` cleanly strips markdown wrappers (```json ... ```) and checks required schema fields (`skill_gap_summary`, `priority_skills`, `learning_roadmap`, `recommended_projects`, `recommended_resources`, `career_readiness`). If Gemini outputs malformed JSON, the service triggers an automatic single retry loop before safely rejecting without polluting MongoDB storage.

---

### 6. Module 5 API Endpoints & Postman Testing Reference

All Skill Gap endpoints strictly enforce `@token_required` JWT authentication and confirm user document ownership via `g.current_user_id`.

#### 1. Perform Skill Gap & AI Career Roadmap Analysis (`POST /api/skill-gap/analyze`)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "resume_id": "6a684df4fd055018bb764697",
    "target_role": "Python Developer"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Skill gap analysis completed successfully",
    "data": {
      "analysis_id": "6a685123fa2c4b9d0e19a5c1",
      "resume_id": "6a684df4fd055018bb764697",
      "target_role": "Python Developer",
      "skill_match_percentage": 72,
      "required_skill_match_percentage": 80,
      "preferred_skill_match_percentage": 60,
      "matched_skills": ["Python", "REST APIs", "SQL", "Git"],
      "missing_skills": ["Docker", "AWS", "FastAPI", "Kubernetes"],
      "priority_skills": [
        {
          "skill": "Docker",
          "priority": "High",
          "reason": "Commonly required for backend microservices deployment and containerization."
        }
      ],
      "skill_gap_summary": "Candidate exhibits strong command of core Python programming, SQL databases, and RESTful APIs. To reach job readiness for Senior Python Developer roles, practical proficiency in container orchestration (Docker) and AWS Cloud deployments is essential.",
      "learning_roadmap": [
        {
          "phase": "Phase 1",
          "title": "Backend Containerization Foundations",
          "duration": "2 weeks",
          "skills": ["Docker", "Linux Environment"],
          "tasks": ["Write multi-stage Dockerfiles for Flask services", "Configure local Docker Compose databases"]
        }
      ],
      "recommended_projects": [
        {
          "project_name": "Containerized Asynchronous Task Pipeline",
          "difficulty": "Intermediate",
          "skills_practiced": ["Docker", "FastAPI", "Celery", "Redis"],
          "description": "Architect a modular REST API processing async background jobs with Celery and Redis, deployed via Docker.",
          "expected_outcome": "Demonstrated hands-on command of asynchronous task processing and Docker deployment."
        }
      ],
      "recommended_resources": [
        {
          "name": "Docker Official Reference & Hands-On Labs",
          "category": "Documentation",
          "url": "https://docs.docker.com/"
        }
      ],
      "career_readiness": {
        "percentage": 72,
        "level": "Intermediate",
        "reason": "Demonstrates verified foundational mastery in required backend competencies (80%), requiring cloud orchestration experience to achieve full production job readiness."
      }
    }
  }
  ```
* **Error Response (503 Service Unavailable / Timeout / High Volume):**
  ```json
  {
    "success": false,
    "message": "AI analysis service is currently experiencing high volume. Please wait a moment and try again."
  }
  ```

#### 2. Get Specific Skill Gap Analysis Report (`GET /api/skill-gap/<analysis_id>`)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):** Returns standardized JSON representation of the persisted analysis report.
* **Error Response (404 Not Found - Access Denied):**
  ```json
  {
    "success": false,
    "message": "Skill gap analysis record not found or access denied."
  }
  ```

#### 3. Get Skill Gap Analysis History for Resume (`GET /api/skill-gap/resume/<resume_id>`)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):** Returns complete chronological evaluation history for the given resume document.

---

### 7. Module 6: Career Prediction, Salary Estimation & 6-Phase Roadmaps

#### Overview
Module 6 implements a comprehensive, transparent career guidance engine combining deterministic multi-factor competency math with Google Gemini AI synthesis. It dynamically analyzes candidate resumes against 13 industry-standard career trajectories (including newly added **Cloud Engineer** and **DevOps Engineer** roles), delivering realistic compensation range benchmarks, readiness ratings, and structured developmental timelines.

#### A. Deterministic Weighted Career Matching
Before querying Google Gemini AI, `PredictionService.calculate_deterministic_match` generates explainable alignment scores bounded strictly between 0 and 100:
* **Weighted Rubric Math:**
  * **Required Skills Match (30%) & Preferred Skills Match (15%):** Normalized synonym evaluation against domain requirements.
  * **Project Relevance (15%) & Experience Relevance (15%):** Analyzes demonstrated engineering experience and technical keyword saturation.
  * **Education Relevance (10%) & Certification Relevance (5%):** Recognizes formal computer science credentials, advanced degrees, and professional certifications (AWS, GCP, Kubernetes).
  * **ATS Score Alignment (10%):** Integrates historical resume formatting and ATS optimization metrics.
* **Multiple Career Ranking:** If `target_role` is unstated or empty, the system automatically evaluates all 13 supported career paths and ranks the top 3–5 most suitable trajectories.

#### B. Modular Market Salary Benchmarking (`SalaryService`)
* **Explainable Estimation:** Estimates candidate seniority (Entry Level, Junior, Mid-Level, Senior, Lead/Principal) from experience histories and computes estimated benchmark annual USD salary ranges (min, max, median).
* **Important Disclaimers:** All return payloads set `"is_estimate": true` and clearly indicate in an explanatory statement that values represent estimated industry benchmark guidance rather than guaranteed actual wage offers or real-time compensation data. The service architecture is fully modular, enabling future integration with real-time labor market providers (such as Bureau of Labor Statistics or Glassdoor APIs).

#### C. Personalized 6-Phase Developmental Roadmap (`CareerRoadmapService`)
Generates realistic, achievable developmental roadmaps tailored specifically to the candidate's verified skill gaps without exaggerated acceleration claims:
* **Phase 1: Foundation & Development Environment** (2–3 weeks: Git, CLI, foundational syntax)
* **Phase 2: Core Role Competencies & Frameworks** (3–4 weeks: Domain frameworks, databases, REST APIs)
* **Phase 3: Advanced Specialties & Cloud Integration** (3–5 weeks: Docker containerization, cloud deployment, CI/CD pipelines)
* **Phase 4: Production-Grade Capstone Implementation** (3–4 weeks: Complex full-stack scalable architecture)
* **Phase 5: Portfolio Curation & Resume Alignment** (1–2 weeks: GitHub repository cleanups, OpenAPI docs, ATS keyword optimization)
* **Phase 6: Technical & Behavioral Interview Prep** (2–3 weeks: System design trade-offs, algorithms, STAR method leadership narratives)

#### D. Career Readiness Rubric & Seamless AI Fallback
* **Career Readiness (% & Level):** Classifies candidate profiles as *Beginner*, *Developing*, *Intermediate*, *Advanced*, or *Job Ready*, outlining distinct candidate strengths and targeted growth areas. Clearly articulates that readiness represents technical skill alignment and does not guarantee formal job placement or guaranteed offers.
* **Resilient Fallback Design:** In strict adherence to system stability principles, if Google Gemini AI experiences rate limiting, network timeout, missing keys, or malformed JSON output after an automatic one-time retry, the service never crashes or aborts. Instead, it seamlessly logs a warning and returns clean, fully detailed deterministic recommendations, salary ranges, and roadmaps.

---

### 8. Module 6 API Endpoints & Postman Testing Reference

All Career Prediction endpoints strictly require `@token_required` stateless JWT authentication and enforce complete database user ownership isolation via `g.current_user_id`.

#### 1. Perform Comprehensive Career Prediction (`POST /api/career/predict`)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body (With Target Role):**
  ```json
  {
    "resume_id": "6a684df4fd055018bb764697",
    "target_role": "Cloud Engineer"
  }
  ```
* **Request Body (Without Target Role - Auto-Rank Top Careers):**
  ```json
  {
    "resume_id": "6a684df4fd055018bb764697"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Career prediction completed successfully",
    "data": {
      "prediction_id": "6a685510abcd1234ef567890",
      "user_id": "6a684d12ae123456cb890123",
      "resume_id": "6a684df4fd055018bb764697",
      "target_role": "Cloud Engineer",
      "recommended_careers": [
        {
          "career": "Cloud Engineer",
          "match_percentage": 81,
          "confidence": "High",
          "reason": "Strong alignment (81%) across core Cloud Engineer competencies and demonstrable engineering experience.",
          "current_skills": ["AWS", "Linux", "Docker", "Git", "SQL"],
          "missing_skills": ["Terraform", "Kubernetes"],
          "transition_difficulty": "Low",
          "next_steps": [
            "Master Terraform through structured multi-stage practical implementation",
            "Deploy an enterprise capstone project proving Cloud Engineer readiness"
          ]
        }
      ],
      "career_match_scores": {
        "skill_match": 83,
        "preferred_skill_match": 80,
        "project_relevance": 75,
        "experience_relevance": 85,
        "education_relevance": 95,
        "certification_relevance": 90,
        "ats_score": 82,
        "overall_match": 81
      },
      "salary_predictions": [
        {
          "career": "Cloud Engineer",
          "experience_level": "Senior",
          "salary_range": {
            "min": 142000,
            "max": 200000,
            "median": 171000,
            "currency": "USD"
          },
          "is_estimate": true,
          "explanation": "Estimated range based on evaluated senior profile and industry benchmarks for Cloud Engineer. Note: All values represent general market guidance estimates and are not guaranteed salaries or job offers."
        }
      ],
      "career_readiness": {
        "percentage": 78,
        "level": "Advanced",
        "strengths": ["High alignment with core technical role competencies.", "Solid background in domain engineering responsibilities."],
        "areas_to_improve": ["Continue optimizing system scalability and interview system design proficiencies."],
        "disclaimer": "Readiness level reflects documented technical skill alignment and does not constitute a guaranteed offer of employment or job placement."
      },
      "career_roadmap": [
        {
          "phase": "Phase 1",
          "title": "Foundation & Development Environment",
          "duration": "2-3 weeks",
          "skills": ["Terraform", "Linux Command Line", "Modular Architecture"],
          "topics": ["Core syntax, data types, and design paradigms for Cloud Engineer"],
          "tasks": ["Set up a containerized local development environment tailored for Cloud Engineer"],
          "expected_outcome": "Solidified programming proficiency and mastered local command-line and version control tooling."
        }
      ]
    }
  }
  ```

#### 2. Get Saved Prediction Report by ID (`GET /api/career/<prediction_id>`)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):** Returns standardized JSON representation of the stored career prediction report.
* **Error Response (404 Not Found - Access Denied / User Isolation):**
  ```json
  {
    "success": false,
    "message": "Career prediction record not found or access denied."
  }
  ```

#### 3. Get Prediction History for Resume (`GET /api/career/resume/<resume_id>`)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):** Returns chronological history of career prediction evaluations performed against the uploaded resume document.

---

### 9. Module 7: AI Career Mentor, Interactive Chat & Conversation Persistence

#### Overview
Module 7 implements an intelligent, conversational tech engineering mentor powered by Google Gemini AI and backed by stateless MongoDB persistent storage (`mentor_chats`). The AI Career Mentor dynamically coaches candidates on resume optimization, ATS enhancement, skill gap closure, 6-phase developmental roadmaps, technical interview design paradigms, and STAR-method behavioral preparation.

#### A. Interactive Coaching Architecture & Ethical Guidance
* **Professional Engineering Tone:** Acts strictly as an executive tech career coach and technical interviewer rather than a general-purpose chatbot or open trivia engine.
* **Legal & Ethical Boundaries:** Never guarantees employment, job placements, or explicit salaries. Clearly reinforces that compensation metrics reflect estimated industry benchmarks.
* **Anti-Hallucination Covenant:** When specific CareerOS profile analyses (such as ATS scores or skill gap roadmaps) are missing or uncalculated, the mentor transparently states that the documentation is unavailable rather than fabricating metrics.

#### B. Zero-Credential Leakage Context Aggregation (`MentorService.get_clean_user_context`)
Before querying Google Gemini AI, the backend securely aggregates candidate records from MongoDB while strictly stripping all authentication credentials:
* **Included Personalized Data:** Candidate skills array, verified missing skill gaps, ATS overall score, target role, career readiness rating, and developmental roadmap summaries.
* **Strictly Excluded Credentials:** Plaintext passwords, bcrypt password hashes, JWT bearer tokens, user email addresses, and server environment API keys (`GEMINI_API_KEY`) are entirely stripped from LLM transmission payloads.

#### C. Smart Conversation Management & Token Window Protection
* **Automatic Session Initializing & Short Titles:** Starting a conversation without a `conversation_id` generates a unique session UUID and derives a crisp, human-readable conversation title without generating extra billable LLM token requests.
* **Bounded Chat History Trim:** To avoid exceeding upstream Gemini token window limitations on long-running discussions, `MentorService.format_history_for_gemini` transmits only the most recent 12 conversational messages to the AI service while retaining 100% of un-truncated message turns safely inside MongoDB.
* **Resilient Failure Fallback:** If upstream Gemini LLM servers encounter rate limits (`429`), network timeouts, or quota exhaustion, the server safely returns HTTP 503 with a friendly message (`"The AI mentor is temporarily unavailable. Please try again later."`) without crashing Flask or persisting corrupted conversation turns.

---

### 10. Module 7 API Endpoints & Postman Testing Reference

All AI Career Mentor endpoints strictly require `@token_required` stateless JWT authentication and enforce strict user database ownership isolation via `g.current_user_id`.

#### 1. Send Message to AI Career Mentor (`POST /api/chat`)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body (Start New Conversation):**
  ```json
  {
    "message": "What skills should I learn to transition into a Cloud Engineer role?"
  }
  ```
* **Request Body (Continue Existing Conversation):**
  ```json
  {
    "message": "How can I prepare for STAR behavioral interview questions on AWS architecture?",
    "conversation_id": "9f41b6cb-03aa-46e7-9ab9-910dd3990a7d"
  }
  ```
* **Success Response (200 / 201 Created):**
  ```json
  {
    "success": true,
    "message": "AI response generated successfully",
    "data": {
      "conversation_id": "9f41b6cb-03aa-46e7-9ab9-910dd3990a7d",
      "user_message": "What skills should I learn to transition into a Cloud Engineer role?",
      "assistant_message": "As your CareerOS AI Career Mentor, I recommend focusing on your identified skill gaps: Terraform, Docker containerization, and AWS IAM policies...",
      "timestamp": "2026-07-28T08:45:00.123456+00:00"
    }
  }
  ```
* **Error Response (400 Bad Request - Message Exceeds 2000 Chars or Empty):**
  ```json
  {
    "success": false,
    "message": "Message exceeds the maximum permitted length of 2000 characters."
  }
  ```
* **Error Response (503 Service Unavailable - AI Upstream Timeout):**
  ```json
  {
    "success": false,
    "message": "The AI mentor is temporarily unavailable. Please try again later."
  }
  ```

#### 2. Get User's Conversation List (`GET /api/chat/conversations`)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):** Returns active conversation summaries ordered by most recently active (`updated_at` DESC).
  ```json
  {
    "success": true,
    "data": {
      "conversations": [
        {
          "conversation_id": "9f41b6cb-03aa-46e7-9ab9-910dd3990a7d",
          "title": "Cloud Engineer Skills Guidance",
          "created_at": "2026-07-28T08:45:00.123456+00:00",
          "updated_at": "2026-07-28T08:50:00.654321+00:00"
        }
      ]
    }
  }
  ```

#### 3. Get Complete Conversation Transcript (`GET /api/chat/conversations/<conversation_id>`)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):** Returns complete ordered history of user queries and AI mentor coaching turns.
* **Error Response (404 Not Found - Access Denied / User Ownership Isolation):**
  ```json
  {
    "success": false,
    "message": "Conversation record not found or access denied."
  }
  ```

#### 4. Delete Conversation (`DELETE /api/chat/conversations/<conversation_id>`)
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Conversation deleted successfully."
  }
  ```

---

### 11. Running Server & Executing Full Automated Verification Suites

#### Launch Backend Server (Ready for React UI `AICareerMentor.jsx` & Module 8 Integration)
```powershell
cd "C:\Users\DIWAKAR\OneDrive\Desktop\AI resume\backend"
python app.py
```

#### Re-Run Complete Automated Verification Test Suites (Modules 2 to 7)
To verify complete system health, stateless JWT user isolation, AI conversational fallbacks, and zero regressions across all **91 total test scenarios**:
```powershell
python "C:\Users\DIWAKAR\.gemini\antigravity-ide\brain\45bac550-0d4b-4f46-bb7d-53391d1a11d0\scratch\test_auth.py"
python "C:\Users\DIWAKAR\.gemini\antigravity-ide\brain\45bac550-0d4b-4f46-bb7d-53391d1a11d0\scratch\test_resume.py"
python "C:\Users\DIWAKAR\.gemini\antigravity-ide\brain\45bac550-0d4b-4f46-bb7d-53391d1a11d0\scratch\test_ats.py"
python "C:\Users\DIWAKAR\.gemini\antigravity-ide\brain\45bac550-0d4b-4f46-bb7d-53391d1a11d0\scratch\test_skillgap.py"
python "C:\Users\DIWAKAR\.gemini\antigravity-ide\brain\45bac550-0d4b-4f46-bb7d-53391d1a11d0\scratch\test_prediction.py"
python "C:\Users\DIWAKAR\.gemini\antigravity-ide\brain\45bac550-0d4b-4f46-bb7d-53391d1a11d0\scratch\test_mentor.py"
```

