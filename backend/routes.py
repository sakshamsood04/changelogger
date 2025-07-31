from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from github_api import github_api, GitHubAPIError
from changelog_service import changelog_service, ChangelogServiceError
import httpx
from config import settings

# Create router for GitHub API endpoints
router = APIRouter(prefix="/api/v1", tags=["GitHub API"])

class RepositoryRequest(BaseModel):
    owner: str
    repo: str

class CommitsRequest(BaseModel):
    owner: str
    repo: str
    since: Optional[str] = None
    until: Optional[str] = None
    max_commits: Optional[int] = 10

class ChangelogRequest(BaseModel):
    owner: str
    repo: str
    since_date: str  # ISO 8601 format: "2024-01-15T00:00:00Z"
    max_commits: Optional[int] = 50

@router.get("/github/test")
async def test_github_connection():
    """Test GitHub API connection and token validity"""
    try:
        result = await github_api.test_connection()
        return {
            "status": "success",
            "message": "GitHub API connection successful",
            "user": result["user"]["login"],
            "api_calls_remaining": result["user"].get("remaining", "unknown")
        }
    except GitHubAPIError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/repositories")
async def list_user_repositories():
    """List repositories that the user owns or has admin access to"""
    try:
        repos = await github_api.get_user_repositories()
        return {
            "status": "success",
            "count": len(repos),
            "repositories": repos
        }
    except GitHubAPIError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/changelog/generate")
async def generate_changelog(request: ChangelogRequest):
    """Generate AI-powered changelog for a repository since a given date"""
    try:
        changelog = await changelog_service.generate_changelog(
            owner=request.owner,
            repo=request.repo,
            since_date=request.since_date,
            max_commits=request.max_commits or 50
        )
        
        return {
            "status": "success",
            "changelog": changelog
        }
        
    except ChangelogServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/openai/test")
async def test_openai_connection():
    """Test OpenAI API connection and key validity"""
    try:
        if not settings.validate_openai_config():
            return {
                "status": "error",
                "message": "OpenAI API key not properly configured",
                "configured": False
            }
        
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{settings.OPENAI_API_BASE_URL}/models", headers=headers)
            
            if response.status_code == 200:
                models_data = response.json()
                return {
                    "status": "success",
                    "message": "OpenAI API connection successful",
                    "models_count": len(models_data.get("data", [])),
                    "first_few_models": [model["id"] for model in models_data.get("data", [])[:5]]
                }
            else:
                return {
                    "status": "error",
                    "message": f"OpenAI API returned status {response.status_code}",
                    "response_text": response.text[:200]  # First 200 chars of error
                }
                
    except httpx.TimeoutException:
        return {
            "status": "error",
            "message": "OpenAI API request timed out"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"OpenAI API error: {str(e)}"
        }

@router.post("/github/repository/info")
async def get_repository_info(request: RepositoryRequest):
    """Get basic information about a GitHub repository"""
    try:
        repo_info = await github_api.get_repository_info(request.owner, request.repo)
        return {
            "status": "success",
            "repository": {
                "name": repo_info["name"],
                "full_name": repo_info["full_name"],
                "description": repo_info.get("description"),
                "language": repo_info.get("language"),
                "default_branch": repo_info["default_branch"],
                "created_at": repo_info["created_at"],
                "updated_at": repo_info["updated_at"],
                "size": repo_info["size"],
                "open_issues": repo_info["open_issues_count"]
            }
        }
    except GitHubAPIError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/github/commits")
async def get_commits(request: CommitsRequest):
    """Get commits from a repository with optional date filtering"""
    try:
        commits = await github_api.get_commits(
            request.owner, 
            request.repo, 
            request.since, 
            request.until,
            request.max_commits or 10
        )
        
        # Return simplified commit data
        simplified_commits = []
        for commit in commits:
            simplified_commits.append({
                "sha": commit["sha"],
                "message": commit["commit"]["message"],
                "author": commit["commit"]["author"]["name"],
                "date": commit["commit"]["author"]["date"],
                "url": commit["html_url"]
            })
        
        return {
            "status": "success",
            "count": len(simplified_commits),
            "commits": simplified_commits
        }
    except GitHubAPIError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/github/commits/with-diffs")
async def get_commits_with_diffs(request: CommitsRequest):
    """Get commits with detailed file changes and diffs for changelog generation"""
    try:
        commits_with_diffs = await github_api.get_commits_with_diffs(
            request.owner, 
            request.repo, 
            request.since, 
            request.until,
            request.max_commits or 10
        )
        
        # Process and return commit data with diff information
        processed_commits = []
        for commit in commits_with_diffs:
            processed_commit = {
                "sha": commit["sha"],
                "message": commit["commit"]["message"],
                "author": commit["commit"]["author"]["name"],
                "date": commit["commit"]["author"]["date"],
                "url": commit["html_url"],
                "stats": commit.get("stats", {}),
                "files": []
            }
            
            # Process file changes
            if "files" in commit:
                for file in commit["files"]:
                    file_info = {
                        "filename": file["filename"],
                        "status": file["status"],  # added, modified, removed, renamed
                        "additions": file.get("additions", 0),
                        "deletions": file.get("deletions", 0),
                        "changes": file.get("changes", 0)
                    }
                    
                    # Include patch (diff) if available and not too large
                    if "patch" in file and len(file["patch"]) < 10000:  # Limit diff size
                        file_info["patch"] = file["patch"]
                    
                    processed_commit["files"].append(file_info)
            
            processed_commits.append(processed_commit)
        
        return {
            "status": "success",
            "count": len(processed_commits),
            "commits": processed_commits
        }
    except GitHubAPIError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/github/commit/{owner}/{repo}/{sha}")
async def get_commit_details(owner: str, repo: str, sha: str):
    """Get detailed information about a specific commit"""
    try:
        commit_details = await github_api.get_commit_details(owner, repo, sha)
        
        return {
            "status": "success",
            "commit": {
                "sha": commit_details["sha"],
                "message": commit_details["commit"]["message"],
                "author": commit_details["commit"]["author"]["name"],
                "date": commit_details["commit"]["author"]["date"],
                "url": commit_details["html_url"],
                "stats": commit_details.get("stats", {}),
                "files_count": len(commit_details.get("files", [])),
                "files": commit_details.get("files", [])
            }
        }
    except GitHubAPIError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}") 