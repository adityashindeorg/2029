import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RelationshipProvider } from './contexts/RelationshipContext';
import { AppRoutes } from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RelationshipProvider>
          <AppRoutes />
        </RelationshipProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
