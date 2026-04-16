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

      {/* ── Main card — same dimensions as ChangePasswordPage ── */}
      <div className="w-full max-w-[500px] flex rounded-[2.5rem] shadow-[0_45px_90px_-20px_rgba(0,0,0,0.7)] overflow-hidden relative z-10 mx-6 bg-transparent backdrop-blur-md border border-white/10 transition-all duration-700 animate-slideUp">

        <div className="flex-1 p-8 md:p-12 bg-white/5 dark:bg-black/60 backdrop-blur-3xl flex flex-col justify-center items-center relative overflow-hidden text-white">

          <div className="w-full max-w-[340px] relative z-10">

            {/* ── Logo with float animation ── */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-bcp-orange/20 blur-3xl rounded-full scale-[2.5] animate-pulse-soft" />
                <img
                  src={logo}
                  alt="BCP Logo"
                  className="relative z-10 h-16 object-contain animate-float drop-shadow-2xl dark:brightness-0 dark:invert"
                />
              </div>
            </div>

            {/* ── Icon + Title ── */}
            <div className="mb-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 border border-amber-500/20">
                <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                {t('Accès', 'Access')}{' '}
                <span className="animate-shine inline-block">{t('Restreint', 'Restricted')}</span>
              </h1>
              <p className="text-white/40 font-black uppercase text-[8px] tracking-[0.4em] mt-2">
                {t('Aucun rôle applicatif détecté', 'No application role detected')}
              </p>
            </div>

            {/* ── Message box ── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-center">
              <p className="text-white/70 text-sm leading-relaxed font-medium">
                {t(
                  'Votre compte est authentifié mais ne possède aucun rôle applicatif actif. Contactez votre administrateur système pour obtenir les accès nécessaires.',
                  'Your account is authenticated but has no active application role. Contact your system administrator to obtain the required access.'
                )}
              </p>
            </div>

            {/* ── Logout button — same style as Login submit button ── */}
            <button
              onClick={handleLogout}
              className="w-full group bg-gradient-to-r from-bcp-orange to-bcp-orange-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 overflow-hidden relative"
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
              <footer className="text-[8px] uppercase tracking-[0.3em] font-black text-white/20 text-center">
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
