import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { PublicChangelogs } from './components/PublicChangelogs';
import { ChangelogDetail } from './components/ChangelogDetail';
import { GlobalStyles } from './styles/GlobalStyles';

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(44, 44, 44, 0.1);
  border-top: 3px solid #2c2c2c;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check if we're on a public route
  const isPublicRoute = location.pathname.startsWith('/public') || location.pathname.startsWith('/changelog/');

  if (loading && !isPublicRoute) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  return (
    <Routes>
      <Route path="/public" element={<PublicChangelogs />} />
      <Route path="/changelog/:id" element={<ChangelogDetail />} />
      <Route path="/" element={user ? <Dashboard /> : <Login />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <GlobalStyles />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;