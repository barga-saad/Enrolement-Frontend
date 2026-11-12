import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Shield, KeyRound, X, PlusCircle, Edit, CheckSquare, ClipboardList, FileText } from 'lucide-react';
import { useAuth } from '../../hooks';
import { useLangStore, t } from '../../utils/langStore';
import { apiService } from '../../services/api';
import { DEV_AUTH_BYPASS } from '../../utils/devAuth';
import { ENROLEMENT_ROLES, PROFIL_ADMIN_CENTRAL, PROFIL_CONSULTATION, USER_MANAGEMENT_ROLES, hasAnyRole } from '../../utils/roles';
import logo from '../../../image.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: _logout, user } = useAuth();
  const { lang: _lang } = useLangStore(); // Use underscore to suppress unused warning while keeping reactive trigger
  const [pendingCount, setPendingCount] = useState(0);

  const canValidate = hasAnyRole(user?.roleNames, ENROLEMENT_ROLES);

  useEffect(() => {
    if (!canValidate) {
      setPendingCount(0);
      return;
    }

    let mounted = true;
    const refreshPendingCount = () => {
      apiService.getPendingValidations()
        .then((res) => {
          let payload: any = res.data;
          for (let depth = 0; depth < 3 && payload && !Array.isArray(payload); depth += 1) {
            payload = payload.data ?? payload.content;
          }
          if (mounted && Array.isArray(payload)) setPendingCount(payload.length);
        })
        .catch(() => {});
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshPendingCount();
    };

    refreshPendingCount();
    const intervalId = window.setInterval(refreshPendingCount, 15000);
    window.addEventListener('focus', refreshPendingCount);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('pending-validations-updated', refreshPendingCount);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshPendingCount);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('pending-validations-updated', refreshPendingCount);
    };
  }, [canValidate, location.pathname]);

  const menuItems = [
    { icon: LayoutDashboard, label: t('Tableau de bord', 'Dashboard'),  path: '/' },
  ];

  const partnerMenuItems = [
    { icon: Users,         label: t('Partenaires', 'Partners'),         path: '/partners',          roles: [...ENROLEMENT_ROLES, PROFIL_CONSULTATION] },
    { icon: PlusCircle,  label: t('Saisie nouveau', 'New Entry'),      path: '/partners/new',    roles: ENROLEMENT_ROLES },
    { icon: FileText,    label: t('Mes Brouillons', 'My Drafts'),       path: '/partners/drafts', roles: ENROLEMENT_ROLES },
    { icon: Edit,        label: t('Modification', 'Modification'),      path: '/partners/edit',   roles: ENROLEMENT_ROLES },
    { icon: CheckSquare, label: t('Validation', 'Validation'),          path: '/partners/validate', roles: ENROLEMENT_ROLES },
  ];

  const adminMenuItems = [
    { icon: Users,          label: t('Utilisateurs', 'Users'),       path: '/users',      roles: USER_MANAGEMENT_ROLES },
    { icon: Shield,         label: t('Rôles', 'Roles'),              path: '/roles',      roles: [PROFIL_ADMIN_CENTRAL] },
    { icon: KeyRound,       label: t('Permissions', 'Permissions'),  path: '/permissions', roles: [PROFIL_ADMIN_CENTRAL] },
    { icon: ClipboardList,  label: t('Journal d\'audit', 'Audit Log'), path: '/audit',    roles: [PROFIL_ADMIN_CENTRAL] },
  ];
  const showPartnerSection = hasAnyRole(user?.roleNames, [...ENROLEMENT_ROLES, PROFIL_CONSULTATION]);
  const showAdminSection = hasAnyRole(user?.roleNames, USER_MANAGEMENT_ROLES);

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const canAccessPartnerItem = (roles: string[]) => {
    if (roles.length === 0) return true; // no restriction
    return user?.roleNames?.some((r) => roles.includes(r)) || false;
  };

  const renderNavItem = (item: { icon: any; label: string; path: string }, key: string) => {
    const active = isActive(item.path);
    const showBadge = item.path === '/partners/validate' && pendingCount > 0;
    return (
      <button
        key={key}
        onClick={() => { navigate(item.path); onClose(); }}
        aria-current={active ? 'page' : undefined}
        className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bcp-orange-light/70 ${
          active
            ? 'bg-gradient-to-r from-bcp-orange to-[#E88300] text-white shadow-lg shadow-black/25'
            : 'text-[#EADFD3]/80 hover:bg-white/[0.07] hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            active ? 'bg-white/20' : 'bg-white/[0.06] text-bcp-orange-light/90 group-hover:bg-white/10 group-hover:text-bcp-orange-light'
          }`}>
            <item.icon className="w-[18px] h-[18px]" />
          </span>
          <span className="font-medium text-sm">{item.label}</span>
        </div>
        <div className="flex items-center space-x-2">
          {showBadge && (
            <span className={`min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums flex items-center justify-center ${active ? 'bg-white text-bcp-orange' : 'bg-bcp-orange text-white'}`}>
              {pendingCount}
            </span>
          )}
          {active && !showBadge && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-glow" />}
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-30 animate-fadeIn"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:sticky top-0 left-0 w-72 h-screen overflow-hidden bg-gradient-to-b from-[#3D2B20] via-[#33241B] to-[#261B14] dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg transition-transform duration-300 z-40 border-r border-black/20 dark:border-dark-border flex flex-col transform ${
          isOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Decorative glow + fine curves (behind the menu) */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,153,0,0.18)_0%,transparent_65%)] pointer-events-none" aria-hidden="true" />
        <svg className="absolute bottom-0 left-0 w-full h-56 pointer-events-none" viewBox="0 0 288 220" preserveAspectRatio="none" fill="none" aria-hidden="true">
          <path d="M-10 150 C 70 110, 150 200, 300 120" stroke="#FF9900" strokeOpacity="0.22" strokeWidth="1.2" />
          <path d="M-10 180 C 90 140, 170 220, 300 155" stroke="#FFB84D" strokeOpacity="0.12" strokeWidth="1" />
          <path d="M-10 210 C 100 175, 190 230, 300 190 L300 230 L-10 230 Z" fill="#FF9900" fillOpacity="0.05" />
        </svg>

        {/* Brand accent line */}
        <div className="relative h-1 w-full bg-gradient-to-r from-bcp-orange via-bcp-orange-light to-bcp-orange/0" />
        <div className="relative px-6 pt-6 pb-5 border-b border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/30 ring-1 ring-white/20 overflow-hidden">
                <img src={logo} alt="BCP Logo" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight leading-tight text-white">
                  BCP <span className="text-bcp-orange">BANK</span>
                </h2>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#D9C7B5]/70 font-semibold">{t('Hub d\'Enrôlement', 'Enrollment Hub')}</p>
              </div>
            </div>
            <button
              className="md:hidden p-2 text-[#EADFD3] hover:bg-white/10 rounded-xl transition-colors"
              onClick={onClose}
              aria-label="Fermer le menu / Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Navigation Menu */}
        <nav className="relative flex-1 flex flex-col gap-1 px-4 pt-6 pb-6 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#C9B39D]/70">{t('Menu Principal', 'Main Menu')}</p>
          </div>
          {menuItems.map((item) => renderNavItem(item, item.path))}

          {/* Partner section (also shown in the dev-only UI preview, where the fake user holds every role) */}
          {(showPartnerSection || DEV_AUTH_BYPASS) && (
            <>
              <div className="px-3 mt-6 mb-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#C9B39D]/70">{t('Gestion Partenaires', 'Partner Management')}</p>
              </div>
              {partnerMenuItems.map((item) => {
                if (!canAccessPartnerItem(item.roles)) return null;
                return renderNavItem(item, item.path);
              })}
            </>
          )}

          {/* Admin section */}
          {showAdminSection && (
            <>
              <div className="px-3 mt-6 mb-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#C9B39D]/70">{t('Administration', 'Administration')}</p>
              </div>
              {adminMenuItems.map((item) => {
                if (!canAccessPartnerItem(item.roles)) return null;
                return renderNavItem(item, item.path);
              })}
            </>
          )}
        </nav>

        <div className="relative px-6 py-4 border-t border-white/[0.08]">
          <p className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#C9B39D]/50 text-center">
            Banque Centrale Populaire
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

