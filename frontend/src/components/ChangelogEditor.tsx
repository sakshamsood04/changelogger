import React from 'react';
import {
  FormCard,
  FormSection,
  Label,
  Input,
  TextArea,
  Button,
  SecondaryButton,
  ButtonGroup,
  ErrorMessage,
  LoadingSpinner,
} from '../styles/SharedComponents';

interface ChangelogEditorProps {
  changelogTitle: string;
  changelog: string;
  loading: boolean;
  error: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onBack: () => void;
  onSave: () => void;
}

export const ChangelogEditor: React.FC<ChangelogEditorProps> = ({
  changelogTitle,
  changelog,
  loading,
  error,
  onTitleChange,
  onContentChange,
  onBack,
  onSave,
}) => {
  return (
    <FormCard>
      <FormSection>
        <Label htmlFor="title">Changelog Title</Label>
        <Input
          id="title"
          type="text"
          value={changelogTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., Version 1.2.0 Release"
        />
      </FormSection>

      <FormSection>
        <Label htmlFor="content">Changelog Content</Label>
        <TextArea
          id="content"
          value={changelog}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Edit the generated changelog..."
        />
      </FormSection>

      <ButtonGroup>
        <SecondaryButton onClick={onBack}>
          Back
        </SecondaryButton>
        <Button 
          onClick={onSave}
          disabled={loading}
        >
          {loading && <LoadingSpinner />}
          {loading ? 'Publishing...' : 'Publish Changelog'}
        </Button>
      </ButtonGroup>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormCard>
  );
}; 