from github_api import github_api, GitHubAPIError
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class CommitService:
    """Service for fetching and processing commit data"""
    
    async def fetch_commits_with_details(
        self, 
        owner: str, 
        repo: str, 
        since_date: Optional[str] = None,
        until_date: Optional[str] = None,
        max_commits: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Fetch commits with detailed information including diffs
        """
        try:
            # Get commits with diffs
            commits_with_diffs = await github_api.get_commits_with_diffs(
                owner, repo, since_date, until_date, max_commits
            )
            
            processed_commits = []
            for commit in commits_with_diffs:
                processed_commit = {
                    "sha": commit["sha"],
                    "message": commit["commit"]["message"],
                    "author": {
                        "name": commit["commit"]["author"]["name"],
                        "email": commit["commit"]["author"]["email"],
                        "date": commit["commit"]["author"]["date"]
                    },
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
                            "changes": file.get("changes", 0),
                            "patch": file.get("patch", "")[:5000] if file.get("patch") else ""  # Limit patch size
                        }
                        processed_commit["files"].append(file_info)
                
                processed_commits.append(processed_commit)
            
            return processed_commits
            
        except GitHubAPIError as e:
            logger.error(f"GitHub API error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in fetch_commits_with_details: {str(e)}")
            raise

    def format_commits_for_ai(self, commits: List[Dict[str, Any]]) -> str:
        """
        Format commits data for AI processing
        """
        formatted_text = "COMMITS AND CHANGES:\n\n"
        
        for i, commit in enumerate(commits, 1):
            formatted_text += f"COMMIT {i}:\n"
            formatted_text += f"SHA: {commit['sha'][:8]}\n"
            formatted_text += f"Author: {commit['author']['name']}\n"
            formatted_text += f"Date: {commit['author']['date']}\n"
            formatted_text += f"Message: {commit['message']}\n"
            
            if commit.get('stats', {}).get('total', 0) > 0:
                stats = commit['stats']
                formatted_text += f"Stats: +{stats.get('additions', 0)} -{stats.get('deletions', 0)} changes\n"
            
            if commit['files']:
                formatted_text += "Files changed:\n"
                for file in commit['files']:
                    formatted_text += f"  - {file['filename']} ({file['status']})\n"
                    if file['patch'] and len(file['patch']) > 0:
                        # Include a truncated diff for context
                        patch_lines = file['patch'].split('\n')[:10]  # First 10 lines
                        formatted_text += f"    Diff: {chr(10).join(patch_lines)}\n"
            
            formatted_text += "\n" + "-"*50 + "\n\n"
        
        return formatted_text

commit_service = CommitService()