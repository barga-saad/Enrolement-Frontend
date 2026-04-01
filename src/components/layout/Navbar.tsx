/**
 * Top Navbar Component
 */

import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-bcp-grey-dark shadow-bcp-soft">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="md:hidden hover:bg-bcp-grey p-2 rounded-lg transition"
          >
            <Menu className="w-6 h-6 text-bcp-brown" />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-6">
          <button className="hover:bg-bcp-grey p-2 rounded-lg transition">
            <Bell className="w-6 h-6 text-bcp-brown" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-bcp rounded-full flex items-center justify-center text-white font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <button className="hover:bg-bcp-grey p-2 rounded-lg transition">
              <User className="w-6 h-6 text-bcp-brown" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
