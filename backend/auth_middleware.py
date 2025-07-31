from fastapi import Request, HTTPException
from typing import Optional, Dict, Any
from auth_routes import sessions


def get_user_session(request: Request) -> Optional[Dict[str, Any]]:
    """Extract user session from request cookies"""
    session_id = request.cookies.get("session_id")
    
    if not session_id or session_id not in sessions:
        return None
    
    return sessions[session_id]


def get_user_token(request: Request) -> Optional[str]:
    """Extract user's GitHub access token from session"""
    session = get_user_session(request)
    
    if not session:
        return None
    
    return session.get("access_token")


def require_authentication(request: Request) -> Dict[str, Any]:
    """Require user to be authenticated and return session data"""
    session = get_user_session(request)
    
    if not session:
        raise HTTPException(
            status_code=401, 
            detail="Authentication required. Please log in first."
        )
    
    return session


def get_authenticated_user_token(request: Request) -> str:
    """Get authenticated user's GitHub token or raise 401"""
    session = require_authentication(request)
    
    access_token = session.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="GitHub access token not found. Please re-authenticate."
        )
    
    return access_token 