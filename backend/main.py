from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routes import router
from auth_routes import router as auth_router
from changelog_routes import router as changelog_router
from config import settings

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Changelog Generator API",
    description="AI-powered changelog generator using GitHub API and OpenAI",
    version="1.0.0"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React frontend ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)
app.include_router(auth_router)
app.include_router(changelog_router)

@app.get("/")
async def root():
    return {
        "message": "Changelog Generator API is running!",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy", 
        "service": "changelog-generator"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=os.getenv("DEBUG", "false").lower() == "true"
    ) 