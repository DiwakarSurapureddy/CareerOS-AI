import re
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class RuleBasedResumeParser:
    """
    Modular Rule-Based Resume Extractor using Regex and Section-Heading Detection.
    Designed for clean integration with Gemini AI in later modules without code restructuring.
    """
    # Reliable regex patterns for personal metadata
    EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
    PHONE_REGEX = re.compile(r'(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}')
    LINKEDIN_REGEX = re.compile(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9_-]+\/?', re.IGNORECASE)
    GITHUB_REGEX = re.compile(r'(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?', re.IGNORECASE)
    PORTFOLIO_REGEX = re.compile(r'(?:https?:\/\/)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)+(?:me|io|dev|tech|com|org|net)(?:\/[^\s]*)?', re.IGNORECASE)

    # Extensive technical keywords grouped by competency domain
    SKILL_KEYWORDS = {
        "Programming Languages": ["python", "javascript", "typescript", "java", "c++", "c#", "c", "ruby", "go", "rust", "php", "swift", "kotlin", "r", "sql", "html", "css", "matlab", "scala", "dart", "bash", "shell"],
        "Frameworks": ["react", "angular", "vue", "next.js", "node.js", "express", "django", "flask", "fastapi", "spring boot", "ruby on rails", "asp.net", "flutter", "react native", "tailwind css", "bootstrap", "graphql", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn"],
        "Databases": ["mongodb", "postgresql", "mysql", "sqlite", "redis", "oracle", "mariadb", "cassandra", "dynamodb", "elasticsearch", "firebase", "supabase", "sql server"],
        "Tools": ["git", "docker", "kubernetes", "aws", "gcp", "azure", "jenkins", "github actions", "terraform", "jira", "postman", "linux", "webpack", "babel", "vite", "ci/cd", "agile", "scrum"]
    }

    DEGREE_PATTERNS = [
        re.compile(r'\b(?:B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|Ph\.?D|Bachelor|Master|Doctor|Associate|B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?|MBA)\s*(?:of|in)?\s*[a-zA-Z\s,]+', re.IGNORECASE),
        re.compile(r'\b(?:Bachelor|Master|Doctor of Philosophy|Associate)\b[^\n,]*', re.IGNORECASE)
    ]

    @classmethod
    def parse(cls, raw_text: str) -> Dict[str, Any]:
        """
        Parse raw resume text and return structured data dictionary.
        Returns null (None) or empty lists [] if fields cannot be found.
        """
        if not raw_text or not isinstance(raw_text, str):
            return cls.get_empty_schema()

        text = cls.clean_whitespace(raw_text)
        lines = [line.strip() for line in text.splitlines() if line.strip()]

        email = cls._extract_email(text)
        phone = cls._extract_phone(text)
        linkedin = cls._extract_linkedin(text)
        github = cls._extract_github(text)
        portfolio = cls._extract_portfolio(text, exclude_urls=[linkedin, github])
        name = cls._extract_name(lines, exclude_strings=[email, phone, linkedin, github, portfolio])
        location = cls._extract_location(lines[:12])

        sections = cls._split_into_sections(text)

        skills = cls._extract_skills(sections.get("skills", "") + "\n" + text)
        education = cls._extract_education(sections.get("education", ""), lines)
        experience = cls._extract_experience(sections.get("experience", ""))
        projects = cls._extract_projects(sections.get("projects", ""))
        certifications = cls._extract_certifications(sections.get("certifications", ""))

        return {
            "name": name,
            "email": email,
            "phone": phone,
            "location": location,
            "linkedin_url": linkedin,
            "github_url": github,
            "portfolio_url": portfolio,
            "skills": skills,
            "education": education,
            "experience": experience,
            "projects": projects,
            "certifications": certifications
        }

    @staticmethod
    def get_empty_schema() -> Dict[str, Any]:
        return {
            "name": None,
            "email": None,
            "phone": None,
            "location": None,
            "linkedin_url": None,
            "github_url": None,
            "portfolio_url": None,
            "skills": [],
            "education": [],
            "experience": [],
            "projects": [],
            "certifications": []
        }

    @staticmethod
    def clean_whitespace(text: str) -> str:
        """Clean excessive blank lines and repetitive spacing while retaining document structure."""
        text = text.replace('\xa0', ' ').replace('\t', ' ')
        lines = [' '.join(line.split()) for line in text.splitlines()]
        cleaned = []
        empty_count = 0
        for line in lines:
            if not line:
                if empty_count < 1:
                    cleaned.append('')
                empty_count += 1
            else:
                cleaned.append(line)
                empty_count = 0
        return '\n'.join(cleaned).strip()

    @classmethod
    def _extract_email(cls, text: str) -> Optional[str]:
        match = cls.EMAIL_REGEX.search(text)
        return match.group(0).lower() if match else None

    @classmethod
    def _extract_phone(cls, text: str) -> Optional[str]:
        match = cls.PHONE_REGEX.search(text)
        if match:
            phone_str = match.group(0).strip()
            digits = re.sub(r'\D', '', phone_str)
            if len(digits) >= 7:
                return phone_str
        return None

    @classmethod
    def _extract_linkedin(cls, text: str) -> Optional[str]:
        match = cls.LINKEDIN_REGEX.search(text)
        if match:
            url = match.group(0).strip()
            if not url.startswith('http'):
                url = 'https://' + url
            return url
        return None

    @classmethod
    def _extract_github(cls, text: str) -> Optional[str]:
        match = cls.GITHUB_REGEX.search(text)
        if match:
            url = match.group(0).strip()
            if not url.startswith('http'):
                url = 'https://' + url
            return url
        return None

    @classmethod
    def _extract_portfolio(cls, text: str, exclude_urls: List[Optional[str]]) -> Optional[str]:
        matches = cls.PORTFOLIO_REGEX.findall(text)
        exclude_set = {u.lower() for u in exclude_urls if u}
        for m in matches:
            clean = m.strip()
            if 'linkedin.com' in clean.lower() or 'github.com' in clean.lower() or '@' in clean:
                continue
            full = ('https://' + clean) if not clean.startswith('http') else clean
            if full.lower() not in exclude_set:
                return full
        return None

    @classmethod
    def _extract_name(cls, lines: List[str], exclude_strings: List[Optional[str]]) -> Optional[str]:
        exclude_set = {s.lower() for s in exclude_strings if s}
        headings = {'resume', 'cv', 'curriculum vitae', 'education', 'experience', 'skills', 'projects', 'summary', 'profile'}
        for line in lines[:5]:
            clean = line.strip()
            if not clean or len(clean) > 50 or clean.lower() in headings:
                continue
            if any(exc in clean.lower() for exc in exclude_set if exc):
                continue
            if '@' in clean or 'http' in clean.lower() or 'www.' in clean.lower():
                continue
            words = clean.split()
            if 1 <= len(words) <= 5 and all(re.match(r'^[A-Za-z\.\-\']+$', w) for w in words):
                if ',' in clean:
                    continue
                return clean
        return None

    @classmethod
    def _extract_location(cls, top_lines: List[str]) -> Optional[str]:
        location_pattern = re.compile(r'\b([A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*,\s*[A-Z]{2,}(?:,\s*[A-Z][a-z]+)?)\b')
        for line in top_lines:
            match = location_pattern.search(line)
            if match and '@' not in line and 'http' not in line.lower():
                return match.group(1).strip()
        return None

    @classmethod
    def _split_into_sections(cls, text: str) -> Dict[str, str]:
        keywords = {
            'education': [r'\beducation\b', r'\bacademic background\b', r'\bdegrees\b'],
            'experience': [r'\bwork experience\b', r'\bprofessional experience\b', r'\bemployment\b', r'\bexperience\b'],
            'skills': [r'\bskills\b', r'\btechnical skills\b', r'\btechnologies\b', r'\bcompetencies\b'],
            'projects': [r'\bprojects\b', r'\bpersonal projects\b', r'\bacademic projects\b'],
            'certifications': [r'\bcertifications\b', r'\bcertificates\b', r'\blicenses\b']
        }
        
        lines = text.splitlines()
        current_section = "header"
        sections = {key: [] for key in keywords}
        sections["header"] = []
        
        for line in lines:
            line_lower = line.strip().lower()
            found_header = None
            if len(line_lower) < 35 and not line_lower.endswith('.'):
                for sec_name, patterns in keywords.items():
                    if any(re.search(pat, line_lower) for pat in patterns):
                        found_header = sec_name
                        break
            if found_header:
                current_section = found_header
            else:
                sections[current_section].append(line)
                
        return {k: "\n".join(v).strip() for k, v in sections.items()}

    @classmethod
    def _extract_skills(cls, text: str) -> List[Dict[str, Any]]:
        text_lower = text.lower()
        skills_found = []
        
        categorized = {cat: [] for cat in cls.SKILL_KEYWORDS}
        for category, kw_list in cls.SKILL_KEYWORDS.items():
            for kw in kw_list:
                pattern = r'\b' + re.escape(kw) + r'\b'
                if re.search(pattern, text_lower):
                    formatted = kw.upper() if kw in ['sql', 'r', 'c', 'gcp', 'aws', 'html', 'css', 'php', 'ci/cd'] else kw.title()
                    if formatted not in categorized[category]:
                        categorized[category].append(formatted)
                        
        for cat, items in categorized.items():
            if items:
                skills_found.append({
                    "category": cat,
                    "items": sorted(items)
                })
        return skills_found

    @classmethod
    def _extract_education(cls, edu_text: str, all_lines: List[str]) -> List[Dict[str, Any]]:
        results = []
        search_lines = edu_text.splitlines() if edu_text else all_lines
        
        year_regex = re.compile(r'\b(19\d{2}|20[0-2]\d|2030)\b')
        univ_regex = re.compile(r'\b(?:University|College|Institute|School|Academy|Polytechnic)\b[^\n,]*', re.IGNORECASE)
        
        current_entry = {}
        for line in search_lines:
            clean = line.strip()
            if not clean:
                if current_entry:
                    results.append(current_entry)
                    current_entry = {}
                continue
                
            u_match = univ_regex.search(clean)
            if u_match and not current_entry.get("university"):
                current_entry["university"] = clean.strip()
                
            for dp in cls.DEGREE_PATTERNS:
                d_match = dp.search(clean)
                if d_match and not current_entry.get("degree"):
                    current_entry["degree"] = d_match.group(0).strip()
                    break
                    
            y_matches = year_regex.findall(clean)
            if y_matches and not current_entry.get("graduation_year"):
                current_entry["graduation_year"] = y_matches[-1]
                
        if current_entry and (current_entry.get("university") or current_entry.get("degree") or current_entry.get("graduation_year")):
            results.append(current_entry)
            
        final_edu = []
        for e in results:
            if e.get("degree") or e.get("university"):
                final_edu.append({
                    "degree": e.get("degree", "Academic Degree"),
                    "university": e.get("university", "Accredited Higher Education Institution"),
                    "graduation_year": e.get("graduation_year", None)
                })
        return final_edu

    @classmethod
    def _extract_experience(cls, exp_text: str) -> List[Dict[str, Any]]:
        if not exp_text:
            return []
        items = []
        for line in exp_text.splitlines():
            clean = re.sub(r'^[\*\-\•\·\>\d\.]+\s*', '', line.strip()).strip()
            if len(clean) > 15:
                items.append({
                    "role": clean[:50] + ("..." if len(clean) > 50 else ""),
                    "description": clean,
                    "company": "Professional Role / Organization"
                })
        return items[:5]

    @classmethod
    def _extract_projects(cls, proj_text: str) -> List[Dict[str, Any]]:
        if not proj_text:
            return []
        projects = []
        for line in proj_text.splitlines():
            clean = re.sub(r'^[\*\-\•\·\>\d\.]+\s*', '', line.strip()).strip()
            if len(clean) > 15:
                projects.append({
                    "title": clean.split('.')[0][:45],
                    "description": clean
                })
        return projects[:5]

    @classmethod
    def _extract_certifications(cls, cert_text: str) -> List[str]:
        if not cert_text:
            return []
        certs = []
        for line in cert_text.splitlines():
            clean = re.sub(r'^[\*\-\•\·\>\d\.]+\s*', '', line.strip()).strip()
            if len(clean) > 5 and clean not in certs:
                certs.append(clean)
        return certs[:10]
