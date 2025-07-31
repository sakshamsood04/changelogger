# Changelog Generator Backend

## Setup

### 1. Create and activate virtual environment
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables
```bash
cp env.example .env
```

Edit `.env` and add your API keys:
- `GITHUB_TOKEN`: Your GitHub Personal Access Token
- `OPENAI_API_KEY`: Your OpenAI API key (for future use)

### 4. Run the server
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## API Endpoints

### Health Check
- `GET /health` - Check if the service is running and configured

### GitHub API
- `GET /api/v1/github/test` - Test GitHub API connection
- `POST /api/v1/github/repository/info` - Get repository information
- `POST /api/v1/github/commits` - Get commits from a repository
- `POST /api/v1/github/commits/with-diffs` - Get commits with detailed diffs

## GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with these scopes:
   - `repo` (for private repositories)
   - `public_repo` (for public repositories)
3. Add the token to your `.env` file 