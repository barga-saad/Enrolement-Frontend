import { create } from 'zustand';
import { storage } from './helpers';

type Language = 'FR' | 'EN';

interface LangStore {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

export const useLangStore = create<LangStore>((set) => ({
  lang: (storage.get('lang') as Language) || 'FR',
  setLang: (lang) => {
    storage.set('lang', lang);
    set({ lang });
  },
  toggleLang: () => {
    set((state) => {
      const newLang = state.lang === 'FR' ? 'EN' : 'FR';
      storage.set('lang', newLang);
      return { lang: newLang };
    });
  },
}));

// Translation helper
export const t = (fr: string, en: string) => {
  const lang = useLangStore.getState().lang;
  return lang === 'FR' ? fr : en;
};
