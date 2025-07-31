import json
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from config import settings
from github_api import github_api, GitHubAPIError

class ChangelogServiceError(Exception):
    """Custom exception for changelog service errors"""
    pass

class ChangelogService:
    """Service for generating AI-powered changelogs from GitHub commits"""
    
    def __init__(self):
        self.openai_base_url = settings.OPENAI_API_BASE_URL
    
    @property
    def openai_headers(self):
        """Get OpenAI API headers"""
        if not settings.validate_openai_config():
            raise ChangelogServiceError("OpenAI API key not configured")
        
        return {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
    
    def _extract_commit_data(self, commits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract and structure relevant data from commits for AI analysis"""
        structured_commits = []
        
        for commit in commits:
            commit_data = {
                "sha": commit["sha"][:8],  # Short SHA
                "message": commit["commit"]["message"],
                "author": commit["commit"]["author"]["name"],
                "date": commit["commit"]["author"]["date"],
                "files_changed": len(commit.get("files", [])),
                "additions": commit.get("stats", {}).get("additions", 0),
                "deletions": commit.get("stats", {}).get("deletions", 0),
                "files": []
            }
            
            # Process file changes
            for file in commit.get("files", []):
                file_data = {
                    "filename": file["filename"],
                    "status": file["status"],  # added, modified, removed, renamed
                    "additions": file.get("additions", 0),
                    "deletions": file.get("deletions", 0),
                    "changes": file.get("changes", 0)
                }
                
                # Include meaningful parts of diff, not too large
                if "patch" in file and len(file["patch"]) < 2000:
                    file_data["diff_snippet"] = file["patch"]
                elif "patch" in file:
                    # For large diffs, just include first and last few lines
                    lines = file["patch"].split('\n')
                    if len(lines) > 20:
                        file_data["diff_snippet"] = '\n'.join(lines[:10] + ['...'] + lines[-10:])
                    else:
                        file_data["diff_snippet"] = file["patch"]
                
                commit_data["files"].append(file_data)
            
            structured_commits.append(commit_data)
        
        return structured_commits
    
    def _build_changelog_prompt(self, repo_name: str, since_date: str, commits: List[Dict[str, Any]]) -> str:
        """Build the prompt for OpenAI to generate changelog"""
        
        prompt = f"""You are a product manager creating a public changelog for "{repo_name}" covering user-visible changes since {since_date}.

Analyze the following commit data and generate a changelog that focuses ONLY on changes that end users would care about:
- New features and functionality
- Bug fixes that affect user experience  
- Breaking changes that impact user workflows
- Performance improvements users can notice

IGNORE developer-only changes like:
- Tests, refactoring, code cleanup
- Documentation updates
- Configuration changes
- Dependency updates
- Internal code structure changes

COMMIT DATA:
{json.dumps(commits, indent=2)}

Generate a JSON response with this exact structure:
{{
  "summary": "Brief 1-2 sentence overview of user-visible changes",
  "changes": [
    {{
      "type": "feature|bugfix|improvement|breaking",
      "title": "Clear, user-friendly title of the change",
      "description": "What this means for users in simple terms",
      "impact": "low|medium|high"
    }}
  ]
}}

Focus on:
1. What users can actually see and experience
2. How changes improve or affect the user experience
3. Clear, non-technical language
4. Only include meaningful user-facing changes

If there are no significant user-visible changes, return an empty changes array.

Return ONLY the JSON response, no additional text."""

        return prompt
    
    async def _call_openai_api(self, prompt: str) -> Dict[str, Any]:
        """Make API call to OpenAI for changelog generation"""
        payload = {
            "model": "gpt-4",
            "messages": [
                {
                    "role": "system", 
                    "content": "You are an expert software engineer who creates clear, comprehensive changelogs. Always respond with valid JSON only."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "temperature": 0.3,
            "max_tokens": 2000
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.openai_base_url}/chat/completions",
                    headers=self.openai_headers,
                    json=payload
                )
                response.raise_for_status()
                
                result = response.json()
                content = result["choices"][0]["message"]["content"].strip()
                
                # Parse the JSON response
                try:
                    changelog_data = json.loads(content)
                    return changelog_data
                except json.JSONDecodeError as e:
                    raise ChangelogServiceError(f"OpenAI returned invalid JSON: {e}")
                
            except httpx.HTTPStatusError as e:
                raise ChangelogServiceError(f"OpenAI API error: {e.response.status_code}")
            except httpx.TimeoutException:
                raise ChangelogServiceError("OpenAI API request timed out")
            except Exception as e:
                raise ChangelogServiceError(f"OpenAI API error: {str(e)}")
    
    async def generate_changelog(
        self, 
        owner: str, 
        repo: str, 
        since_date: str,
        max_commits: int = 50
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive changelog for a repository since a given date
        
        Args:
            owner: Repository owner
            repo: Repository name
            since_date: ISO 8601 date string (e.g., "2024-01-15T00:00:00Z")
            max_commits: Maximum number of commits to analyze
        
        Returns:
            Structured changelog data
        """
        try:
            # Fetch commits with diffs since the specified date
            commits_with_diffs = await github_api.get_commits_with_diffs(
                owner, repo, since=since_date, max_commits=max_commits
            )
            
            if not commits_with_diffs:
                return {
                    "summary": "No commits found since the specified date",
                    "total_commits": 0,
                    "date_range": f"since {since_date}",
                    "changes": [],
                    "breaking_changes": [],
                    "notable_commits": []
                }
            
            # Structure the commit data for AI analysis
            structured_commits = self._extract_commit_data(commits_with_diffs)
            
            # Build the prompt for OpenAI
            prompt = self._build_changelog_prompt(f"{owner}/{repo}", since_date, structured_commits)
            
            # Generate changelog using OpenAI
            changelog = await self._call_openai_api(prompt)
            
            # Add metadata
            changelog["repository"] = f"{owner}/{repo}"
            changelog["generated_at"] = datetime.utcnow().isoformat() + "Z"
            changelog["total_commits"] = len(commits_with_diffs)
            
            return changelog
            
        except GitHubAPIError as e:
            raise ChangelogServiceError(f"GitHub API error: {str(e)}")
        except Exception as e:
            raise ChangelogServiceError(f"Changelog generation failed: {str(e)}")

# Create global changelog service instance
changelog_service = ChangelogService() 