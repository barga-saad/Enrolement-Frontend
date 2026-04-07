import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, FileText, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks';
import { useLangStore, t } from '../../utils/langStore';
import logo from '../../../image.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { lang: _lang } = useLangStore(); // Use underscore to suppress unused warning while keeping reactive trigger

  const ROLE_LABELS: Record<string, string> = {
    PROFIL_ADMIN_CENTRAL: t('Administrateur Central', 'Central Admin'),
    PROFIL_SAISIE:        t('Saisie de Données', 'Data Entry'),
    PROFIL_VALIDATEUR:    t('Validateur', 'Validator'),
    PROFIL_CONSULTATION:  t('Consultation', 'Consultation'),
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t('Tableau de bord', 'Dashboard'),  path: '/' },
    { icon: Users,           label: t('Utilisateurs', 'Users'),      path: '/users',    requiredRole: 'PROFIL_ADMIN_CENTRAL' },
    { icon: Shield,          label: t('Rôles', 'Roles'),      path: '/roles',    requiredRole: 'PROFIL_ADMIN_CENTRAL' },
    { icon: FileText,        label: t('Partenaires', 'Partners'),   path: '/partners' },
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
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:sticky top-0 left-0 w-72 h-screen bg-white dark:bg-dark-bg transition-all duration-300 z-40 border-r border-gray-100 dark:border-dark-border flex flex-col transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 bg-white dark:bg-dark-bg-soft rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden border border-gray-100 dark:border-dark-border">
                <img src={logo} alt="BCP Logo" className="w-10 h-10 object-contain" />
              </div>
              <div className="hidden lg:block">
                <h2 className="text-xl font-bold tracking-tight text-bcp-brown dark:text-white">
                  BCP <span className="text-bcp-orange">BANK</span>
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-bcp-grey-text dark:text-dark-text-dim font-black">{t('Hub d\'Enrôlement', 'Enrollment Hub')}</p>
              </div>
            </div>
            <button
              className="md:hidden p-2 text-bcp-brown dark:text-dark-text-dim hover:bg-gray-100 dark:hover:bg-dark-bg-soft rounded-xl transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-4">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('Menu Principal', 'Main Menu')}</p>
          </div>
          {menuItems.map((item) => {
            if (!canAccess(item.requiredRole)) return null;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  active
                    ? 'bg-bcp-orange text-white shadow-lg shadow-orange-500/20 active-scale-95'
                    : 'text-gray-600 dark:text-dark-text-dim hover:bg-orange-50 dark:hover:bg-bcp-orange/10 hover:text-bcp-orange'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'animate-pulse-subtle' : ''}`} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {active && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-glow" />}
              </button>
            );
          })}
        </nav>

        {/* Footer User Profile */}
        <div className="p-4 mt-auto">
          <div className="p-4 bg-gray-50 dark:bg-dark-bg-soft rounded-3xl border border-gray-100 dark:border-dark-border group transition-all duration-300 hover:shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-brown-600 flex items-center justify-center text-white font-bold text-sm shadow-inner ring-2 ring-white dark:ring-dark-bg-soft">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-bcp-orange font-bold uppercase tracking-tighter truncate">
                  {user?.roleNames?.length
                    ? (ROLE_LABELS[user.roleNames[0]] ?? user.roleNames[0])
                    : t('Aucun rôle assigné', 'No role assigned')}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white dark:bg-dark-bg shadow-sm rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 border border-gray-100 dark:border-dark-border font-bold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('Déconnexion', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

