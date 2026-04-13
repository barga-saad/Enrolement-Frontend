import { useLangStore } from '../../utils/langStore';
import { Globe } from 'lucide-react';

export const LanguageToggle = () => {
  const { lang, toggleLang } = useLangStore();

  return (
    <button
      onClick={toggleLang}
      className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-warm-300/50 dark:bg-white/5 hover:bg-warm-400/50 dark:hover:bg-white/10 border border-warm-500/20 dark:border-white/10 transition-all duration-300 group shadow-sm"
      title={lang === 'FR' ? 'Switch to English' : 'Changer en Français'}
    >
      <Globe className="w-4 h-4 text-bcp-brown/60 dark:text-white/50 group-hover:text-bcp-orange transition-colors" />
      <span className="text-[10px] font-black text-bcp-brown dark:text-white tracking-widest uppercase">
        {lang}
      </span>
      <div className="flex flex-col space-y-0.5 leading-none pl-1 border-l border-bcp-brown/10 dark:border-white/10">
        <span className={`text-[8px] font-bold ${lang === 'FR' ? 'text-bcp-orange dark:text-white' : 'text-bcp-brown/30 dark:text-white/30'}`}>FR</span>
        <span className={`text-[8px] font-bold ${lang === 'EN' ? 'text-bcp-orange dark:text-white' : 'text-bcp-brown/30 dark:text-white/30'}`}>EN</span>
      </div>
    </button>
  );
};
