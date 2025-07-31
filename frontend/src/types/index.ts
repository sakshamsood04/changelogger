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
}

export interface ChangelogRequest {
  owner: string;
  repo: string;
  since_date: string;
  max_commits: number;
}

export interface ChangelogResponse {
  status: string;
  changelog: string;
}