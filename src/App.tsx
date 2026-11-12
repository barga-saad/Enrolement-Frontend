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
import PermissionsPage from './components/pages/PermissionsPage';
import PartnersPage from './components/pages/PartnersPage';
import AuditLogPage from './components/pages/AuditLogPage';
import NoRolePage from './components/pages/NoRolePage';

// Components
import Layout from './components/layout/Layout';
import { ToastContainer } from './components/common/ToastContainer';

// Unauthorized page component
const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen px-4">
    <div className="text-center max-w-md">
      <h1 className="text-7xl font-bold tracking-tight text-red-600 dark:text-red-400 mb-4 tabular-nums">403</h1>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">You don't have permission to access this page. Contact your administrator.</p>
      <a href="/" className="btn-primary">
        Go to Dashboard
      </a>
    </div>
  </div>
);

// 404 Not Found page
const NotFoundPage = () => (
  <div className="flex items-center justify-center min-h-[60vh] px-4">
    <div className="text-center space-y-4 max-w-md">
      <h1 className="text-8xl font-bold tracking-tight bg-gradient-to-br from-bcp-orange to-bcp-brown bg-clip-text text-transparent tabular-nums">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Page introuvable</h2>
      <p className="text-gray-500 dark:text-gray-400">La page que vous cherchez n'existe pas.</p>
      <a href="/" className="btn-primary mt-4">
        Retour au tableau de bord
      </a>
    </div>
  </div>
);

import { Loader } from './components/common/Loader';
import { DEV_AUTH_BYPASS } from './utils/devAuth';
import { PROFIL_ADMIN_CENTRAL, USER_MANAGEMENT_ROLES, hasAnyRole } from './utils/roles';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const roleNames = user?.roleNames?.filter((role) => role && role.trim().length > 0) || [];
  const hasNoRole = isAuthenticated && roleNames.length === 0;

  // Check if user is admin (PROFIL_ADMIN_CENTRAL)
  const isAdmin = hasAnyRole(user?.roleNames, [PROFIL_ADMIN_CENTRAL]);
  // Central admin + habilitation agent can manage users
  const canManageUsers = hasAnyRole(user?.roleNames, USER_MANAGEMENT_ROLES);

  // Show loading screen while hydrating auth
  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      {DEV_AUTH_BYPASS && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[90] px-3 py-1.5 rounded-full bg-red-600 text-white text-[11px] font-semibold shadow-lg pointer-events-none whitespace-nowrap">
          DEV PREVIEW · authentification désactivée (front uniquement)
        </div>
      )}
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/403" element={<UnauthorizedPage />} />
          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                hasNoRole ? (
                  <NoRolePage />
                ) : (
                  <Layout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/partners" element={<PartnersPage key="partners-list" />} />
                      <Route path="/partners/new" element={<PartnersPage key="partners-new" initialMode="create" />} />
                      <Route path="/partners/drafts" element={<PartnersPage key="partners-drafts" initialMode="drafts" />} />
                      <Route path="/partners/edit" element={<PartnersPage key="partners-edit" initialMode="edit" />} />
                      <Route path="/partners/validate" element={<PartnersPage key="partners-validate" initialMode="validate" />} />
                      <Route path="/partners/consult" element={<PartnersPage key="partners-consult" initialMode="consult" />} />
                      
                      {/* Admin-only pages */}
                      <Route
                        path="/users"
                        element={
                          canManageUsers ? (
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
                      <Route
                        path="/permissions"
                        element={isAdmin ? <PermissionsPage /> : <UnauthorizedPage />}
                      />
                      <Route
                        path="/audit"
                        element={
                          isAdmin ? (
                            <AuditLogPage />
                          ) : (
                            <UnauthorizedPage />
                          )
                        }
                      />
                      
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Layout>
                )
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
