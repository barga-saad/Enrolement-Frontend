/**
 * PrivateRoute Component
 * Protects routes that require authentication
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const PrivateRoute = ({ children, requiredRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && user) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user.roleNames.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
