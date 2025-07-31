<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# ok so add this context to the PDR

Absolutely! Below is your **final Product Design Review (PDR) and implementation plan**, consolidated into a single-track, prescriptive roadmap for your Greptile coding challenge. This incorporates all your clarified requirements and the latest context:

# AI-Powered Changelog Generator — Product Design Review (PDR)

## 1. Problem Statement

Developers need a tool that automates changelog creation by analyzing both commit messages and the actual code changes from a GitHub repository, summarizing these with AI (OpenAI GPT) for clear, user-friendly change announcements.

## 2. Solution Overview

- **Internal Developer Tool:** React web app for devs to select a GitHub repo and commit range, fetch changes, auto-generate a changelog via AI, review/edit, and publish.
- **Public Changelog Viewer:** Simple site for users to view all published changelogs.


## 3. Technology Choices

- **Frontend:** React (JavaScript)
- **Backend:** Python (FastAPI)
- **DB:** SQLite (managed via SQLAlchemy ORM)
- **APIs:** GitHub REST API (fetch commit data and diffs), OpenAI GPT (summarization)
- **Deployment:** Railway (hosts both frontend and backend in the same app)
- **Secrets:** Stored in `.env` (not in git)
- **Startup:** Always include a `.gitignore` to exclude node_modules, build artifacts, Python caches, `.env`, SQLite DB, and IDE files.


## 4. Detailed Implementation Plan

### 4.1 Initialization

- Create monorepo structure (frontend and backend folders or single repo root).
- Add `.gitignore` with:

```
# Node/React
node_modules/
build/
dist/
.env

# Python/FastAPI
__pycache__/
*.pyc
*.sqlite3

# OS & IDE
.DS_Store
Thumbs.db
.vscode/
.idea/
```


### 4.2 Backend (Python + FastAPI)

#### 4.2.1 Project Setup

- Install FastAPI, uvicorn, requests, python-dotenv, SQLAlchemy.


#### 4.2.2 Models

- Changelog: id, created_at, content, author, commit_range, raw_commits, published


#### 4.2.3 Fetching Commit Data \& Changes

- REST endpoint to accept repo and date/sha range.
- Use the GitHub API:
    - List commits: `/repos/{owner}/{repo}/commits`
    - For each commit in range, fetch details: `/repos/{owner}/{repo}/commits/{sha}`
        - Extract: commit message, files changed, per-file diffs (the "patch" property)
- Store all relevant data (messages and code diffs) in raw_commits field for traceability.


#### 4.2.4 Changelog Generation (AI)

- REST endpoint receives the commit data and code patches.
- Build a prompt with both commit messages and diffs (truncated as needed):
    - e.g., "Given the following commit messages and code changes, summarize the user-visible changes as a public changelog."
- Call OpenAI GPT (default model, API key from `.env`) and return the generated summary.


#### 4.2.5 Publishing Changelogs

- Endpoint to save reviewed/edited changelog in the database.
- Endpoint to list all published changelogs.
- Endpoint to retrieve a changelog by its id.


#### 4.2.6 Env Management

- Store all sensitive info (`OPENAI_API_KEY`, `GITHUB_TOKEN`) in `.env`.
- Ensure code never leaks `.env` (it's gitignored).


### 4.3 Frontend (React)

#### 4.3.1 Project Initialization

- Initialize React app (e.g., with Vite or Create React App).
- Install Axios or fetch API for backend communication.


#### 4.3.2 Developer/Admin Interface

- Form: Input repo URL (parsed to owner/repo), select date/sha range.
- Button: "Fetch Commits" (calls backend, gets commit data, shows messages \& diffs if needed).
- Button: "Generate Changelog" (calls backend GPT endpoint, shows AI summary).
- Editable TextArea: Review/edit generated summary.
- Button: "Publish" (sends finalized content to backend).


#### 4.3.3 Public Viewer

- Homepage: list all published changelogs, sorted by date.
- Detail page: expand to see full changelog.
- UI: minimal, responsive, styled cleanly (Stripe/Twilio inspired).


### 4.4 Database Schema

- Table: Changelogs (id, created_at, content, author, commit_range, raw_commits (JSON), published)


### 4.5 Testing \& QA

- Backend: Pytest for endpoints (mock GitHub and OpenAI).
- Frontend: react-testing-library for workflows.
- Manual: End-to-end workflow w/ real GitHub repo.


### 4.6 Deployment

- Deploy both backend (FastAPI) and frontend (React) on Railway for a unified deployment.
- Add Railway variables for environment secrets.
- README instructions: how to run locally, set up `.env`, deploy, and test.


### 4.7 Demo \& Handoff

- Record a 30s screen demo: dev logs in, fetches commits+diffs, generates and publishes changelog, shows public site.
- Clean repository with `.gitignore`.
- Complete README.


## Highlights of Your Implementation

- Uses GitHub API for both commit messages and code patches ("diffs"), letting the LLM see the real code being changed, enabling summaries based on both metadata and the actual work.
- GPT model prompt is constructed from both messages and diffs, for richer feature/change detection.
- Everything is deployed on Railway for simplicity—no cross-platform complexity.
- Security best practices with `.env` and `.gitignore` set up from the start.

**This PDR can be executed step by step exactly in your dev tools—no ambiguous choices. You’re ready to deliver a very strong project for the Greptile interview!**

