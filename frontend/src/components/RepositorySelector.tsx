import React from 'react';
import { Repository } from '../types';
import {
  FormCard,
  FormSection,
  Label,
  Select,
  Input,
  Button,
  FormRow,
  ErrorMessage,
  LoadingSpinner,
} from '../styles/SharedComponents';

interface RepositorySelectorProps {
  repositories: Repository[];
  selectedRepo: string;
  sinceDate: string;
  maxCommits: number | undefined;
  loading: boolean;
  loadingRepos: boolean;
  error: string;
  onRepoChange: (repo: string) => void;
  onDateChange: (date: string) => void;
  onMaxCommitsChange: (maxCommits: number | undefined) => void;
  onFetchCommits: () => void;
}

export const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  repositories,
  selectedRepo,
  sinceDate,
  maxCommits,
  loading,
  loadingRepos,
  error,
  onRepoChange,
  onDateChange,
  onMaxCommitsChange,
  onFetchCommits,
}) => {
  return (
    <FormCard>
      <FormSection>
        <Label htmlFor="repository">Select Repository</Label>
        <Select
          id="repository"
          value={selectedRepo}
          onChange={(e) => onRepoChange(e.target.value)}
          disabled={loadingRepos}
        >
          <option value="">
            {loadingRepos ? 'Loading repositories...' : 'Choose a repository'}
          </option>
          {repositories.map((repo) => (
            <option key={repo.id} value={repo.full_name}>
              {repo.full_name} {repo.description && `- ${repo.description.slice(0, 50)}${repo.description.length > 50 ? '...' : ''}`}
            </option>
          ))}
        </Select>
      </FormSection>

      <FormRow>
        <FormSection>
          <Label htmlFor="sinceDate">Changes Since</Label>
          <Input
            id="sinceDate"
            type="date"
            value={sinceDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </FormSection>

        <FormSection>
          <Label htmlFor="maxCommits">Max Commits</Label>
          <Input
            id="maxCommits"
            type="number"
            min="1"
            max="100"
            value={maxCommits || ''}
            onChange={(e) => onMaxCommitsChange(e.target.value ? parseInt(e.target.value) : 0)}
            placeholder="50"
          />
        </FormSection>
      </FormRow>

      <Button 
        onClick={onFetchCommits} 
        disabled={loading || !selectedRepo || !sinceDate}
      >
        {loading && <LoadingSpinner />}
        {loading ? 'Fetching...' : 'Fetch Commits'}
      </Button>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormCard>
  );
}; 