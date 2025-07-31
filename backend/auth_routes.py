from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
import httpx
import secrets
from typing import Dict, Any
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory session storage (for demo - use Redis/database in production)
sessions: Dict[str, Dict[str, Any]] = {}

@router.get("/github/login")
async def github_login():
    """Initiate GitHub OAuth login"""
    if not settings.validate_github_oauth_config():
        raise HTTPException(
            status_code=500, 
            detail="GitHub OAuth not properly configured"
        )
    
    # Generate state parameter for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Store state in session (in production, use proper session management)
    sessions[state] = {"initiated": True}
    
    # GitHub OAuth authorization URL
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri=http://localhost:8000/auth/github/callback"
        f"&scope=user:email"
        f"&state={state}"
    )
    
    return {"authorization_url": github_auth_url}

@router.get("/github/callback")
async def github_callback(code: str, state: str, response: Response):
    """Handle GitHub OAuth callback"""
    
    # Verify state parameter
    if state not in sessions:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    try:
        # Exchange code for access token
        token_data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
        }
        
        headers = {"Accept": "application/json"}
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data=token_data,
                headers=headers
            )
            
            if token_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to get access token")
            
            token_json = token_response.json()
            access_token = token_json.get("access_token")
            
            if not access_token:
                raise HTTPException(status_code=400, detail="No access token received")
            
            # Get user info from GitHub
            user_headers = {
                "Authorization": f"token {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            user_response = await client.get(
                "https://api.github.com/user",
                headers=user_headers
            )
            
            if user_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to get user info")
            
            user_data = user_response.json()
            
            # Create session
            session_id = secrets.token_urlsafe(32)
            sessions[session_id] = {
                "user": {
                    "id": user_data["id"],
                    "login": user_data["login"],
                    "name": user_data.get("name"),
                    "email": user_data.get("email"),
                    "avatar_url": user_data["avatar_url"],
                    "authenticated": True
                },
                "access_token": access_token
            }
            
            # Set HTTP-only cookie
            response = RedirectResponse(url=f"{settings.FRONTEND_URL}/?auth=success")
            response.set_cookie(
                key="session_id",
                value=session_id,
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite="lax",
                max_age=86400  # 24 hours
            )
            
            # Clean up state
            del sessions[state]
            
            return response
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth error: {str(e)}")

@router.get("/status")
async def auth_status(request: Request):
    """Check authentication status"""
    session_id = request.cookies.get("session_id")
    
    if not session_id or session_id not in sessions:
        return {"authenticated": False}
    
    session_data = sessions[session_id]
    return {
        "authenticated": True,
        "user": session_data["user"]
    }

@router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_id = request.cookies.get("session_id")
    
    if session_id and session_id in sessions:
        del sessions[session_id]
    
    response.delete_cookie("session_id")
    return {"message": "Logged out successfully"}