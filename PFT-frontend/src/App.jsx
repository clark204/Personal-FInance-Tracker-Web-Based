import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Import router components
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import your page components
import LandingPage from './page/LandingPage';
import AuthPage from './page/AuthPage';
import Dashboard from './page/Dashboard';

// 
import Overview from './components/dashboard/Overview';
import Transaction from './components/dashboard/Transaction';
import Budget from './components/dashboard/Budget';
import Goal from './components/dashboard/Goal';
import Settings from './components/dashboard/Settings';
import Profile from './components/dashboard/Profile';
import Account from './components/dashboard/Account';
import VerifyEmail from './components/email/VerifyEmail';
import { AuthProvider, useAuth } from './context/AuthContext';
function App() {

  const queryClient = new QueryClient();

  const PublicRoutes = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (user) {
      return <Navigate to="/dashboard" />;
    }

    return children;
  }

  const ProtectedRoutes = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return <Navigate to="/auth?mode=login" />;
    }

    return children;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <PublicRoutes>
                <LandingPage />
              </PublicRoutes>
            } />
            <Route path="/auth" element={
              <PublicRoutes>
                <AuthPage />
              </PublicRoutes>
            } />
            <Route path="/verify-email/:id/:hash" element={
              <PublicRoutes>
                <VerifyEmail />
              </PublicRoutes>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoutes>
                <Dashboard />
              </ProtectedRoutes>
            }>
              <Route index element={<Overview />} />
              <Route path="transactions" element={<Transaction />} />
              <Route path="budgets" element={<Budget />} />
              <Route path="goals" element={<Goal />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="accounts" element={<Account />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;