# Minimalist Frontend with GitHub OAuth - Implementation Instructions

## Overview
Create a minimalist React frontend with GitHub OAuth authentication based on the existing codebase. This frontend should be cleaner and more streamlined while maintaining core OAuth functionality.

## Tech Stack
- **React 18+** with TypeScript
- **Styled Components** for styling
- **React Router DOM** for routing
- **Axios** for API calls
- **React Context** for state management

## Required Dependencies
```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.7.1",
    "styled-components": "^6.1.19",
    "axios": "^1.11.0",
    "typescript": "^4.9.5"
  },
  "devDependencies": {
    "@types/react": "^19.1.9",
    "@types/react-dom": "^19.1.7",
    "@types/styled-components": "^5.1.34"
  }
}
```

## Project Structure
```
src/
├── components/
│   ├── Login.tsx
│   └── Dashboard.tsx
├── contexts/
│   └── AuthContext.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── styles/
│   └── GlobalStyles.tsx
├── App.tsx
└── index.tsx
```

## Key Implementation Requirements

### 1. Environment Configuration
- **IMPORTANT**: The backend uses environment variables for GitHub OAuth
- Set `REACT_APP_API_URL` to point to your backend (default: `http://localhost:8000`)
- Backend requires `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` environment variables

### 2. API Service (`src/services/api.ts`)
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Essential for session cookies
});

export const apiService = {
  // Auth endpoints
  async getAuthStatus() {
    const response = await api.get('/auth/status');
    return response.data;
  },

  async initiateGitHubLogin() {
    const response = await api.get('/auth/github/login');
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
```

### 3. Authentication Context (`src/contexts/AuthContext.tsx`)
Create a React Context that manages:
- Authentication state
- Login/logout functions
- Auth status checking
- Loading states

Key features:
- Uses `withCredentials: true` for session management
- Redirects to GitHub OAuth URL for login
- Handles auth success callback via URL parameters
- Automatic auth status checking on app load

### 4. Types Definition (`src/types/index.ts`)
```typescript
export interface User {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
  authenticated: boolean;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: User;
}
```

### 5. Routing Structure (`src/App.tsx`)
- **Public route**: `/` - Login page (if not authenticated)
- **Protected route**: `/dashboard` - Main app (requires authentication)
- **Auth callback**: Handle `?auth=success` parameter for OAuth callback

### 6. Components

#### Login Component (`src/components/Login.tsx`)
**Minimalist requirements:**
- Simple, clean design with GitHub branding
- Single "Sign in with GitHub" button
- Loading state during OAuth initiation
- Error handling for failed login attempts
- No feature list or excessive UI elements

Key styling:
- Centered card layout
- GitHub button with GitHub logo SVG
- Subtle animations and hover effects
- Clean typography

#### Dashboard Component (`src/components/Dashboard.tsx`)
**Minimalist requirements:**
- Simple header with user info and logout
- Clean, minimal interface
- User avatar and display name
- Logout functionality

### 7. Styling Approach
Use **Styled Components** with:
- Minimal color palette (stick to grays, whites, and GitHub's black)
- Clean typography (system fonts)
- Subtle shadows and blur effects
- Smooth transitions
- Mobile-responsive design

**Key styling patterns:**
```typescript
const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;
```

### 8. OAuth Flow Implementation
1. **Login initiation**: Call `/auth/github/login` endpoint
2. **Redirect**: Backend returns `authorization_url`, redirect user to GitHub
3. **Callback handling**: Backend handles OAuth callback at `/auth/github/callback`
4. **Success redirect**: Backend redirects to frontend with `?auth=success`
5. **Auth check**: Frontend detects success parameter and refreshes auth status

### 9. Session Management
- Uses HTTP-only cookies for security
- Session handled entirely by backend
- Frontend uses `withCredentials: true` for cookie inclusion
- No token storage in frontend

### 10. Error Handling
- Network errors
- Authentication failures
- Session expiration
- OAuth flow interruptions

## Minimalist Design Principles
1. **Less is more**: Remove unnecessary UI elements
2. **Focus on functionality**: Core OAuth flow only
3. **Clean typography**: Use system fonts
4. **Subtle interactions**: Minimal animations
5. **Responsive**: Works on all screen sizes
6. **Accessible**: Proper contrast and focus states

## Security Considerations
- Never store tokens in localStorage/sessionStorage
- Use HTTP-only cookies for session management
- Implement proper CORS configuration
- Handle session expiration gracefully
- Validate all API responses

## Backend Integration Notes
- Backend expects `withCredentials: true` in requests
- OAuth callback URL: `{BACKEND_URL}/auth/github/callback`
- Frontend callback: `{FRONTEND_URL}/?auth=success`
- Session cookies are automatically managed

## Key Differences from Original
1. **Simplified UI**: Remove feature lists, complex layouts
2. **Minimal components**: Only Login and Dashboard
3. **Cleaner styling**: Reduced visual complexity
4. **Streamlined flow**: Focus on core OAuth functionality
5. **Environment-based config**: Use env vars instead of hardcoded values

## Development Notes
- Start with `npm start` for development server
- Backend should be running on port 8000 (or update API_BASE_URL)
- Test OAuth flow in development with proper redirect URLs
- Use browser dev tools to monitor cookie behavior

## Testing OAuth Flow
1. Ensure backend is running with GitHub OAuth configured
2. Click "Sign in with GitHub" button
3. Complete GitHub authorization
4. Should redirect back with auth success
5. Verify user info displays in dashboard
6. Test logout functionality