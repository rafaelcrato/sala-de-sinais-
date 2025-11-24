import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Admin from './pages/Admin';

const AppContent = () => {
    return (
        <Routes>
            {/* Main App Routes */}
            <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Redirect any unknown route to dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
           <AppContent />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;