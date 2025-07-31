import styled from 'styled-components';

export const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
`;

export const FormSection = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

export const Input = styled.input`
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

export const Select = styled.select`
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

export const TextArea = styled.textarea`
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

export const Button = styled.button`
  background: #2c2c2c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;

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

export const SecondaryButton = styled(Button)`
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

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    justify-content: stretch;
    
    > * {
      flex: 1;
    }
  }
`;

export const ErrorMessage = styled.div`
  background: rgba(255, 240, 240, 0.9);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  color: #d63031;
  font-size: 0.9rem;
  margin-top: 1rem;
`;

export const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`; 