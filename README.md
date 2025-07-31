# Changelogger

A minimal React frontend with GitHub OAuth authentication for AI-powered changelog generation.

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- GitHub OAuth App (for authentication)
- GitHub Personal Access Token (for API access)
- OpenAI API Key (for changelog generation)

## Setup

### 1. GitHub OAuth App Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: `Changelogger`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:8000/auth/github/callback`
4. Save the Client ID and Client Secret

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your credentials:
# - GITHUB_CLIENT_ID (from OAuth App)
# - GITHUB_CLIENT_SECRET (from OAuth App)  
# - GITHUB_TOKEN (Personal Access Token with repo access)
# - OPENAI_API_KEY (OpenAI API key)

# Run the backend
python main.py
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Click "Sign in with GitHub" 
3. Authorize the application
4. You'll be redirected back to the dashboard

## Features

- **Minimal Design**: Clean, simple interface using only white, beige, and subtle shadows
- **GitHub OAuth**: Secure authentication via GitHub
- **Responsive**: Works on all screen sizes
- **TypeScript**: Full type safety
- **Styled Components**: CSS-in-JS with minimal color palette

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── auth_routes.py       # GitHub OAuth routes
│   ├── routes.py           # API routes
│   ├── config.py           # Configuration
│   └── requirements.txt    # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── contexts/       # React contexts
    │   ├── services/       # API services
    │   ├── styles/         # Global styles
    │   └── types/          # TypeScript types
    ├── package.json        # Node.js dependencies
    └── vite.config.ts      # Vite configuration
```

## Environment Variables

### Backend (.env)
- `GITHUB_CLIENT_ID` - GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth App Client Secret  
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `OPENAI_API_KEY` - OpenAI API Key
- `FRONTEND_URL` - Frontend URL (default: http://localhost:3000)
- `DEBUG` - Debug mode (default: false)

## Security

- Uses HTTP-only cookies for session management
- CSRF protection with state parameter
- No token storage in frontend localStorage
- Proper CORS configuration