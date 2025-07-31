# AI-Powered Changelog Generator

A full-stack application that automatically generates user-friendly changelogs from GitHub commits using AI. Built with FastAPI, React, and OpenAI's GPT models.

## Overview

This application solves the common problem of creating meaningful changelogs for software releases. Instead of manually writing release notes, developers can:

1. **Authenticate with GitHub** via OAuth
2. **Select a repository** from their account
3. **Choose commits** from a specific time range
4. **Generate AI-powered changelogs** that summarize changes in user-friendly language
5. **Save and manage** multiple changelogs with full CRUD operations

## Architecture

### Backend (FastAPI)
- **FastAPI** for high-performance async API
- **SQLAlchemy** for database ORM with SQLite
- **GitHub OAuth** for secure authentication
- **OpenAI GPT-3.5** for intelligent changelog generation
- **Session-based authentication** with HTTP-only cookies

### Frontend (React + TypeScript)
- **React 18** with TypeScript for type safety
- **Styled Components** for maintainable CSS-in-JS
- **React Router** for client-side routing
- **Axios** for API communication
- **Context API** for state management

## Technical Decisions

### Why FastAPI?
- **Performance**: One of the fastest Python frameworks and easy to work with

### Why GitHub OAuth?
- **Security**: No need to store user credentials
- **User Experience**: Single sign-on with familiar GitHub account

### Why OpenAI GPT-3.5?
- **Context Understanding**: Analyzes both commit messages and code changes
- **Cost Effective**: GPT-3.5 provides good results at lower cost than GPT-4

### Why SQLite?
- **Simplicity**: Zero configuration for development

## Getting Started

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **Git**

### Required API Keys
1. **GitHub OAuth App**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App with callback URL: `http://localhost:8000/auth/github/callback`
   - Set Homepage URL: `http://localhost:3000`
   - Note the Client ID and Client Secret

2. **OpenAI API Key**:
   - Visit [OpenAI API](https://platform.openai.com/api-keys)
   - Create new API key

### Backend Setup

1. **Clone and navigate to backend**:
   ```bash
   git clone <repository-url>
   cd Changelog/backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file**:
   ```bash
   cp .env.example .env  # Or create .env manually
   ```

5. **Configure `.env` file**:
   ```env
   # GitHub OAuth Configuration
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   
   # Application Configuration
   FRONTEND_URL=http://localhost:3000
   DEBUG=true
   ```

6. **Run backend server**:
   ```bash
   python main.py
   ```
   
   Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Frontend will be available at: `http://localhost:3000`

## 📖 Usage Guide

### 1. Authentication
- Click "Sign in with GitHub" on the homepage
- Authorize the application to access your repositories
- You'll be redirected back to the dashboard

### 2. Generate Changelog
- Select a repository from your account
- Choose a date range for commits
- Review and select specific commits
- Click "Generate Changelog" to create AI-powered summary
- Edit the generated content if needed
- Publish the changelog
