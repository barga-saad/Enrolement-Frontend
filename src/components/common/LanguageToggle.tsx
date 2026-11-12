import { useLangStore } from '../../utils/langStore';
import { Globe } from 'lucide-react';

export const LanguageToggle = () => {
  const { lang, toggleLang } = useLangStore();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="flex h-9 items-center space-x-2 px-3 rounded-xl bg-white/80 dark:bg-dark-bg-soft hover:bg-orange-50 dark:hover:bg-bcp-orange/10 border border-gray-200/80 dark:border-white/10 hover:border-bcp-orange/40 transition-colors duration-200 group shadow-sm"
      title={lang === 'FR' ? 'Switch to English' : 'Changer en Français'}
      aria-label={lang === 'FR' ? 'Switch to English' : 'Changer en Français'}
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
