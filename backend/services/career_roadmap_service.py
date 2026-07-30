"""
Career Roadmap Service for CareerOS AI Backend.
Generates structured, realistic 6-phase career acceleration roadmaps tailored to
a candidate's target career role and identified skill gaps.
"""

import logging
from services.career_roles import get_role_competency_profile

logger = logging.getLogger(__name__)

class CareerRoadmapService:
    """
    Service responsible for constructing a personalized 6-phase developmental roadmap
    spanning Foundation, Core Skills, Advanced Skills, Projects, Portfolio, and Interviews.
    """

    @classmethod
    def generate_personalized_roadmap(cls, target_role: str, matched_skills: list, missing_skills: list) -> list:
        """
        Build a deterministic 6-phase learning and practical growth roadmap based on
        candidate proficiency gaps without unrealistic accelerated timelines.
        """
        role_profile = get_role_competency_profile(target_role)
        role_title = role_profile.get("title", target_role or "Software Engineer")
        
        # Categorize missing vs available learning milestones
        req_gaps = [s for s in missing_skills if s in role_profile.get("required_skills", [])]
        pref_gaps = [s for s in missing_skills if s in role_profile.get("preferred_skills", []) or s in role_profile.get("cloud_skills", [])]
        
        # Fallbacks if gaps are minimal (candidate has strong match)
        if not req_gaps:
            req_gaps = role_profile.get("core_skills", ["Domain Programming", "Data Structures", "Version Control"])[:3]
        if not pref_gaps:
            pref_gaps = role_profile.get("preferred_skills", ["Cloud Deployment", "CI/CD Automation", "System Architecture"])[:4]

        # Phase 1: Foundation
        phase_1 = {
            "phase": "Phase 1",
            "title": "Foundation & Development Environment",
            "duration": "2-3 weeks",
            "skills": [req_gaps[0] if len(req_gaps) > 0 else "Git & Version Control", "Linux Command Line", "Modular Architecture"],
            "topics": [
                f"Core syntax, data types, and design paradigms for {role_title}",
                "Command line operations, SSH, and environment configuration",
                "Git version control workflows (feature branches, rebase, merge conflicts)"
            ],
            "tasks": [
                f"Set up a containerized local development environment tailored for {role_title}",
                "Write clear unit tests for foundational data manipulation utilities",
                "Establish automated Git commit sanitization and pre-commit linting hooks"
            ],
            "project_suggestions": [
                f"CLI utility tool automating local file curation and log validation for {role_title}"
            ],
            "expected_outcome": "Solidified programming proficiency and mastered local command-line and version control tooling."
        }

        # Phase 2: Core Skills & Frameworks
        core_skill_targets = req_gaps[:3] if len(req_gaps) >= 3 else (req_gaps + role_profile.get("frameworks", ["REST APIs", "SQL"])[:2])
        phase_2 = {
            "phase": "Phase 2",
            "title": "Core Role Competencies & Frameworks",
            "duration": "3-4 weeks",
            "skills": list(set(core_skill_targets))[:4],
            "topics": [
                f"Architecting modular applications with industry-standard {role_title} frameworks",
                "Relational database integration, schema design, and query optimization",
                "RESTful API design, authentication headers, and error state management"
            ],
            "tasks": [
                "Implement role-specific core frameworks to handle asynchronous network interactions",
                "Design normalized SQL schemas with primary/foreign key indexing",
                "Write comprehensive integration tests covering successful and error API payloads"
            ],
            "project_suggestions": [
                f"Full-featured CRUD backend service with authentication and structured logging"
            ],
            "expected_outcome": "Capable of engineering scalable backend or standalone applications using core domain frameworks."
        }

        # Phase 3: Advanced Skills & Cloud Orchestration
        adv_skill_targets = pref_gaps[:3] if len(pref_gaps) >= 3 else (pref_gaps + role_profile.get("cloud_skills", ["AWS", "Docker", "CI/CD"])[:2])
        phase_3 = {
            "phase": "Phase 3",
            "title": "Advanced Specialties & Cloud Integration",
            "duration": "3-5 weeks",
            "skills": list(set(adv_skill_targets))[:4],
            "topics": [
                "Containerization, multi-stage Docker builds, and environment variable security",
                "Cloud platform orchestration (AWS/GCP/Azure) and automated CI/CD deployment pipelines",
                "Caching layers (Redis), rate-limiting, and fault-tolerant architectural principles"
            ],
            "tasks": [
                "Containerize services using optimized multi-stage Dockerfiles and Docker Compose",
                "Configure continuous deployment workflows via GitHub Actions or Jenkins",
                "Implement distributed monitoring, structured health checks, and alerting triggers"
            ],
            "project_suggestions": [
                "Cloud-native microservice architecture deployed on AWS/Linux container clusters with CI/CD"
            ],
            "expected_outcome": "Demonstrated practical mastery over modern container orchestration, cloud deployment, and system reliability."
        }

        # Phase 4: Capstone Projects
        phase_4 = {
            "phase": "Phase 4",
            "title": "Production-Grade Capstone Project Implementation",
            "duration": "3-4 weeks",
            "skills": [role_title + " Integration", "End-to-End System Architecture", "Performance Tuning"],
            "topics": [
                "Translating complex business functional specifications into technical engineering plans",
                "Handling concurrent request volumes, asynchronous workers, and queue management",
                "Real-world application debugging, memory analysis, and query query refactoring"
            ],
            "tasks": [
                f"Architect and develop a production-ready Capstone solution demonstrating top {role_title} skills",
                "Perform automated load testing and optimize latency bottlenecks",
                "Secure application endpoints against common OWASP vulnerabilities"
            ],
            "project_suggestions": [
                f"Enterprise-level Capstone: End-to-end cloud production platform for {role_title} with asynchronous background workers"
            ],
            "expected_outcome": "Engineered a high-performance, demonstrable capstone project proving real-world engineering readiness."
        }

        # Phase 5: Portfolio, Github Curation & Resume Polish
        phase_5 = {
            "phase": "Phase 5",
            "title": "Portfolio Curation, Code Documentation & Resume Alignment",
            "duration": "1-2 weeks",
            "skills": ["Technical Writing", "Personal Branding", "ATS Resume Optimization"],
            "topics": [
                "Writing professional README documentation featuring architectural diagrams and setup instructions",
                "Curating clear Git commit histories and public repository presentation",
                "Optimizing resume experience bullet points with quantifiable engineering metrics and keywords"
            ],
            "tasks": [
                "Publish capstone projects to GitHub with clean architectural diagrams and OpenAPI/Swagger documentation",
                f"Revise resume summary and skill sections to reflect newly mastered {role_title} competencies",
                "Run iterative evaluations using ATS Analyzer to verify achievement of >80% keyword alignment"
            ],
            "project_suggestions": [
                "Developer portfolio showcase site linking to live deployed cloud projects and GitHub repositories"
            ],
            "expected_outcome": "Professional engineering portfolio and ATS-optimized resume communicating high candidate value."
        }

        # Phase 6: Interview Preparation
        phase_6 = {
            "phase": "Phase 6",
            "title": "Technical & Behavioral Interview Preparation",
            "duration": "2-3 weeks",
            "skills": ["System Design", "Algorithm Problem Solving", "Technical Communication"],
            "topics": [
                f"Standard technical coding evaluations and data structure traversals for {role_title} interviews",
                "High-level system design questions (scalability, load balancers, sharding, consensus)",
                "Structured STAR method responses for behavioral engineering leadership scenarios"
            ],
            "tasks": [
                "Complete targeted daily algorithm problem sets focusing on trees, graphs, maps, and dynamic logic",
                f"Practice white-boarding architectures and trade-off discussions for large scale {role_title} systems",
                "Participate in live mock interview sessions to refine concise technical explanation skills"
            ],
            "project_suggestions": [
                "Comprehensive interview notebook documenting system design patterns, Big-O complexites, and STAR narratives"
            ],
            "expected_outcome": "Complete interview readiness, confident technical communication, and poised problem solving."
        }

        return [phase_1, phase_2, phase_3, phase_4, phase_5, phase_6]
