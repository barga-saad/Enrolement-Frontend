import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, LogOut, X, PlusCircle, Edit, CheckSquare, Eye, ClipboardList, FileText } from 'lucide-react';
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
  ];

  const partnerMenuItems = [
    { icon: PlusCircle,  label: t('Saisie nouveau', 'New Entry'),      path: '/partners/new',    roles: ['PROFIL_ADMIN_CENTRAL', 'PROFIL_SAISIE'] },
    { icon: FileText,    label: t('Mes Brouillons', 'My Drafts'),       path: '/partners/drafts', roles: ['PROFIL_ADMIN_CENTRAL', 'PROFIL_SAISIE'] },
    { icon: Edit,        label: t('Modification', 'Modification'),      path: '/partners/edit',   roles: ['PROFIL_ADMIN_CENTRAL', 'PROFIL_SAISIE'] },
    { icon: CheckSquare, label: t('Validation', 'Validation'),          path: '/partners/validate', roles: ['PROFIL_ADMIN_CENTRAL', 'PROFIL_VALIDATEUR'] },
    { icon: Eye,         label: t('Consultation', 'Consultation'),      path: '/partners/consult',  roles: [] },
  ];

  const adminMenuItems = [
    { icon: Users,          label: t('Utilisateurs', 'Users'),       path: '/users',      requiredRole: 'PROFIL_ADMIN_CENTRAL' },
    { icon: Shield,         label: t('Rôles', 'Roles'),              path: '/roles',      requiredRole: 'PROFIL_ADMIN_CENTRAL' },
    { icon: ClipboardList,  label: t('Journal d\'audit', 'Audit Log'), path: '/audit',    requiredRole: 'PROFIL_ADMIN_CENTRAL' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  const canAccess = (requiredRole?: string) => {
    if (!requiredRole) return true;
    return user?.roleNames?.includes(requiredRole) || false;
  };

  const canAccessPartnerItem = (roles: string[]) => {
    if (roles.length === 0) return true; // no restriction
    return user?.roleNames?.some((r) => roles.includes(r)) || false;
  };

  const renderNavItem = (item: { icon: any; label: string; path: string }, key: string) => {
    const active = isActive(item.path);
    return (
      <button
        key={key}
        onClick={() => { navigate(item.path); onClose(); }}
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
          {menuItems.map((item) => renderNavItem(item, item.path))}

          {/* Partner section */}
          <div className="px-4 mt-6 mb-4">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('Gestion Partenaires', 'Partner Management')}</p>
          </div>
          {partnerMenuItems.map((item) => {
            if (!canAccessPartnerItem(item.roles)) return null;
            return renderNavItem(item, item.path);
          })}

          {/* Admin section */}
          {canAccess('PROFIL_ADMIN_CENTRAL') && (
            <>
              <div className="px-4 mt-6 mb-4">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('Administration', 'Administration')}</p>
              </div>
              {adminMenuItems.map((item) => {
                if (!canAccess(item.requiredRole)) return null;
                return renderNavItem(item, item.path);
              })}
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

