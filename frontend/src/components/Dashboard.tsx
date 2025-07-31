import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Repository } from '../types';
import { RepositorySelector } from './RepositorySelector';
import { CommitSelector } from './CommitSelector';
import { ChangelogEditor } from './ChangelogEditor';

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

  const handleSaveChangelog = async () => {
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
        selectedCommitData
      );
      
      // Reset form
      setChangelogTitle('');
      setChangelog('');
      setSelectedCommits([]);
      setCommits([]);
      setCurrentStep(1);
      
      alert('Changelog published successfully!');
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
          <RepositorySelector
            repositories={repositories}
            selectedRepo={selectedRepo}
            sinceDate={sinceDate}
            maxCommits={maxCommits}
            loading={loading}
            loadingRepos={loadingRepos}
            error={error}
            onRepoChange={setSelectedRepo}
            onDateChange={setSinceDate}
            onMaxCommitsChange={setMaxCommits}
            onFetchCommits={handleFetchCommits}
          />
        );

      case 2:
        return (
          <CommitSelector
            commits={commits}
            selectedCommits={selectedCommits}
            loading={loading}
            error={error}
            onCommitToggle={handleCommitToggle}
            onSelectAllCommits={handleSelectAllCommits}
            onBack={() => setCurrentStep(1)}
            onGenerateChangelog={handleGenerateChangelog}
          />
        );

      case 3:
        return (
          <ChangelogEditor
            changelogTitle={changelogTitle}
            changelog={changelog}
            loading={loading}
            error={error}
            onTitleChange={setChangelogTitle}
            onContentChange={setChangelog}
            onBack={() => setCurrentStep(2)}
            onSave={handleSaveChangelog}
          />
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