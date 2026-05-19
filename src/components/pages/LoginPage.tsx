import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Building2 } from 'lucide-react';
import { GeometricDecor } from '../common/GeometricDecor';
import { LanguageToggle } from '../common/LanguageToggle';
import { ThemeToggle } from '../common/ThemeToggle';
import { useLangStore, t } from '../../utils/langStore';
import logo from '../../../image.png';
import towerImg from '../../../image copy.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error: authError, isLoading, isAuthenticated, requiresPasswordChange } = useAuth();
  const { lang: _lang } = useLangStore(); // Use underscore to suppress unused warning while keeping reactive trigger
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
      setError(t('Fournissez vos identifiants pour accéder au coffre sécurisé', 'Provide your credentials to access the secure vault'));
      return;
    }

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.response?.data?.message || t('Échec de la vérification. Ré-authentifiez-vous avec des identifiants autorisés.', 'Verification failed. Re-authenticate with authorized credentials.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-gray-900 overflow-hidden relative font-['Inter'] transition-colors duration-500">

      {/* 🌐 TOP ACTIONS: LANGUAGE & THEME */}
      <div className="absolute top-8 right-8 z-50 flex items-center space-x-4 animate-fadeIn">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      {/* 🚀 EPIC BACKGROUND: TOWER WITH MODERN FILTERS */}
      <div className="absolute inset-0 z-0">
        <img
          src={towerImg}
          alt="BCP Tower"
          className="w-full h-full object-cover brightness-[0.9] dark:brightness-[0.8] saturate-[1.2] dark:saturate-[1.4] contrast-[1.1] scale-105 transition-transform duration-[20s] animate-float-slow"
        />
        <div className="absolute inset-0 bcp-tower-overlay" />

        {/* Dynamic Floating Shapes Layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="bcp-geometric-shape triangle-up w-64 h-64 bg-bcp-orange -top-20 -left-20 animate-spin-slow" />
          <div className="bcp-geometric-shape diamond w-40 h-40 bg-bcp-brown top-1/4 -right-10 animate-float" />
          <div className="bcp-geometric-shape triangle-down w-32 h-32 bg-bcp-orange bottom-10 left-1/4 animate-pulse-soft" />
          <div className="bcp-geometric-shape diamond w-24 h-24 bg-white/20 dark:bg-white/10 bottom-1/4 right-1/4 animate-float-slow" />
        </div>
      </div>

      {/* 💎 GEOMETRIC DECOR */}
      <GeometricDecor />
      <div className="w-full max-w-[900px] min-h-[500px] flex rounded-[2.5rem] shadow-[0_45px_90px_-20px_rgba(107,76,58,0.3)] dark:shadow-[0_45px_90px_-20px_rgba(0,0,0,0.7)] overflow-hidden relative z-10 mx-6 glass-morphism border border-warm-300 dark:border-white/10 transition-all duration-700 animate-slideUp">

        {/* 🏢 LEFT SIDE: BRANDED HUB */}
        <div className="hidden lg:flex flex-1 flex-col justify-center items-center text-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-warm-200/80 dark:from-bcp-brown/80 via-bcp-brown/10 dark:via-transparent to-transparent opacity-80" />

          <div className="relative z-10 space-y-8">
            <div className="inline-flex w-16 h-16 bg-white/20 dark:bg-white/10 backdrop-blur-2xl rounded-2xl items-center justify-center border border-white/30 dark:border-white/20 shadow-xl mx-auto animate-bounce-soft">
              <Building2 className="w-8 h-8 text-bcp-brown dark:text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-bcp-brown dark:text-white leading-tight tracking-tighter">
                {t('La nouvelle ère de', 'The Next Era of')} <br />
                <span className="animate-shine inline-block">{t('Enrôlement', 'Enrollment')}</span>
              </h2>
              <div className="w-16 h-1.5 bg-bcp-orange rounded-full mx-auto" />
              <p className="text-bcp-brown/70 dark:text-white/70 text-base leading-relaxed max-w-[280px] font-medium mx-auto italic">
                {t('La sécurité d\'entreprise rencontre l\'héritage marocain.', 'Enterprise security meets Moroccan heritage.')}
              </p>
            </div>

            <div className="inline-flex items-center space-x-4 p-4 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-500 shadow-sm">
              <div className="w-10 h-10 bg-bcp-orange rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-bcp-brown dark:text-white font-bold text-xs uppercase tracking-widest">{t('Accès Sécurisé', 'Secure Access')}</p>
                <p className="text-bcp-brown/40 dark:text-white/40 text-[10px]">© BCP Bank Morocco</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🛂 RIGHT SIDE: THE LOGIN VAULT */}
        <div className="flex-[0.9] p-8 md:p-12 bg-white/30 dark:bg-black/60 backdrop-blur-3xl flex flex-col justify-center items-center relative overflow-hidden text-bcp-brown dark:text-white border-l border-warm-300 dark:border-white/5">

          <div className="w-full max-w-[320px] relative z-10">
            <div className="mb-10 text-center flex flex-col items-center">
              <div className="mb-6">
                <div className="relative inline-block animate-float">
                  <div className="absolute inset-0 bg-bcp-orange/20 dark:bg-bcp-orange/40 blur-3xl rounded-full scale-[2] animate-pulse-soft" />
                  <img
                    src={logo}
                    alt="BCP Logo"
                    className="h-16 relative z-10 object-contain hover:scale-110 transition-transform cursor-pointer drop-shadow-2xl dark:brightness-0 dark:invert"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-bcp-brown dark:text-white tracking-tighter uppercase italic">
                  {t('Portail', 'Enrolment')} <span className="animate-shine inline-block">{t('Enrôlement', 'Portal')}</span>
                </h1>
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-[1px] w-8 bg-bcp-orange/30 dark:bg-bcp-orange/50" />
                  <p className="text-bcp-brown/50 dark:text-white/60 font-black uppercase text-[8px] tracking-[0.4em]">{t('Accès Vérifié', 'Verified Access')}</p>
                  <div className="h-[1px] w-8 bg-bcp-orange/30 dark:bg-bcp-orange/50" />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {(error || authError) && (
                <div className="bg-red-500/20 dark:bg-red-500/20 border-l-4 border-red-500 text-red-600 dark:text-white rounded-lg p-3 text-xs font-bold flex items-center animate-shake backdrop-blur-md">
                  {error || authError}
                </div>
              )}

              <div className="space-y-2 group">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-bcp-brown/40 dark:text-white/50 transition-colors group-focus-within:text-bcp-orange" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('Identifiant Professionnel', 'Professional Identifier')}
                    className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-white/5 border border-warm-300 dark:border-white/10 rounded-2xl outline-none focus:bg-white/80 dark:focus:bg-white/10 focus:border-bcp-orange/50 transition-all duration-300 font-semibold text-sm text-bcp-brown dark:text-white placeholder-bcp-brown/30 dark:placeholder-white/30"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-bcp-brown/40 dark:text-white/50 transition-colors group-focus-within:text-bcp-orange" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('Code de Sécurité', 'Security Code')}
                    className="w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-white/5 border border-warm-300 dark:border-white/10 rounded-2xl outline-none focus:bg-white/80 dark:focus:bg-white/10 focus:border-bcp-orange/50 transition-all duration-300 font-semibold text-sm text-bcp-brown dark:text-white placeholder-bcp-brown/30 dark:placeholder-white/30"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-bcp-brown/40 dark:text-white/40 hover:text-bcp-orange transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

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
                      <span className="uppercase tracking-[0.15em] text-xs">{t('Décryptage...', 'Decrypting...')}</span>
                    </>
                  ) : (
                    <>
                      <span className="uppercase tracking-[0.15em] text-xs font-bold">{t('Accéder', 'Access')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-10">
              <footer className="text-[9px] uppercase tracking-widest font-black text-bcp-brown/40 dark:text-white/40 text-center">
                BANQUE CENTRALE POPULAIRE
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
