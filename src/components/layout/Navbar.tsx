import { Menu, LogOut, ChevronDown, Shield, User } from 'lucide-react';
import { useAuth } from '../../hooks';
import { ThemeToggle } from '../common/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { LanguageToggle } from '../common/LanguageToggle';
import { useLangStore, t } from '../../utils/langStore';
import { useState, useRef, useEffect } from 'react';
import { roleLabel as profileLabel } from '../../utils/roles';


interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang: _lang } = useLangStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase();
  // Every role held by the user (e.g. Saisie · Validateur · Consultation)
  const roleLabels = (user?.roleNames ?? []).map(profileLabel);
  const roleLabel = roleLabels.join(' · ');

  return (
    <nav className="sticky top-0 z-30 bg-sand-100/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-sand-300/90 dark:border-dark-border shadow-[0_1px_0_rgba(255,255,255,0.6)] dark:shadow-none transition-colors duration-300">
      <div className="px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Menu */}
        <div className="flex items-center flex-1">
          <button
            onClick={onMenuClick}
            aria-label="Menu"
            className="md:hidden p-2 -ml-1 rounded-xl text-bcp-brown dark:text-dark-text hover:bg-orange-50 dark:hover:bg-dark-bg-soft transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          <LanguageToggle />
          <ThemeToggle />

          <div className="h-7 w-px bg-gray-200 dark:bg-dark-border hidden sm:block" />

          {/* User dropdown trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className={`flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl border transition-colors duration-200 group ${
                open
                  ? 'bg-orange-50/70 border-bcp-orange/30 dark:bg-dark-bg-soft dark:border-dark-border'
                  : 'border-transparent hover:bg-gray-100/80 dark:hover:bg-dark-bg-soft'
              }`}
            >
              {/* Avatar */}
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-bcp-orange to-bcp-brown flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-dark-bg flex-shrink-0">
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-dark-bg rounded-full" />
              </div>

              {/* Name + role */}
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-[13px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  {user?.firstName} {user?.lastName}
                </p>
                <p title={roleLabel} className="max-w-[240px] truncate text-[10px] font-semibold text-bcp-brown/80 dark:text-bcp-orange uppercase tracking-wide">
                  {roleLabel}
                </p>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 hidden sm:block transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown panel */}
            {open && (
              <div role="menu" className="absolute right-0 mt-2 w-72 bg-white dark:bg-dark-bg-soft rounded-2xl shadow-bcp-medium border border-gray-200/80 dark:border-dark-border overflow-hidden animate-fadeIn z-50">
                {/* Profile header */}
                <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-orange-50 via-white to-brown-50 dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg-soft border-b border-gray-100 dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bcp-orange to-bcp-brown flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-text-dim">{user?.username}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {roleLabels.map((label) => (
                          <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-bcp-orange/20 text-[10px] font-bold text-bcp-orange uppercase tracking-wide">
                            <Shield className="w-2.5 h-2.5" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  <div className="px-3 py-2 flex items-center gap-2 text-xs text-gray-400 dark:text-dark-text-dim">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-medium">{t('Mon compte', 'My account')}</span>
                  </div>

                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors flex-shrink-0">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    {t('Déconnexion', 'Sign out')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


