import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings and configuration"""
    
    # GitHub API Configuration
    GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN")
    GITHUB_API_BASE_URL: str = "https://api.github.com"
    
    # GitHub OAuth Configuration
    GITHUB_CLIENT_ID: Optional[str] = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: Optional[str] = os.getenv("GITHUB_CLIENT_SECRET")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # OpenAI API Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_API_BASE_URL: str = "https://api.openai.com/v1"
    
    # Application Configuration
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

settings = Settings() 