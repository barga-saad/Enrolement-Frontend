import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { GeometricDecor } from '../common/GeometricDecor';
import { useIdleLogout } from '../../hooks/useIdleLogout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Signed-in area only: automatic sign-out after inactivity
  useIdleLogout();

  return (
    <div className="flex h-screen h-[100dvh] bg-transparent dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
      {/* Background decoration: soft glows, fine curves, dot grid */}
      <GeometricDecor />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1480px] mx-auto w-full animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

