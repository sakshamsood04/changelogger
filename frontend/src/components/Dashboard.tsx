import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Repository, ChangelogResponse } from '../types';

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 300;
  color: #2c2c2c;
  letter-spacing: -0.02em;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const UserName = styled.span`
  font-weight: 500;
  color: #2c2c2c;
  font-size: 0.95rem;
`;

const UserLogin = styled.span`
  font-size: 0.85rem;
  color: #666;
`;

const LogoutButton = styled.button`
  background: transparent;
  color: #666;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  margin-left: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #2c2c2c;
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const ViewChangelogsLink = styled(Link)`
  background: transparent;
  color: #666;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  margin-left: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #2c2c2c;
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c2c2c;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(0, 0, 0, 0.3);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c2c2c;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(0, 0, 0, 0.3);
  }
`;

const Button = styled.button`
  background: #2c2c2c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #1a1a1a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChangelogCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ChangelogTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 500;
  color: #2c2c2c;
  margin-bottom: 1.5rem;
`;

const ChangelogContent = styled.pre`
  background: rgba(248, 248, 248, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #2c2c2c;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 500px;
  overflow-y: auto;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 240, 240, 0.9);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  color: #d63031;
  font-size: 0.9rem;
  margin-top: 1rem;
`;


const CommitsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
`;

const CommitItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CommitCheckbox = styled.input`
  margin-top: 0.25rem;
`;

const CommitInfo = styled.div`
  flex: 1;
`;

const CommitMessage = styled.div`
  font-weight: 500;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const CommitMeta = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const CommitFiles = styled.div`
  font-size: 0.8rem;
  color: #888;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c2c2c;
  font-size: 0.9rem;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(0, 0, 0, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: #666;
  border: 1px solid rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #2c2c2c;
    border-color: rgba(0, 0, 0, 0.2);
    transform: none;
    box-shadow: none;
  }
`;

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [sinceDate, setSinceDate] = useState<string>('');
  const [maxCommits, setMaxCommits] = useState<number | undefined>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [changelog, setChangelog] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loadingRepos, setLoadingRepos] = useState<boolean>(true);
  
  // Multi-step process state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [commits, setCommits] = useState<any[]>([]);
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [changelogTitle, setChangelogTitle] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loadRepositories = async () => {
    try {
      setLoadingRepos(true);
      const response = await apiService.getRepositories();
      setRepositories(response.repositories || []);
    } catch (error) {
      console.error('Failed to load repositories:', error);
      setError('Failed to load repositories. Please try again.');
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleFetchCommits = async () => {
    if (!selectedRepo || !sinceDate) {
      setError('Please select a repository and specify a date.');
      return;
    }

    const [owner, repo] = selectedRepo.split('/');
    if (!owner || !repo) {
      setError('Invalid repository selection.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.fetchCommits(owner, repo, sinceDate, maxCommits || 50);
      const fetchedCommits = response.commits || [];
      setCommits(fetchedCommits);
      // Preselect all commits
      setSelectedCommits(fetchedCommits.map((commit: any) => commit.sha));
      setCurrentStep(2);
    } catch (error: any) {
      console.error('Failed to fetch commits:', error);
      setError(error.response?.data?.detail || 'Failed to fetch commits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChangelog = async () => {
    if (selectedCommits.length === 0) {
      setError('Please select at least one commit.');
      return;
    }

    const [owner, repo] = selectedRepo.split('/');
    
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.generateChangelog(owner, repo, commits, selectedCommits);
      setChangelog(response.changelog || 'No changelog generated.');
      setCurrentStep(3);
    } catch (error: any) {
      console.error('Failed to generate changelog:', error);
      setError(error.response?.data?.detail || 'Failed to generate changelog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChangelog = async (publish: boolean = false) => {
    if (!changelogTitle.trim() || !changelog.trim()) {
      setError('Please provide a title and content for the changelog.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const commitRange = `since: ${sinceDate}`;
      const selectedCommitData = commits.filter(c => selectedCommits.includes(c.sha));
      
      await apiService.saveChangelog(
        changelogTitle,
        changelog,
        selectedRepo,
        commitRange,
        selectedCommitData,
        publish
      );
      
      // Reset form
      setChangelogTitle('');
      setChangelog('');
      setSelectedCommits([]);
      setCommits([]);
      setCurrentStep(1);
      
      alert(publish ? 'Changelog published successfully!' : 'Changelog saved as draft!');
    } catch (error: any) {
      console.error('Failed to save changelog:', error);
      setError(error.response?.data?.detail || 'Failed to save changelog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommitToggle = (sha: string) => {
    setSelectedCommits(prev => 
      prev.includes(sha) 
        ? prev.filter(s => s !== sha)
        : [...prev, sha]
    );
  };

  const handleSelectAllCommits = () => {
    if (selectedCommits.length === commits.length) {
      setSelectedCommits([]);
    } else {
      setSelectedCommits(commits.map(c => c.sha));
    }
  };

  useEffect(() => {
    if (user) {
      loadRepositories();
      
      // Set default date to 30 days ago
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() - 30);
      setSinceDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormCard>
            <FormSection>
              <Label htmlFor="repository">Select Repository</Label>
              <Select
                id="repository"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
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
                  onChange={(e) => setSinceDate(e.target.value)}
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
                  onChange={(e) => setMaxCommits(e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder="50"
                />
              </FormSection>
            </FormRow>

            <Button 
              onClick={handleFetchCommits} 
              disabled={loading || !selectedRepo || !sinceDate}
            >
              {loading && <LoadingSpinner />}
              {loading ? 'Fetching...' : 'Fetch Commits'}
            </Button>

            {error && <ErrorMessage>{error}</ErrorMessage>}
          </FormCard>
        );

      case 2:
        return (
          <FormCard>
            <FormSection>
              <Label>Select Commits to Include ({selectedCommits.length} of {commits.length} selected)</Label>
              <ButtonGroup>
                <SecondaryButton type="button" onClick={handleSelectAllCommits}>
                  {selectedCommits.length === commits.length ? 'Deselect All' : 'Select All'}
                </SecondaryButton>
              </ButtonGroup>
            </FormSection>

            <FormSection>
              <CommitsList>
                {commits.map((commit) => (
                  <CommitItem key={commit.sha}>
                    <CommitCheckbox
                      type="checkbox"
                      checked={selectedCommits.includes(commit.sha)}
                      onChange={() => handleCommitToggle(commit.sha)}
                    />
                    <CommitInfo>
                      <CommitMessage>{commit.message}</CommitMessage>
                      <CommitMeta>
                        {commit.author.name} • {new Date(commit.author.date).toLocaleDateString()} • {commit.sha.slice(0, 8)}
                      </CommitMeta>
                      {commit.files.length > 0 && (
                        <CommitFiles>
                          {commit.files.length} file{commit.files.length !== 1 ? 's' : ''} changed: {commit.files.slice(0, 3).map(f => f.filename).join(', ')}
                          {commit.files.length > 3 && ` +${commit.files.length - 3} more`}
                        </CommitFiles>
                      )}
                    </CommitInfo>
                  </CommitItem>
                ))}
              </CommitsList>
            </FormSection>

            <ButtonGroup>
              <SecondaryButton onClick={() => setCurrentStep(1)}>
                Back
              </SecondaryButton>
              <Button 
                onClick={handleGenerateChangelog}
                disabled={loading || selectedCommits.length === 0}
              >
                {loading && <LoadingSpinner />}
                {loading ? 'Generating...' : 'Generate Changelog'}
              </Button>
            </ButtonGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
          </FormCard>
        );

      case 3:
        return (
          <>
            <FormCard>
              <FormSection>
                <Label htmlFor="title">Changelog Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={changelogTitle}
                  onChange={(e) => setChangelogTitle(e.target.value)}
                  placeholder="e.g., Version 1.2.0 Release"
                />
              </FormSection>

              <FormSection>
                <Label htmlFor="content">Changelog Content</Label>
                <TextArea
                  id="content"
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="Edit the generated changelog..."
                />
              </FormSection>

              <ButtonGroup>
                <SecondaryButton onClick={() => setCurrentStep(2)}>
                  Back
                </SecondaryButton>
                <SecondaryButton 
                  onClick={() => handleSaveChangelog(false)}
                  disabled={loading}
                >
                  Save as Draft
                </SecondaryButton>
                <Button 
                  onClick={() => handleSaveChangelog(true)}
                  disabled={loading}
                >
                  {loading && <LoadingSpinner />}
                  {loading ? 'Publishing...' : 'Publish Changelog'}
                </Button>
              </ButtonGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FormCard>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <Title>Changelogger</Title>
        <UserSection>
          <Avatar src={user.avatar_url} alt={user.login} />
          <UserInfo>
            <UserName>{user.name || user.login}</UserName>
            <UserLogin>@{user.login}</UserLogin>
          </UserInfo>
          <ViewChangelogsLink to="/public">
            View Published
          </ViewChangelogsLink>
          <LogoutButton onClick={handleLogout}>
            Sign out
          </LogoutButton>
        </UserSection>
      </Header>
      
      <Content>
        {renderStepContent()}
      </Content>
    </Container>
  );
};