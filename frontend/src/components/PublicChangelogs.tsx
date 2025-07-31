import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { apiService } from '../services/api';

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const HeaderContent = styled.div`
  text-align: center;
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: #2c2c2c;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
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

const Spacer = styled.div`
  width: 120px; /* Approximately matches the Developer View button width */
`;

// Stacked card container
const StackedCardContainer = styled.div`
  position: relative;
  margin-bottom: 2rem;
`;

// Individual changelog card
const ChangelogCard = styled.div<{ isStacked?: boolean; stackIndex?: number; isExpanded?: boolean }>`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: ${props => props.isStacked && !props.isExpanded ? '0' : '2rem'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: ${props => props.isStacked && !props.isExpanded ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  
  ${props => props.isStacked && !props.isExpanded && `
    position: ${props.stackIndex === 0 ? 'relative' : 'absolute'};
    top: ${props.stackIndex! * 8}px;
    left: ${props.stackIndex! * 4}px;
    right: ${props.stackIndex! * -4}px;
    z-index: ${10 - props.stackIndex!};
    transform: rotate(${props.stackIndex! * 0.5}deg);
    
    &:hover {
      transform: rotate(${props.stackIndex! * 0.5}deg) translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    }
  `}
  
  ${props => props.isStacked && props.isExpanded && `
    position: relative;
    transform: none;
    margin-bottom: 1rem;
    opacity: 1;
    z-index: 1;
  `}
`;

// Stack header for showing repository info and count
const StackHeader = styled.div<{ isExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(108, 117, 125, 0.1);
  border-radius: 12px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(108, 117, 125, 0.15);
  }
`;

const StackTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  color: #2c2c2c;
  margin: 0;
`;

const StackCount = styled.span`
  background: rgba(108, 117, 125, 0.2);
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ExpandIcon = styled.span<{ isExpanded: boolean }>`
  font-size: 1.2rem;
  transition: transform 0.2s ease;
  transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const ChangelogTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  color: #2c2c2c;
  margin-bottom: 1rem;
`;

const ChangelogMeta = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ChangelogContent = styled.div`
  line-height: 1.7;
  color: #2c2c2c;
  font-size: 0.95rem;
  
  h1, h2, h3, h4, h5, h6 {
    margin: 1.5rem 0 1rem 0;
    color: #2c2c2c;
  }
  
  h1 { font-size: 1.5rem; font-weight: 600; }
  h2 { font-size: 1.25rem; font-weight: 600; }
  h3 { font-size: 1.1rem; font-weight: 600; }
  
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

const ReadMoreLink = styled(Link)`
  display: inline-block;
  margin-top: 1rem;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  
  &:hover {
    color: #2c2c2c;
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

const BackLink = styled.a`
  display: inline-block;
  margin-bottom: 2rem;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    color: #2c2c2c;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 3rem;
  
  h3 {
    color: #2c2c2c;
    margin-bottom: 1rem;
  }
`;

const ExpandedStackContainer = styled.div`
  border-radius: 16px;
  padding: 1rem;
  background: rgba(108, 117, 125, 0.05);
  margin-bottom: 2rem;
`;

interface GroupedChangelogs {
  [repository: string]: any[];
}

export const PublicChangelogs: React.FC = () => {
  const [changelogs, setChangelogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedStacks, setExpandedStacks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPublicChangelogs();
  }, []);

  const loadPublicChangelogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getChangelogs(true); // published only
      setChangelogs(response.changelogs || []);
    } catch (error: any) {
      console.error('Failed to load changelogs:', error);
      setError('Failed to load changelogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Group changelogs by repository
  const groupedChangelogs: GroupedChangelogs = changelogs.reduce((groups, changelog) => {
    const repo = changelog.repository;
    if (!groups[repo]) {
      groups[repo] = [];
    }
    groups[repo].push(changelog);
    return groups;
  }, {} as GroupedChangelogs);

  const toggleStack = (repository: string) => {
    const newExpandedStacks = new Set(expandedStacks);
    if (expandedStacks.has(repository)) {
      newExpandedStacks.delete(repository);
    } else {
      newExpandedStacks.add(repository);
    }
    setExpandedStacks(newExpandedStacks);
  };

  const renderChangelogCard = (changelog: any, isStacked: boolean, stackIndex?: number, isExpanded?: boolean) => (
    <ChangelogCard 
      key={changelog.id} 
      isStacked={isStacked} 
      stackIndex={stackIndex} 
      isExpanded={isExpanded}
      onClick={isStacked && !isExpanded ? (e) => {
        e.stopPropagation();
        toggleStack(changelog.repository);
      } : undefined}
    >
      <ChangelogTitle>{changelog.title}</ChangelogTitle>
      <ChangelogMeta>
        <span><strong>Repository:</strong> {changelog.repository}</span>
        <span><strong>Published:</strong> {new Date(changelog.created_at).toLocaleDateString()}</span>
      </ChangelogMeta>
      <ChangelogContent>
        <ReactMarkdown>
          {changelog.content_preview || 'No content available.'}
        </ReactMarkdown>
      </ChangelogContent>
      <ReadMoreLink to={`/changelog/${changelog.id}`}>
        Read full changelog →
      </ReadMoreLink>
    </ChangelogCard>
  );

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading changelogs...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <DeveloperLink to="/">
          ← Developer View
        </DeveloperLink>
        <HeaderContent>
          <Title>Changelogger</Title>
          <Subtitle>Latest updates</Subtitle>
        </HeaderContent>
        <Spacer />
      </Header>

      {changelogs.length === 0 ? (
        <EmptyState>
          <h3>No changelogs published yet</h3>
          <p>Check back later for updates!</p>
        </EmptyState>
      ) : (
        Object.entries(groupedChangelogs).map(([repository, repoChangelogs]) => {
          const isExpanded = expandedStacks.has(repository);
          const hasMultipleChangelogs = repoChangelogs.length > 1;

          if (!hasMultipleChangelogs) {
            // Single changelog - render normally
            return renderChangelogCard(repoChangelogs[0], false);
          }

          // Multiple changelogs - render as stack
          return (
            <StackedCardContainer key={repository}>
              {!isExpanded && (
                <>
                  <StackHeader isExpanded={isExpanded} onClick={() => toggleStack(repository)}>
                    <div>
                      <StackTitle>{repository}</StackTitle>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StackCount>{repoChangelogs.length} changelogs</StackCount>
                      <ExpandIcon isExpanded={isExpanded}>▼</ExpandIcon>
                    </div>
                  </StackHeader>
                  {repoChangelogs.map((changelog, index) => 
                    renderChangelogCard(changelog, true, index, false)
                  )}
                </>
              )}
              
              {isExpanded && (
                <ExpandedStackContainer>
                  <StackHeader isExpanded={isExpanded} onClick={() => toggleStack(repository)}>
                    <div>
                      <StackTitle>{repository}</StackTitle>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StackCount>{repoChangelogs.length} changelogs</StackCount>
                      <ExpandIcon isExpanded={isExpanded}>▼</ExpandIcon>
                    </div>
                  </StackHeader>
                  {repoChangelogs.map((changelog) => 
                    renderChangelogCard(changelog, true, 0, true)
                  )}
                </ExpandedStackContainer>
              )}
            </StackedCardContainer>
          );
        })
      )}
    </Container>
  );
};