import axios from 'axios';
import { AuthStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const apiService = {
  async getAuthStatus(): Promise<AuthStatus> {
    const response = await api.get('/auth/status');
    return response.data;
  },

  async initiateGitHubLogin(): Promise<{ authorization_url: string }> {
    const response = await api.get('/auth/github/login');
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getRepositories(): Promise<any> {
    const response = await api.get('/api/v1/repositories');
    return response.data;
  },

  async fetchCommits(owner: string, repo: string, sinceDate: string, maxCommits: number = 50): Promise<any> {
    const response = await api.post('/api/v1/changelogs/fetch-commits', {
      owner,
      repo,
      since_date: sinceDate,
      max_commits: maxCommits
    });
    return response.data;
  },

  async generateChangelog(owner: string, repo: string, commits: any[], selectedCommitShas: string[]): Promise<any> {
    const response = await api.post('/api/v1/changelogs/generate', {
      owner,
      repo,
      commits,
      selected_commit_shas: selectedCommitShas
    });
    return response.data;
  },

  async saveChangelog(title: string, content: string, repository: string, commitRange: string, rawCommits: any[], published: boolean = false): Promise<any> {
    const response = await api.post('/api/v1/changelogs/save', {
      title,
      content,
      repository,
      commit_range: commitRange,
      raw_commits: rawCommits,
      published
    });
    return response.data;
  },

  async getChangelogs(publishedOnly: boolean = false): Promise<any> {
    const response = await api.get(`/api/v1/changelogs/?published_only=${publishedOnly}`);
    return response.data;
  },

  async getChangelog(id: number): Promise<any> {
    const response = await api.get(`/api/v1/changelogs/${id}`);
    return response.data;
  },

  async updateChangelog(id: number, updates: any): Promise<any> {
    const response = await api.put(`/api/v1/changelogs/${id}`, updates);
    return response.data;
  },
};