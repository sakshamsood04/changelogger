import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from config import settings

class GitHubAPIError(Exception):
    """Custom exception for GitHub API errors"""
    pass

class GitHubAPI:
    """GitHub API client for fetching repository data"""
    
    def __init__(self, user_token: Optional[str] = None):
        self.base_url = settings.GITHUB_API_BASE_URL
        self.user_token = user_token
        self._headers = None
    
    @property
    def headers(self):
        """Lazy load headers to check token at runtime"""
        # Use user token if provided, otherwise fall back to server token
        if self.user_token:
            token = self.user_token
        else:
            if not settings.GITHUB_TOKEN:
                raise GitHubAPIError("GitHub token not configured. Please set GITHUB_TOKEN in your .env file.")
            token = settings.GITHUB_TOKEN
        
        if self._headers is None:
            self._headers = {
                "Authorization": f"token {token}",
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "changelog-generator/1.0"
            }
        return self._headers
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test GitHub API connection and token validity"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/user",
                    headers=self.headers
                )
                response.raise_for_status()
                return {
                    "status": "success",
                    "user": response.json()
                }
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    raise GitHubAPIError("Invalid GitHub token")
                elif e.response.status_code == 403:
                    raise GitHubAPIError("GitHub API rate limit exceeded")
                else:
                    raise GitHubAPIError(f"GitHub API error: {e.response.status_code}")
            except Exception as e:
                raise GitHubAPIError(f"Connection error: {str(e)}")
    
    async def get_user_repositories(self, type: str = "owner") -> List[Dict[str, Any]]:
        """
        Get repositories that the user owns or has admin access to
        
        Args:
            type: "owner" for owned repos, "member" for member repos, "all" for both
        """
        async with httpx.AsyncClient() as client:
            try:
                params = {
                    "type": type,
                    "sort": "updated",
                    "per_page": 100
                }
                
                response = await client.get(
                    f"{self.base_url}/user/repos",
                    headers=self.headers,
                    params=params
                )
                response.raise_for_status()
                repos = response.json()
                
                # Filter for repos where user has admin permissions and return simplified data
                return [
                    {
                        "name": repo["name"],
                        "full_name": repo["full_name"],
                        "description": repo.get("description"),
                        "language": repo.get("language"),
                        "updated_at": repo["updated_at"],
                        "private": repo["private"],
                        "default_branch": repo["default_branch"]
                    }
                    for repo in repos
                    if repo.get("permissions", {}).get("admin", False)
                ]
                
            except httpx.HTTPStatusError as e:
                raise GitHubAPIError(f"Error fetching repositories: {e.response.status_code}")
    
    async def get_repository_info(self, owner: str, repo: str) -> Dict[str, Any]:
        """Get basic repository information"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo}",
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise GitHubAPIError(f"Repository {owner}/{repo} not found")
                else:
                    raise GitHubAPIError(f"Error fetching repository: {e.response.status_code}")
    
    async def get_commits(
        self, 
        owner: str, 
        repo: str, 
        since: Optional[str] = None, 
        until: Optional[str] = None,
        per_page: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get commits from a repository within a date range
        
        Args:
            owner: Repository owner
            repo: Repository name
            since: ISO 8601 date string (optional)
            until: ISO 8601 date string (optional)
            per_page: Number of commits per page (max 100)
        """
        async with httpx.AsyncClient() as client:
            params = {"per_page": min(per_page, 100)}
            
            if since:
                params["since"] = since
            if until:
                params["until"] = until
            
            try:
                response = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo}/commits",
                    headers=self.headers,
                    params=params
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                raise GitHubAPIError(f"Error fetching commits: {e.response.status_code}")
    
    async def get_commit_details(self, owner: str, repo: str, sha: str) -> Dict[str, Any]:
        """
        Get detailed information about a specific commit including file changes and diffs
        
        Args:
            owner: Repository owner
            repo: Repository name
            sha: Commit SHA
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo}/commits/{sha}",
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                raise GitHubAPIError(f"Error fetching commit details: {e.response.status_code}")
    
    async def get_commits_with_diffs(
        self, 
        owner: str, 
        repo: str, 
        since: Optional[str] = None, 
        until: Optional[str] = None,
        max_commits: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get commits with their detailed diffs for changelog generation
        
        Args:
            owner: Repository owner
            repo: Repository name
            since: ISO 8601 date string (optional)
            until: ISO 8601 date string (optional)
            max_commits: Maximum number of commits to fetch with diffs
        """
        # First get the list of commits
        commits = await self.get_commits(owner, repo, since, until, max_commits)
        
        # Get detailed information for each commit concurrently would be better but for simplicity keep sequential
        detailed_commits = []
        for commit in commits[:max_commits]:  # Limit to prevent API abuse
            try:
                detailed_commit = await self.get_commit_details(owner, repo, commit["sha"])
                detailed_commits.append(detailed_commit)
            except GitHubAPIError:
                # Skip failed commits silently to avoid disruption
                continue
        
        return detailed_commits

# Create global GitHub API instance (for server operations)
github_api = GitHubAPI() 