"""
Modular Career Role Competency & Skill Requirement Database for CareerOS AI.
Unified single-source-of-truth configuration shared across Module 4 (ATS Analyzer)
and Module 5 (Skill Gap & AI Career Readiness Analyzer).
"""

TECH_SYNONYMS = {
    "react.js": "React",
    "reactjs": "React",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express.js": "Express.js",
    "expressjs": "Express.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "mongodb": "MongoDB",
    "mongo db": "MongoDB",
    "mongo": "MongoDB",
    "postgresql": "PostgreSQL",
    "postgre sql": "PostgreSQL",
    "machine learning": "Machine Learning",
    "artificial intelligence": "Artificial Intelligence",
    "deep learning": "Deep Learning",
    "amazon web services": "AWS",
    "google cloud platform": "GCP",
    "kubernetes": "Kubernetes",
    "tailwind css": "Tailwind CSS",
    "python 3": "Python",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "golang": "Go",
    "c plus plus": "C++",
    "c sharp": "C#"
}

CAREER_ROLES = {
    "python developer": {
        "title": "Python Developer",
        "core_skills": ["Python", "Object-Oriented Programming", "REST APIs", "SQL", "Git"],
        "required_skills": ["Python", "SQL", "Git", "REST APIs", "Object-Oriented Programming"],
        "preferred_skills": ["Django", "Flask", "FastAPI", "Docker", "PostgreSQL", "AWS", "Unit Testing", "Microservices", "Linux", "Celery"],
        "tools": ["Git", "Docker", "Postman", "Jira", "Linux", "PyCharm", "VS Code", "Pytest"],
        "frameworks": ["Django", "Flask", "FastAPI", "Celery", "SQLAlchemy", "Pydantic"],
        "databases": ["PostgreSQL", "MongoDB", "Redis", "MySQL", "SQLite"],
        "cloud_skills": ["AWS", "Kubernetes", "Docker", "CI/CD", "Linux"],
        "technologies": ["REST APIs", "Microservices", "PostgreSQL", "Redis", "MongoDB", "AWS", "Linux", "Docker", "Kubernetes", "CI/CD"],
        "keywords": ["python", "object-oriented programming", "backend", "api", "database", "orm", "asynchronous", "microservices", "debugging", "data structures", "algorithms", "pytest", "unit testing"]
    },
    "full stack developer": {
        "title": "Full Stack Developer",
        "core_skills": ["JavaScript", "HTML", "CSS", "SQL", "REST APIs", "Git"],
        "required_skills": ["JavaScript", "HTML", "CSS", "SQL", "Git", "REST APIs"],
        "preferred_skills": ["React", "Node.js", "TypeScript", "Python", "MongoDB", "PostgreSQL", "Docker", "AWS", "State Management"],
        "tools": ["Git", "Docker", "Postman", "Webpack", "Vite", "Jira", "AWS"],
        "frameworks": ["React", "Angular", "Vue.js", "Node.js", "Express.js", "Next.js", "Django", "Flask", "Tailwind CSS", "Bootstrap"],
        "databases": ["MongoDB", "PostgreSQL", "MySQL", "Redis"],
        "cloud_skills": ["Docker", "AWS", "CI/CD", "Vercel", "Netlify"],
        "technologies": ["HTML", "CSS", "JavaScript", "TypeScript", "REST APIs", "GraphQL", "MongoDB", "PostgreSQL", "Redis", "Docker", "CI/CD"],
        "keywords": ["full stack", "frontend", "backend", "responsive design", "api integration", "database design", "authentication", "jwt", "version control", "deployment", "state management", "agile"]
    },
    "frontend developer": {
        "title": "Frontend Developer",
        "core_skills": ["HTML", "CSS", "JavaScript", "Responsive Design", "Git"],
        "required_skills": ["HTML", "CSS", "JavaScript", "Git", "Responsive Design"],
        "preferred_skills": ["React", "TypeScript", "Tailwind CSS", "Next.js", "Vue.js", "State Management", "Webpack", "Vite", "UI/UX"],
        "tools": ["Git", "Webpack", "Vite", "Babel", "Figma", "Chrome DevTools", "Postman"],
        "frameworks": ["React", "Angular", "Vue.js", "Next.js", "Tailwind CSS", "Bootstrap", "Redux", "Zustand"],
        "databases": ["IndexedDB", "Firebase", "Local Storage"],
        "cloud_skills": ["Vercel", "Netlify", "Cloudflare", "AWS S3", "CDN"],
        "technologies": ["HTML", "CSS", "JavaScript", "TypeScript", "DOM", "REST APIs", "GraphQL", "WebSockets", "PWA"],
        "keywords": ["frontend", "user interface", "user experience", "responsive", "mobile-first", "dom manipulation", "state management", "component-based", "performance optimization", "accessibility", "cross-browser", "css grid", "flexbox"]
    },
    "backend developer": {
        "title": "Backend Developer",
        "core_skills": ["SQL", "REST APIs", "Database Design", "Git", "Server Architecture"],
        "required_skills": ["SQL", "REST APIs", "Git", "Database Design"],
        "preferred_skills": ["Python", "Java", "Node.js", "Docker", "Kubernetes", "Microservices", "PostgreSQL", "MongoDB", "Redis", "AWS", "CI/CD"],
        "tools": ["Git", "Docker", "Kubernetes", "Postman", "Swagger", "Linux", "Jenkins", "Jira"],
        "frameworks": ["Django", "Flask", "FastAPI", "Express.js", "Spring Boot", "ASP.NET", "Ruby on Rails", "Hibernate"],
        "databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch"],
        "cloud_skills": ["AWS", "Docker", "Kubernetes", "Microservices", "GCP", "Azure", "CI/CD", "Linux"],
        "technologies": ["REST APIs", "GraphQL", "gRPC", "PostgreSQL", "MySQL", "MongoDB", "Redis", "RabbitMQ", "Kafka", "AWS", "Linux"],
        "keywords": ["backend", "server-side", "api design", "database indexing", "scalability", "concurrency", "caching", "authentication", "authorization", "microservices", "performance", "security", "logging", "orm"]
    },
    "data analyst": {
        "title": "Data Analyst",
        "core_skills": ["SQL", "Excel", "Data Visualization", "Statistics"],
        "required_skills": ["SQL", "Excel", "Data Visualization", "Statistics"],
        "preferred_skills": ["Python", "R", "Tableau", "Power BI", "Pandas", "Data Cleaning", "Data Modeling", "Business Intelligence", "ETL"],
        "tools": ["Tableau", "Power BI", "Excel", "Jupyter Notebook", "Git", "Google Analytics", "Looker"],
        "frameworks": ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Plotly"],
        "databases": ["PostgreSQL", "MySQL", "BigQuery", "Snowflake", "SQL Server"],
        "cloud_skills": ["AWS", "Google Cloud BigQuery", "Azure Synapse", "ETL"],
        "technologies": ["SQL", "PostgreSQL", "MySQL", "BigQuery", "Snowflake", "Python", "R", "ETL", "Data Warehousing"],
        "keywords": ["data analysis", "reporting", "dashboard", "business intelligence", "data storytelling", "data mining", "exploratory data analysis", "eda", "statistical analysis", "metrics", "kpi", "trend analysis", "data validation"]
    },
    "data scientist": {
        "title": "Data Scientist",
        "core_skills": ["Python", "SQL", "Statistics", "Machine Learning"],
        "required_skills": ["Python", "SQL", "Statistics", "Machine Learning"],
        "preferred_skills": ["Scikit-Learn", "Pandas", "NumPy", "Deep Learning", "TensorFlow", "PyTorch", "Data Visualization", "Feature Engineering", "NLP", "A/B Testing"],
        "tools": ["Jupyter", "Git", "Docker", "Tableau", "Apache Spark", "MLflow", "AWS"],
        "frameworks": ["Scikit-Learn", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Matplotlib", "Seaborn", "SciPy", "Keras"],
        "databases": ["PostgreSQL", "MongoDB", "BigQuery", "Vector Databases"],
        "cloud_skills": ["AWS", "GCP", "SageMaker", "Docker", "Spark"],
        "technologies": ["Python", "R", "SQL", "PostgreSQL", "Spark", "Hadoop", "AWS", "GCP", "MongoDB", "Vector Databases"],
        "keywords": ["data science", "predictive modeling", "statistical modeling", "hypothesis testing", "regression", "classification", "clustering", "feature engineering", "cross-validation", "model evaluation", "big data", "etl", "experimentation"]
    },
    "machine learning engineer": {
        "title": "Machine Learning Engineer",
        "core_skills": ["Python", "Machine Learning", "Model Deployment", "Git"],
        "required_skills": ["Python", "Machine Learning", "Model Deployment", "Git"],
        "preferred_skills": ["TensorFlow", "PyTorch", "Scikit-Learn", "Docker", "Kubernetes", "MLOps", "Deep Learning", "AWS", "Data Pipelines", "SQL", "C++"],
        "tools": ["Docker", "Kubernetes", "Git", "MLflow", "Apache Airflow", "Weights & Biases", "AWS", "GCP"],
        "frameworks": ["TensorFlow", "PyTorch", "Keras", "Scikit-Learn", "Transformers", "FastAPI", "ONNX", "Ray"],
        "databases": ["PostgreSQL", "MongoDB", "Feature Stores", "Redis"],
        "cloud_skills": ["AWS", "GCP", "Kubernetes", "Docker", "MLOps", "Kafka"],
        "technologies": ["Python", "C++", "SQL", "Docker", "Kubernetes", "REST APIs", "gRPC", "Spark", "AWS", "Kafka"],
        "keywords": ["ml engineer", "mlops", "model deployment", "inference", "model optimization", "neural networks", "feature store", "data pipelines", "scalability", "distributed computing", "cloud computing", "ci/cd", "hyperparameter tuning"]
    },
    "ai engineer": {
        "title": "AI Engineer",
        "core_skills": ["Python", "Artificial Intelligence", "Deep Learning", "Git"],
        "required_skills": ["Python", "Artificial Intelligence", "Deep Learning", "Git"],
        "preferred_skills": ["LLMs", "Generative AI", "LangChain", "PyTorch", "TensorFlow", "Transformers", "Vector Databases", "Prompt Engineering", "RAG", "NLP", "REST APIs"],
        "tools": ["Git", "Docker", "Postman", "Hugging Face", "Ollama", "Jupyter", "VS Code", "AWS"],
        "frameworks": ["LangChain", "PyTorch", "TensorFlow", "Transformers", "LlamaIndex", "FastAPI", "Flask"],
        "databases": ["Pinecone", "ChromaDB", "Milvus", "Weaviate", "PostgreSQL", "Vector Databases"],
        "cloud_skills": ["AWS", "OpenAI API", "Hugging Face Endpoints", "Docker", "GCP"],
        "technologies": ["Python", "Vector Databases", "Pinecone", "ChromaDB", "Milvus", "REST APIs", "OpenAI API", "Hugging Face", "PostgreSQL"],
        "keywords": ["artificial intelligence", "large language models", "llm", "generative ai", "retrieval-augmented generation", "rag", "natural language processing", "nlp", "computer vision", "transformers", "fine-tuning", "embeddings", "agentic workflows", "api integration"]
    },
    "react developer": {
        "title": "React Developer",
        "core_skills": ["React", "JavaScript", "HTML", "CSS", "Git"],
        "required_skills": ["React", "JavaScript", "HTML", "CSS", "Git"],
        "preferred_skills": ["TypeScript", "Redux", "Next.js", "Tailwind CSS", "State Management", "REST APIs", "Webpack", "Vite", "Testing Library", "Jest"],
        "tools": ["Git", "Vite", "Webpack", "Babel", "Chrome DevTools", "Postman", "Figma", "npm", "yarn"],
        "frameworks": ["React", "Next.js", "Redux", "Zustand", "Tailwind CSS", "Material-UI", "Chakra UI", "Jest", "React Testing Library"],
        "databases": ["Firebase", "IndexedDB", "REST APIs", "GraphQL"],
        "cloud_skills": ["Vercel", "Netlify", "AWS S3", "CI/CD"],
        "technologies": ["JavaScript", "TypeScript", "HTML", "CSS", "REST APIs", "GraphQL", "WebSockets", "PWA", "DOM"],
        "keywords": ["react", "virtual dom", "jsx", "hooks", "custom hooks", "state management", "component lifecycle", "single page application", "spa", "server side rendering", "ssr", "routing", "responsive UI", "component architecture"]
    },
    "java developer": {
        "title": "Java Developer",
        "core_skills": ["Java", "SQL", "Object-Oriented Programming", "Git"],
        "required_skills": ["Java", "SQL", "Object-Oriented Programming", "Git"],
        "preferred_skills": ["Spring Boot", "Hibernate", "Microservices", "REST APIs", "Maven", "Gradle", "Docker", "PostgreSQL", "JUnit", "AWS", "CI/CD"],
        "tools": ["Git", "Maven", "Gradle", "Docker", "IntelliJ IDEA", "Eclipse", "Postman", "Jenkins", "Jira"],
        "frameworks": ["Spring Boot", "Spring Cloud", "Hibernate", "JUnit", "Mockito", "Apache Camel"],
        "databases": ["PostgreSQL", "MySQL", "Oracle", "MongoDB", "Redis"],
        "cloud_skills": ["AWS", "Docker", "Kubernetes", "Microservices", "Kafka", "RabbitMQ", "CI/CD"],
        "technologies": ["Java", "SQL", "PostgreSQL", "MySQL", "Oracle", "REST APIs", "Microservices", "Docker", "Kubernetes", "AWS", "Kafka", "RabbitMQ"],
        "keywords": ["java", "jvm", "spring", "dependency injection", "object-oriented", "concurrency", "multithreading", "jpa", "orm", "microservices", "backend", "scalability", "unit testing", "design patterns"]
    },
    "software engineer": {
        "title": "Software Engineer",
        "core_skills": ["Data Structures", "Algorithms", "Object-Oriented Programming", "Git"],
        "required_skills": ["Data Structures", "Algorithms", "Object-Oriented Programming", "Git"],
        "preferred_skills": ["Python", "Java", "JavaScript", "C++", "SQL", "System Design", "Docker", "REST APIs", "CI/CD", "Testing", "Agile", "Cloud Computing"],
        "tools": ["Git", "Docker", "Kubernetes", "Linux", "Postman", "Jira", "Jenkins", "VS Code", "GitHub Actions"],
        "frameworks": ["Django", "React", "Spring Boot", "Node.js", "Flask", "Express.js", "FastAPI", "Pytest", "JUnit"],
        "databases": ["SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis"],
        "cloud_skills": ["AWS", "Docker", "Kubernetes", "GCP", "Azure", "Linux", "CI/CD"],
        "technologies": ["SQL", "PostgreSQL", "REST APIs", "Microservices", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Linux", "CI/CD"],
        "keywords": ["software engineering", "software development", "problem solving", "system design", "data structures", "algorithms", "clean code", "design patterns", "version control", "testing", "debugging", "agile", "scrum", "architecture", "scalability"]
    },
    "cloud engineer": {
        "title": "Cloud Engineer",
        "core_skills": ["AWS", "Linux", "Networking", "Security", "Terraform"],
        "required_skills": ["AWS", "Linux", "Networking", "Security", "Terraform", "Docker"],
        "preferred_skills": ["Kubernetes", "GCP", "Azure", "CI/CD", "Python", "Bash", "Ansible", "IAM", "CloudFormation", "Monitoring"],
        "tools": ["AWS CLI", "Docker", "Kubernetes", "Terraform", "Ansible", "Git", "Grafana", "Prometheus", "Linux", "Jenkins"],
        "frameworks": ["Serverless Framework", "AWS SAM", "Boto3", "Cloud SDK"],
        "databases": ["DynamoDB", "PostgreSQL", "RDS", "MySQL", "Elastikache", "Redis"],
        "cloud_skills": ["AWS", "GCP", "Azure", "Terraform", "Docker", "Kubernetes", "CloudFormation", "IAM", "VPC", "Serverless", "CI/CD"],
        "technologies": ["AWS", "GCP", "Azure", "Linux", "Terraform", "Docker", "Kubernetes", "Bash", "Python", "Networking", "DNS", "IAM"],
        "keywords": ["cloud computing", "aws", "gcp", "azure", "infrastructure as code", "iac", "terraform", "serverless", "virtualization", "networking", "vpc", "iam", "cloud security", "high availability", "scalability", "cost optimization", "containerization"]
    },
    "devops engineer": {
        "title": "DevOps Engineer",
        "core_skills": ["Linux", "Docker", "Kubernetes", "CI/CD", "Git", "Terraform"],
        "required_skills": ["Linux", "Docker", "Kubernetes", "CI/CD", "Git", "Terraform", "Bash"],
        "preferred_skills": ["AWS", "Jenkins", "GitHub Actions", "Ansible", "Python", "Prometheus", "Grafana", "Helm", "GitOps", "ArgoCD", "Nginx"],
        "tools": ["Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Git", "Terraform", "Ansible", "Helm", "Prometheus", "Grafana", "ArgoCD", "Postman"],
        "frameworks": ["GitOps", "Infrastructure as Code", "Microservices Architecture", "Automated Testing Pipelines"],
        "databases": ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch"],
        "cloud_skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "GCP", "Azure", "Serverless", "Linux"],
        "technologies": ["Docker", "Kubernetes", "Linux", "Terraform", "CI/CD", "Jenkins", "GitHub Actions", "Bash", "Python", "Ansible", "Prometheus", "Grafana"],
        "keywords": ["devops", "continuous integration", "continuous delivery", "ci/cd", "containerization", "docker", "kubernetes", "k8s", "infrastructure as code", "iac", "monitoring", "observability", "site reliability engineering", "sre", "automation", "pipeline", "gitops"]
    }
}

def get_role_competency_profile(target_role: str) -> dict:
    """
    Retrieve structured skill requirements for a target career role.
    Supports exact matching, substring matching, domain heuristics, and dynamic fallbacks.
    """
    if not target_role:
        return CAREER_ROLES["software engineer"]
        
    role_clean = target_role.strip().lower()
    
    if role_clean in CAREER_ROLES:
        return CAREER_ROLES[role_clean]
        
    for key, val in CAREER_ROLES.items():
        if key in role_clean or role_clean in key:
            return val
            
    if "cloud" in role_clean or "aws" in role_clean or "gcp" in role_clean or "azure" in role_clean:
        return CAREER_ROLES["cloud engineer"]
    if "devops" in role_clean or "sre" in role_clean or "kubernetes" in role_clean or "ci/cd" in role_clean:
        return CAREER_ROLES["devops engineer"]
    if "data sci" in role_clean or "ml" in role_clean:
        return CAREER_ROLES["data scientist"]
    if "data anal" in role_clean or "bi " in role_clean or "analyst" in role_clean:
        return CAREER_ROLES["data analyst"]
    if "ai " in role_clean or "artificial intelligence" in role_clean or "llm" in role_clean:
        return CAREER_ROLES["ai engineer"]
    if "front" in role_clean or "ui" in role_clean:
        return CAREER_ROLES["frontend developer"]
    if "back" in role_clean or "api" in role_clean:
        return CAREER_ROLES["backend developer"]
    if "full" in role_clean or "web dev" in role_clean:
        return CAREER_ROLES["full stack developer"]
    if "python" in role_clean:
        return CAREER_ROLES["python developer"]
    if "react" in role_clean:
        return CAREER_ROLES["react developer"]
    if "java" in role_clean and "javascript" not in role_clean:
        return CAREER_ROLES["java developer"]
        
    fallback = dict(CAREER_ROLES["software engineer"])
    fallback["title"] = target_role.strip().title()
    return fallback
