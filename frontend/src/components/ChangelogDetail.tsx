import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { apiService } from '../services/api';

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 2rem;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    color: #2c2c2c;
  }
`;

const HeaderNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const DeveloperLink = styled(Link)`
  background: transparent;
  color: #666;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #2c2c2c;
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const ChangelogCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ChangelogTitle = styled.h1`
  font-size: 2rem;
  font-weight: 500;
  color: #2c2c2c;
  margin-bottom: 1.5rem;
`;

const ChangelogMeta = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
`;

const ChangelogContent = styled.div`
  line-height: 1.7;
  color: #2c2c2c;
  
  h1, h2, h3, h4, h5, h6 {
    margin: 2rem 0 1rem 0;
    color: #2c2c2c;
  }
  
  h1 { font-size: 1.75rem; font-weight: 600; }
  h2 { font-size: 1.5rem; font-weight: 600; }
  h3 { font-size: 1.25rem; font-weight: 600; }
  
  ul, ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin: 0.5rem 0;
  }
  
  p {
    margin: 1rem 0;
  }
  
  code {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.9em;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.05);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 3rem;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 240, 240, 0.9);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  color: #d63031;
  text-align: center;
  margin: 2rem 0;
`;

export const ChangelogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [changelog, setChangelog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadChangelog(parseInt(id));
    }
  }, [id]);

  const loadChangelog = async (changelogId: number) => {
    try {
      setLoading(true);
      const response = await apiService.getChangelog(changelogId);
      setChangelog(response.changelog);
    } catch (error: any) {
      console.error('Failed to load changelog:', error);
      setError('Changelog not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading changelog...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <BackLink to="/public">← Back to all changelogs</BackLink>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!changelog) {
    return (
      <Container>
        <BackLink to="/public">← Back to all changelogs</BackLink>
        <ErrorMessage>Changelog not found.</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderNav>
        <BackLink to="/public">← Back to all changelogs</BackLink>
        <DeveloperLink to="/">Developer View</DeveloperLink>
      </HeaderNav>
      
      <ChangelogCard>
        <ChangelogTitle>{changelog.title}</ChangelogTitle>
        <ChangelogMeta>
          <span><strong>Repository:</strong> {changelog.repository}</span>
          <span><strong>Published:</strong> {new Date(changelog.created_at).toLocaleDateString()}</span>
          <span><strong>Commit Range:</strong> {changelog.commit_range}</span>
        </ChangelogMeta>
        <ChangelogContent>
          <ReactMarkdown>
            {changelog.content || 'No content available.'}
          </ReactMarkdown>
        </ChangelogContent>
      </ChangelogCard>
    </Container>
  );
};