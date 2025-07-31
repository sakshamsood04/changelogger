import os
from typing import Optional
from dotenv import load_dotenv
import httpx

# Load environment variables from .env file
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
    
    def validate_github_config(self) -> bool:
        """Check if GitHub API token is properly configured (basic validation)"""
        # Made optional since we now primarily use user OAuth tokens
        return (self.GITHUB_TOKEN is not None and 
                self.GITHUB_TOKEN != "your_github_personal_access_token_here" and
                len(self.GITHUB_TOKEN.strip()) > 0)
    
    def validate_openai_config(self) -> bool:
        """Check if OpenAI API key is properly configured (basic validation)"""
        return (self.OPENAI_API_KEY is not None and 
                self.OPENAI_API_KEY != "your_openai_api_key_here" and
                len(self.OPENAI_API_KEY.strip()) > 0)
    
    def validate_github_oauth_config(self) -> bool:
        """Check if GitHub OAuth is properly configured"""
        return (self.GITHUB_CLIENT_ID is not None and 
                self.GITHUB_CLIENT_SECRET is not None and
                len(self.GITHUB_CLIENT_ID.strip()) > 0 and
                len(self.GITHUB_CLIENT_SECRET.strip()) > 0)
    
    async def test_github_connection(self) -> bool:
        """Actually test GitHub API connectivity"""
        if not self.validate_github_config():
            return False
        
        try:
            headers = {
                "Authorization": f"token {self.GITHUB_TOKEN}",
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "changelog-generator/1.0"
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.GITHUB_API_BASE_URL}/user", headers=headers)
                return response.status_code == 200
        except Exception:
            return False
    
    async def test_openai_connection(self) -> bool:
        """Actually test OpenAI API connectivity"""
        if not self.validate_openai_config():
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            
            # Test with a minimal models list request
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.OPENAI_API_BASE_URL}/models", headers=headers)
                return response.status_code == 200
        except Exception:
            return False

# Create global settings instance
settings = Settings() 