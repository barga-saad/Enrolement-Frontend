import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff, Building2, CheckCircle2 } from 'lucide-react';
import { LanguageToggle } from '../common/LanguageToggle';
import { ThemeToggle } from '../common/ThemeToggle';
import { useLangStore, t } from '../../utils/langStore';
import logo from '../../../image.png';
import towerImg from '../../../image copy.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error: authError, isLoading, isAuthenticated } = useAuth();
  const { lang: _lang } = useLangStore(); // Use underscore to suppress unused warning while keeping reactive trigger
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Auto-navigate after successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
      const errorCode = err.response?.data?.error?.errorCode;
      if (errorCode === 'USER_NOT_REGISTERED') {
        setError(t(
          "Accès refusé : votre compte n'est pas encore enregistré dans l'application. Contactez votre agent d'habilitation.",
          'Access denied: your account is not registered in the application yet. Please contact your access management agent.'
        ));
      } else if (errorCode === 'ACCOUNT_DISABLED') {
        setError(t('Accès refusé : votre compte est désactivé.', 'Access denied: your account is disabled.'));
      } else if (errorCode === 'INVALID_CREDENTIALS') {
        setError(t('Identifiant ou mot de passe incorrect.', 'Invalid username or password.'));
      } else {
        setError(err.response?.data?.message || t('Échec de la vérification. Ré-authentifiez-vous avec des identifiants autorisés.', 'Verification failed. Re-authenticate with authorized credentials.'));
      }
    }
  };

  // ── Shared styles for the two credential fields ──
  // Field shell: carries the border, glow and animated underline (reacts via group-focus-within)
  const fieldShellClass =
    'group relative flex items-center rounded-2xl border transition-all duration-300 ' +
    'bg-gradient-to-b from-white to-[#FFFBF5] dark:from-white/[0.07] dark:to-white/[0.03] ' +
    'border-sand-300 dark:border-white/[0.10] shadow-[0_1px_2px_rgba(61,43,32,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-none ' +
    'hover:border-bcp-orange/40 dark:hover:border-white/20 ' +
    'focus-within:border-bcp-orange/70 dark:focus-within:border-bcp-orange/60 ' +
    'focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.12),0_10px_24px_-12px_rgba(255,136,0,0.45)]';
  // Icon tile on the left: neutral at rest, orange gradient when the field is focused
  const iconTileClass =
    'pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 short:h-9 short:w-9 items-center justify-center rounded-xl transition-all duration-300 ' +
    'bg-sand-100 text-bcp-brown ring-1 ring-sand-300/80 dark:bg-white/[0.06] dark:text-bcp-orange-light dark:ring-white/10 ' +
    'group-focus-within:bg-gradient-to-br group-focus-within:from-bcp-orange group-focus-within:to-[#E07800] group-focus-within:text-white group-focus-within:ring-0 group-focus-within:shadow-[0_6px_14px_-4px_rgba(255,136,0,0.6)]';
  const inputClass =
    'peer w-full h-[60px] short:h-[54px] bg-transparent pl-[3.75rem] pt-5 pb-1.5 outline-none rounded-2xl ' +
    'text-[15px] font-semibold tracking-[0.01em] text-brown-900 dark:text-white placeholder-transparent disabled:opacity-60';
  const floatingLabelClass =
    'pointer-events-none absolute left-[3.75rem] top-2.5 short:top-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 dark:text-white/50 transition-all duration-200 ' +
    'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[14.5px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-white/40 ' +
    'peer-focus:top-2.5 short:peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.08em] peer-focus:font-semibold peer-focus:text-bcp-orange dark:peer-focus:text-bcp-orange-light';
  // Thin gradient underline that grows from the centre on focus
  const underlineClass =
    'pointer-events-none absolute inset-x-5 -bottom-px h-[2px] origin-center scale-x-0 rounded-full bg-gradient-to-r from-transparent via-bcp-orange to-transparent transition-transform duration-500 group-focus-within:scale-x-100';

  return (
    <div className="relative min-h-screen min-h-[100dvh] flex flex-col overflow-hidden bg-[#2B1F18] font-sans">

      {/* ── BACKGROUND: BCP tower photo, lightly framed ── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img
          src={towerImg}
          alt=""
          className="w-full h-full object-cover brightness-100 dark:brightness-[0.8] saturate-[1.05] dark:saturate-[1.15] scale-[1.02]"
        />
        <div className="absolute inset-0 bcp-tower-overlay" />
      </div>

      {/* ── DECORATIVE LINES (behind the card) ── */}
      <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" aria-hidden="true">
        {/* Top sweep */}
        <path d="M-20 170 C 260 60, 520 250, 860 120 S 1300 40, 1460 110" stroke="#FFB84D" strokeOpacity="0.38" strokeWidth="1.4" />
        <path d="M-20 205 C 280 100, 560 280, 900 160 S 1320 80, 1460 150" stroke="#FFFFFF" strokeOpacity="0.20" strokeWidth="1" />
        {/* Bottom sweep */}
        <path d="M-20 760 C 320 640, 700 860, 1060 720 S 1360 640, 1460 680" stroke="#FF9900" strokeOpacity="0.40" strokeWidth="1.5" />
        <path d="M-20 800 C 340 690, 720 900, 1080 770 S 1370 700, 1460 730" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1" />
        <path d="M-20 835 C 360 740, 740 930, 1100 815 S 1380 760, 1460 790" stroke="#FFB84D" strokeOpacity="0.22" strokeWidth="1" />
      </svg>

      {/* ── TOP BAR: theme & language (in the flow, so it never overlaps the card) ── */}
      <header className="relative z-20 flex items-center justify-end gap-3 px-4 pt-4 sm:px-8 sm:pt-5 short:pt-3 animate-fadeIn">
        <ThemeToggle />
        <LanguageToggle />
      </header>

      {/* ── CARD ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8 short:py-3">
        {/* Glass card with hairline border — the tower photo shows through */}
        <div className="relative w-full max-w-[940px] short:max-w-[880px] rounded-[28px] border border-white/50 dark:border-white/[0.12] shadow-[0_50px_100px_-30px_rgba(43,31,24,0.65)] animate-slideUp">
          <div className="grid lg:grid-cols-[1fr_1.08fr] rounded-[27px] overflow-hidden">

            {/* 🏢 LEFT: BRAND PANEL — deep brown glass, matching the app sidebar */}
            <section className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden px-10 py-12 short:py-8 tiny:py-6 text-center bg-gradient-to-br from-[#3F2C20]/[0.58] via-[#30231A]/[0.52] to-[#211812]/[0.72] backdrop-blur-[3px] backdrop-saturate-150">
              {/* Decoration — all kept inside this panel */}
              <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,153,0,0.28)_0%,transparent_65%)] pointer-events-none" aria-hidden="true" />
              <svg className="absolute bottom-0 left-0 w-full h-40 pointer-events-none" viewBox="0 0 480 180" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <path d="M0 120 C 110 70, 230 170, 480 90 L480 180 L0 180 Z" fill="#FF9900" fillOpacity="0.06" />
                <path d="M0 150 C 130 110, 260 190, 480 125 L480 180 L0 180 Z" fill="#FF9900" fillOpacity="0.05" />
                <path d="M-10 118 C 110 68, 230 168, 490 88" stroke="#FFB84D" strokeOpacity="0.35" strokeWidth="1.2" />
                <path d="M-10 148 C 130 108, 260 188, 490 123" stroke="#FF9900" strokeOpacity="0.22" strokeWidth="1" />
              </svg>
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-bcp-orange via-bcp-orange-light to-transparent" aria-hidden="true" />

              <div className="relative z-10 flex w-full max-w-[340px] flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <div className="relative flex h-16 w-16 short:h-14 short:w-14 items-center justify-center rounded-2xl bg-white/[0.08] ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_12px_30px_-10px_rgba(255,153,0,0.45)] backdrop-blur">
                    <Building2 className="h-8 w-8 short:h-7 short:w-7 text-bcp-orange-light" />
                  </div>
                </div>

                <h2 className="mt-7 short:mt-5 tiny:mt-4 text-[2rem] short:text-[1.75rem] font-bold leading-[1.12] tracking-tight text-white">
                  {t('Enrôlement', 'Enrollment')} <br />
                  <span className="animate-shine inline-block">{t('Partenaires & Clients', 'Partners & Clients')}</span>
                </h2>
                <div className="mt-5 short:mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-bcp-orange to-bcp-orange-light" />
                <p className="mt-5 short:mt-4 max-w-[320px] text-[14.5px] short:text-[13.5px] leading-relaxed text-[#F3EADF]/90 [text-wrap:balance] [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
                  {t(
                    'Espace dédié à la création, la validation et le suivi de l’enrôlement des partenaires de la Banque Centrale Populaire.',
                    'Dedicated space for creating, validating and monitoring the enrollment of Banque Centrale Populaire partners.'
                  )}
                </p>

                <div className="mt-8 short:mt-6 tiny:mt-5 inline-flex max-w-full items-center gap-3 rounded-full bg-white/[0.07] py-1.5 pl-1.5 pr-5 ring-1 ring-white/[0.12] backdrop-blur">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-bcp-orange to-[#D97700] shadow-md shadow-orange-500/30">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </span>
                  <p className="whitespace-nowrap text-xs font-semibold text-white/90">
                    {t('Accès sécurisé @ Banque Centrale Populaire', 'Secure access @ Banque Centrale Populaire')}
                  </p>
                </div>
              </div>
            </section>

            {/* 🛂 RIGHT: LOGIN FORM */}
            <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-9 sm:px-12 sm:py-11 short:py-7 tiny:py-5 bg-[#FFFCF8]/[0.82] dark:bg-[#151210]/[0.78] backdrop-blur-md backdrop-saturate-150">
              {/* Soft glow + fine lines inside the form panel */}
              <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,153,0,0.14)_0%,transparent_65%)] pointer-events-none" aria-hidden="true" />
              <svg className="absolute inset-x-0 bottom-0 h-28 w-full pointer-events-none" viewBox="0 0 480 120" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <path d="M-10 92 C 120 52, 260 122, 490 62" stroke="#FF9900" strokeOpacity="0.22" strokeWidth="1.2" />
                <path d="M-10 110 C 140 76, 280 132, 490 88" stroke="#6B4C3A" strokeOpacity="0.12" strokeWidth="1" />
              </svg>
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-bcp-orange via-bcp-orange-light/70 to-transparent lg:hidden" aria-hidden="true" />

              <div className="relative z-10 w-full max-w-[350px]">
                <div className="mb-7 short:mb-5 tiny:mb-4 flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="absolute inset-0 scale-[2] rounded-full bg-bcp-orange/15 blur-3xl dark:bg-bcp-orange/25" />
                    <img
                      src={logo}
                      alt={t('Logo BCP', 'BCP Logo')}
                      className="relative z-10 h-14 short:h-12 tiny:h-10 object-contain dark:brightness-0 dark:invert"
                    />
                  </div>
                  <h1 className="mt-5 short:mt-4 text-[1.6rem] short:text-[1.45rem] font-bold uppercase leading-tight tracking-tight text-brown-900 dark:text-white">
                    {t('Portail', 'Enrolment')} <span className="animate-shine inline-block">{t('Enrôlement', 'Portal')}</span>
                  </h1>
                  <div className="mt-2.5 flex items-center justify-center gap-3">
                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-bcp-orange/70" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gray-600 dark:text-white/60">{t('Accès Vérifié', 'Verified Access')}</p>
                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-bcp-orange/70" />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 short:space-y-3">
                  {(error || authError) && (
                    <div role="alert" className="flex items-center rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-red-50/90 p-3 text-xs font-semibold text-red-700 animate-shake dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200">
                      {error || authError}
                    </div>
                  )}

                  {/* Username */}
                  <div className={fieldShellClass}>
                    <span className={iconTileClass}>
                      <User className="h-[18px] w-[18px]" />
                    </span>
                    <input
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('Identifiant Professionnel', 'Professional Identifier')}
                      autoComplete="username"
                      className={`${inputClass} pr-11`}
                      disabled={isLoading}
                    />
                    <label htmlFor="login-username" className={floatingLabelClass}>
                      {t('Identifiant Professionnel', 'Professional Identifier')}
                    </label>
                    {username && (
                      <CheckCircle2 className="pointer-events-none absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-emerald-500 animate-fadeIn" aria-hidden="true" />
                    )}
                    <span className={underlineClass} aria-hidden="true" />
                  </div>

                  {/* Password */}
                  <div className={fieldShellClass}>
                    <span className={iconTileClass}>
                      <Lock className="h-[18px] w-[18px]" />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('Code de Sécurité', 'Security Code')}
                      autoComplete="current-password"
                      className={`${inputClass} pr-14`}
                      disabled={isLoading}
                    />
                    <label htmlFor="login-password" className={floatingLabelClass}>
                      {t('Code de Sécurité', 'Security Code')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t('Masquer le code', 'Hide code') : t('Afficher le code', 'Show code')}
                      aria-pressed={showPassword}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-orange-50 hover:text-bcp-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bcp-orange/40 dark:text-white/45 dark:hover:bg-white/10"
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                    <span className={underlineClass} aria-hidden="true" />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    aria-busy={isLoading}
                    className="group relative !mt-6 short:!mt-5 h-[56px] short:h-[50px] w-full overflow-hidden rounded-2xl bg-gradient-to-r from-bcp-orange via-[#FF8F00] to-[#E07800] font-bold text-white shadow-[0_14px_30px_-10px_rgba(255,136,0,0.65)] ring-1 ring-inset ring-white/20 transition-all duration-200 hover:shadow-[0_18px_36px_-10px_rgba(255,136,0,0.75)] hover:brightness-105 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bcp-orange/30"
                  >
                    <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {isLoading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                          <span className="text-xs uppercase tracking-[0.18em]">{t('Décryptage...', 'Decrypting...')}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[13px] font-bold uppercase tracking-[0.2em]">{t('Accéder', 'Access')}</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                </form>

                <div className="mt-7 short:mt-5 tiny:mt-4 border-t border-sand-300 pt-5 short:pt-4 dark:border-white/[0.08]">
                  <footer className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-500 dark:text-white/45">
                    {t('BANQUE CENTRALE POPULAIRE', 'BANQUE CENTRALE POPULAIRE')}
                  </footer>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
