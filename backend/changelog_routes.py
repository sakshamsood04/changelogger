from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import json

from database import get_db, Changelog, init_db
from commit_service import commit_service
from config import settings
from auth_middleware import get_authenticated_user_token

router = APIRouter(prefix="/api/v1/changelogs", tags=["Changelogs"])

# Initialize database
init_db()

# OpenAI will be initialized per request

class CommitsFetchRequest(BaseModel):
    owner: str
    repo: str
    since_date: Optional[str] = None
    until_date: Optional[str] = None
    max_commits: Optional[int] = 50

class ChangelogGenerateRequest(BaseModel):
    owner: str
    repo: str
    commits: List[Dict[str, Any]]
    selected_commit_shas: List[str]

class ChangelogSaveRequest(BaseModel):
    title: str
    content: str
    repository: str
    commit_range: str
    raw_commits: List[Dict[str, Any]]
    published: bool = False

class ChangelogUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    published: Optional[bool] = None

@router.post("/fetch-commits")
async def fetch_commits(commits_request: CommitsFetchRequest, request: Request):
    """Fetch commits with detailed information for selection"""
    try:
        # Get user's GitHub token from session
        user_token = get_authenticated_user_token(request)
        
        commits = await commit_service.fetch_commits_with_details(
            owner=commits_request.owner,
            repo=commits_request.repo,
            since_date=commits_request.since_date,
            until_date=commits_request.until_date,
            max_commits=commits_request.max_commits or 50,
            user_token=user_token
        )
        
        return {
            "status": "success",
            "commits": commits,
            "count": len(commits)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch commits: {str(e)}")

@router.post("/generate")
async def generate_changelog(request: ChangelogGenerateRequest):
    """Generate changelog from selected commits using AI"""
    try:
        if not settings.validate_openai_config():
            raise HTTPException(status_code=500, detail="OpenAI API not configured")
        
        # Filter commits by selected SHAs
        selected_commits = [
            commit for commit in request.commits 
            if commit['sha'] in request.selected_commit_shas
        ]
        
        if not selected_commits:
            raise HTTPException(status_code=400, detail="No commits selected")
        
        # Format commits for AI
        formatted_commits = commit_service.format_commits_for_ai(selected_commits)
        
        # Create AI prompt
        prompt = f"""
Given the following commit messages and code changes from a GitHub repository, create a user-friendly changelog that summarizes the changes in a clear, organized way.

Focus on:
- User-visible changes and new features
- Bug fixes and improvements
- Breaking changes (if any)
- Technical improvements that affect users

Format as a markdown changelog with appropriate sections (Features, Bug Fixes, Improvements, etc.).

{formatted_commits}

Please create a changelog:
"""
        
        # Call OpenAI API
        try:
            import openai
            
            # Create OpenAI client with minimal configuration
            client = openai.OpenAI(
                api_key=settings.OPENAI_API_KEY
            )
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates clear, user-friendly changelogs from commit data."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.7
            )
            
            changelog_content = response.choices[0].message.content
            
            return {
                "status": "success",
                "changelog": changelog_content
            }
            
        except Exception as openai_error:
            import traceback
            error_details = f"OpenAI API error: {str(openai_error)}\nTraceback: {traceback.format_exc()}"
            print(error_details)  # For debugging
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(openai_error)}")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate changelog: {str(e)}")

@router.post("/save")
async def save_changelog(request: ChangelogSaveRequest, db: Session = Depends(get_db)):
    """Save changelog to database"""
    try:
        changelog = Changelog(
            title=request.title,
            content=request.content,
            author="system",  # Could be extracted from user session
            repository=request.repository,
            commit_range=request.commit_range,
            raw_commits=request.raw_commits,
            published=True
        )
        
        db.add(changelog)
        db.commit()
        db.refresh(changelog)
        
        return {
            "status": "success",
            "changelog_id": changelog.id,
            "message": "Changelog saved successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save changelog: {str(e)}")

def create_markdown_preview(content: str, max_length: int = 300) -> str:
    """Create a preview that respects markdown structure"""
    if len(content) <= max_length:
        return content
    
    # Split content into lines
    lines = content.split('\n')
    preview_lines = []
    current_length = 0
    
    for line in lines:
        # If adding this line would exceed the limit, stop
        if current_length + len(line) + 1 > max_length:
            break
        
        preview_lines.append(line)
        current_length += len(line) + 1  # +1 for newline
    
    preview = '\n'.join(preview_lines)
    
    # Only add "..." if we actually truncated
    if current_length < len(content):
        preview += "\n\n..."
    
    return preview

@router.get("/")
async def list_changelogs(published_only: bool = False, db: Session = Depends(get_db)):
    """List all changelogs"""
    try:
        query = db.query(Changelog)
        if published_only:
            query = query.filter(Changelog.published == True)
        
        changelogs = query.order_by(Changelog.created_at.desc()).all()
        
        return {
            "status": "success",
            "changelogs": [
                {
                    "id": c.id,
                    "title": c.title,
                    "repository": c.repository,
                    "created_at": c.created_at.isoformat(),
                    "published": c.published,
                    "content_preview": create_markdown_preview(c.content)
                }
                for c in changelogs
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list changelogs: {str(e)}")

@router.get("/{changelog_id}")
async def get_changelog(changelog_id: int, db: Session = Depends(get_db)):
    """Get a specific changelog"""
    try:
        changelog = db.query(Changelog).filter(Changelog.id == changelog_id).first()
        if not changelog:
            raise HTTPException(status_code=404, detail="Changelog not found")
        
        return {
            "status": "success",
            "changelog": {
                "id": changelog.id,
                "title": changelog.title,
                "content": changelog.content,
                "repository": changelog.repository,
                "commit_range": changelog.commit_range,
                "created_at": changelog.created_at.isoformat(),
                "published": changelog.published,
                "raw_commits": changelog.raw_commits
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get changelog: {str(e)}")

@router.put("/{changelog_id}")
async def update_changelog(changelog_id: int, request: ChangelogUpdateRequest, db: Session = Depends(get_db)):
    """Update a changelog"""
    try:
        changelog = db.query(Changelog).filter(Changelog.id == changelog_id).first()
        if not changelog:
            raise HTTPException(status_code=404, detail="Changelog not found")
        
        if request.title is not None:
            changelog.title = request.title
        if request.content is not None:
            changelog.content = request.content
        if request.published is not None:
            changelog.published = request.published
        
        db.commit()
        db.refresh(changelog)
        
        return {
            "status": "success",
            "message": "Changelog updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update changelog: {str(e)}")

@router.delete("/{changelog_id}")
async def delete_changelog(changelog_id: int, db: Session = Depends(get_db)):
    """Delete a changelog"""
    try:
        changelog = db.query(Changelog).filter(Changelog.id == changelog_id).first()
        if not changelog:
            raise HTTPException(status_code=404, detail="Changelog not found")
        
        db.delete(changelog)
        db.commit()
        
        return {
            "status": "success",
            "message": "Changelog deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete changelog: {str(e)}")