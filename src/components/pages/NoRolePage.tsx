import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import logo from '../../../image.png';
import towerImg from '../../../image copy.png';
import { useAuth } from '../../hooks';
import { useLangStore, t } from '../../utils/langStore';
import { LanguageToggle } from '../common/LanguageToggle';
import { ThemeToggle } from '../common/ThemeToggle';
import { GeometricDecor } from '../common/GeometricDecor';

const NoRolePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { lang: _lang } = useLangStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-warm-50 dark:bg-gray-900 overflow-hidden relative font-sans transition-colors duration-500 py-20 sm:py-10">

      {/* 🌐 TOP ACTIONS: LANGUAGE & THEME */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 flex items-center space-x-3 animate-fadeIn">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      {/* 🚀 EPIC BACKGROUND: TOWER WITH MODERN FILTERS */}
      <div className="absolute inset-0 z-0">
        <img
          src={towerImg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover brightness-[0.95] dark:brightness-[0.8] saturate-[1.1] dark:saturate-[1.3] contrast-[1.05] scale-105"
        />
        <div className="absolute inset-0 bcp-tower-overlay" />
      </div>

      {/* 💎 GEOMETRIC DECOR */}
      <GeometricDecor />

      {/* Main no-role card */}
      <div className="w-full max-w-[500px] flex rounded-[2rem] shadow-[0_32px_80px_-24px_rgba(107,76,58,0.35)] dark:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.7)] overflow-hidden relative z-10 mx-4 sm:mx-6 glass-morphism border border-white/60 dark:border-white/10 animate-slideUp">

        <div className="flex-1 p-8 md:p-12 bg-white/55 dark:bg-black/60 backdrop-blur-3xl flex flex-col justify-center items-center relative overflow-hidden text-bcp-brown dark:text-white">

          <div className="w-full max-w-[340px] relative z-10">

            {/* ── Logo ── */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-bcp-orange/20 blur-3xl rounded-full scale-[2.5]" />
                <img
                  src={logo}
                  alt="BCP Logo"
                  className="relative z-10 h-16 object-contain drop-shadow-xl dark:brightness-0 dark:invert"
                />
              </div>
            </div>

            {/* ── Icon + Title ── */}
            <div className="mb-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-500/20">
                <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-bcp-brown dark:text-white tracking-tight uppercase">
                {t('Accès', 'Access')}{' '}
                <span className="animate-shine inline-block">{t('Restreint', 'Restricted')}</span>
              </h1>
              <p className="text-bcp-brown/60 dark:text-white/50 font-semibold uppercase text-[9px] tracking-[0.35em] mt-2">
                {t('Aucun rôle applicatif détecté', 'No application role detected')}
              </p>
            </div>

            {/* ── Message box ── */}
            <div className="bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-xl p-4 mb-6 text-center" role="status">
              <p className="text-gray-700 dark:text-white/75 text-sm leading-relaxed">
                {t(
                  'Votre compte est authentifié mais ne possède aucun rôle applicatif actif. Contactez votre administrateur système pour obtenir les accès nécessaires.',
                  'Your account is authenticated but has no active application role. Contact your system administrator to obtain the required access.'
                )}
              </p>
            </div>

            {/* ── Logout button - same style as Login submit button ── */}
            <button
              onClick={handleLogout}
              className="w-full min-h-[52px] group bg-gradient-to-r from-bcp-orange to-[#F08400] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:brightness-105 active:scale-[0.99] transition-all duration-200 overflow-hidden relative focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bcp-orange/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <span className="uppercase tracking-[0.15em] text-xs font-bold">
                  {t('Se déconnecter', 'Sign Out')}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <div className="mt-8">
              <footer className="text-[9px] uppercase tracking-[0.25em] font-semibold text-bcp-brown/50 dark:text-white/30 text-center">
                Banque Centrale Populaire
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoRolePage;
