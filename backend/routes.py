from fastapi import APIRouter, HTTPException, Request
from github_api import github_api, GitHubAPI, GitHubAPIError
from auth_middleware import get_authenticated_user_token

# Create router for GitHub API endpoints
router = APIRouter(prefix="/api/v1", tags=["GitHub API"])

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
async def list_user_repositories(request: Request):
    """List repositories that the user owns or has admin access to"""
    try:
        # Get user's GitHub token from session
        user_token = get_authenticated_user_token(request)
        
        # Create GitHub API instance with user's token
        user_github_api = GitHubAPI(user_token=user_token)
        repos = await user_github_api.get_user_repositories()
        return {
            "status": "success",
            "count": len(repos),
            "repositories": repos
        }
    except GitHubAPIError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


 