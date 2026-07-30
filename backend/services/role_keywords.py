"""
Wrapper module for target-role keyword and competency definitions.
Reuses the unified configuration from services.career_roles to avoid data duplication across Module 4 and Module 5.
"""

from services.career_roles import CAREER_ROLES as ROLE_DEFINITIONS, TECH_SYNONYMS, get_role_competency_profile

def get_role_keywords(target_role: str) -> dict:
    """
    Retrieve skill & keyword requirements for a target role.
    Delegates directly to the unified career roles registry.
    """
    return get_role_competency_profile(target_role)

__all__ = ["ROLE_DEFINITIONS", "TECH_SYNONYMS", "get_role_keywords"]
