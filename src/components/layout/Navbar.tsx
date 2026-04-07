import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, Search, ChevronDown, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../hooks';
import { ThemeToggle } from '../common/ThemeToggle';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-border transition-all duration-300">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Mobile Menu & Search */}
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-bcp-brown dark:text-dark-text hover:bg-orange-50 dark:hover:bg-dark-bg-soft transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden md:flex items-center max-w-md w-full bg-gray-50 dark:bg-dark-bg-soft rounded-2xl px-4 py-2 border border-transparent focus-within:border-bcp-orange/30 transition-all group">
            <Search className="w-4 h-4 text-gray-400 group-focus-within:text-bcp-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="ml-3 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-dark-text w-full"
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <ThemeToggle />
          
          <button className="relative p-2 rounded-xl text-bcp-brown dark:text-dark-text hover:bg-orange-50 dark:hover:bg-dark-bg-soft transition-colors group">
            <Bell className="w-5 h-5 group-hover:shake" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-bcp-orange rounded-full border-2 border-white dark:border-dark-bg-soft" />
          </button>
          
          <div className="h-8 w-[1px] bg-gray-200 dark:bg-dark-border mx-2 hidden sm:block" />
          
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-dark-text-dim font-medium">Online</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-bcp-gradient-soft flex items-center justify-center text-bcp-orange font-bold text-sm shadow-sm border border-orange-100 dark:border-bcp-orange/20 transition-transform group-hover:scale-105">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-dark-bg transition-colors" />
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-bcp-orange transition-all duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </div>

            {/* Profile Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-dark-bg-card rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-border py-2 animate-slideUp z-50">
                <div className="px-4 py-3 border-b border-gray-50 dark:border-dark-border">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-text-dim truncate">{user?.username || 'user@bcp.ma'}</p>
                </div>
                
                <div className="p-2">
                  <button 
                    onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-bcp-orange/10 hover:text-bcp-orange transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>User Settings</span>
                  </button>
                  
                  <button 
                    onClick={() => { navigate('/roles'); setShowDropdown(false); }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-bcp-orange/10 hover:text-bcp-orange transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>My Permissions</span>
                  </button>
                </div>
                
                <div className="p-2 border-t border-gray-50 dark:border-dark-border">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
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


