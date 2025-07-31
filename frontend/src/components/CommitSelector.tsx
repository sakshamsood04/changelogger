import React from 'react';
import styled from 'styled-components';
import {
  FormCard,
  FormSection,
  Label,
  Button,
  SecondaryButton,
  ButtonGroup,
  ErrorMessage,
  LoadingSpinner,
} from '../styles/SharedComponents';

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



interface CommitSelectorProps {
  commits: any[];
  selectedCommits: string[];
  loading: boolean;
  error: string;
  onCommitToggle: (sha: string) => void;
  onSelectAllCommits: () => void;
  onBack: () => void;
  onGenerateChangelog: () => void;
}

export const CommitSelector: React.FC<CommitSelectorProps> = ({
  commits,
  selectedCommits,
  loading,
  error,
  onCommitToggle,
  onSelectAllCommits,
  onBack,
  onGenerateChangelog,
}) => {
  return (
    <FormCard>
      <FormSection>
        <Label>Select Commits to Include ({selectedCommits.length} of {commits.length} selected)</Label>
        <ButtonGroup>
          <SecondaryButton type="button" onClick={onSelectAllCommits}>
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
                onChange={() => onCommitToggle(commit.sha)}
              />
              <CommitInfo>
                <CommitMessage>{commit.message}</CommitMessage>
                <CommitMeta>
                  {commit.author.name} • {new Date(commit.author.date).toLocaleDateString()} • {commit.sha.slice(0, 8)}
                </CommitMeta>
                {commit.files.length > 0 && (
                  <CommitFiles>
                    {commit.files.length} file{commit.files.length !== 1 ? 's' : ''} changed: {commit.files.slice(0, 3).map((f: any) => f.filename).join(', ')}
                    {commit.files.length > 3 && ` +${commit.files.length - 3} more`}
                  </CommitFiles>
                )}
              </CommitInfo>
            </CommitItem>
          ))}
        </CommitsList>
      </FormSection>

      <ButtonGroup>
        <SecondaryButton onClick={onBack}>
          Back
        </SecondaryButton>
        <Button 
          onClick={onGenerateChangelog}
          disabled={loading || selectedCommits.length === 0}
        >
          {loading && <LoadingSpinner />}
          {loading ? 'Generating...' : 'Generate Changelog'}
        </Button>
      </ButtonGroup>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormCard>
  );
}; 