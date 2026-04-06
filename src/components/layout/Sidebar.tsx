/**
 * Sidebar Navigation Component
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, FileText, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const ROLE_LABELS: Record<string, string> = {
    PROFIL_ADMIN_CENTRAL: 'Admin Central',
    PROFIL_SAISIE:        'Data Entry',
    PROFIL_VALIDATEUR:    'Validator',
    PROFIL_CONSULTATION:  'Consultation',
  };

  const hasRole = (...roles: string[]) =>
    roles.some(r => user?.roleNames?.includes(r)) || false;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',  path: '/' },
    { icon: Users,           label: 'Users',      path: '/users',    requiredRole: 'PROFIL_ADMIN_CENTRAL' },
    { icon: Shield,          label: 'Roles',      path: '/roles',    requiredRole: 'PROFIL_ADMIN_CENTRAL' },
    { icon: FileText,        label: 'Partners',   path: '/partners' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  
  const canAccess = (requiredRole?: string) => {
    if (!requiredRole) return true;
    return user?.roleNames?.includes(requiredRole) || false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static w-64 h-screen bg-white shadow-bcp-medium z-40 transform transition-transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-bcp-grey-dark">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-bcp bg-clip-text text-transparent">
              BCP
            </h2>
            <button
              className="md:hidden text-bcp-brown hover:text-bcp-orange"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-bcp-grey-text mt-1">Enrollment Platform</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            if (!canAccess(item.requiredRole)) return null;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-gradient-bcp text-white'
                    : 'text-bcp-grey-text hover:bg-bcp-grey hover:text-bcp-brown'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-300 space-y-2">
          <div className="px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-600 mt-1">
              {user?.roleNames?.length
                ? (ROLE_LABELS[user.roleNames[0]] ?? user.roleNames[0])
                : 'No role assigned'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
