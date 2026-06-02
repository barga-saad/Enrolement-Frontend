import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks';
import { ThemeToggle } from '../common/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { LanguageToggle } from '../common/LanguageToggle';
import { useLangStore, t } from '../../utils/langStore';

const ROLE_LABELS: Record<string, string> = {
  PROFIL_ADMIN_CENTRAL: t('Admin Central', 'Central Admin'),
  PROFIL_SAISIE:        t('Saisie', 'Data Entry'),
  PROFIL_VALIDATEUR:    t('Validateur', 'Validator'),
  PROFIL_CONSULTATION:  t('Consultation', 'Consultation'),
};

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang: _lang } = useLangStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-border transition-all duration-300">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Mobile Menu */}
        <div className="flex items-center flex-1">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-bcp-brown dark:text-dark-text hover:bg-orange-50 dark:hover:bg-dark-bg-soft transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <LanguageToggle />
          <ThemeToggle />

          <div className="h-8 w-[1px] bg-gray-200 dark:bg-dark-border mx-1 hidden sm:block" />

          {/* User info */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] font-bold text-bcp-orange uppercase tracking-tight">
                {user?.roleNames?.length ? (ROLE_LABELS[user.roleNames[0]] ?? user.roleNames[0]) : ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title={t('Déconnexion', 'Sign Out')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-xs font-bold border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Déconnexion', 'Sign Out')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


