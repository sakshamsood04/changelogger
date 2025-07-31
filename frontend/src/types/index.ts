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

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  default_branch: string;
  updated_at: string;
  private: boolean;
}

export interface Commit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }>;
}