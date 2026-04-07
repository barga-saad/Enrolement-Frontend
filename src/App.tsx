/**
 * Main App Component
 * Root entry point with routing and global layout
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks';
import './styles/globals.css';

// Pages
import LoginPage from './components/pages/LoginPage';
import DashboardPage from './components/pages/DashboardPage';
import UsersPage from './components/pages/UsersPage';
import RolesPage from './components/pages/RolesPage';
import PartnersPage from './components/pages/PartnersPage';
import ChangePasswordPage from './components/pages/ChangePasswordPage';

// Components
import Layout from './components/layout/Layout';
import { ToastContainer } from './components/common/ToastContainer';

// Unauthorized page component
const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-8">You don't have permission to access this page. Contact your administrator.</p>
      <a href="/" className="inline-block bg-cyan-700 text-white px-6 py-2 rounded-lg hover:bg-cyan-800">
        Go to Dashboard
      </a>
    </div>
  </div>
);

import { Loader } from './components/common/Loader';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Check if user is admin (PROFIL_ADMIN_CENTRAL)
  const isAdmin = user?.roleNames?.some(
    (role) => role === 'PROFIL_ADMIN_CENTRAL'
  ) || false;

  // Show loading screen while hydrating auth
  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/403" element={<UnauthorizedPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <Layout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/partners" element={<PartnersPage />} />
                    
                    {/* Admin-only pages */}
                    <Route
                      path="/users"
                      element={
                        isAdmin ? (
                          <UsersPage />
                        ) : (
                          <UnauthorizedPage />
                        )
                      }
                    />
                    <Route
                      path="/roles"
                      element={
                        isAdmin ? (
                          <RolesPage />
                        ) : (
                          <UnauthorizedPage />
                        )
                      }
                    />
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
}

export default App;
