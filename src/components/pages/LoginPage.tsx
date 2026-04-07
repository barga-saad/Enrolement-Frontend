import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Building2 } from 'lucide-react';
import { GeometricDecor } from '../common/GeometricDecor';
import logo from '../../../image.png';
import towerImg from '../../../image copy.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error: authError, isLoading, isAuthenticated, requiresPasswordChange } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Auto-navigate after successful login
  useEffect(() => {
    if (isAuthenticated) {
      if (requiresPasswordChange) {
        navigate('/change-password', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, requiresPasswordChange, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Provide your credentials to access the secure vault');
      return;
    }

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Re-authenticate with authorized credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative font-['Inter']">
      
      {/* 🚀 EPIC BACKGROUND: TOWER WITH MODERN FILTERS */}
      <div className="absolute inset-0 z-0">
        <img 
          src={towerImg} 
          alt="BCP Tower" 
          className="w-full h-full object-cover brightness-[0.45] saturate-[1.2] contrast-[1.1] scale-105 transition-transform duration-[20s] animate-pulse-soft"
        />
        <div className="absolute inset-0 bcp-tower-overlay" />
      </div>

      {/* 💎 GEOMETRIC DECOR (TRIANGLES INSPIRED BY IMAGE 1) */}
      <GeometricDecor />

      <div className="w-full max-w-[1200px] min-h-[700px] flex rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 mx-6 bg-black/10 backdrop-blur-sm border border-white/10 transition-all duration-700 animate-slideUp">
        
        {/* 🏢 LEFT SIDE: BRANDED GLASS HUB */}
        <div className="hidden lg:flex flex-[1.2] flex-col justify-between p-16 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-bcp-brown/80 to-transparent opacity-60" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center mb-12 border border-white/20 shadow-2xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
              A Future-Proof <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-bcp-orange to-white">Enrollment</span> Hub
            </h2>
            <div className="w-20 h-1.5 bg-bcp-orange rounded-full mb-8" />
            <p className="text-white/80 text-xl leading-relaxed max-w-sm font-medium">
              Enterprise security meets Moroccan banking heritage. Manage your partners with unparalleled control.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-6 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
              <div className="w-12 h-12 bg-bcp-orange rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Secure Access Only</p>
                <p className="text-white/50 text-sm">Level 4 Auth Encryption Enabled</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🛂 RIGHT SIDE: THE LOGIN VAULT */}
        <div className="flex-1 p-10 md:p-16 lg:p-16 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-2xl flex flex-col justify-center transition-colors duration-500">
          <div className="mb-12 text-center lg:text-left">
            <img 
              src={logo} 
              alt="BCP Logo" 
              className="h-16 mx-auto lg:mx-0 mb-8 object-contain hover:scale-105 transition-transform cursor-pointer" 
            />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Vault Login</h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-widest">Administrative Authentication Port</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {(error || authError) && (
              <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-xl p-4 text-sm font-black flex items-center animate-shake">
                {error || authError}
              </div>
            )}

            {/* Account ID */}
            <div className="space-y-3 group">
              <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest pl-1 group-focus-within:text-bcp-orange transition-colors">
                Professional Identifier
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-bcp-orange" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="consultant@bcp.ma"
                  className="w-full pl-14 pr-4 py-5 bg-gray-50/50 dark:bg-white/[0.03] border-2 border-transparent dark:border-white/5 rounded-3xl outline-none focus:bg-white dark:focus:bg-transparent focus:border-bcp-orange/20 focus:ring-4 focus:ring-bcp-orange/10 transition-all duration-300 font-bold text-gray-700 dark:text-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Security Code */}
            <div className="space-y-3 group">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest group-focus-within:text-bcp-orange transition-colors">
                  Security Code
                </label>
                <button type="button" className="text-xs font-black text-bcp-orange hover:underline uppercase tracking-tighter">
                  Recovery Mode
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-bcp-orange" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-5 bg-gray-50/50 dark:bg-white/[0.03] border-2 border-transparent dark:border-white/5 rounded-3xl outline-none focus:bg-white dark:focus:bg-transparent focus:border-bcp-orange/20 focus:ring-4 focus:ring-bcp-orange/10 transition-all duration-300 font-bold text-gray-700 dark:text-white"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bcp-orange transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group bg-gradient-to-r from-bcp-orange to-bcp-orange-dark text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-orange-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-500 disabled:opacity-50 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-center space-x-4">
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="uppercase tracking-[0.2em] text-sm">Decrypting Account...</span>
                  </>
                ) : (
                  <>
                    <span className="uppercase tracking-[0.2em] text-sm">Initialize Access</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <footer className="mt-16 text-center text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-white/20">
            Certified Partner Enrollment Gateway • Morocco BP Division
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

