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
      <div className="w-full max-w-[900px] min-h-[500px] flex rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 mx-6 bg-transparent backdrop-blur-md border border-white/10 transition-all duration-700 animate-slideUp">

        {/* 🏢 LEFT SIDE: BRANDED GLASS HUB (Centered Content) */}
        <div className="hidden lg:flex flex-1 flex-col justify-center items-center text-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-bcp-brown/90 to-transparent opacity-80" />
          
          {/* Animated Background Element */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-bcp-orange/10 rounded-full blur-3xl animate-pulse" />

          <div className="relative z-10 space-y-8">
            <div className="inline-flex w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-2xl items-center justify-center border border-white/20 shadow-xl mx-auto">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">
                The Next Era of <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-bcp-orange to-white">Enrollment</span>
              </h2>
              <div className="w-16 h-1.5 bg-bcp-orange rounded-full mx-auto" />
              <p className="text-white/70 text-base leading-relaxed max-w-[280px] font-medium mx-auto">
                Enterprise security meets Moroccan heritage. Unified partner management.
              </p>
            </div>

            <div className="inline-flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="w-10 h-10 bg-bcp-orange rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-xs">Secure Access</p>
                <p className="text-white/40 text-[10px]">© 2026 BCP Bank Morocco</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🛂 RIGHT SIDE: THE LOGIN VAULT (Always Centered Content) */}
        <div className="flex-[0.9] p-8 md:p-12 bg-white/10 dark:bg-black/40 backdrop-blur-3xl flex flex-col justify-center items-center relative overflow-hidden text-white">
          
          {/* Subtle geometric accents */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.2] pointer-events-none">
            <div className="w-48 h-48 border-[30px] border-bcp-orange rounded-full" />
          </div>

          <div className="w-full max-w-[320px] relative z-10">
            <div className="mb-10 text-center flex flex-col items-center">
              <div className="mb-6">
                <div className="relative inline-block animate-float">
                   <div className="absolute inset-0 bg-bcp-orange/40 blur-3xl rounded-full scale-[2] animate-pulse-soft" />
                   <img
                     src={logo}
                     alt="BCP Logo"
                     className="h-16 relative z-10 object-contain hover:scale-110 transition-transform cursor-pointer drop-shadow-2xl brightness-0 invert"
                   />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                  Enrolment <span className="text-bcp-orange">Portal</span>
                </h1>
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-[1px] w-8 bg-bcp-orange/50" />
                  <p className="text-white/60 font-black uppercase text-[8px] tracking-[0.4em]">Verified Authentication Port</p>
                  <div className="h-[1px] w-8 bg-bcp-orange/50" />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {(error || authError) && (
                <div className="bg-red-500/20 border-l-4 border-red-500 text-white rounded-lg p-3 text-xs font-bold flex items-center animate-shake backdrop-blur-md">
                  {error || authError}
                </div>
              )}

              {/* Account ID */}
              <div className="space-y-2 group">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/50 transition-colors group-focus-within:text-bcp-orange" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Professional Identifier"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-bcp-orange/50 transition-all duration-300 font-semibold text-sm text-white placeholder-white/40"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Security Code */}
              <div className="space-y-2 group">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/50 transition-colors group-focus-within:text-bcp-orange" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Security Code"
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-bcp-orange/50 transition-all duration-300 font-semibold text-sm text-white placeholder-white/40"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-bcp-orange transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group bg-gradient-to-r from-bcp-orange to-bcp-orange-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 overflow-hidden relative mt-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="relative z-10 flex items-center justify-center space-x-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="uppercase tracking-[0.15em] text-xs">Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span className="uppercase tracking-[0.15em] text-xs">Access Hub</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <footer className="mt-12 text-center text-[9px] uppercase tracking-widest font-black text-white/40">
              Gateway MOROCCO BCP
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

