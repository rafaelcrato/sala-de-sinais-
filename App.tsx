import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

const AppContent = () => {
    return (
        <Routes>
            {/* Main App Routes */}
            <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/history" element={<div className="text-center p-10 text-gray-500">Histórico em breve...</div>} />
                <Route path="/profile" element={<Profile />} />
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